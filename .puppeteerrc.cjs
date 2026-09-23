// Skip Puppeteer's automatic Chromium download at `npm install` time.
// scripts/generate-resume-pdf.mjs launches the machine's already
// installed Google Chrome first, and only downloads a Chrome build
// itself (via an explicit, lazy `puppeteer browsers install` CLI
// call, unaffected by this setting) as a fallback for CI images that
// don't ship one. This keeps `npm install` fast and avoids an
// eager, often-unnecessary fetch from Google's binary CDN.
module.exports = {
  skipDownload: true,
};
