const THEME = "theme";
const LIGHT = "light";
const DARK = "dark";

function systemTheme(): string {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK
    : LIGHT;
}

// A small script near the top of the page sets the theme before it appears.
// Reuse that value so the theme doesn't change during startup.
let themeValue: string =
  (document.documentElement.dataset.theme as string) || systemTheme();
const storedTheme = localStorage.getItem(THEME);
let hasUserPreference = storedTheme === LIGHT || storedTheme === DARK;

function reflectPreference(): void {
  document.documentElement.setAttribute("data-theme", themeValue);
  const btn = document.querySelector<HTMLButtonElement>("#theme-btn");
  if (btn) {
    btn.setAttribute("aria-pressed", String(themeValue === DARK));
  }
  const meta = document.querySelector<HTMLMetaElement>(
    "meta[name='theme-color']"
  );
  const body = document.body;
  if (meta && body) {
    meta.setAttribute("content", getComputedStyle(body).backgroundColor);
  }
}

function setPreference(): void {
  localStorage.setItem(THEME, themeValue);
  hasUserPreference = true;
  reflectPreference();
}

reflectPreference();

document
  .querySelector<HTMLButtonElement>("#theme-btn")
  ?.addEventListener("click", () => {
    themeValue = themeValue === LIGHT ? DARK : LIGHT;
    setPreference();
  });

// Follow system changes until the user chooses a theme.
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    if (hasUserPreference) return;

    themeValue = isDark ? DARK : LIGHT;
    reflectPreference();
  });
