import announce from "./custom-alert.js";
let expression = "";
const calculator = document.querySelector(".calculator"), symbolKeys = calculator.querySelectorAll("[data-symbol]"), resetKey = calculator.querySelector(".js-reset-key"), delKey = calculator.querySelector(".js-del-key"), resultKey = calculator.querySelector(".js-result-key"), expressionNode = calculator.querySelector(".js-expression");
function updateCalculatorExpression(exp) {
    expressionNode.textContent = exp;
    expressionNode.scrollLeft = expressionNode.scrollWidth;
}
function deleteLastCharacter() {
    expression = expression.slice(0, expression.length - 1);
    updateCalculatorExpression(expression);
}
symbolKeys.forEach((k) => {
    const symbol = k.getAttribute("data-symbol");
    k.addEventListener("click", () => {
        expression += symbol;
        updateCalculatorExpression(expression);
    });
});
resetKey.addEventListener("click", () => {
    expression = "";
    updateCalculatorExpression(expression);
});
delKey.addEventListener("click", deleteLastCharacter);
window.addEventListener("keydown", (e) => {
    if (e.key === "Backspace")
        deleteLastCharacter();
});
resultKey.addEventListener("click", getResult);
function getResult() {
    if (expression.length === 0)
        return;
    try {
        const result = doTheMath(expression);
        expression = result.toString();
        updateCalculatorExpression(expression);
    }
    catch (err) {
        announce(err);
    }
}
const operators = ["+", "-", "x", "÷"];
const operatorsFunctions = {
    x: (a, b) => a * b,
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "÷": (a, b) => a / b,
};
const number = /([-+]?\d+\.\d+)|([-+]?\d+\.?)|([-+]?\.?\d+)/, onlyNumber = /^(([-+]?\d+\.\d+)|([-+]?\d+\.?)|([-+]?\.?\d+))$/;
function expRegExp(operatorCharacterClass) {
    return new RegExp(`(${number.source})(${operatorCharacterClass})(${number.source})`);
}
const firstExps = expRegExp("[x÷]"), secondExps = expRegExp("[-+]");
function destructureExpression(exp) {
    const firstTermMatch = number.exec(exp), term1 = firstTermMatch[0], rest = exp.slice(term1.length), operator = rest[0], term2 = rest.slice(1);
    return [Number(term1), operator, Number(term2)];
}
function doTheMath(exp) {
    checkValidity(exp);
    if (onlyNumber.test(exp)) {
        return Number(exp);
    }
    exp = solveExpressions(exp, firstExps);
    exp = solveExpressions(exp, secondExps);
    return Number(exp);
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
const tooBigNumber = /(\d{16,})/, multipleOperators = /([-+÷x]{2,})/, multipleDots = /(\.{2,})/, missingOperand = /(\d+[-+÷x])$/, invalidDot = /\D\.\D/, invalidDotAlone = /^(\.|\.\D|\D\.)$/;
function checkValidity(exp) {
    const tooBigNumberMatch = tooBigNumber.exec(exp);
    if (tooBigNumberMatch) {
        throw new RangeError(`Number is too big: '${tooBigNumberMatch[1]}'`);
    }
    const multipleOperatorsMatch = multipleOperators.exec(exp);
    if (multipleOperatorsMatch) {
        throw new SyntaxError(`You cannot put multiple operators together: '${multipleOperatorsMatch[1]}'`);
    }
    const multipleDotsMatch = multipleDots.exec(exp);
    if (multipleDotsMatch) {
        throw new SyntaxError(`Invalid expression: '${multipleDotsMatch[1]}'`);
    }
    const missingOperandMatch = missingOperand.exec(exp);
    if (missingOperandMatch) {
        throw new SyntaxError(`You forgot a number in '${missingOperandMatch[0]}'`);
    }
    const invalidDotMatch = invalidDot.exec(exp) || invalidDotAlone.exec(exp);
    if (invalidDotMatch) {
        throw new SyntaxError(`Invalid dot: '${invalidDotMatch[0]}'`);
    }
}
