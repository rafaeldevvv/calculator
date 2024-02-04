"use strict";
const themes = ["theme-blue", "theme-white", "theme-purple"];
const body = document.body;
function removeTheme() {
    themes.forEach((t) => {
        body.classList.remove(t);
    });
}
function setTheme(t) {
    removeTheme();
    body.classList.add(t);
    localStorage.setItem("calculator-theme", t);
}
const initialTheme = (localStorage.getItem("calculator-theme") ||
    "theme-blue");
const radios = document.querySelectorAll(".theme-radio");
setTheme(initialTheme);
radios.forEach((r) => {
    if (r.value === initialTheme)
        r.checked = true;
    else
        r.checked = false;
    r.addEventListener("change", changeTheme);
});
function changeTheme(e) {
    const input = e.target;
    if (input.checked) {
        const theme = input.value;
        setTheme(theme);
    }
}
