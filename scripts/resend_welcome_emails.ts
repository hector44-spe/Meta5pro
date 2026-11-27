import "dotenv/config";
import { prisma } from "../lib/prisma";
import { sendWelcomeEmail } from "../lib/mail";

async function main() {
  const targetEmails = [
    "angelaclark2948@euploading.com",
    "tevon.adjeipoku@gmail.com",
    "aciobaniteigiorgio949@gmail.com",
    "omoruddin67@gmail.com",
    "sskjermaine0509@gmail.com",
    "kangura@hotmail.co.uk",
    "riccojabnouni070@gmail.com",
    "leearmstrong2@gmail.com",
    "mickaelvanleda10@gmail.com",
    "quw97ok@gmail.com",
  ];

  console.log(`Starting manual email delivery to ${targetEmails.length} users...`);

  const results: { email: string; name: string; success: boolean }[] = [];

  for (const email of targetEmails) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true, fullName: true, username: true },
    });

    if (!user) {
      console.warn(`User ${email} not found in database!`);
      results.push({ email, name: "Unknown", success: false });
      continue;
    }

    const firstName = user.fullName ? user.fullName.trim().split(/\s+/)[0] : user.username;
    console.log(`Sending welcome email to ${firstName} <${email}>...`);

    const ok = await sendWelcomeEmail(email, firstName);
    console.log(`Result for ${email}: ${ok ? "SUCCESS (SENT)" : "FAILED"}`);
    results.push({ email, name: firstName, success: ok });

    // Wait 2 seconds between emails to respect SMTP rate limits
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\n====== FINAL DELIVERY REPORT ======");
  for (const r of results) {
    console.log(`${r.success ? "✓" : "✗"} ${r.name} <${r.email}>: ${r.success ? "DELIVERED" : "FAILED"}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
