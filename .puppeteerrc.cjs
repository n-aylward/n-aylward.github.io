// Never download a bundled Chromium: launch the machine's already
// installed Google Chrome instead (see scripts/generate-resume-pdf.mjs).
// This keeps `npm install` fast and avoids depending on being able to
// reach Google's binary CDN from every machine/CI runner.
module.exports = {
  skipDownload: true,
};
