import { describe, it, expect } from "vitest";
import { money, InsufficientFundsError } from "../lib/ledger";

describe("Financial Ledger Utilities", () => {
  it("should round amounts correctly to cents", () => {
    expect(money(10.555)).toBe(10.56);
    expect(money(10.554)).toBe(10.55);
    expect(money(100.1)).toBe(100.1);
    expect(money(0.001)).toBe(0);
    expect(money(0.009)).toBe(0.01);
  });

  it("should construct InsufficientFundsError with correct available balance", () => {
    const error = new InsufficientFundsError(45.5);
    expect(error.message).toBe("Insufficient funds");
    expect(error.available).toBe(45.5);
    expect(error instanceof Error).toBe(true);
  });
});
