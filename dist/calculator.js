import alertUser, { dismiss as dismissAlert } from "./custom-alert.js";
import { announcePolitely } from "./visually-hidden-announcer.js";
import manageHistoryPopupMenu from "./popup-menu-manager.js";
import * as storage from "./storage.js";
import { renderHistoryEntries, prepareExpressionForPresentation, } from "./rendering.js";
import { spliceString, splitAtIndex, formatNumbers } from "./utils.js";
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
const calculator = document.querySelector(".js-calculator"), symbolKeys = calculator.querySelectorAll("[data-symbol]"), resetKey = calculator.querySelector(".js-reset-key"), delKey = calculator.querySelector(".js-del-key"), resultKey = calculator.querySelector(".js-result-key"), copyButton = calculator.querySelector(".js-copy-button"), copyIcon = copyButton.querySelector(".js-icon"), expressionContainer = calculator.querySelector(".js-expression-container"), expressionContent = calculator.querySelector(".js-expression__content"), historyMenu = document.querySelector("#history-menu"), historyDescription = document.querySelector("#history-description");
function animateExpression() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches)
        return;
    expressionContent.animate([
        { opacity: 0, transform: "translateY(300%)" },
        { opacity: 1, transform: "translateY(0%)" },
    ], { duration: 500, fill: "forwards" });
}
function updateExpressionDOM(exp, isResult = false) {
    let contents = formatNumbers(exp);
    expressionContent.innerHTML = prepareExpressionForPresentation(contents);
    expressionContainer.scrollLeft = expressionContainer.scrollWidth;
    if (isResult) {
        animateExpression();
    }
}
function updateExpression(newExp) {
    previousExpressions.push(expression);
    expression = newExp;
    announceExpression();
}
const listenedHistoryIds = [];
function handleEntryClick(id) {
    const entry = storage.get("history").find((e) => e.id === id);
    updateExpression(entry.expression);
    updateExpressionDOM(expression, true);
    historyPopover.hidePopover();
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
const binaryOperators = ["+", "-", "x", "÷", "^"];
const binaryOperatorsEvaluators = {
    x: (a, b) => a * b,
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "÷": (a, b) => a / b,
    "^": Math.pow,
};
function destructureBasically(exp, operator) {
    const encodedExpression = encodeExpression(exp);
    const operatorIndex = encodedExpression.indexOf(`*${operator}*`) + 1;
    const [operand1, operand2] = splitAtIndex(exp, operatorIndex, false);
    return [operand1, operand2];
}
function encodeExpression(exp) {
    let encodedExp = exp;
    for (let i = 0; i < exp.length;) {
        const ch = exp[i];
        if (ch === "(") {
            const len = getParenthesizedExpressionLen(exp.slice(i));
            encodedExp = spliceString(encodedExp, i, len, "*".repeat(len));
            i += len;
            continue;
        }
        else if (/[\d.%]/.test(ch)) {
            encodedExp = spliceString(encodedExp, i, 1, "*");
        }
        i++;
    }
    return encodedExp;
}
function destructure(exp, targetOperator, includeOperandSignOutsideParens) {
    exp = exp.trim();
    let [operand1, operand2] = destructureBasically(exp, targetOperator);
    operand1 = operand1;
    operand2 = operand2;
    if (operand1.startsWith("(")) {
        operand1 = operand1.slice(1, operand1.length - 1);
        operand1 = doTheMath(operand1);
    }
    else {
        operand1 = Number(operand1.slice(includeOperandSignOutsideParens ? 0 : operand1.search(/[\d.]/)));
    }
    if (operand2.startsWith("(")) {
        operand2 = operand2.slice(1, operand2.length - 1);
        operand2 = doTheMath(operand2);
    }
    else {
        operand2 = Number(operand2);
    }
    const missingSign = (exp.startsWith("+") || exp.startsWith("-") ? exp[0] : "");
    return [
        operand1,
        targetOperator,
        operand2,
        includeOperandSignOutsideParens ? undefined : missingSign,
    ];
}
const number = /(?:[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)))/, onlyNumber = /^(?:[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)))$/, parenthesizedNumber = /(\((?:[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)))\))/;
const expressionRegexp = /\*+[-+x÷^]\*+/;
function isExpression(exp) {
    exp = encodeExpression(exp);
    const binaryOperatorIndex = exp.search(expressionRegexp);
    return binaryOperatorIndex >= 0;
}
function indexOfAndLengthOfParenthesizedExp(exp) {
    for (let i = 0; i < exp.length; i++) {
        const ch = exp[i];
        if (ch === "(") {
            const length = getParenthesizedExpressionLen(exp.slice(i)), parensContents = exp.slice(i + 1, i + length - 1), areContentsExpression = isExpression(parensContents);
            if (areContentsExpression) {
                return {
                    length: length,
                    index: i,
                };
            }
        }
    }
    return null;
}
function getParenthesizedExpressionLen(exp, backwards = false) {
    let openInside = 0, length = 1;
    if (backwards) {
        exp = exp
            .split("")
            .reverse()
            .join("")
            .replace(/([()])/g, (_, paren) => {
            return paren === "(" ? ")" : "(";
        });
    }
    if (!exp.startsWith("(")) {
        throw new SyntaxError("Expression doesn't start with '(', so it's not possible to know the length");
    }
    for (let i = 1; i < exp.length; i++) {
        const ch = exp[i];
        if (ch === "(") {
            openInside++;
        }
        else if (ch === ")" && openInside === 0) {
            length++;
            break;
        }
        else if (ch === ")") {
            openInside--;
        }
        length++;
    }
    return length;
}
function expRegExp(operatorCharacterClass) {
    return new RegExp(`(${number.source}|${parenthesizedNumber.source})(${operatorCharacterClass})(${number.source}|${parenthesizedNumber.source})`);
}
const firstExps = expRegExp("[\\^]"), secondExps = expRegExp("[x÷]"), thirdExps = expRegExp("[-+]");
const precedenceRules = [firstExps, secondExps, thirdExps];
const missingSignFlags = {
    x: false,
    "+": true,
    "-": true,
    "÷": false,
    "^": false,
};
function destructureOperation(exp) {
    const encodedExp = encodeExpression(exp), operator = /\*+(?<operator>.)\*+/.exec(encodedExp).groups
        .operator;
    return destructure(exp, operator, missingSignFlags[operator]);
}
function prepareExpression(exp) {
    return removeUnnecessaryParens(addImplicitOperations(replacePercentages(exp)));
}
function doTheMath(exp) {
    checkValidity(exp);
    if (onlyNumber.test(exp))
        return Number(exp);
    exp = prepareExpression(exp);
    let parenMatch;
    while ((parenMatch = indexOfAndLengthOfParenthesizedExp(exp))) {
        const { index, length } = parenMatch;
        const subexp = exp.slice(index + 1, index + length - 1);
        const result = doTheMath(subexp);
        exp = spliceString(exp, index, length, `(${result})`);
        exp = prepareExpression(exp);
    }
    if (onlyNumber.test(exp))
        return Number(exp);
    exp = precedenceRules.reduce(solveBinaryOperations, exp);
    if (exp.startsWith("("))
        exp = exp.slice(1, exp.length - 1);
    return Number(exp);
}
const unnecessarilyParenthesizedPositiveNumber = /\((?:\+?([\d.]+))\)/g, unnecessarilyParenthesizedNegativeNumber = /(^|[^-+x^÷])\((?:\-([\d.]+))\)([^-+x^÷]|$)/g;
function removeUnnecessaryParens(exp) {
    while (unnecessarilyParenthesizedPositiveNumber.test(exp)) {
        exp = exp.replaceAll(unnecessarilyParenthesizedPositiveNumber, "$1");
    }
    while (unnecessarilyParenthesizedNegativeNumber.test(exp)) {
        exp = exp.replace(unnecessarilyParenthesizedNegativeNumber, (_, chBefore, number, chAfter) => {
            return `${chBefore}-${number}${chAfter}`;
        });
    }
    return exp;
}
function addImplicitOperations(exp) {
    exp = exp.replaceAll(")(", ")x(");
    exp = exp.replace(/(\d|\.)\(/g, "$1x(");
    exp = exp.replace(/\)(\d|\.)/g, ")x$1");
    exp = exp.replace(/%([\d(.])/g, "%x$1");
    exp = exp.replace(/([^\)\d.]|^)([-+])\(/g, (_, chBefore, sign) => {
        let replacement = `${chBefore || ""}(${sign === "+" ? "" : sign}1)x(`;
        return replacement;
    });
    return exp;
}
function extractNumber(str) {
    if (str.startsWith("("))
        return Number(str.slice(1, str.length - 1));
    else
        return Number(str);
}
const percentageInRoundBrackets = /\(([+-]?[\d.]+)%\)/g, percentageNextToMultiplationOrDivision = /([\d.]+|\([+-]?[\d.]+\))%([x÷^])|([x÷^])([\d.]+|\([+-]?[\d.]+\))%/g, addedPercentage = /([-+])(\([+-]?[\d.]+\)|[\d.]+)%([^x^÷]|$)/, percentageAlone = /^(?:(\([-+]?[\d.]+\)|[+-]?[\d.]+)%)/g;
function replacePercentages(exp) {
    exp = exp.replaceAll(percentageInRoundBrackets, (_, number) => {
        return `(${Number(number) / 100})`;
    });
    exp = exp.replaceAll(percentageNextToMultiplationOrDivision, (_, perc1, sign1, sign2, perc2) => {
        if (perc1) {
            const n = extractNumber(perc1);
            return `${Number(n) / 100}${sign1}`;
        }
        else {
            const n = extractNumber(perc2);
            return `${sign2}${Number(n) / 100}`;
        }
    });
    exp = exp.replaceAll(percentageAlone, (_, number) => {
        const n = extractNumber(number);
        return `${n / 100}`;
    });
    let lastIndex = 0;
    while (addedPercentage.test(exp)) {
        const match = addedPercentage.exec(exp), { index } = match, [whole, plusOrMinus, percentage, chAfter] = match;
        let open = 0, startIndex = null;
        for (let i = index - 1; i >= 0; i--) {
            const ch = exp[i];
            if (ch === ")")
                open++;
            else if ((ch === "(" && open === 0) || i === 0) {
                startIndex = i;
                break;
            }
            else if (ch === "(")
                open--;
        }
        const contentBeforePercentage = exp.slice(startIndex, index);
        const perc = extractNumber(percentage);
        const factor = plusOrMinus === "-" ? 1 - perc / 100 : 1 + perc / 100;
        lastIndex = index + whole.length;
        if (contentBeforePercentage === "" || contentBeforePercentage.endsWith("("))
            break;
        exp = spliceString(exp, startIndex, contentBeforePercentage.length + whole.length, `(${contentBeforePercentage})x(${factor})${chAfter}`);
    }
    return exp;
}
function solveBinaryOperations(exp, targetExpressionRegExp) {
    while (exp.search(targetExpressionRegExp) !== -1) {
        const match = targetExpressionRegExp.exec(exp);
        const expression = match[0], { index } = match;
        const [operand1, operator, operand2, missingSign] = destructureOperation(expression);
        const operatorFunc = binaryOperatorsEvaluators[operator], result = operatorFunc(operand1, operand2);
        if (exp.length === expression.length) {
            exp = `${result >= 0 ? missingSign || "" : ""}(${result})`;
            exp = prepareExpression(exp);
            continue;
        }
        let resultStr = `(${result >= 0 ? missingSign || "" : ""}${result})`;
        const before = exp.slice(0, index);
        if (before !== "" && !/[-+x^÷]$/.test(before))
            resultStr = "+" + resultStr;
        exp = spliceString(exp, index, expression.length, `${resultStr}`);
        exp = prepareExpression(exp);
    }
    return exp;
}
const maxNumberLength = Number.MAX_SAFE_INTEGER.toString().length, tooBigNumber = new RegExp(String.raw `\d{${maxNumberLength + 1},}|[+-]?\d+(\.\d+)?e[+-]\d+`), multipleOperators = /(?:[-+÷x^]{2,}|%{2,}|[-+÷x^]+%+)/, multipleDots = /(?:\.{2,})/, missingOperand = /(?:\d+[-+÷x^])$/, invalidDot = /\D\.\D/, invalidDotAlone = /^(?:\.|\.\D|\D\.)$/, invalidNaNOrInfinity = /NaN|Infinity/, singleOperator = /^[-+÷x^%]$/, emptyParenthesis = /\(\)/, singleBracket = /^(?:\(|\))$/, operatorAndBracket = /[-+÷x^]\)|\([x÷^%]/, invalidDecimal = /\d*(?:\.\d*){2,}/, invalidOperator = /^[÷x^%]/;
const errorChecks = [
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
    errorChecks.forEach(({ test, message, ErrorConstructor }) => {
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
