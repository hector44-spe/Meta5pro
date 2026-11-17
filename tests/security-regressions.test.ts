import { describe, expect, it } from "vitest";
import { consumeWithdrawalCode } from "../lib/withdrawalCode";
import {
  cardStatusSchema,
  coldStorageTransferSchema,
  realEstateInvestmentSchema,
  subscriptionPurchaseSchema,
  walletConnectionSchema,
} from "../lib/schemas";

describe("security regression guards", () => {
  it("does not accept the former default withdrawal code", async () => {
    const tx = {
      withdrawalCode: {
        findFirst: async () => null,
      },
    };
    await expect(consumeWithdrawalCode(tx as never, "user-1", "123456")).resolves.toMatch(/expired/i);
  });

  it("rejects recovery phrases and only accepts public wallet metadata", () => {
    expect(walletConnectionSchema.safeParse({
      name: "Example",
      phrase: "one two three four five six seven eight nine ten eleven twelve",
    }).success).toBe(false);
    expect(walletConnectionSchema.safeParse({
      name: "Example",
      address: "0x1234567890abcdef",
      network: "Ethereum",
    }).success).toBe(true);
  });

  it("does not accept a browser-supplied cold-storage price", () => {
    expect(coldStorageTransferSchema.safeParse({
      action: "withdraw",
      symbol: "BTC",
      amount: 1,
      price: 1_000_000,
    }).success).toBe(false);
  });

  it("does not let users define subscription returns", () => {
    expect(subscriptionPurchaseSchema.safeParse({
      planId: "1d4bbff0-3d88-4c0a-82ea-734cffa401dd",
      amount: 100,
      roi: 999,
      duration: 9999,
    }).success).toBe(false);
  });

  it("does not let users define real-estate terms", () => {
    expect(realEstateInvestmentSchema.safeParse({
      projectId: "bridge-labs",
      amount: 12_000,
      roi: 999,
    }).success).toBe(false);
  });

  it("does not accept a requested card activation status", () => {
    expect(cardStatusSchema.safeParse({
      action: "toggleStatus",
      cardId: "card-1",
      newStatus: "active",
    }).success).toBe(false);
  });
});
