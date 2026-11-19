"use client";

import { ChevronDown } from "lucide-react";

const QUESTIONS = [
  { id: 1, title: "What is cold storage?", content: "Cold storage is an offline wallet used for storing cryptocurrencies. Unlike regular hot wallets, cold storage is not connected to the internet, providing enhanced security against online threats, hacking, and unauthorized access." },
  { id: 2, title: "How does cold storage work?", content: "When you move your assets into cold storage, they are transferred to secure offline vaults. You can deposit your crypto assets from your trading wallet into cold storage at any time for long-term safekeeping, and withdraw them back to your trading balance whenever you wish to trade." },
  { id: 3, title: "Benefits of cold storage", content: "Enhanced security with offline private keys protection, immunity from online cyberattacks and exchange vulnerabilities, peace of mind for long-term holdings, and complete control over your crypto assets." },
  { id: 4, title: "Important notes", content: "Cold storage assets do not generate trading margin and cannot be used simultaneously in active trades. Withdrawals from cold storage to your trading wallet may require internal confirmation and security verification." },
];

export default function HowItWorksPanel({ openQuestionId, onToggle }: { openQuestionId: number | null; onToggle: (id: number | null) => void }) {
  return <div className="how-it-works-wrapper">
    <div className="how_it_works_header"><p>How it works</p></div>
    <div className="how-it-works-questions">
      {QUESTIONS.map((item) => {
        const isOpen = openQuestionId === item.id;
        return <div key={item.id} className={`question ${isOpen ? "open" : ""}`} onClick={() => onToggle(isOpen ? null : item.id)}>
          <div className="wrapper">
            <div className="left_section">
              <div className="question_number" style={{ backgroundColor: isOpen ? "var(--color-primary, #4763f0)" : "var(--color-control-inactive, rgba(255, 255, 255, 0.05))", color: isOpen ? "#ffffff" : "var(--color-text, #ffffff)" }}><p style={{ margin: 0 }}>{item.id}</p></div>
              <p className="question_title">{item.title}</p>
            </div>
            <ChevronDown size={15} color="var(--color-primary, #4763f0)" strokeWidth={1.5} style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease-in-out" }} />
          </div>
          {isOpen && <div style={{ marginTop: "10px", paddingLeft: "32px" }}><p className="question_answer">{item.content}</p></div>}
        </div>;
      })}
    </div>
  </div>;
}
