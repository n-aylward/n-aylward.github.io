// Plain contact data, shared by the Astro site (src/constants.ts adds
// icons on top of this) and by the Node-only PDF/DOCX generator
// scripts in scripts/, which can't import Astro-specific modules
// (like the SVG icon imports in constants.ts).

export interface Contact {
  name: "GitHub" | "LinkedIn" | "Mail";
  href: string;
}

export const CONTACTS: Contact[] = [
  { name: "GitHub", href: "https://github.com/n-aylward" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/nick-a-b2666b57" },
  { name: "Mail", href: "mailto:nickolas.aylward@protonmail.com" },
];
