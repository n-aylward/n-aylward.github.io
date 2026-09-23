const THEME = "theme";
const LIGHT = "light";
const DARK = "dark";

function systemTheme(): string {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK
    : LIGHT;
}

// Use whatever the inline head script wrote, so we don't re-run the
// detection logic and risk disagreeing with the FOUC-prevention path.
let themeValue: string =
  (document.documentElement.dataset.theme as string) || systemTheme();

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
  reflectPreference();
}

reflectPreference();

document
  .querySelector<HTMLButtonElement>("#theme-btn")
  ?.addEventListener("click", () => {
    themeValue = themeValue === LIGHT ? DARK : LIGHT;
    setPreference();
  });

// Sync with system preference changes; only when the user hasn't
// explicitly chosen a theme.
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches: isDark }) => {
    themeValue = isDark ? DARK : LIGHT;
    setPreference();
  });
