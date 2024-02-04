const themes = ["theme-blue", "theme-white", "theme-purple"] as const;
type Theme = (typeof themes)[number];

const body = document.body;

function removeTheme() {
  themes.forEach((t) => {
    body.classList.remove(t);
  });
}

function setTheme(t: Theme) {
  removeTheme();
  body.classList.add(t);
  localStorage.setItem("calculator-theme", t);
}

const initialTheme = (localStorage.getItem("calculator-theme") ||
  "theme-blue") as Theme;
const radios: NodeListOf<HTMLInputElement> =
  document.querySelectorAll(".theme-radio");

setTheme(initialTheme);
radios.forEach((r) => {
  if (r.value === initialTheme) r.checked = true;
  else r.checked = false;
  
  r.addEventListener("change", changeTheme);
});

function changeTheme(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.checked) {
    const theme = input.value as Theme;
    setTheme(theme);
  }
}
