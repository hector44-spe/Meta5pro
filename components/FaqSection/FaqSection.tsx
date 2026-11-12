"use client";

import React, { useState } from "react";
import { FaqItem } from "@/data/faqs";

interface FaqSectionProps {
  type: string;
  questions: FaqItem[];
}

export default function FaqSection({ type, questions }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="section-faq-module__E870Jq__container">
      <div className="backlight inView"></div>
      <div className="section-faq-module__E870Jq__content">
        <div className="section-faq-module__E870Jq__contentWrapper">
          <div className="section-faq-module__E870Jq__faqSection">
            <p className="section-faq-module__E870Jq__faqSectionTitle">
              {type} FAQs
            </p>
            <div className="faq-module__GPQN9G__container">
              <div
                data-orientation="vertical"
                dir="ltr"
                className="faq-module__GPQN9G__Accordion"
              >
                {questions.map((item, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <div
                      key={index}
                      data-orientation="vertical"
                      data-index={index}
                      data-open={isOpen ? "" : undefined}
                      data-closed={!isOpen ? "" : undefined}
                      className="faq-module__GPQN9G__Item"
                    >
                      <h3 className="faq-module__GPQN9G__Header">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => toggle(index)}
                          className="faq-module__GPQN9G__Trigger"
                          data-panel-open={isOpen ? "" : undefined}
                        >
                          <span>{item.q}</span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="faq-module__GPQN9G__TriggerIcon"
                            style={{
                              transform: isOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.2s ease",
                            }}
                          >
                            <path
                              d="M17.6569 9.34315L12 15L6.34315 9.34315"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </h3>
                      <div
                        className="faq-module__GPQN9G__Panel"
                        style={{
                          maxHeight: isOpen ? "500px" : "0px",
                          opacity: isOpen ? 1 : 0,
                          transition:
                            "max-height 0.25s ease, opacity 0.2s ease",
                          overflow: "hidden",
                        }}
                      >
                        <div className="faq-module__GPQN9G__Content">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
