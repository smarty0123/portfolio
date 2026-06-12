// Automatically update copyright year
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Theme toggle — dark by default, choice persists (initial theme is set in <head>)
const themeMeta = document.querySelector('meta[name="theme-color"]');
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  if (themeMeta) {
    themeMeta.content = theme === "light" ? "#fafafa" : "#131313";
  }
}

applyTheme(document.documentElement.dataset.theme || "dark");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
}
