"use client";

import React, { useState } from "react";
import { FAQS } from "@/data/faqs";

const categories = [
  { id: "Trading", title: "Trading", items: FAQS.TRADING },
  { id: "Stocks", title: "Stocks", items: FAQS.STOCKS },
  { id: "Real Estate", title: "Real Estate", items: FAQS.REAL_ESTATE },
  { id: "Crypto", title: "Crypto", items: FAQS.CRYPTO },
  { id: "Copy Trading", title: "Copy Trading", items: FAQS.COPY_TRADING },
  { id: "Staking", title: "Staking", items: FAQS.STAKING },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = categories
    .filter((cat) => selectedCategory === "all" || cat.id === selectedCategory)
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          !search ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <main className="page-module___8aEwW__mainContainer">
      <div
        style={{
          padding: "0px var(--container-padding-inline)",
          maxWidth: "1440px",
          boxSizing: "border-box",
          margin: "0 auto",
        }}
      >
        <section className="help-center-module__AcrFRG__hero">
          <div className="help-center-module__AcrFRG__lockup">
            <div className="stagger-2" data-animate="true">
              <div className="pill-module__qX7Pgq__pillContainer pill-module__qX7Pgq__noUrl ">
                <div className="pill-module__qX7Pgq__pillBorderSvg">
                  <svg
                    className="pill-module__qX7Pgq__rotatingBorder"
                    viewBox="0 0 200 40"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="_R_5anpfjb_"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="rgba(125, 102, 255, 0.192)"
                        />
                        <stop
                          offset="100%"
                          stopColor="rgba(168, 153, 255, 0.28)"
                        />
                      </linearGradient>
                    </defs>
                    <rect
                      x="0.5"
                      y="0.5"
                      width="199"
                      height="39"
                      rx="20"
                      fill="none"
                      stroke="url(#_R_5anpfjb_)"
                      strokeWidth="1"
                      strokeDasharray="6 8"
                      className="pill-module__qX7Pgq__rotatingStroke"
                    />
                  </svg>
                </div>
                <p className="pill-module__qX7Pgq__pillText">Help Center</p>
              </div>
            </div>
            <h2
              className="help-center-module__AcrFRG__lockupTitle stagger-1"
              data-animate="true"
            >
              Frequently Asked Questions.
            </h2>
            <p
              className="help-center-module__AcrFRG__lockupSubtext inter-alts stagger-3"
              data-animate="true"
            >
              Got Questions? Answers and advice from the Team
            </p>
          </div>
          <div
            style={{
              margin: "0 auto",
              marginTop: "64px",
              backgroundColor: "transparent",
              width: "100%",
              position: "relative",
              zIndex: "10",
            }}
            className="stagger-5"
            data-animate="true"
          >
            <div className="help-center-module__AcrFRG__searchFilterWrapper">
              <div className="help-center-module__AcrFRG__searchWrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="help-center-module__AcrFRG__searchIcon"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    d="m15.879 15.879 4.242 4.242M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search for answers..."
                  className="help-center-module__AcrFRG__searchInput"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="help-center-module__AcrFRG__filterWrapper">
                <select
                  className="help-center-module__AcrFRG__filterSelect"
                  style={{ fontWeight: "500" }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="Trading">Trading</option>
                  <option value="Stocks">Stocks</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Copy Trading">Copy Trading</option>
                  <option value="Staking">Staking</option>
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="help-center-module__AcrFRG__filterCaret"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M12.707 14.535a1 1 0 0 1-1.414 0l-2.829-2.828A1 1 0 0 1 9.172 10h5.656a1 1 0 0 1 .708 1.707z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="help-center-module__AcrFRG__faqSectionWrapper">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="help-center-module__AcrFRG__faqSet"
                >
                  <p className="help-center-module__AcrFRG__faqSectionTitle">
                    {cat.title}
                  </p>
                  <div className="faq-module__GPQN9G__container">
                    <div
                      data-orientation="vertical"
                      dir="ltr"
                      className="faq-module__GPQN9G__Accordion"
                    >
                      {cat.items.map((item, idx) => {
                        const itemKey = `${cat.id}-${idx}`;
                        const isOpen = !!openItems[itemKey];
                        return (
                          <div
                            key={itemKey}
                            data-orientation="vertical"
                            data-open={isOpen ? "" : undefined}
                            data-closed={!isOpen ? "" : undefined}
                            className="faq-module__GPQN9G__Item"
                          >
                            <h3 className="faq-module__GPQN9G__Header">
                              <button
                                type="button"
                                aria-expanded={isOpen}
                                onClick={() => toggle(itemKey)}
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
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
