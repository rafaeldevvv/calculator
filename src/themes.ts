import type { Theme } from "./types";
import * as storage from "./storage.js";

const themes = [
  "theme-blue",
  "theme-white",
  "theme-purple",
  "theme-default",
] as const;

const body = document.body;

function removeTheme() {
  themes.forEach((t) => {
    body.classList.remove(t);
  });
}

function setTheme(t: Theme) {
  removeTheme();
  body.classList.add(t);
  storage.save("theme", t);
}

let initialTheme = storage.get("theme");
if (initialTheme === null) {
  const lightMatch = matchMedia("(prefers-color-scheme: light)");
  if (lightMatch.matches) {
    initialTheme = "theme-white";
  } else {
    initialTheme = "theme-purple";
  }
}

const radios: NodeListOf<HTMLInputElement> =
  document.querySelectorAll(".js-theme-radio");

setTheme(initialTheme as Theme);
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
