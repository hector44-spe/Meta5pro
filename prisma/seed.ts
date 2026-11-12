import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Plans
  const plans = [
    {
      name: "Alpha Staking",
      minDeposit: 500,
      maxDeposit: 10000,
      dailyRoiPercentage: 0.8,
      durationDays: 30,
      capitalRefund: true,
      isActive: true,
    },
    {
      name: "Quant Copytrade",
      minDeposit: 2500,
      maxDeposit: 50000,
      dailyRoiPercentage: 1.4,
      durationDays: 60,
      capitalRefund: true,
      isActive: true,
    },
    {
      name: "Institutional Prime",
      minDeposit: 10000,
      maxDeposit: 500000,
      dailyRoiPercentage: 2.2,
      durationDays: 90,
      capitalRefund: true,
      isActive: true,
    },
  ];

  for (const p of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.plan.create({ data: p });
    }
  }

  // 2. Create Super Admin
  const adminEmail = "admin@platform.internal";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (!existingAdmin) {
    const adminPass = await bcrypt.hash("AdminPassword123!", 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        username: "superadmin",
        fullName: "System Administrator",
        passwordHash: adminPass,
        role: "ADMIN",
        status: "ACTIVE",
        wallet: {
          create: {
            mainBalance: 100000.0,
            interestBalance: 0.0,
            totalDeposited: 100000.0,
            totalWithdrawn: 0.0,
          },
        },
      },
    });
    console.log(
      "Admin user created: admin@platform.internal / AdminPassword123!",
    );
  }

  // 3. Create Demo Investor
  const demoEmail = "investor@platform.internal";
  const existingInvestor = await prisma.user.findUnique({
    where: { email: demoEmail },
  });
  if (!existingInvestor) {
    const investorPass = await bcrypt.hash("InvestorPassword123!", 12);
    await prisma.user.create({
      data: {
        email: demoEmail,
        username: "alexander_investor",
        fullName: "Alexander Sterling",
        phoneNumber: "+1 555-0199",
        passwordHash: investorPass,
        role: "INVESTOR",
        status: "ACTIVE",
        wallet: {
          create: {
            mainBalance: 18450.0,
            interestBalance: 1240.5,
            totalDeposited: 25000.0,
            totalWithdrawn: 6550.0,
          },
        },
      },
    });
    console.log(
      "Demo investor created: investor@platform.internal / InvestorPassword123!",
    );
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
