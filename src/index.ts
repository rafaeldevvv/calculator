import manageHistoryPopupMenu from "./popup-menu-manager.js";
import { announcePolitely } from "./visually-hidden-announcer.js";
import { formatNumbers } from "./utils.js";
import {
  prepareExpressionForPresentation,
  renderHistoryControls,
  renderHistoryCount,
  renderHistoryEntries,
  renderHistoryList,
} from "./rendering.js";
import * as storage from "./storage.js";
import alertUser, { dismiss as dismissAlert } from "./custom-alert.js";
import doTheMath from "./calculator.js";

const historyToggle = document.querySelector(
    ".js-history-popover-toggle"
  ) as HTMLElement,
  historyPopover = document.getElementById(
    historyToggle.getAttribute("popovertarget") as string
  ) as HTMLElement;

manageHistoryPopupMenu(historyToggle);

let expression = "",
  previousExpressions = [expression];

function announceExpression() {
  if (expression) {
    announcePolitely(`Current expression is ${expression}`);
  } else {
    announcePolitely("Expression is empty");
  }
}

const calculator = document.querySelector(".js-calculator") as HTMLElement,
  /* 
   all nodes that have a data-symbol attribute 
   are used to add a symbol to the expression 
 */
  symbolKeys = calculator.querySelectorAll("[data-symbol]"),
  resetKey = calculator.querySelector(".js-reset-key") as HTMLButtonElement,
  delKey = calculator.querySelector(".js-del-key") as HTMLButtonElement,
  resultKey = calculator.querySelector(".js-result-key") as HTMLButtonElement,
  copyButton = calculator.querySelector(".js-copy-button") as HTMLButtonElement,
  copyIcon = copyButton.querySelector(".js-icon") as HTMLElement,
  expressionContainer = calculator.querySelector(
    ".js-expression-container"
  ) as HTMLElement,
  expressionContent = calculator.querySelector(
    ".js-expression__content"
  ) as HTMLElement,
  historySection = document.querySelector("#history-section")!,
  historyDescription = document.querySelector(
    "#history-description"
  ) as HTMLParagraphElement;

let historyList = document.querySelector("#history-menu"),
  historyCtrls: Element | undefined | null;

function animateExpression() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  expressionContent.animate(
    [
      { opacity: 0, transform: "translateY(300%)" },
      { opacity: 1, transform: "translateY(0%)" },
    ],
    { duration: 500, fill: "forwards" }
  );
}

function updateExpressionDOM(exp: string, animate = false) {
  let contents = formatNumbers(exp);
  expressionContent.innerHTML = prepareExpressionForPresentation(contents);
  expressionContainer.scrollLeft = expressionContainer.scrollWidth;

  if (animate) {
    animateExpression();
  }
}

function updateExpression(newExp: string) {
  previousExpressions.push(expression);
  expression = newExp;
  announceExpression();
}

function handleSelectClick(id: number, target: "res" | "exp") {
  const entry = storage.get("history").find((e) => e.id === id)!;

  const newExp = (
    target === "exp" ? entry.expression : entry.result
  ).toString();
  updateExpression(newExp);
  updateExpressionDOM(newExp, true);
  historyPopover.hidePopover();
}

let shownEntries = 5;
function handleDeleteEntry(id: number) {
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
  const entries = Array.from(
    historyList!.querySelectorAll(".js-history-entry")
  );

  entries.forEach((e) => {
    const entryRes = e.querySelector(".js-entry-res")!,
      entryExp = e.querySelector(".js-entry-exp")!,
      entryDelBtn = e.querySelector(".js-entry-del")!,
      id = Number(e.getAttribute("data-entry-id"));

    /* there's no need to remove previous event listeners because when a node is
    removed and there's no reference to it, its event listeners are removed automatically.
    https://stackoverflow.com/questions/12528049/if-a-dom-element-is-removed-are-its-listeners-also-removed-from-memory#:~:text=According%20to%20the%20jquery%20Documentation,listeners%20are%20removed%20from%20memory.*/

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

function registerHistoryCtrlsListeners() {
  const clearBtn = document.querySelector(
      ".js-clear-btn"
    )! as HTMLButtonElement,
    seeMoreBtn = document.querySelector(
      ".js-see-more-btn"
    )! as HTMLButtonElement,
    seeLessBtn = document.querySelector(
      ".js-see-less-btn"
    )! as HTMLButtonElement;

  clearBtn.addEventListener("click", () => {
    storage.clearHistory();
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

  const seeMoreBtn = document.querySelector(
      ".js-see-more-btn"
    )! as HTMLButtonElement,
    seeLessBtn = document.querySelector(
      ".js-see-less-btn"
    )! as HTMLButtonElement;

  seeLessBtn.disabled = shownEntries === 5;
  seeMoreBtn.disabled = shownEntries >= history.length;
}

function updateHistory() {
  const history = storage.get("history"),
    { length } = history;
  if (length !== 0) {
    historyDescription.textContent = "Select an expression or result.";
    if (historyList === null) {
      const historyListHTML = renderHistoryList(history.slice(0, shownEntries)),
        ctrls = renderHistoryControls(length, shownEntries, 5),
        count = renderHistoryCount(length);

      historySection.insertAdjacentHTML(
        "beforeend",
        count + historyListHTML + ctrls
      );
      registerHistoryCtrlsListeners();
      historyList = document.querySelector("#history-menu");
      historyCtrls = document.querySelector(".js-history-ctrls");
    } else {
      const count = document.querySelector("#history-count") as HTMLElement;
      const historyEntries = renderHistoryEntries(
        history.slice(0, shownEntries)
      );
      historyList.innerHTML = historyEntries;
      count.textContent = `${length} calculation${
        length === 1 ? "" : "s"
      } stored:`;
    }
    registerHistoryEntriesListeners();
    updateHistoryCtrlsDisabledState();
  } else {
    historyDescription.textContent =
      "Your previous calculations will appear here.";
    historyList?.remove();
    historyCtrls?.remove();
    document.querySelector("#history-count")?.remove();
    historyCtrls = null;
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
  } else if (e.key === "Backspace") {
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
  if (expression.length === 0) return;
  try {
    const result = doTheMath(expression);

    storage.addHistoryEntry({ expression, result });

    updateExpression(result.toString());
    updateHistory();
    updateExpressionDOM(expression, true);
    announcePolitely(`The result is ${result}`);
  } catch (err) {
    alertUser(err as any);
    console.error(err);
  }
}
