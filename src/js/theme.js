const THEME_KEY = "foodie_theme";
const root = document.documentElement;
const themeButtons = document.querySelectorAll("[data-theme-toggle]");

function getPreferredTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  root.dataset.theme = theme;

  themeButtons.forEach((button) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    button.textContent = theme === "dark" ? "☀️" : "🌙";
    button.setAttribute("title", `Switch to ${nextTheme} mode`);
  });
}

function toggleTheme() {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

applyTheme(getPreferredTheme());

themeButtons.forEach((button) => {
  button.addEventListener("click", toggleTheme);
});
