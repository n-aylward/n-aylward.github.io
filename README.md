# n-aylward.github.io

Nick Aylward's resume site — a static [Astro](https://astro.build) site deployed to GitHub Pages. The webpage, the downloadable PDF, and the downloadable DOCX are all generated from one shared data file, so editing a single file keeps every format in sync.

Live site: https://n-aylward.github.io/

## Quick start

```bash
npm install
npm run dev
```

This starts a local dev server (Astro prints the URL, typically `http://localhost:4321`) with hot reload.

**Requirements:**

- Node.js 22 (see `.node-version`; use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to match it automatically)
- Google Chrome installed, for the PDF generation step (see [Single-sourcing the resume](#single-sourcing-the-resume) below). Not needed for `npm run dev`.

## Editing the resume content

All resume content — name, title, skills, work experience, education — lives in one place:

- **`src/data/resume.ts`** — skills, experience (companies/roles/bullets), and education.
- **`src/data/contacts.ts`** — email, LinkedIn, and GitHub links.

Edit these files and every output updates automatically:

- The homepage (`src/pages/index.astro`) renders directly from this data.
- The downloadable PDF (`public/assets/aylward-nickolas-resume.pdf`) is a headless-Chrome print of that same homepage.
- A DOCX (`public/assets/aylward-nickolas-resume.docx`) is built straight from the same data with the [`docx`](https://www.npmjs.com/package/docx) library. There's no download link for it on the page on purpose (Nick hands it out directly rather than publishing it) — it's still generated on every build and deployed at a stable URL (`/assets/aylward-nickolas-resume.docx`) if you need to grab or share it.

**You should never need to hand-edit the PDF or DOCX, or touch the resume content inside `index.astro` directly** — change the data file and rebuild instead. See [Single-sourcing the resume](#single-sourcing-the-resume) for how this works under the hood.

## Available scripts

| Command                | What it does                                                                                                                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Starts the local Astro dev server with hot reload.                                                                                                                                                                                                  |
| `npm run build`        | Full production build: regenerates the DOCX, type-checks, builds the static site, regenerates the PDF, then builds and copies the [Pagefind](https://pagefind.app/) search index. Outputs to `dist/`. This is what CI runs on every push to `main`. |
| `npm run preview`      | Serves the built `dist/` folder locally, so you can sanity-check a production build before deploying. Run `npm run build` first.                                                                                                                    |
| `npm run resume:docx`  | Regenerates just `public/assets/aylward-nickolas-resume.docx` from `src/data/resume.ts`. Fast, no browser needed.                                                                                                                                   |
| `npm run resume:pdf`   | Regenerates just the PDF by printing the built site. Requires `dist/` to already exist (run `npm run build` or `astro build` first) — if it doesn't, the script builds it for you automatically.                                                    |
| `npm run sync`         | Regenerates Astro's generated types (`.astro/`). Rarely needed manually.                                                                                                                                                                            |
| `npm run format`       | Formats the whole repo with Prettier (including Astro and Tailwind class sorting).                                                                                                                                                                  |
| `npm run format:check` | Checks formatting without writing changes — useful before committing.                                                                                                                                                                               |
| `npm run lint`         | Runs ESLint over the project.                                                                                                                                                                                                                       |
| `npm run deploy`       | Publishes `dist/` to Cloudflare via `wrangler deploy` (see [Deployment](#deployment) — this is a secondary/manual deploy path; the site's primary deployment is GitHub Pages via Actions).                                                          |

## Single-sourcing the resume

This site used to have the webpage content hardcoded in `index.astro` and a separate, hand-exported PDF — the two would drift out of sync every time one was updated and not the other. That's fixed now:

```
src/data/resume.ts  ─┬─► src/pages/index.astro  (the live webpage)
src/data/contacts.ts ┤
                      ├─► scripts/generate-resume-pdf.mjs  ─► public/assets/aylward-nickolas-resume.pdf
                      └─► scripts/generate-resume-docx.mjs ─► public/assets/aylward-nickolas-resume.docx
```

- **PDF generation** (`scripts/generate-resume-pdf.mjs`) serves the already-built `dist/` folder locally, opens `dist/index.html` in headless Chrome with `@media print` active (see `src/styles/print.css`, which hides the header/footer/download buttons and forces light colors for print), and saves the rendered page as a PDF. Because it's a literal print of the live page, the PDF can never show different content than the website.
- **DOCX generation** (`scripts/generate-resume-docx.mjs`) reads the same `src/data/resume.ts` / `src/data/contacts.ts` data and builds a Word document with the `docx` library — no browser involved.
- Both scripts run automatically as part of `npm run build` (and therefore on every CI deploy — see below), so the published site's downloads are always regenerated fresh. The copies of the PDF/DOCX committed in `public/assets/` are kept up to date locally whenever you run a build, but if you edit resume content, run `npm run build` (or at least `npm run resume:docx`) and commit the refreshed files so the repo itself stays current too.

**Chrome, not a downloaded browser:** `scripts/generate-resume-pdf.mjs` launches your machine's already-installed Google Chrome (`channel: "chrome"` in Puppeteer) rather than downloading a bundled Chromium (`.puppeteerrc.cjs` sets `skipDownload: true`). This keeps `npm install` fast and avoids depending on being able to reach Google's binary CDN. If Chrome isn't found, either install it, or point the script at a specific binary with:

```bash
PUPPETEER_EXECUTABLE_PATH=/path/to/chrome npm run resume:pdf
```

GitHub Actions' `ubuntu-latest` runners and macOS all ship with Chrome preinstalled, so CI and most local machines need no extra setup.

## Project structure

```
src/
  data/
    resume.ts       # Single source of truth: skills, experience, education
    contacts.ts      # Single source of truth: email/LinkedIn/GitHub links
  pages/
    index.astro      # The resume homepage — renders from src/data/
    404.astro
    og.png.ts        # Generates the Open Graph share image
    robots.txt.ts
  components/        # Header, Footer, Socials, LinkButton
  layouts/
    Layout.astro     # Shared <head>, fonts, theme-switching script
  styles/
    global.css       # Tailwind entry point + theme colors
    print.css        # Print-only overrides used by the PDF generator
    typography.css
  scripts/
    theme.ts         # Light/dark theme toggle logic
  assets/icons/       # SVG icons
scripts/
  generate-resume-pdf.mjs   # Builds public/assets/aylward-nickolas-resume.pdf
  generate-resume-docx.mjs  # Builds public/assets/aylward-nickolas-resume.docx
public/
  assets/             # Favicon, and the generated PDF/DOCX
```

## Deployment

The site deploys automatically to **GitHub Pages** via `.github/workflows/deploy.yml` on every push to `main` (or manually via "Run workflow"). It uses [`withastro/action`](https://github.com/withastro/action), which runs this repo's own `npm run build` script — so the deployed site always has a freshly generated PDF and DOCX, even if the committed copies in `public/assets/` are a little behind.

A `wrangler.jsonc` config and `npm run deploy` script also exist for deploying the built `dist/` folder to Cloudflare Workers/Pages as an alternative or secondary target, if you choose to use it.

## Search

Page content is indexed for on-site search with [Pagefind](https://pagefind.app/) as part of `npm run build`. The generated index is copied into `public/pagefind/` (gitignored — it's regenerated on every build) so it's available in both `dist/` and local previews.

## Content style

Pull requests are checked by [Vale](https://vale.sh/) (`.vale.ini`) via `.github/workflows/vale.yml` for prose/style issues in `src/`.
