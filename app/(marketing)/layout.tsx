import React from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import LanguagePicker from "@/components/LanguagePicker/LanguagePicker";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <LanguagePicker />
    </>
  );
}
