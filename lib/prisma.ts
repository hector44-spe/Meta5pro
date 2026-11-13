import { PrismaClient, Prisma } from "@prisma/client";

// Money columns are Postgres DECIMAL, which Prisma returns as Decimal objects.
// Serialize them as plain numbers so API responses keep the shape the UI expects.
// (Do math with Prisma's increment/decrement or Number(x), never `decimal + number`.)
(Prisma.Decimal.prototype as unknown as { toJSON: () => number }).toJSON = function (
  this: Prisma.Decimal,
) {
  return this.toNumber();
};

// One client per process; reused across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type Tx = Prisma.TransactionClient;
export default prisma;
