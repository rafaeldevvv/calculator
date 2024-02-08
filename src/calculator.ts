import announce from "./custom-alert.js";
import { announcePolitely } from "./visually-hidden-announcer.js";

let expression = "";

function announceExpression() {
  if (expression) {
    announcePolitely(`Current expression is ${expression}`);
  } else {
    announcePolitely("Expression is empty");
  }
}

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
  announceExpression();
}

symbolKeys.forEach((k) => {
  const symbol = k.getAttribute("data-symbol");
  k.addEventListener("click", () => {
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

delKey.addEventListener("click", deleteLastCharacter);

window.addEventListener("keydown", (e) => {
  if (e.key === "Backspace") deleteLastCharacter();
});

resultKey.addEventListener("click", getResult);

function getResult() {
  if (expression.length === 0) return;
  try {
    const result = doTheMath(expression);
    expression = result.toString();
    updateCalculatorExpression(expression);
    announcePolitely(`The result is ${result}`);
  } catch (err) {
    announce(err as any);
  }
}

const operators = ["+", "-", "x", "÷"] as const;
type Operator = (typeof operators)[number];

const operatorsFunctions = {
  x: (a: number, b: number) => a * b,
  "+": (a: number, b: number) => a + b,
  "-": (a: number, b: number) => a - b,
  "÷": (a: number, b: number) => a / b,
} as const;

const number = /([-+]?\d+\.\d+)|([-+]?\d+\.?)|([-+]?\.?\d+)/,
  onlyNumber = /^(([-+]?\d+\.\d+)|([-+]?\d+\.?)|([-+]?\.?\d+))$/;

/**
 * Builds a mathematical expression regular expression.
 * The regular expression will look like `/(term1)(operator)(term2)/`.
 *
 * @param operatorCharacterClass - A character class for operators, such as '[-+]'.
 * @returns - A mathematical expression regular expression.
 *
 * @example
 * const regexp = expRegExp("[+-]");
 * console.log(regexp.source);
 * // -> ((\d+\.?|\.?\d+|\d+\.\d+)([+-])(\d+\.?|\.?\d+|\d+\.\d+))
 */
function expRegExp(operatorCharacterClass: string) {
  return new RegExp(
    `(${number.source})(${operatorCharacterClass})(${number.source})`
  );
}

/*
These defines precedence. Multiplication and division are 
performed first. Then addition and subtraction. */
const firstExps = expRegExp("[x÷]"),
  secondExps = expRegExp("[-+]");

/**
 * Destructures a simple mathematical expression like 1+5.
 *
 * @param exp
 * @returns - A tuple type whose elements are, respectively, the first term, the operator
 * and the second term.
 *
 * @example
 * destructureExpression("1+5");
 * // -> [1, "+", 5]
 * destructureExpression("10.35-5.5");
 * // -> [10.35, "-", 5.5]
 */
function destructureExpression(
  exp: string
): [term1: number, operator: string, term2: number] {
  const firstTermMatch = number.exec(exp)!,
    term1 = firstTermMatch[0],
    rest = exp.slice(term1.length),
    operator = rest[0],
    term2 = rest.slice(1);

  return [Number(term1), operator, Number(term2)];
}

function doTheMath(exp: string): number {
  checkValidity(exp);

  if (onlyNumber.test(exp)) {
    return Number(exp);
  }

  exp = solveExpressions(exp, firstExps);
  exp = solveExpressions(exp, secondExps);

  return Number(exp);
}

/**
 * Solves expressions in a bigger expression based on the regular expression
 * passed in.
 *
 * @param exp - The whole expression.
 * @param targetExpressionRegExp - The regular expression that matches the
 * smaller expressions that need to be solved.
 * @returns - An expression with the required expressions solved.
 *
 * For example, suppose `multiplicationRegExp` is an expression that matches multiplications expressions like 8x5:
 * @example
 * const additions = solveExpressions("1+1+2x7", multiplicationRegExp);
 * // -> additions is "1+2+14"
 */
function solveExpressions(exp: string, targetExpressionRegExp: RegExp) {
  while (exp.search(targetExpressionRegExp) !== -1) {
    const match = targetExpressionRegExp.exec(exp)!;
    if (!match) break;
    const expression = match[0],
      { index } = match;
    const [term1, operator, term2] = destructureExpression(expression);

    const operatorFunc = operatorsFunctions[operator as Operator],
      result = operatorFunc(term1, term2);
    if (exp.length === expression.length) {
      exp = result.toString();
      continue;
    }
    let before = exp.substring(0, index),
      after = exp.substring(index + expression.length);
    if (before !== "" && result >= 0) {
      before += "+";
    }
    exp = before + result + after;
  }

  return exp;
}

const tooBigNumber = /(\d{16,})/,
  multipleOperators = /([-+÷x]{2,})/,
  multipleDots = /(\.{2,})/,
  missingOperand = /(\d+[-+÷x])$/,
  invalidDot = /\D\.\D/,
  invalidDotAlone = /^(\.|\.\D|\D\.)$/;

/**
 * A check for an error in a piece of text.
 */
interface ErrorCheck {
  /** A regular expression matching an error in a piece of text. */
  test: RegExp;
  /**
   * The message to show the user when the error occurs. The first star character (`'*'`) in this message
   * is replaced by the part of the text that matches the error.
   */
  message: string;
  /** The construct to construct the error. */
  ErrorConstructor: typeof Error;
}

const errorTests: ErrorCheck[] = [
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
    message: "`Invalid dot: '*`",
    ErrorConstructor: SyntaxError,
  },
  {
    test: invalidDotAlone,
    message: "`Invalid dot: '*`",
    ErrorConstructor: SyntaxError,
  },
];

function checkValidity(exp: string) {
  errorTests.forEach(({ test, message, ErrorConstructor }) => {
    const match = test.exec(exp);
    if (match) {
      throw new ErrorConstructor(message.replace("*", match[0]));
    }
  });
}
