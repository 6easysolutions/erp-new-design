import { describe, it, expect } from "vitest";
import { safeCalculate } from "./index.js";

describe("Security: Safe Expression Calculator", () => {
  it("evaluates simple addition and subtraction", () => {
    expect(safeCalculate("1 + 2")).toBe(3);
    expect(safeCalculate("10 - 4")).toBe(6);
  });

  it("evaluates multiplication, division, and modulo", () => {
    expect(safeCalculate("6 * 7")).toBe(42);
    expect(safeCalculate("20 / 4")).toBe(5);
    expect(safeCalculate("14 % 4")).toBe(2);
  });

  it("respects operator precedence (* and / over + and -)", () => {
    expect(safeCalculate("2 + 3 * 4")).toBe(14);
    expect(safeCalculate("10 - 6 / 2")).toBe(7);
    expect(safeCalculate("20 / 4 * 2")).toBe(10);
  });

  it("handles decimal values and comma decimal separators", () => {
    expect(safeCalculate("1.5 + 2.5")).toBe(4);
    expect(safeCalculate("2,5 * 2")).toBe(5);
  });

  it("handles unary plus and minus signs", () => {
    expect(safeCalculate("-5 + 10")).toBe(5);
    expect(safeCalculate("+5 + 5")).toBe(10);
    expect(safeCalculate("10 + -3")).toBe(7);
  });

  it("throws error on division or modulo by zero", () => {
    expect(() => safeCalculate("10 / 0")).toThrow("Division by zero");
    expect(() => safeCalculate("10 % 0")).toThrow("Modulo by zero");
  });

  it("returns 0 for empty or whitespace-only inputs", () => {
    expect(safeCalculate("")).toBe(0);
    expect(safeCalculate("   ")).toBe(0);
    expect(safeCalculate(null)).toBe(0);
  });

  it("blocks arbitrary code execution or invalid characters", () => {
    expect(() => safeCalculate("alert(1)")).toThrow("Invalid characters in expression");
    expect(() => safeCalculate("console.log('pwned')")).toThrow("Invalid characters in expression");
    expect(() => safeCalculate("window.location")).toThrow("Invalid characters in expression");
    expect(() => safeCalculate("import('fs')")).toThrow("Invalid characters in expression");
  });

  it("rejects malformed syntax like dangling operators or malformed numbers", () => {
    expect(() => safeCalculate("5 *")).toThrow();
    expect(() => safeCalculate("..5")).toThrow();
    expect(() => safeCalculate("5 + * 2")).toThrow();
  });
});
