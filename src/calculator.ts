import alertUser from "./custom-alert.js";
import { announcePolitely } from "./visually-hidden-announcer.js";
import managePopupMenu from "./popup-menu-manager.js";
import * as storage from "./storage.js";
import {
  renderHistoryEntries,
  prepareExpressionForPresentation,
} from "./rendering.js";
import { spliceString } from "./utils.js";

managePopupMenu(document.querySelector(".js-menu-parent") as HTMLElement);

let expression = "";

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
  expressionContainer = calculator.querySelector(
    ".js-expression-container"
  ) as HTMLElement,
  expressionContent = calculator.querySelector(
    ".js-expression__content"
  ) as HTMLElement,
  historyMenu = document.querySelector("#history-menu") as HTMLUListElement,
  historyDescription = document.querySelector(
    "#history-description"
  ) as HTMLParagraphElement;

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

function updateCalculatorExpression(exp: string, animate = false) {
  expressionContent.innerHTML = prepareExpressionForPresentation(exp);
  expressionContainer.scrollLeft = expressionContainer.scrollWidth;

  if (animate) {
    animateExpression();
  }
}

const listenedHistoryIds: number[] = [];

function handleEntryClick(id: number) {
  const entry = storage.get("history").find((e) => e.id === id)!;
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
  if (e.key === "Backspace") deleteLastSymbol();
});

resultKey.addEventListener("click", showResult);

function showResult() {
  if (expression.length === 0) return;
  try {
    const result = doTheMath(expression);

    storage.addHistoryEntry({ expression, result });

    expression = result.toString();
    updateHistory();
    updateCalculatorExpression(expression, true);
    announcePolitely(`The result is ${result}`);
  } catch (err) {
    alertUser(err as any);
  }
}

const operators = ["+", "-", "x", "÷", "^"] as const;
type Operator = (typeof operators)[number];

const operatorsFunctions = {
  x: (a: number, b: number) => a * b,
  "+": (a: number, b: number) => a + b,
  "-": (a: number, b: number) => a - b,
  "÷": (a: number, b: number) => a / b,
  "^": Math.pow,
} as const;

const number = /([-+]?\d+\.\d+)|([-+]?\d+\.?)|([-+]?\.?\d+)/,
  onlyNumber = /^(([-+]?\d+\.\d+)|([-+]?\d+\.?)|([-+]?\.?\d+))$/,
  bracketExpression = /\([-+÷x^.\d]+\)/;

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
const firstExps = expRegExp("[\\^]"),
  secondExps = expRegExp("[x÷]"),
  thirdExps = expRegExp("[-+]");

const precedenceRules = [firstExps, secondExps, thirdExps];

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

/**
 * Solves a mathematical expression.
 *
 * @returns - The result of the calculations.
 */
function doTheMath(exp: string): number {
  checkValidity(exp);

  if (onlyNumber.test(exp)) {
    return Number(exp);
  }

  exp = addMultiplicationSignsAroundBrackets(exp);

  while (exp.includes("(")) {
    const bracketExpressionMatch = bracketExpression.exec(exp)!,
      { index } = bracketExpressionMatch,
      bracketExpressionString = bracketExpressionMatch[0],
      matchLength = bracketExpressionString.length,
      innerExp = bracketExpressionString.slice(1, matchLength - 1);

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

function addMultiplicationSignsAroundBrackets(exp: string) {
  exp = exp.replaceAll(")(", ")x(");
  /* 
  the dot assumes that the expression is valid and we have something like 5.(2) or (5).5 
  which results in 5x2 and 5x0.5, respectively.
  */
  exp = exp.replace(/(\d|\.)\(/g, "$1x(");
  exp = exp.replace(/\)(\d|\.)/g, ")x$1");
  return exp;
}

function fixSigns(exp: string) {
  exp = exp.replaceAll("+-", "-");
  exp = exp.replaceAll("-+", "-");
  exp = exp.replaceAll("--", "+");
  exp = exp.replaceAll("++", "+");
  return exp;
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
 * For example, suppose `multiplicationRegExp` is an expression that matches
 * multiplications expressions like 8x5:
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

const maxNumberLength = Number.MAX_SAFE_INTEGER.toString().length;
const tooBigNumber = new RegExp(
    String.raw`\d{${maxNumberLength + 1},}|[+-]?\d+(\.\d+)?e[+-]\d+`
    // if there's an 'e' in the expression then we're messing with really big numbers already
  ),
  multipleOperators = /([-+÷x^%]{2,})/,
  multipleDots = /(\.{2,})/,
  missingOperand = /(\d+[-+÷x^%])$/,
  invalidDot = /\D\.\D/,
  invalidDotAlone = /^(\.|\.\D|\D\.)$/,
  invalidNaNOrInfinity = /NaN|Infinity/,
  singleOperator = /^[-+÷x^%]$/,
  emptyParenthesis = /\(\)/,
  singleBracket = /^(\(|\))$/,
  operatorAndBracket = /[-+÷x^]\)|\([x÷^%]/,
  invalidDecimal = /\d*(\.\d*){2,}/,
  invalidOperator = /^[÷x^%]/;

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

/**
 * Checks if all parenthesis, if present, in an expression are opened and closed properly.
 *
 * @param exp - The expression.
 * @returns - A boolen that tells whether all parenthesis are properly closed.
 */
function checkClosedParenthesis(exp: string): boolean {
  let open = 0,
    /* 
    need this flag because if the first bracket in the expression
    is a closing parenthesis, then open will be zero and the
    algorithm fails, returning true when the expression is invalid
    */
    valid = true;

  for (const ch of exp) {
    if (ch === "(") {
      open++;
    } else if (ch === ")") {
      if (open > 0) {
        open--;
      } else {
        //
        valid = false;
        break;
      }
    }
  }

  return valid && open === 0;
}

function checkValidity(exp: string) {
  errorTests.forEach(({ test, message, ErrorConstructor }) => {
    const match = test.exec(exp);
    if (match) {
      throw new ErrorConstructor(message.replace("*", match[0]));
    }
  });

  const correctlyParenthesized = checkClosedParenthesis(exp);
  if (!correctlyParenthesized) {
    throw new SyntaxError(
      "You forgot to close or open some parenthesis properly"
    );
  }
}
