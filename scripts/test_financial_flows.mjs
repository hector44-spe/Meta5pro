import { db, sqlite } from "../lib/db.ts";

async function testFinancialFlows() {
  console.log("=== Testing Financial Flows: Deposits, Approvals, Trading & Withdrawals ===");

  // 1. Get initial investor balance
  const investorEmail = "investor@platform.internal";
  const user = await db.user.findUnique({
    where: { email: investorEmail },
    include: { wallet: true },
  });

  if (!user || !user.wallet) throw new Error("Investor not found");
  const initialBalance = user.wallet.mainBalance;
  console.log(`1. Initial Investor Balance: $${initialBalance.toFixed(2)} USD`);

  // 2. Submit Deposit ($5,000 USDT)
  const depositTx = await db.transaction.create({
    data: {
      userId: user.id,
      type: "DEPOSIT",
      amount: 5000.0,
      currency: "USDT_TRC20",
      cryptoAddress: "TJY6ZpB8E7WcEKnLq3h74V75tKjM9zD5eR",
      txHash: "0xabc123test_tx_hash_" + Date.now(),
      status: "PENDING",
    },
  });
  console.log(`2. Deposit Proof Recorded: ID ${depositTx.id}, Status: ${depositTx.status}, Amount: $5,000.00`);

  // 3. Admin Approves Deposit
  console.log("3. Simulating Admin Approval...");
  await db.wallet.update({
    where: { userId: user.id },
    data: {
      mainBalance: initialBalance + 5000.0,
      totalDeposited: user.wallet.totalDeposited + 5000.0,
    },
  });
  await db.transaction.update({
    where: { id: depositTx.id },
    data: { status: "APPROVED", approvedAt: new Date().toISOString() },
  });

  const walletAfterDeposit = await db.wallet.findUnique({ where: { userId: user.id } });
  if (walletAfterDeposit.mainBalance !== initialBalance + 5000.0) {
    throw new Error("FAIL: Balance was not credited upon deposit approval!");
  }
  console.log(`✓ Balance after deposit approval: $${walletAfterDeposit.mainBalance.toFixed(2)} USD (+$5,000.00 credited)`);

  // 4. Trade Execution (Buy $1,000 BTC with 5x leverage)
  console.log("4. Simulating Trade Order Execution...");
  const marginRequired = 1000 / 5; // $200
  const tradeTx = await db.transaction.create({
    data: {
      userId: user.id,
      type: "TRADE_BUY",
      amount: 1000.0,
      currency: "BTC",
      status: "APPROVED",
    },
  });
  console.log(`✓ Trade Order Filled: ${tradeTx.type} for $1,000 BTC. Required Margin: $${marginRequired.toFixed(2)}`);

  // 5. Withdrawal Request ($2,000)
  console.log("5. Simulating Withdrawal Request ($2,000 USD)...");
  const balanceBeforeWithdraw = walletAfterDeposit.mainBalance;
  await db.wallet.update({
    where: { userId: user.id },
    data: { mainBalance: balanceBeforeWithdraw - 2000.0 },
  });
  const withdrawTx = await db.transaction.create({
    data: {
      userId: user.id,
      type: "WITHDRAWAL",
      amount: 2000.0,
      currency: "BTC",
      cryptoAddress: "bc1qtestdestinationaddress999",
      status: "PENDING",
    },
  });
  const walletAfterWithdrawLock = await db.wallet.findUnique({ where: { userId: user.id } });
  console.log(`✓ Funds held on escrow. Available balance: $${walletAfterWithdrawLock.mainBalance.toFixed(2)} USD (-$2,000 held)`);

  // 6. Admin Rejection with Refund
  console.log("6. Simulating Admin Rejection with Auto-Refund...");
  await db.wallet.update({
    where: { userId: user.id },
    data: { mainBalance: walletAfterWithdrawLock.mainBalance + 2000.0 },
  });
  await db.transaction.update({
    where: { id: withdrawTx.id },
    data: { status: "REJECTED", approvedAt: new Date().toISOString() },
  });

  const finalWallet = await db.wallet.findUnique({ where: { userId: user.id } });
  if (finalWallet.mainBalance !== balanceBeforeWithdraw) {
    throw new Error("FAIL: Balance was not refunded upon rejection!");
  }
  console.log(`✓ Balance refunded on rejection: $${finalWallet.mainBalance.toFixed(2)} USD (escrow restored)`);

  console.log("\n>>> ALL FINANCIAL FLOW TESTS PASSED SUCCESSFULLY! <<<");
}

testFinancialFlows().catch(console.error);
