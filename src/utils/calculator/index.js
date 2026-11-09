/**
 * Security Utility: Safe Expression Calculator
 *
 * Evaluates standard arithmetic expressions (+, -, *, /, %) safely
 * using recursive descent parsing instead of dynamic code evaluation
 * (such as eval() or new Function()).
 */

/**
 * Evaluates a mathematical string expression safely.
 *
 * @param {string} expression - The expression to evaluate
 * @returns {number} The calculated numerical result
 * @throws {Error} If expression syntax is invalid or division by zero occurs
 */
export function safeCalculate(expression) {
  if (typeof expression !== "string" || !expression.trim()) {
    return 0;
  }

  // Normalize commas to decimal points if used as separator
  const expr = expression.replace(/,/g, ".");

  // Strict whitelist check: only digits, decimal point, whitespace, and arithmetic operators
  if (!/^[0-9+\-*/%.\s]+$/.test(expr)) {
    throw new Error("Invalid characters in expression");
  }

  const tokens = expr.match(/[0-9]+(?:\.[0-9]+)?|[+\-*/%]/g);
  if (!tokens || tokens.join("") !== expr.replace(/\s+/g, "")) {
    throw new Error("Invalid syntax in expression");
  }

  let index = 0;

  function parsePrimary() {
    let sign = 1;
    if (tokens[index] === "+") {
      index++;
    } else if (tokens[index] === "-") {
      sign = -1;
      index++;
    }

    if (index >= tokens.length) {
      throw new Error("Unexpected end of expression");
    }

    const val = Number(tokens[index++]);
    if (isNaN(val)) {
      throw new Error("Invalid numeric value");
    }
    return sign * val;
  }

  function parseMulDiv() {
    let left = parsePrimary();
    while (
      index < tokens.length &&
      (tokens[index] === "*" || tokens[index] === "/" || tokens[index] === "%")
    ) {
      const op = tokens[index++];
      const right = parsePrimary();
      if (op === "*") {
        left = left * right;
      } else if (op === "/") {
        if (right === 0) {
          throw new Error("Division by zero");
        }
        left = left / right;
      } else if (op === "%") {
        if (right === 0) {
          throw new Error("Modulo by zero");
        }
        left = left % right;
      }
    }
    return left;
  }

  function parseAddSub() {
    let left = parseMulDiv();
    while (
      index < tokens.length &&
      (tokens[index] === "+" || tokens[index] === "-")
    ) {
      const op = tokens[index++];
      const right = parseMulDiv();
      if (op === "+") {
        left = left + right;
      } else if (op === "-") {
        left = left - right;
      }
    }
    return left;
  }

  const result = parseAddSub();
  if (index < tokens.length) {
    throw new Error("Unexpected trailing characters in expression");
  }

  if (!Number.isFinite(result)) {
    throw new Error("Result is not a finite number");
  }

  return result;
}
