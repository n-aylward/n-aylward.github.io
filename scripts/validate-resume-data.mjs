#!/usr/bin/env node
// Check that resume and contact data include the fields used by the
// website and document generators. This catches missing content before
// it appears in a build.

import { RESUME } from "../src/data/resume.ts";
import { CONTACTS } from "../src/data/contacts.ts";

const errors = [];

function required(value, path, label) {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${label} (${path}) is missing or empty`);
  }
}

function requiredArray(value, path, label) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label} (${path}) must be a non-empty array`);
  }
}

required(RESUME.name, "name", "Name");
required(RESUME.title, "title", "Title");
required(RESUME.introduction, "introduction", "Introduction");

requiredArray(RESUME.skills?.proficiency, "skills.proficiency", "Proficiency skills");
requiredArray(RESUME.skills?.familiarity, "skills.familiarity", "Familiarity skills");

requiredArray(RESUME.experience, "experience", "Work experience");
RESUME.experience?.forEach((company, i) => {
  const prefix = `experience[${i}] (${company?.company ?? "?"})`;
  required(company?.company, "company", "Company name");
  required(company?.dateRange, "dateRange", "Company date range");
  requiredArray(company?.roles, "roles", "Roles");
  company?.roles?.forEach((role, j) => {
    const rprefix = `${prefix}.roles[${j}] (${role?.title ?? "?"})`;
    required(role?.title, "title", "Role title");
    required(role?.dateRange, "dateRange", "Role date range");
    requiredArray(role?.bullets, "bullets", "Role bullets");
    role?.bullets?.forEach((bullet, k) => {
      if (typeof bullet !== "string" || !bullet.trim()) {
        errors.push(`${rprefix}.bullets[${k}] must be a non-empty string`);
      }
    });
  });
});

required(RESUME.education?.institution, "education.institution", "Education institution");
required(RESUME.education?.dateRange, "education.dateRange", "Education date range");
required(RESUME.education?.degree, "education.degree", "Education degree");
requiredArray(RESUME.education?.coursework, "education.coursework", "Education coursework");

requiredArray(CONTACTS, "contacts", "Contacts");
CONTACTS?.forEach((contact, i) => {
  const prefix = `contacts[${i}] (${contact?.name ?? "?"})`;
  required(contact?.name, "name", "Contact name");
  required(contact?.href, "href", "Contact href");
  if (!/^(https?:\/\/|mailto:)/.test(contact?.href ?? "")) {
    errors.push(`${prefix}.href must start with http(s):// or mailto:`);
  }
});

if (errors.length > 0) {
  console.error("[validate-resume-data] FAILED:");
  for (const err of errors) console.error("  - " + err);
  process.exit(1);
}

const companyCount = RESUME.experience.length;
const roleCount = RESUME.experience.reduce((n, c) => n + c.roles.length, 0);
console.log(
  `[validate-resume-data] OK (${companyCount} companies, ${roleCount} roles, ${CONTACTS.length} contacts)`
);
