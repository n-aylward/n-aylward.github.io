#!/usr/bin/env node
// Create the DOCX resume from the same data as the homepage. Run this
// script alone with `npm run resume:docx`, or as part of `npm run build`.
// The build runs this script before Astro copies public files into dist/.

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

  new Paragraph({
    spacing: { before: 100, after: 120 },
    children: [new TextRun({ text: RESUME.introduction })],
  }),

  heading("Areas of Expertise"),
  new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: RESUME.areasOfExpertise.join(" | ") })],
  }),

  heading("Technical Proficiencies"),
  new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "Proficiency: ", bold: true }),
      new TextRun({ text: RESUME.skills.proficiency.join(", ") }),
      new TextRun({ text: "\nFamiliarity: ", bold: true, break: 1 }),
      new TextRun({ text: RESUME.skills.familiarity.join(", ") }),
    ],
  }),

  heading("Professional Experience"),
  ...RESUME.experience.filter(company => !company.additional).flatMap(company => {
    const rows = [dateRow(`${company.company} · ${company.location}`, company.dateRange, { leftSize: 22 })];

    for (const role of company.roles) {
      rows.push(
        dateRow(role.title, role.dateRange, { leftColor: ACCENT, leftSize: 20 })
      );
      rows.push(...role.bullets.map(bullet));
    }

    rows.push(new Paragraph({ spacing: { after: 160 }, children: [] }));
    return rows;
  }),

  heading("Additional Experience"),
  ...RESUME.experience
    .filter(company => company.additional)
    .flatMap(company =>
      [
        dateRow(`${company.company} · ${company.location}`, company.dateRange, { leftSize: 22 }),
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: company.roles[0].title, bold: true, color: ACCENT, size: 20 }),
          ],
        }),
        ...company.roles[0].bullets.map(bullet),
      ]
    ),

  heading("Education"),
  dateRow(RESUME.education.institution, RESUME.education.dateRange, { leftSize: 22 }),
  new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: RESUME.education.degree, bold: true, color: ACCENT, size: 20 }),
    ],
  }),
  new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: RESUME.education.coursework.join(" · ") })],
  }),
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
          size: { width: 12240, height: 15840 }, // US Letter page size, in twentieths of a point.
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
