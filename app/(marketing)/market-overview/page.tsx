"use client";

import React from "react";
import Link from "next/link";

export default function MarketsPage() {
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
        <section
          className="markets-module__ocH3oG__hero"
          style={{ position: "relative" }}
        >
          {/* Authentic Background Grid Illustration */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "1440px",
              height: "650px",
              pointerEvents: "none",
              zIndex: 0,
              overflow: "hidden",
              opacity: 0.45,
              maskImage:
                "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
            }}
          >
            <img
              src="/assets/imgs/flat-grid.svg"
              alt="grid background"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <div
            className="markets-module__ocH3oG__lockup"
            style={{ position: "relative", zIndex: 2 }}
          >
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
                <p className="pill-module__qX7Pgq__pillText">Markets</p>
              </div>
            </div>
            <h2
              className="markets-module__ocH3oG__lockupTitle stagger-1"
              data-animate="true"
            >
              Supported Markets
            </h2>
            <p
              className="markets-module__ocH3oG__lockupSubtext inter-alts stagger-3"
              data-animate="true"
            >
              Get access to all the markets listed below and many more using our
              powerful trading platform.
            </p>
            <div
              className="markets-module__ocH3oG__lockupButtons stagger-4"
              data-animate="true"
            >
              <a
                className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__primary"
                href="/register"
              >
                <div className="button-module__Q_cxDG__overlay"></div>
                <p className="button-module__Q_cxDG__buttonText inter-alts">
                  See all markets
                </p>
              </a>
            </div>
          </div>
          <div
            className="markets-module__ocH3oG__marketsTableContainer stagger-5"
            data-animate="true"
          >
            <div className="markets-module__ocH3oG__marketsTable">
              <div>
                <table>
                  <thead>
                    <tr>
                      <th className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/filled.svg"
                        />
                        <p>Asset</p>
                      </th>
                      <th className="markets-module__ocH3oG__symbol">Symbol</th>
                      <th className="markets-module__ocH3oG__type">Type</th>
                      <th className="markets-module__ocH3oG__price">
                        Current price (USD)
                      </th>
                      <th className="markets-module__ocH3oG__action">Action</th>
                    </tr>
                  </thead>
                  <tbody className="scrollbar-hide">
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="BTC icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/markets/BTC.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Bitcoin
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          BTC
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>crypto</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$30,000.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="ETH icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/markets/ETH.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Ethereum
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ETH
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>crypto</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$30,000.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="AAPL icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/shares/stocks/AAPL.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Apple
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          AAPL
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>stocks</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$175.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="TSLA icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/shares/stocks/TSLA.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Tesla
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          TSLA
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>stocks</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$250.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="LTC icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/markets/LTC.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Litecoin
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          LTC
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>crypto</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$150.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="XRP icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/markets/XRP.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Ripple
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          XRP
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>crypto</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$0.50</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="SPY icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/shares/etfs/spdr.png"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          S&P 500 ETF Trust
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          SPY
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>ETFs</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$450.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="AMZN icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/shares/stocks/AMZN.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Amazon
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          AMZN
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>stocks</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$140.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="ADA icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/markets/ADA.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Cardano
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ADA
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>crypto</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$1.20</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="NVDA icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/shares/stocks/NVDA.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Nvidia
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          NVDA
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>stocks</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$500.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="QQQ icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/shares/etfs/invesco.png"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          QQQ Trust Series 1
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          QQQ
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>ETFs</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$380.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="VTI icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/shares/etfs/vanguard.png"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Total Stock Market ETF
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          VTI
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>ETFs</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$240.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="XLM icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/markets/XLM.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Stellar
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          XLM
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>crypto</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$0.30</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="NFLX icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/shares/stocks/NFLX.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Netflix
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          NFLX
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>stocks</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$450.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="SOL icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/markets/SOL.svg"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Solana
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          SOL
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>crypto</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$40.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="markets-module__ocH3oG__asset">
                        <img
                          alt="watchlist star"
                          loading="lazy"
                          width="14"
                          height="14"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__watchlist"
                          style={{ color: "transparent" }}
                          src="/assets/markets/gold.svg"
                        />
                        <img
                          alt="VGT icon"
                          loading="lazy"
                          width="17"
                          height="17"
                          decoding="async"
                          data-nimg="1"
                          className="markets-module__ocH3oG__assetIcon"
                          style={{ color: "transparent" }}
                          src="/assets/shares/etfs/vanguard.png"
                        />
                        <p className="markets-module__ocH3oG__assetName">
                          Information Technology ETF
                        </p>
                        <p
                          className="markets-module__ocH3oG__assetSymbol"
                          style={{
                            maxWidth: "120px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          VGT
                        </p>
                      </td>
                      <td className="markets-module__ocH3oG__type">
                        <p>ETFs</p>
                      </td>
                      <td className="markets-module__ocH3oG__price">
                        <p>$420.00</p>
                      </td>
                      <td className="markets-module__ocH3oG__action">
                        <a
                          href="/register"
                          className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary button-module__Q_cxDG__sm "
                        >
                          <p className="button-module__Q_cxDG__buttonText inter-alts">
                            Trade
                          </p>{" "}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div
            style={{
              position: "relative",
              zIndex: "10",
              width: "max-content",
              margin: "0 auto",
            }}
          >
            <a
              className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__primary"
              href="/register"
            >
              <div className="button-module__Q_cxDG__overlay"></div>
              <p className="button-module__Q_cxDG__buttonText inter-alts">
                See all markets
              </p>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
