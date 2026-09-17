#!/usr/bin/env node
// Generates the downloadable resume PDF by headlessly printing the
// site's own built homepage (dist/index.html) with `@media print`
// active. Because the page is the single source of truth for resume
// content (src/data/resume.ts), the PDF can never drift from what a
// visitor sees on the site itself.
//
// Requires a fresh `astro build` (run automatically first if dist/
// isn't there yet). Runs automatically as part of `npm run build`,
// after `astro build` and before pagefind indexing.
//
// Browser resolution is self-healing: we first try whatever Google
// Chrome is already installed on the machine (fast, no network) —
// this covers the user's own Mac and GitHub Actions' ubuntu-latest
// runners, which both ship Chrome preinstalled. If no system Chrome
// is found (e.g. Cloudflare Pages' build image, which doesn't ship
// one), we fall back to downloading a version-matched Chrome build
// on demand via Puppeteer's own installer CLI. `.puppeteerrc.cjs`
// only disables the *automatic* download at `npm install` time; this
// explicit, lazy CLI call is unaffected and only runs when needed.

import { existsSync, copyFileSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function ensureDistBuilt() {
  if (existsSync(path.join(DIST, "index.html"))) return;
  console.log("[resume:pdf] dist/ not found, running `astro build` first...");
  const result = spawnSync("npx", ["astro", "build"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    throw new Error("astro build failed; cannot generate resume PDF");
  }
}

/** Minimal static file server so root-relative asset URLs (/_astro/...) resolve correctly. */
function serveDist() {
  return new Promise(resolve => {
    const server = createServer((req, res) => {
      let reqPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
      if (reqPath.endsWith("/")) reqPath += "index.html";

      let filePath = path.join(DIST, reqPath);
      if (!filePath.startsWith(DIST)) {
        res.writeHead(403);
        res.end();
        return;
      }
      if (existsSync(filePath) && filePath.split(path.sep).pop().indexOf(".") === -1) {
        filePath = path.join(filePath, "index.html");
      }

      if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream" });
      res.end(readFileSync(filePath));
    });

    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

/**
 * Downloads a Puppeteer-managed, version-matched Chrome build via the
 * `puppeteer` CLI and returns its executable path. Used as a fallback
 * for CI images (like Cloudflare Pages) that don't ship a system
 * Chrome. Requires network access to Google's Chrome-for-Testing
 * bucket, which is available in most CI providers even when the local
 * dev/test sandbox used while building this script was not.
 */
function installManagedChrome() {
  console.log("[resume:pdf] downloading a matching Chrome build via `puppeteer browsers install`...");

  const cliPath = path.join(ROOT, "node_modules", "puppeteer", "lib", "cjs", "puppeteer", "node", "cli.js");
  const result = spawnSync(process.execPath, [cliPath, "browsers", "install", "chrome", "--format", "{{path}}"], {
    cwd: ROOT,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(`\`puppeteer browsers install chrome\` failed:\n${details}`);
  }

  // The CLI's stdout may include extra progress output ahead of the
  // formatted path line, so scan for the line that's an actual,
  // existing executable rather than assuming it's the last line.
  const candidateLines = result.stdout
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
  const executablePath = [...candidateLines].reverse().find(existsSync);

  if (!executablePath) {
    throw new Error(`Could not parse installed Chrome path from puppeteer CLI output:\n${result.stdout}`);
  }

  console.log(`[resume:pdf] installed Chrome at ${executablePath}`);
  return executablePath;
}

async function launchBrowser() {
  const baseOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  // Explicit override always wins (handy for CI images or sandboxes
  // with a non-standard Chrome install path).
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return puppeteer.launch({ ...baseOptions, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
  }

  try {
    // Fast path: whatever Google Chrome is already installed on the
    // machine. No network access required.
    return await puppeteer.launch({ ...baseOptions, channel: "chrome" });
  } catch (err) {
    console.log(
      `[resume:pdf] no system Chrome found (${err instanceof Error ? err.message : String(err)}); ` +
        "falling back to a managed download..."
    );
    const executablePath = installManagedChrome();
    return puppeteer.launch({ ...baseOptions, executablePath });
  }
}

async function main() {
  ensureDistBuilt();

  const server = await serveDist();
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/`;

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
    await page.emulateMediaType("print");
    await page.goto(url, { waitUntil: "networkidle0" });

    const distPdfPath = path.join(DIST, "assets", "aylward-nickolas-resume.pdf");
    await page.pdf({
      path: distPdfPath,
      preferCSSPageSize: true,
      printBackground: true,
    });

    // Keep the checked-in copy in public/ up to date too, so it stays
    // correct for anyone browsing the repo directly, and so a plain
    // `astro build` (without this script) still ships the latest file.
    const publicPdfPath = path.join(ROOT, "public", "assets", "aylward-nickolas-resume.pdf");
    copyFileSync(distPdfPath, publicPdfPath);

    console.log(`[resume:pdf] wrote ${path.relative(ROOT, distPdfPath)} and ${path.relative(ROOT, publicPdfPath)}`);
  } finally {
    await browser.close();
    server.close();
  }
}

await main();
