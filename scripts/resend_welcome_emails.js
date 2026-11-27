const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Script to resend welcome emails to recent users once email service is active.
// Usage: node scripts/resend_welcome_emails.js
async function main() {
  console.log("Loading users...");
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

  const users = await prisma.user.findMany({
    where: { email: { in: targetEmails } },
    select: { id: true, email: true, fullName: true, username: true },
  });

  console.log(`Found ${users.length} target users in database:`);
  for (const u of users) {
    console.log(`- ${u.fullName || u.username} <${u.email}> (ID: ${u.id})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
