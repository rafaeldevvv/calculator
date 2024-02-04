let expression = "";

const expressionNode = document.querySelector(".js-expression") as HTMLElement;
function updateCalculatorExpression(exp: string) {
  expressionNode.textContent = exp;
  expressionNode.scrollLeft = expressionNode.scrollWidth;
}

/* 
   all nodes that have a data-symbol attribute 
   are used to add a symbol to the expression 
*/
const symbolKeys = document.querySelectorAll("[data-symbol]"),
  resetKey = document.querySelector(".js-reset-key") as HTMLButtonElement,
  delKey = document.querySelector(".js-del-key") as HTMLButtonElement,
  resultKey = document.querySelector(".js-result-key") as HTMLButtonElement;

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
