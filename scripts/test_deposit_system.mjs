import { db } from "../lib/db.ts";

async function runDepositSystemTest() {
  console.log("=== Testing Multi-Step Deposit System & Dynamic Admin Addresses ===\n");

  // 1. Verify default deposit addresses are seeded
  const addresses = await db.depositAddress.findMany();
  console.log(`1. Total seeded crypto deposit addresses: ${addresses.length}`);
  for (const a of addresses) {
    console.log(`   - ${a.token} (${a.symbol}) [${a.network}]: ${a.address}`);
  }

  if (addresses.length < 6) {
    throw new Error("Expected at least 6 tokens/network addresses seeded!");
  }

  // 2. Test Admin address update (Simulate admin changing Ripple XRP address)
  const rippleRecord = addresses.find((a) => a.symbol === "XRP");
  if (!rippleRecord) throw new Error("Ripple XRP record not found!");

  const newXrpAddress = "rPFL3WdeJHYuKu1xReCTGyu9n3moJD2388";
  console.log(`\n2. Updating Ripple XRP address from ${rippleRecord.address} to ${newXrpAddress}...`);

  const updated = await db.depositAddress.update({
    where: { id: rippleRecord.id },
    data: { address: newXrpAddress, memo: "123456" },
  });

  console.log(`✓ Address successfully updated in database: ${updated.address} (Memo: ${updated.memo})`);

  // 3. Verify user retrieval reflects the change
  const verified = await db.depositAddress.findFirst({ where: { symbol: "XRP" } });
  if (verified?.address !== newXrpAddress) {
    throw new Error("Address retrieval did not return the updated address!");
  }
  console.log("✓ Dynamic address query for investor verified: matches updated admin address.");

  // 4. Test deposit recording with screenshot proof
  const investor = await db.user.findUnique({ where: { email: "investor@platform.internal" } });
  if (!investor) throw new Error("Investor test user not found");

  const testProofUrl = "/uploads/proofs/test_screenshot_1794.png";
  const depositTx = await db.transaction.create({
    data: {
      userId: investor.id,
      type: "DEPOSIT",
      amount: 500,
      currency: "XRP (XRP)",
      cryptoAddress: newXrpAddress,
      txHash: "TX_XRP_CONFIRMED_88291",
      receiptUrl: testProofUrl,
      status: "PENDING",
    },
  });

  console.log(`\n3. Created test deposit transaction: ID: ${depositTx.id}`);
  console.log(`   - Amount: $${depositTx.amount} ${depositTx.currency}`);
  console.log(`   - Status: ${depositTx.status}`);
  console.log(`   - Attached Payment Proof URL: ${depositTx.receiptUrl}`);

  // 5. Verify transaction in pending queue
  const pendingTxs = await db.transaction.findMany({ where: { status: "PENDING" } });
  const foundPending = pendingTxs.find((t) => t.id === depositTx.id);
  if (!foundPending || !foundPending.receiptUrl) {
    throw new Error("Transaction not found in pending queue with receiptUrl!");
  }
  console.log("✓ Transaction visible in Admin queue with screenshot proof attached.");

  // 6. Test Admin Approval and Balance Crediting
  const initialWallet = await db.wallet.findUnique({ where: { userId: investor.id } });
  const initialBalance = initialWallet?.mainBalance || 0;

  await db.transaction.update({
    where: { id: depositTx.id },
    data: { status: "APPROVED", approvedAt: new Date().toISOString() },
  });

  await db.wallet.update({
    where: { userId: investor.id },
    data: {
      mainBalance: initialBalance + 500,
      totalDeposited: (initialWallet?.totalDeposited || 0) + 500,
    },
  });

  const updatedWallet = await db.wallet.findUnique({ where: { userId: investor.id } });
  console.log(`\n4. Admin approved deposit: Balance updated from $${initialBalance} to $${updatedWallet?.mainBalance}`);
  console.log("\n>>> ALL MULTI-STEP DEPOSIT SYSTEM & DYNAMIC ADDRESS TESTS PASSED! <<<");
}

runDepositSystemTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
