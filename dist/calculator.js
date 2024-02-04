"use strict";
let expression = "";
const expressionNode = document.querySelector(".js-expression");
function updateCalculatorExpression(exp) {
    expressionNode.textContent = exp;
    expressionNode.scrollLeft = expressionNode.scrollWidth;
}
const symbolKeys = document.querySelectorAll("[data-symbol]"), resetKey = document.querySelector(".js-reset-key"), delKey = document.querySelector(".js-del-key"), resultKey = document.querySelector(".js-result-key");
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
delKey.addEventListener("click", () => {
    expression = expression.slice(0, expression.length - 1);
    updateCalculatorExpression(expression);
});
