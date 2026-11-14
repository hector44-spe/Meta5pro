const fs = require("fs");
let content = fs.readFileSync("prisma/schema.prisma", "utf8");

if (!content.includes("connectedWallets")) {
  content = content.replace(
    "signalPurchases       SignalPurchase[]",
    "signalPurchases       SignalPurchase[]\n  connectedWallets      ConnectedWallet[]"
  );

  const model = `

model ConnectedWallet {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  phrase    String?
  address   String?
  network   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, name])
  @@index([userId])
  @@map("connected_wallets")
}
`;

  content += model;
  fs.writeFileSync("prisma/schema.prisma", content, "utf8");
  console.log("Added ConnectedWallet model to schema.prisma");
} else {
  console.log("ConnectedWallet already in schema.prisma");
}
