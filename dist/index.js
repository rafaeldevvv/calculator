import manageHistoryPopupMenu from "./popup-menu-manager.js";
import { announcePolitely } from "./visually-hidden-announcer.js";
import { formatNumbers } from "./utils.js";
import { prepareExpressionForPresentation, renderHistoryControls, renderHistoryCount, renderHistoryEntries, renderHistoryList, } from "./rendering.js";
import * as storage from "./storage.js";
import alertUser, { dismiss as dismissAlert } from "./custom-alert.js";
import doTheMath from "./calculator.js";
const historyToggle = document.querySelector(".js-history-popover-toggle"), historyPopover = document.getElementById(historyToggle.getAttribute("popovertarget")), shortcutsToggle = document.getElementById("shortcuts-toggle"), ctrls = document.querySelector(".js-controls");
manageHistoryPopupMenu(historyToggle, ctrls);
manageHistoryPopupMenu(shortcutsToggle, ctrls);
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
let historyList = document.querySelector("#history-menu"), historyCtrls;
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
let shownEntries = 5;
function handleDeleteEntry(id) {
    storage.delHistoryEntry(id);
    const history = storage.get("history");
    shownEntries =
        shownEntries > history.length
            ? history.length < 5
                ? 5
                : history.length
            : shownEntries;
    updateHistory();
    announcePolitely("Entry was deleted");
}
function registerHistoryEntriesListeners() {
    const entries = Array.from(historyList.querySelectorAll(".js-history-entry"));
    entries.forEach((e) => {
        const entryRes = e.querySelector(".js-entry-res"), entryExp = e.querySelector(".js-entry-exp"), entryDelBtn = e.querySelector(".js-entry-del"), id = Number(e.getAttribute("data-entry-id"));
        entryExp.addEventListener("click", () => {
            handleSelectClick(id, "exp");
        });
        entryDelBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            handleDeleteEntry(id);
        });
        entryRes.addEventListener("click", () => {
            handleSelectClick(id, "res");
        });
    });
}
function registerHistoryCtrlsListeners() {
    const clearBtn = document.querySelector(".js-clear-btn"), seeMoreBtn = document.querySelector(".js-see-more-btn"), seeLessBtn = document.querySelector(".js-see-less-btn");
    clearBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        storage.clearHistory();
        announcePolitely("History cleared!");
        updateHistory();
    });
    seeMoreBtn.addEventListener("click", () => {
        const history = storage.get("history");
        const nextShownEntries = shownEntries + 5;
        shownEntries = Math.min(history.length, nextShownEntries);
        updateHistory();
    });
    seeLessBtn.addEventListener("click", () => {
        const nextShownEntries = shownEntries - 5;
        shownEntries = Math.max(nextShownEntries, 5);
        updateHistory();
    });
}
function updateHistoryCtrlsDisabledState() {
    const history = storage.get("history");
    const seeMoreBtn = document.querySelector(".js-see-more-btn"), seeLessBtn = document.querySelector(".js-see-less-btn");
    seeLessBtn.disabled = shownEntries === 5;
    seeMoreBtn.disabled = shownEntries >= history.length;
}
function updateHistory() {
    var _a;
    const history = storage.get("history"), { length } = history;
    if (length !== 0) {
        historyDescription.textContent = "Select an expression or result.";
        if (historyList === null) {
            const historyListHTML = renderHistoryList(history.slice(0, shownEntries)), ctrls = renderHistoryControls(length, shownEntries, 5), count = renderHistoryCount(length);
            historySection.insertAdjacentHTML("beforeend", count + historyListHTML + ctrls);
            registerHistoryCtrlsListeners();
            historyList = document.querySelector("#history-menu");
            historyCtrls = document.querySelector(".js-history-ctrls");
        }
        else {
            const count = document.querySelector("#history-count");
            const historyEntries = renderHistoryEntries(history.slice(0, shownEntries));
            historyList.innerHTML = historyEntries;
            count.textContent = `${length} calculation${length === 1 ? "" : "s"} stored:`;
        }
        registerHistoryEntriesListeners();
        updateHistoryCtrlsDisabledState();
    }
    else {
        historyDescription.textContent =
            "Your previous calculations will appear here.";
        historyList === null || historyList === void 0 ? void 0 : historyList.remove();
        historyCtrls === null || historyCtrls === void 0 ? void 0 : historyCtrls.remove();
        (_a = document.querySelector("#history-count")) === null || _a === void 0 ? void 0 : _a.remove();
        historyCtrls = null;
        historyList = null;
    }
}
updateHistory();
function deleteLastSymbol() {
    updateExpression(expression.slice(0, expression.length - 1));
    updateExpressionDOM(expression);
}
function addSymbol(symb) {
    updateExpression(expression + symb);
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
function resetExp() {
    updateExpression("");
    updateExpressionDOM(expression);
}
resetKey.addEventListener("click", () => {
    resetExp();
    dismissAlert();
});
delKey.addEventListener("click", () => {
    deleteLastSymbol();
    dismissAlert();
});
const validChrs = new Set([
    "+",
    "-",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "(",
    ")",
    "^",
    "%",
    "x",
]);
window.addEventListener("keydown", (e) => {
    const { key } = e;
    if (e.ctrlKey) {
        if (key == "z") {
            expression = previousExpressions.pop() || "";
            updateExpressionDOM(expression);
        }
    }
    else if (validChrs.has(key)) {
        e.preventDefault();
        addSymbol(key);
        dismissAlert();
    }
    else {
        switch (key) {
            case "Backspace": {
                dismissAlert();
                deleteLastSymbol();
                break;
            }
            case "/": {
                dismissAlert();
                addSymbol("÷");
                break;
            }
            case "=": {
                e.preventDefault();
                dismissAlert();
                showResult();
                break;
            }
            case "r": {
                resetExp();
                dismissAlert();
            }
        }
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
