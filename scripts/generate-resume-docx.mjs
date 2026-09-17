#!/usr/bin/env node
// Builds a Word (.docx) resume straight from the same canonical data
// that src/pages/index.astro renders (src/data/resume.ts +
// src/data/contacts.ts), so it can never drift from the webpage.
//
// Run standalone with `npm run resume:docx`. Also runs automatically
// as the first step of `npm run build`, before `astro build`, so the
// file lands in public/assets/ in time to be copied into dist/.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import { RESUME } from "../src/data/resume.ts";
import { CONTACTS } from "../src/data/contacts.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const ACCENT = "2C5F7C";
const MUTED_TEXT = "555555";

const contactLine = CONTACTS.map(c =>
  c.href.replace(/^mailto:/, "").replace(/^https?:\/\/(www\.)?/, "")
).join("   ·   ");

function heading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 140 },
    border: { bottom: { style: "single", size: 6, color: ACCENT, space: 4 } },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, color: ACCENT, size: 24 }),
    ],
  });
}

function dateRow(left, right, { leftBold = true, leftColor, leftSize = 22 } = {}) {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    spacing: { after: 20 },
    children: [
      new TextRun({ text: left, bold: leftBold, color: leftColor, size: leftSize }),
      new TextRun({ text: `\t${right}`, italics: true, color: MUTED_TEXT, size: 20 }),
    ],
  });
}

function bullet(text) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

function commaList(label, items) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: `${label}: `, bold: true }),
      new TextRun({ text: items.join(", ") }),
    ],
  });
}

const children = [
  new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: RESUME.name, bold: true, size: 48 })],
  }),
  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: RESUME.title, color: ACCENT, bold: true, size: 26 })],
  }),
  new Paragraph({
    border: { bottom: { style: "single", size: 6, color: "CCCCCC", space: 6 } },
    spacing: { after: 40 },
    children: [new TextRun({ text: contactLine, color: MUTED_TEXT, size: 19 })],
  }),

  heading("Professional Skills"),
  commaList("Proficiency", RESUME.skills.proficiency),
  commaList("Familiarity", RESUME.skills.familiarity),

  heading("Work Experience"),
  ...RESUME.experience.flatMap(company => {
    const rows = [dateRow(company.company, company.dateRange, { leftSize: 22 })];

    if (company.roles.length > 1) {
      for (const role of company.roles) {
        rows.push(
          dateRow(role.title, role.dateRange, { leftColor: ACCENT, leftSize: 20 })
        );
        rows.push(...role.bullets.map(bullet));
      }
    } else {
      const role = company.roles[0];
      rows.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [new TextRun({ text: role.title, bold: true, color: ACCENT, size: 20 })],
        })
      );
      rows.push(...role.bullets.map(bullet));
    }

    rows.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
    return rows;
  }),

  heading("Education"),
  dateRow(RESUME.education.institution, RESUME.education.dateRange, { leftSize: 22 }),
  new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: RESUME.education.degree, bold: true, color: ACCENT, size: 20 }),
    ],
  }),
  commaList("Relevant Coursework", RESUME.education.coursework),
];

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 20 },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 }, // Letter, in twips
          margin: { top: 720, bottom: 720, left: 900, right: 900 },
        },
      },
      children,
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
const outPath = path.join(ROOT, "public", "assets", "aylward-nickolas-resume.docx");
writeFileSync(outPath, buffer);
console.log(`[resume:docx] wrote ${path.relative(ROOT, outPath)} (${buffer.length} bytes)`);
