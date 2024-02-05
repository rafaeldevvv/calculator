let expression = "";

const calculator = document.querySelector(".calculator") as HTMLElement,
  /* 
    all nodes that have a data-symbol attribute 
    are used to add a symbol to the expression 
  */
  symbolKeys = calculator.querySelectorAll("[data-symbol]"),
  resetKey = calculator.querySelector(".js-reset-key") as HTMLButtonElement,
  delKey = calculator.querySelector(".js-del-key") as HTMLButtonElement,
  resultKey = calculator.querySelector(".js-result-key") as HTMLButtonElement,
  expressionNode = calculator.querySelector(".js-expression") as HTMLElement;

function updateCalculatorExpression(exp: string) {
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
  if (e.key === "Backspace") deleteLastCharacter();
});
