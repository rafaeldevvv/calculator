import alertUser from "./custom-alert.js";
import { announcePolitely } from "./visually-hidden-announcer.js";
import managePopupMenu from "./popup-menu-manager.js";
import * as storage from "./storage.js";
import { renderHistoryEntries, prepareExpressionForPresentation, } from "./rendering.js";
import { spliceString } from "./utils.js";
managePopupMenu(document.querySelector(".js-menu-parent"));
let expression = "";
function announceExpression() {
    if (expression) {
        announcePolitely(`Current expression is ${expression}`);
    }
    else {
        announcePolitely("Expression is empty");
    }
}
const calculator = document.querySelector(".js-calculator"), symbolKeys = calculator.querySelectorAll("[data-symbol]"), resetKey = calculator.querySelector(".js-reset-key"), delKey = calculator.querySelector(".js-del-key"), resultKey = calculator.querySelector(".js-result-key"), expressionContainer = calculator.querySelector(".js-expression-container"), expressionContent = calculator.querySelector(".js-expression__content"), historyMenu = document.querySelector("#history-menu"), historyDescription = document.querySelector("#history-description");
function animateExpression() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
    expressionContent.animate([
        { opacity: 0, transform: "translateY(300%)" },
        { opacity: 1, transform: "translateY(0%)" },
    ], { duration: 500, fill: "forwards" });
}
function updateCalculatorExpression(exp, animate = false) {
    expressionContent.innerHTML = prepareExpressionForPresentation(exp);
    expressionContainer.scrollLeft = expressionContainer.scrollWidth;
    if (animate) {
        animateExpression();
    }
}
const listenedHistoryIds = [];
function handleEntryClick(id) {
    const entry = storage.get("history").find((e) => e.id === id);
    expression = entry.expression;
    updateCalculatorExpression(expression, true);
    announceExpression();
}
function registerHistoryEntriesListeners() {
    const entries = historyMenu.querySelectorAll("[role=menuitem]");
    entries.forEach((e) => {
        const id = Number(e.getAttribute("data-entry-id"));
        if (!listenedHistoryIds.includes(id)) {
            e.addEventListener("click", () => {
                handleEntryClick(id);
            });
        }
    });
}
function updateHistory() {
    const history = storage.get("history");
    if (history.length !== 0) {
        const historyContent = renderHistoryEntries(history);
        historyMenu.innerHTML = historyContent;
        historyDescription.textContent = "Click to select an expression.";
        registerHistoryEntriesListeners();
    }
}
updateHistory();
function deleteLastSymbol() {
    expression = expression.slice(0, expression.length - 1);
    updateCalculatorExpression(expression);
    announceExpression();
}
symbolKeys.forEach((k) => {
    const symbol = k.getAttribute("data-symbol");
    k.addEventListener("click", () => {
        if (expression.includes("NaN") || expression.includes("Infinity")) {
            expression = "";
        }
        expression += symbol;
        updateCalculatorExpression(expression);
        announceExpression();
    });
});
resetKey.addEventListener("click", () => {
    expression = "";
    updateCalculatorExpression(expression);
    announceExpression();
});
delKey.addEventListener("click", deleteLastSymbol);
window.addEventListener("keydown", (e) => {
    if (e.key === "Backspace")
        deleteLastSymbol();
});
resultKey.addEventListener("click", showResult);
function showResult() {
    if (expression.length === 0)
        return;
    try {
        const result = doTheMath(expression);
        storage.addHistoryEntry({ expression, result });
        expression = result.toString();
        updateHistory();
        updateCalculatorExpression(expression, true);
        announcePolitely(`The result is ${result}`);
    }
    catch (err) {
        alertUser(err);
    }
}
const operators = ["+", "-", "x", "÷", "^"];
const operatorsFunctions = {
    x: (a, b) => a * b,
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "÷": (a, b) => a / b,
    "^": Math.pow,
};
const number = /([-+]?\d+\.\d+)|([-+]?\d+\.?)|([-+]?\.?\d+)/, onlyNumber = /^(([-+]?\d+\.\d+)|([-+]?\d+\.?)|([-+]?\.?\d+))$/, bracketExpression = /\([-+÷x^.\d]+\)/, percentage = /(\.\d+|\d+(\.\d*)?|\(.*\))%/g;
function expRegExp(operatorCharacterClass) {
    return new RegExp(`(${number.source})(${operatorCharacterClass})(${number.source})`);
}
const firstExps = expRegExp("[\\^]"), secondExps = expRegExp("[x÷]"), thirdExps = expRegExp("[-+]");
const precedenceRules = [firstExps, secondExps, thirdExps];
function destructureExpression(exp) {
    const firstTermMatch = number.exec(exp), term1 = firstTermMatch[0], rest = exp.slice(term1.length), operator = rest[0], term2 = rest.slice(1);
    return [Number(term1), operator, Number(term2)];
}
function doTheMath(exp) {
    checkValidity(exp);
    if (onlyNumber.test(exp)) {
        return Number(exp);
    }
    exp = addMissingMultiplicationSigns(exp);
    exp = replacePercentages(exp);
    console.log(exp);
    while (exp.includes("(")) {
        const bracketExpressionMatch = bracketExpression.exec(exp), { index } = bracketExpressionMatch, bracketExpressionString = bracketExpressionMatch[0], matchLength = bracketExpressionString.length, innerExp = bracketExpressionString.slice(1, matchLength - 1);
        const result = doTheMath(innerExp).toString();
        exp = spliceString(exp, index, matchLength, result);
        exp = fixSigns(exp);
    }
    if (onlyNumber.test(exp)) {
        return Number(exp);
    }
    exp = precedenceRules.reduce(solveExpressions, exp);
    return Number(exp);
}
function addMissingMultiplicationSigns(exp) {
    exp = exp.replaceAll(")(", ")x(");
    exp = exp.replace(/(\d|\.)\(/g, "$1x(");
    exp = exp.replace(/\)(\d|\.)/g, ")x$1");
    exp = exp.replace(/%(\(|\d)/, "%x$1");
    return exp;
}
function replacePercentages(exp) {
    exp = exp.replaceAll(percentage, "($1÷100)");
    return exp;
}
function fixSigns(exp) {
    exp = exp.replaceAll("+-", "-");
    exp = exp.replaceAll("-+", "-");
    exp = exp.replaceAll("--", "+");
    exp = exp.replaceAll("++", "+");
    return exp;
}
function solveExpressions(exp, targetExpressionRegExp) {
    while (exp.search(targetExpressionRegExp) !== -1) {
        const match = targetExpressionRegExp.exec(exp);
        if (!match)
            break;
        const expression = match[0], { index } = match;
        const [term1, operator, term2] = destructureExpression(expression);
        const operatorFunc = operatorsFunctions[operator], result = operatorFunc(term1, term2);
        if (exp.length === expression.length) {
            exp = result.toString();
            continue;
        }
        let before = exp.substring(0, index), after = exp.substring(index + expression.length);
        if (before !== "" && result >= 0) {
            before += "+";
        }
        exp = before + result + after;
    }
    return exp;
}
const maxNumberLength = Number.MAX_SAFE_INTEGER.toString().length;
const tooBigNumber = new RegExp(String.raw `\d{${maxNumberLength + 1},}|[+-]?\d+(\.\d+)?e[+-]\d+`), multipleOperators = /([-+÷x^%]{2,})/, multipleDots = /(\.{2,})/, missingOperand = /(\d+[-+÷x^])$/, invalidDot = /\D\.\D/, invalidDotAlone = /^(\.|\.\D|\D\.)$/, invalidNaNOrInfinity = /NaN|Infinity/, singleOperator = /^[-+÷x^%]$/, emptyParenthesis = /\(\)/, singleBracket = /^(\(|\))$/, operatorAndBracket = /[-+÷x^]\)|\([x÷^%]/, invalidDecimal = /\d*(\.\d*){2,}/, invalidOperator = /^[÷x^%]/;
const errorTests = [
    {
        test: tooBigNumber,
        message: "Number is too big: '*'",
        ErrorConstructor: RangeError,
    },
    {
        test: multipleOperators,
        message: "You cannot put multiple operators together: '*'",
        ErrorConstructor: SyntaxError,
    },
    {
        test: multipleDots,
        message: "Invalid expression: '*'",
        ErrorConstructor: SyntaxError,
    },
    {
        test: missingOperand,
        message: "You forgot a number in '*'",
        ErrorConstructor: SyntaxError,
    },
    {
        test: invalidDot,
        message: "Invalid dot: '*'",
        ErrorConstructor: SyntaxError,
    },
    {
        test: invalidDotAlone,
        message: "Invalid dot: '*'",
        ErrorConstructor: SyntaxError,
    },
    {
        test: invalidNaNOrInfinity,
        message: "Invalid expression: '*'",
        ErrorConstructor: SyntaxError,
    },
    {
        test: singleOperator,
        message: "You forgot the numbers for '*'",
        ErrorConstructor: SyntaxError,
    },
    {
        test: emptyParenthesis,
        message: "Empty parenthesis are not allowed: '*'",
        ErrorConstructor: SyntaxError,
    },
    {
        test: singleBracket,
        message: "Invalid bracket: '*'",
        ErrorConstructor: SyntaxError,
    },
    {
        test: operatorAndBracket,
        message: "Invalid operator and bracket combination: '*'",
        ErrorConstructor: SyntaxError,
    },
    {
        test: invalidDecimal,
        message: "Invalid number: '*'",
        ErrorConstructor: SyntaxError,
    },
    {
        test: invalidOperator,
        message: "Invalid operator at the beginning of expression: '*'",
        ErrorConstructor: SyntaxError,
    },
];
function checkClosedParenthesis(exp) {
    let open = 0, valid = true;
    for (const ch of exp) {
        if (ch === "(") {
            open++;
        }
        else if (ch === ")") {
            if (open > 0) {
                open--;
            }
            else {
                valid = false;
                break;
            }
        }
    }
    return valid && open === 0;
}
function checkValidity(exp) {
    errorTests.forEach(({ test, message, ErrorConstructor }) => {
        const match = test.exec(exp);
        if (match) {
            throw new ErrorConstructor(message.replace("*", match[0]));
        }
    });
    const correctlyParenthesized = checkClosedParenthesis(exp);
    if (!correctlyParenthesized) {
        throw new SyntaxError("You forgot to close or open some parenthesis properly");
    }
}
