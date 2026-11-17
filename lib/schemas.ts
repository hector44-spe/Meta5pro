import { z } from "zod";

export const walletConnectionSchema = z.object({
  name: z.string().trim().min(1).max(80),
  address: z.string().trim().min(10, "A public wallet address is required").max(160),
  network: z.string().trim().min(1).max(40),
}).strict();

export const coldStorageTransferSchema = z.object({
  action: z.enum(["deposit", "withdraw"]),
  symbol: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,10}$/),
  amount: z.number().positive().max(1e12),
}).strict();

export const subscriptionPurchaseSchema = z.object({
  planId: z.string().uuid(),
  amount: z.number().positive().max(100_000_000),
}).strict();

export const realEstateInvestmentSchema = z.object({
  projectId: z.string().trim().min(1).max(100),
  amount: z.number().positive().max(100_000_000),
}).strict();

export const cardRequestSchema = z.object({
  action: z.literal("request").optional(),
  cardType: z.enum(["Regular", "Virtual", "Physical"]),
  cardPin: z.string().regex(/^\d{4,6}$/, "PIN must contain 4 to 6 digits"),
  txHash: z.string().trim().min(16).max(120).optional(),
  receiptUrl: z.string().trim().max(200).optional(),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,10}$/).optional(),
  cryptoAddress: z.string().trim().max(160).optional(),
}).strict();

export const cardTopupSchema = z.object({
  action: z.literal("topup"),
  cardId: z.string().min(1),
  amount: z.number().positive().max(1_000_000),
}).strict();

export const cardPinSchema = z.object({
  action: z.literal("changePin"),
  cardId: z.string().min(1),
  newPin: z.string().regex(/^\d{4,6}$/, "PIN must contain 4 to 6 digits"),
}).strict();

export const cardStatusSchema = z.object({
  action: z.literal("toggleStatus"),
  cardId: z.string().min(1),
}).strict();

const finiteMoney = z.number().finite().min(-1_000_000_000).max(1_000_000_000);
export const adminTradeActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("close"), positionId: z.string().uuid(), pnl: finiteMoney.optional() }).strict(),
  z.object({
    action: z.literal("update"),
    positionId: z.string().uuid(),
    pnl: finiteMoney.optional(),
    status: z.enum(["OPEN", "CLOSED"]).optional(),
  }).strict(),
  z.object({
    action: z.literal("create"),
    userId: z.string().uuid(),
    symbol: z.string().trim().toUpperCase().regex(/^[A-Z0-9/]{2,15}$/),
    type: z.enum(["BUY", "SELL"]),
    amount: z.number().positive().max(1_000_000_000),
    entryPrice: z.number().positive().max(1_000_000_000),
    leverage: z.number().int().min(1).max(100),
    pnl: finiteMoney.optional(),
    status: z.literal("OPEN").default("OPEN"),
  }).strict(),
  z.object({
    action: z.literal("createCopyTrade"),
    expertId: z.string().trim().min(1).max(100),
    symbol: z.string().trim().toUpperCase().regex(/^[A-Z0-9/]{2,15}$/),
    type: z.enum(["BUY", "SELL"]),
    amount: z.number().positive().max(1_000_000_000),
    leverage: z.number().int().min(1).max(100),
    pnl: finiteMoney.optional(),
  }).strict(),
  z.object({ action: z.literal("delete"), positionId: z.string().uuid() }).strict(),
]);
