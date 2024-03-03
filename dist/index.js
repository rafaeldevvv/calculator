import manageHistoryPopupMenu from "./popup-menu-manager.js";
import { announcePolitely } from "./visually-hidden-announcer.js";
import { formatNumbers } from "./utils.js";
import { prepareExpressionForPresentation, renderHistoryEntries, renderHistoryList, } from "./rendering.js";
import * as storage from "./storage.js";
import alertUser, { dismiss as dismissAlert } from "./custom-alert.js";
import doTheMath from "./calculator.js";
const historyToggle = document.querySelector(".js-history-popover-toggle"), historyPopover = document.getElementById(historyToggle.getAttribute("popovertarget"));
manageHistoryPopupMenu(historyToggle);
let expression = "", previousExpressions = [expression];
function announceExpression() {
    if (expression) {
        announcePolitely(`Current expression is ${expression}`);
    }
    else {
        announcePolitely("Expression is empty");
    }
}
const calculator = document.querySelector(".js-calculator"), symbolKeys = calculator.querySelectorAll("[data-symbol]"), resetKey = calculator.querySelector(".js-reset-key"), delKey = calculator.querySelector(".js-del-key"), resultKey = calculator.querySelector(".js-result-key"), copyButton = calculator.querySelector(".js-copy-button"), copyIcon = copyButton.querySelector(".js-icon"), expressionContainer = calculator.querySelector(".js-expression-container"), expressionContent = calculator.querySelector(".js-expression__content"), historySection = document.querySelector("#history-section"), historyDescription = document.querySelector("#history-description");
let historyList = document.querySelector("#history-menu");
function animateExpression() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
    expressionContent.animate([
        { opacity: 0, transform: "translateY(300%)" },
        { opacity: 1, transform: "translateY(0%)" },
    ], { duration: 500, fill: "forwards" });
}
function updateExpressionDOM(exp, animate = false) {
    let contents = formatNumbers(exp);
    expressionContent.innerHTML = prepareExpressionForPresentation(contents);
    expressionContainer.scrollLeft = expressionContainer.scrollWidth;
    if (animate) {
        animateExpression();
    }
}
function updateExpression(newExp) {
    previousExpressions.push(expression);
    expression = newExp;
    announceExpression();
}
function handleSelectClick(id, target) {
    const entry = storage.get("history").find((e) => e.id === id);
    const newExp = (target === "exp" ? entry.expression : entry.result).toString();
    updateExpression(newExp);
    updateExpressionDOM(newExp, true);
    historyPopover.hidePopover();
}
function handleDeleteEntry(id) {
    storage.delHistoryEntry(id);
    updateHistory();
}
function registerHistoryEntriesListeners() {
    const entries = Array.from(historyList.querySelectorAll(".js-history-entry"));
    entries.forEach((e) => {
        const entryRes = e.querySelector(".js-entry-res"), entryExp = e.querySelector(".js-entry-exp"), entryDelBtn = e.querySelector(".js-entry-del"), id = Number(e.getAttribute("data-entry-id"));
        entryExp.addEventListener("click", () => {
            handleSelectClick(id, "exp");
        });
        entryDelBtn.addEventListener("click", () => {
            handleDeleteEntry(id);
        });
        entryRes.addEventListener("click", () => {
            handleSelectClick(id, "res");
        });
    });
}
let shownEntries = 10;
function updateHistory() {
    const history = storage.get("history");
    if (history.length !== 0) {
        historyDescription.textContent = "Select an expression or result.";
        if (historyList === null) {
            const historyListHTML = renderHistoryList(history);
            historySection.insertAdjacentHTML("beforeend", historyListHTML);
            historyList = document.querySelector("#history-menu");
        }
        else {
            const historyEntries = renderHistoryEntries(history.slice(0, shownEntries));
            historyList.innerHTML = historyEntries;
        }
        registerHistoryEntriesListeners();
    }
    else if (historyList) {
        historyDescription.textContent =
            "Your previous calculations will appear here.";
        historyList.remove();
        historyList = null;
    }
}
updateHistory();
function deleteLastSymbol() {
    updateExpression(expression.slice(0, expression.length - 1));
    updateExpressionDOM(expression);
}
symbolKeys.forEach((k) => {
    const symbol = k.getAttribute("data-symbol");
    k.addEventListener("click", () => {
        if (expression.includes("NaN") || expression.includes("Infinity")) {
            expression = "";
        }
        updateExpression(expression + symbol);
        updateExpressionDOM(expression);
        dismissAlert();
    });
});
resetKey.addEventListener("click", () => {
    updateExpression("");
    updateExpressionDOM(expression);
    dismissAlert();
});
delKey.addEventListener("click", () => {
    deleteLastSymbol();
    dismissAlert();
});
window.addEventListener("keydown", (e) => {
    if (e.ctrlKey) {
        if (e.key == "z") {
            expression = previousExpressions.pop() || "";
            updateExpressionDOM(expression);
        }
    }
    else if (e.key === "Backspace") {
        deleteLastSymbol();
        dismissAlert();
    }
});
resultKey.addEventListener("click", showResult);
copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(expression).then(() => {
        announcePolitely("copied!");
        copyIcon.classList.remove("fa-copy");
        copyIcon.classList.add("fa-check");
        setTimeout(() => {
            copyIcon.classList.remove("fa-check");
            copyIcon.classList.add("fa-copy");
        }, 1500);
    });
});
function showResult() {
    if (expression.length === 0)
        return;
    try {
        const result = doTheMath(expression);
        storage.addHistoryEntry({ expression, result });
        updateExpression(result.toString());
        updateHistory();
        updateExpressionDOM(expression, true);
        announcePolitely(`The result is ${result}`);
    }
    catch (err) {
        alertUser(err);
        console.error(err);
    }
}
