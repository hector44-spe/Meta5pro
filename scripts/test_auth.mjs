import { db } from "../lib/db.ts";
import { hashPassword, verifyPassword, signToken, verifyToken } from "../lib/auth.ts";

async function testAuth() {
  console.log("=== Testing Authentication & Database Layer ===");

  // 1. Query Demo Investor
  const investor = await db.user.findUnique({
    where: { email: "investor@platform.internal" },
    include: { wallet: true },
  });

  if (!investor) {
    throw new Error("FAIL: investor@platform.internal not found!");
  }
  console.log("✓ Found investor:", investor.email, "Role:", investor.role);
  console.log("✓ Wallet main balance:", investor.wallet?.mainBalance);

  // 2. Verify Password Match
  const validPass = await verifyPassword("InvestorPassword123!", investor.passwordHash);
  if (!validPass) {
    throw new Error("FAIL: Password verification failed!");
  }
  console.log("✓ Password hash verified successfully with bcryptjs.");

  const invalidPass = await verifyPassword("WrongPassword!", investor.passwordHash);
  if (invalidPass) {
    throw new Error("FAIL: Invalid password should not pass!");
  }
  console.log("✓ Invalid password correctly rejected.");

  // 3. JWT Signing and Verification
  const token = signToken({
    userId: investor.id,
    email: investor.email,
    role: investor.role,
    username: investor.username,
  });
  console.log("✓ JWT Token generated:", token.substring(0, 30) + "...");

  const decoded = verifyToken(token);
  if (!decoded || decoded.userId !== investor.id) {
    throw new Error("FAIL: JWT token decoding failed!");
  }
  console.log("✓ JWT Token successfully verified. Decoded user:", decoded.email);

  // 4. Test Registration Creation
  const testEmail = "newtrader_" + Date.now() + "@test.internal";
  const passHash = await hashPassword("SecurePass2026!");
  const newUser = await db.user.create({
    data: {
      email: testEmail,
      username: "trader_" + Math.floor(Math.random() * 10000),
      fullName: "Jane Trader",
      passwordHash: passHash,
      role: "INVESTOR",
      wallet: {
        create: {
          mainBalance: 0.0,
          interestBalance: 0.0,
          totalDeposited: 0.0,
          totalWithdrawn: 0.0,
        },
      },
    },
    include: { wallet: true },
  });

  if (!newUser || !newUser.wallet) {
    throw new Error("FAIL: User creation with wallet failed!");
  }
  console.log("✓ New user registered:", newUser.email);
  console.log("✓ New wallet initialized with balance:", newUser.wallet.mainBalance);

  console.log("\n>>> ALL TESTS PASSED: Auth, JWT, Bcrypt, and SQLite Database operational! <<<");
}

testAuth().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
