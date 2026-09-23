# n-aylward.github.io

Personal resume site—a static [Astro](https://astro.build) app deployed to GitHub Pages. The webpage, downloadable PDF, and DOCX all build from one data file (`src/data/resume.ts`), so editing it keeps every format in sync.

Live: https://n-aylward.github.io/

## Quick start

Requires Node 22 (see `.node-version`).

```bash
npm install
npm run dev
```

## Editing the resume

All content lives in `src/data/resume.ts` (skills, experience, education) and `src/data/contacts.ts` (email, LinkedIn, GitHub). Edit, then `npm run build` regenerates the webpage, PDF, and DOCX.

## Scripts

| Command                           | What it does                                   |
| --------------------------------- | ---------------------------------------------- |
| `npm run dev`                     | Astro dev server with hot reload               |
| `npm run build`                   | Full build: DOCX, type-check, static site, PDF |
| `npm run resume:docx`             | Just the DOCX                                  |
| `npm run resume:pdf`              | Just the PDF                                   |
| `npm run validate`                | Check the resume data has all required fields  |
| `npm run format` / `format:check` | Prettier                                       |
| `npm run lint`                    | ESLint                                         |

The PDF is a headless-Chrome print of the built webpage, so it can't drift from the live site.

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages.

## Project structure

```
src/data/         resume.ts, contacts.ts
src/pages/        index.astro, 404.astro, og.png.ts, robots.txt.ts
src/components/   Header, Footer, Socials, LinkButton
src/layouts/      Layout.astro
src/styles/       global.css, print.css
src/scripts/      theme.ts
src/utils/        OG image generation
scripts/          generate-resume-{pdf,docx}.mjs, validate-resume-data.mjs
public/assets/    Favicon, generated PDF/DOCX
```

Prose in `src/` is linted by [Vale](https://vale.sh/) in CI.
