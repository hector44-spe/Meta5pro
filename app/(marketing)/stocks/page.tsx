"use client";

import React, { useState } from "react";
import Link from "next/link";
import TradingToolsOrb from "@/components/TradingToolsOrb/TradingToolsOrb";
import LightRays from "@/components/LightRays/LightRays";
import FaqSection from "@/components/FaqSection/FaqSection";
import { FAQS } from "@/data/faqs";

interface StockItem {
  name: string;
  symbol: string;
}

interface EtfItem {
  name: string;
  symbol: string;
  parent: string;
}

const STOCKS: StockItem[] = [
  { name: "Caterpillar", symbol: "CAT" },
  { name: "Apple", symbol: "AAPL" },
  { name: "Amazon", symbol: "AMZN" },
  { name: "PayPal", symbol: "PYPL" },
  { name: "Tesla", symbol: "TSLA" },
  { name: "Microsoft", symbol: "MSFT" },
  { name: "Meta Platforms Inc", symbol: "FB" },
  { name: "Nvidia", symbol: "NVDA" },
  { name: "Netflix", symbol: "NFLX" },
  { name: "Adobe", symbol: "ADBE" },
  { name: "Alibaba", symbol: "BABA" },
  { name: "Boeing", symbol: "BA" },
  { name: "Cisco", symbol: "CSCO" },
  { name: "Disney", symbol: "DIS" },
  { name: "Coca Cola", symbol: "KO" },
  { name: "Nike", symbol: "NKE" },
  { name: "Walmart", symbol: "WMT" },
  { name: "Toyota Motor", symbol: "TM" },
  { name: "Chevron", symbol: "CVX" },
  { name: "Merck", symbol: "MRK" },
  { name: "Pepsi", symbol: "PEP" },
  { name: "Oracle", symbol: "ORCL" },
  { name: "Costco", symbol: "COST" },
  { name: "Visa", symbol: "V" },
];

const ETFS: EtfItem[] = [
  { name: "QQQ Trust Series 1", symbol: "QQQ", parent: "Invesco" },
  { name: "FTSE Developed Markets ETF", symbol: "VEA", parent: "Vanguard" },
  { name: "Information Technology ETF", symbol: "VGT", parent: "Vanguard" },
  { name: "FTSE Emerging Markets ETF", symbol: "VWO", parent: "Vanguard" },
  { name: "Core S&P Mid-Cap ETF", symbol: "IJH", parent: "iShares" },
  { name: "Mid-Cap ETF", symbol: "VO", parent: "Vanguard" },
  { name: "Technology Select Sector SPDR ETF", symbol: "XLK", parent: "SPDR" },
  { name: "S&P 500 Equal Weight ETF", symbol: "RSP", parent: "Invesco" },
  { name: "0-3 Month Treasury Bond ETF", symbol: "SGOV", parent: "iShares" },
  {
    name: "Bitcoin Trust Beneficial Interest",
    symbol: "IBIT",
    parent: "iShares",
  },
  { name: "Russell 1000 Value ETF", symbol: "IWD", parent: "iShares" },
  { name: "Russell 1000 Growth ETF", symbol: "IWF", parent: "iShares" },
  { name: "Core S&P Small-Cap ETF", symbol: "IJR", parent: "iShares" },
  { name: "High Yield Index ETF", symbol: "VYM", parent: "Vanguard" },
  { name: "U.S. Aggregate Bond ETF", symbol: "AGG", parent: "iShares" },
  { name: "Energy Select Sector SPDR ETF", symbol: "XLE", parent: "SPDR" },
  { name: "Financial Select Sector SPDR ETF", symbol: "XLF", parent: "SPDR" },
  { name: "Health Care Select Sector SPDR ETF", symbol: "XLV", parent: "SPDR" },
  { name: "MSCI EAFE ETF", symbol: "EFA", parent: "iShares" },
  { name: "Real Estate ETF", symbol: "VNQ", parent: "Vanguard" },
  { name: "Total Bond Market ETF", symbol: "BND", parent: "Vanguard" },
  { name: "U.S. Total Market Stock ETF", symbol: "SCHB", parent: "Schwab" },
  { name: "S&P 500 ETF Trust", symbol: "SPY", parent: "SPDR" },
  { name: "Vanguard 500 Index Fund", symbol: "VOO", parent: "Vanguard" },
];

export default function StocksPage() {
  const [activeTab, setActiveTab] = useState<"stocks" | "etfs">("stocks");

  return (
    <main className="page-module___8aEwW__mainContainer">
      <div
        style={{
          padding: "0px var(--container-padding-inline)",
          maxWidth: "1440px",
          boxSizing: "border-box",
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100vw",
            height: "640px",
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            background: "transparent",
            zIndex: 0,
            opacity: 1,
            pointerEvents: "none",
            overflow: "hidden",
            transition: "opacity 0.5s ease-out",
          }}
        >
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={0.5}
            lightSpread={0.5}
            rayLength={2}
            followMouse={true}
            mouseInfluence={0.05}
            noiseAmount={0}
            distortion={0}
            className="custom-rays"
          />
        </div>
        <section className="stocks-module__mh0C-a__hero">
          <div className="stocks-module__mh0C-a__illustrationContainer">
            <div
              className="stocks-module__mh0C-a__illustrationWrapper stagger-5"
              data-animate="true"
            >
              <TradingToolsOrb />
            </div>
          </div>
          <div className="stocks-module__mh0C-a__lockup">
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
                        id="_R_aanpfjb_"
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
                      stroke="url(#_R_aanpfjb_)"
                      strokeWidth="1"
                      strokeDasharray="6 8"
                      className="pill-module__qX7Pgq__rotatingStroke"
                    />
                  </svg>
                </div>
                <p className="pill-module__qX7Pgq__pillText">Stocks & ETFs</p>
              </div>
            </div>
            <h2
              className="stocks-module__mh0C-a__lockupTitle stagger-1"
              data-animate="true"
            >
              Invest and trade shares
            </h2>
            <p
              className="stocks-module__mh0C-a__lockupSubtext inter-alts stagger-3"
              data-animate="true"
            >
              Invest in over 1,000 stocks and ETFs directly on our platform
            </p>
            <div
              className="stocks-module__mh0C-a__lockupButtons stagger-4"
              data-animate="true"
            >
              <Link
                className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__primary"
                href="/register"
              >
                <div className="button-module__Q_cxDG__overlay"></div>
                <p className="button-module__Q_cxDG__buttonText inter-alts">
                  Get started
                </p>
              </Link>
            </div>
          </div>
          <div className="stocks-module__mh0C-a__radialMask"></div>
        </section>
      </div>

      <section className="stocks-module__uQLVAq__container">
        <div className="top-line-module__PKQ0Jq__topLinecontainer">
          <svg
            className="top-line-module__PKQ0Jq__topLineBorder"
            viewBox="0 0 800 1"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="0.5"
              x2="800"
              y2="0.5"
              className="top-line-module__PKQ0Jq__topLineBorderStroke"
            />
          </svg>
          <div className="top-line-module__PKQ0Jq__threeLines">
            <div className="top-line-module__PKQ0Jq__lineOne"></div>
            <div className="top-line-module__PKQ0Jq__lineTwo"></div>
            <div className="top-line-module__PKQ0Jq__lineThree"></div>
          </div>
        </div>

        <div className="stocks-module__uQLVAq__content">
          <div className="stocks-module__uQLVAq__contentWrapper">
            <div className="stocks-module__uQLVAq__switcherSection">
              <div className="stocks-module__uQLVAq__switcherSectionTop">
                <p className="stocks-module__uQLVAq__switcherSectionTitle">
                  Build your stock portfolio.
                </p>
                <p className="stocks-module__uQLVAq__switcherSectionSubtext">
                  Start investing in a world of ever-growing stocks and ETFs.
                </p>
                <div className="stocks-module__uQLVAq__switcher">
                  <button
                    type="button"
                    onClick={() => setActiveTab("stocks")}
                    className={`stocks-module__uQLVAq__switcherButton ${
                      activeTab === "stocks"
                        ? "stocks-module__uQLVAq__isActive"
                        : ""
                    }`}
                  >
                    <p>Stocks</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("etfs")}
                    className={`stocks-module__uQLVAq__switcherButton ${
                      activeTab === "etfs"
                        ? "stocks-module__uQLVAq__isActive"
                        : ""
                    }`}
                  >
                    <p>ETFs</p>
                  </button>
                </div>
              </div>

              <div className="stocks-module__uQLVAq__marqueeBlock">
                {[0, 1, 2, 3].map((rowIndex) => {
                  const items =
                    activeTab === "stocks"
                      ? STOCKS.slice(rowIndex * 6, (rowIndex + 1) * 6)
                      : ETFS.slice(rowIndex * 6, (rowIndex + 1) * 6);
                  const loopedItems = [...items, ...items];

                  return (
                    <div
                      key={`row-${rowIndex}-${activeTab}`}
                      className="stocks-module__uQLVAq__marqueeRowWrapper"
                    >
                      <div className="stocks-module__uQLVAq__marqueeRow">
                        {loopedItems.map((item, idx) => {
                          const isStock = activeTab === "stocks";
                          const iconSrc = isStock
                            ? `/assets/shares/stocks/${item.symbol}.svg`
                            : `/assets/shares/etfs/${(item as EtfItem).parent.toLowerCase()}.png`;

                          return (
                            <div
                              key={`${activeTab}-${rowIndex}-${idx}`}
                              className="stocks-module__uQLVAq__marqueeBox"
                            >
                              <div className="stocks-module__uQLVAq__marqueeBoxIcon">
                                <img
                                  alt="icon img"
                                  loading="lazy"
                                  width="28"
                                  height="28"
                                  src={iconSrc}
                                  style={{
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "14px",
                                    objectFit: "contain",
                                  }}
                                />
                              </div>
                              <span className="stocks-module__uQLVAq__marqueeBoxTitles">
                                <p className="stocks-module__uQLVAq__marqueeBoxTitlesName">
                                  {item.name}
                                </p>
                                <p className="stocks-module__uQLVAq__marqueeBoxTitlesSymbol">
                                  {item.symbol}
                                </p>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqSection type="Stocks" questions={FAQS.STOCKS} />
    </main>
  );
}
