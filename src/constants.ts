import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import { SITE } from "@/config";
import { CONTACTS } from "@/data/contacts";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

const ICONS: Record<
  (typeof CONTACTS)[number]["name"],
  (_props: Props) => Element
> = {
  GitHub: IconGitHub,
  LinkedIn: IconLinkedin,
  Mail: IconMail,
};

const LINK_TITLES: Record<(typeof CONTACTS)[number]["name"], string> = {
  GitHub: `${SITE.title} on GitHub`,
  LinkedIn: `${SITE.title} on LinkedIn`,
  Mail: `Send an email to ${SITE.title}`,
};

export const SOCIALS: Social[] = CONTACTS.map(contact => ({
  name: contact.name,
  href: contact.href,
  linkTitle: LINK_TITLES[contact.name],
  icon: ICONS[contact.name],
}));
