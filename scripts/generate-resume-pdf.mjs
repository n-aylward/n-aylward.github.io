#!/usr/bin/env node
// Create the PDF by printing the built homepage in Chrome. The page's
// print styles control the PDF layout, and the page uses the resume data
// from src/data/resume.ts.
//
// `npm run build` runs this script after `astro build`. If the built
// homepage is missing, this script runs `astro build` first.
//
// Set PUPPETEER_EXECUTABLE_PATH to use a specific Chrome executable.
// Otherwise, the script tries installed Chrome, then downloads a
// compatible version through Puppeteer. If Chrome still cannot start,
// the script copies the checked-in PDF as a fallback. That PDF can be
// out of date after resume changes, so regenerate and commit it then.

import { existsSync, copyFileSync, readFileSync, mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const DIST_PDF_PATH = path.join(DIST, "assets", "aylward-nickolas-resume.pdf");
const PUBLIC_PDF_PATH = path.join(ROOT, "public", "assets", "aylward-nickolas-resume.pdf");

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

/** Serve the built files locally so Chrome can load the page and its assets. */
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

/** Download a Chrome version compatible with Puppeteer and return its path. */
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

  // Puppeteer prints progress messages as well as the path. Find an
  // output line that names an existing file.
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

/** Launch Chrome from the configured path, system install, or download. */
async function launchBrowser() {
  const baseOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  // Use the configured path first when one is provided.
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return puppeteer.launch({ ...baseOptions, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
  }

  try {
    // Try installed Chrome first to avoid downloading another copy.
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

/** Copy the checked-in PDF to dist when Chrome cannot start. */
function useCheckedInPdfFallback(reason) {
  if (!existsSync(PUBLIC_PDF_PATH)) {
    throw new Error(
      `${reason}\n[resume:pdf] and there's no checked-in fallback at ` +
        `${path.relative(ROOT, PUBLIC_PDF_PATH)} to fall back to — cannot produce a resume PDF for this build.`
    );
  }

  console.warn(`[resume:pdf] ${reason}`);
  console.warn(
    "[resume:pdf] this usually means the build environment has no system package manager " +
      "(e.g. Cloudflare Pages' build image) and can't provide the shared libraries any " +
      "downloaded Chrome build needs. Falling back to the PDF already checked into " +
      `${path.relative(ROOT, PUBLIC_PDF_PATH)}. Regenerate and commit it from your machine or ` +
      "GitHub Actions (both of which have a working Chrome) after any resume content changes."
  );

  mkdirSync(path.dirname(DIST_PDF_PATH), { recursive: true });
  copyFileSync(PUBLIC_PDF_PATH, DIST_PDF_PATH);
  console.log(`[resume:pdf] copied ${path.relative(ROOT, PUBLIC_PDF_PATH)} -> ${path.relative(ROOT, DIST_PDF_PATH)}`);
}

async function main() {
  ensureDistBuilt();

  let browser;
  try {
    browser = await launchBrowser();
  } catch (err) {
    useCheckedInPdfFallback(
      `could not launch any headless Chrome in this environment: ${err instanceof Error ? err.message : String(err)}`
    );
    return;
  }

  const server = await serveDist();

  try {
    const { port } = server.address();
    const url = `http://127.0.0.1:${port}/`;

    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
    await page.emulateMediaType("print");
    await page.goto(url, { waitUntil: "networkidle0" });

    await page.pdf({
      path: DIST_PDF_PATH,
      preferCSSPageSize: true,
      printBackground: true,
    });

    // Update the checked-in copy so a later Astro build includes this PDF.
    copyFileSync(DIST_PDF_PATH, PUBLIC_PDF_PATH);

    console.log(`[resume:pdf] wrote ${path.relative(ROOT, DIST_PDF_PATH)} and ${path.relative(ROOT, PUBLIC_PDF_PATH)}`);
  } finally {
    await browser.close();
    server.close();
  }
}

await main();
