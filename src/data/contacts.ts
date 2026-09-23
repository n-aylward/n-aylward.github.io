// The website adds icons when it displays these links. The PDF and DOCX
// scripts also use them, so this file does not depend on website components.

export interface Contact {
  name: "GitHub" | "LinkedIn" | "Mail";
  href: string;
}

export const CONTACTS: Contact[] = [
  { name: "GitHub", href: "https://github.com/n-aylward" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/nick-a-b2666b57" },
  { name: "Mail", href: "mailto:nickolas.aylward@protonmail.com" },
];
