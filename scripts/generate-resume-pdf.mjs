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

async function main() {
  ensureDistBuilt();

  const server = await serveDist();
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/`;

  const launchOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };
  // Use a specific browser binary if one is provided (handy for CI images
  // or sandboxes with a non-standard Chrome install path); otherwise fall
  // back to whatever Google Chrome is already installed on the machine.
  // We never download a bundled Chromium (see .puppeteerrc.cjs).
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  } else {
    launchOptions.channel = "chrome";
  }

  const browser = await puppeteer.launch(launchOptions);

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
