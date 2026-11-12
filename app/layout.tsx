import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Meta Gold 5 - Trade With Ease",
  description:
    "Meta Gold 5 blends advanced power with simplicity, offering strong security, 24/7 support, and an intuitive trading platform.",
  keywords: [
    "Meta Gold 5",
    "crypto trading",
    "portfolio management",
    "copy trading",
    "automated trading tools",
    "staking",
    "forex",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="inter_b65991a8-module__hDb0IG__variable mori_f26f32d3-module__KmV5nG__variable digitalnumbers_d8613293-module__O5KEpG__variable">
        {children}
      </body>
    </html>
  );
}
