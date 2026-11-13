"use client";

import React from "react";
import Link from "next/link";
import TradingToolsOrb from "@/components/TradingToolsOrb/TradingToolsOrb";
import CountUp from "@/components/CountUp/CountUp";
import BackgroundVideo from "@/components/BackgroundVideo";

export default function HomePage() {
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
        <BackgroundVideo
          src="/assets/video/bg-video.mp4"
          poster="/assets/asset_10.webp"
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: "-1",
            mixBlendMode: "screen",
            maskImage:
              "linear-gradient(to bottom,var(--background) 30%,transparent 70%)",
            opacity: "0.35",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
        <section className="two-module__iAIncG__hero">
          <div className="two-module__iAIncG__lockup">
            <div className="stagger-2" data-animate="true">
              <div className="pill-module__qX7Pgq__pillContainer pill-module__qX7Pgq__noUrl">
                <div className="pill-module__qX7Pgq__pillBorderSvg">
                  <svg
                    className="pill-module__qX7Pgq__rotatingBorder"
                    viewBox="0 0 128.6875 28"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="_R_5glfjb_"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="rgba(125, 102, 255, 0.192)"
                        ></stop>
                        <stop
                          offset="100%"
                          stopColor="rgba(168, 153, 255, 0.28)"
                        ></stop>
                      </linearGradient>
                    </defs>
                    <rect
                      x="0.5"
                      y="0.5"
                      width="127.6875"
                      height="27"
                      rx="14"
                      fill="none"
                      stroke="url(#_R_5glfjb_)"
                      strokeWidth="1"
                      strokeDasharray="6 8"
                      className="pill-module__qX7Pgq__rotatingStroke"
                    />
                  </svg>
                </div>
                <p className="pill-module__qX7Pgq__pillText">
                  Trading Platform
                </p>
              </div>
            </div>
            <h2
              className="two-module__iAIncG__lockupTitle stagger-1 mixed-text"
              data-animate="true"
            >
              Upgrade the{" "}
              <span
                style={{ display: "inline-block" }}
                className="stagger-2 mixed-text"
                data-animate="true"
              >
                way you trade
              </span>
            </h2>
            <p
              className="two-module__iAIncG__lockupSubtext inter-alts stagger-3"
              data-animate="true"
            >
              Meta Gold 5 blends advanced power with simplicity, offering strong
              security, 24/7 support, and an intuitive trading platform.
            </p>
            <div
              className="two-module__iAIncG__lockupButtons stagger-4"
              data-animate="true"
            >
              <a
                className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__primary"
                href="/register"
              >
                <div className="button-module__Q_cxDG__overlay"></div>
                <p className="button-module__Q_cxDG__buttonText inter-alts">
                  Get started
                </p>
              </a>
            </div>
          </div>
          <div
            style={{
              maxWidth: "max-content",
              margin: "0 auto",
              marginTop: "64px",
              position: "relative",
            }}
            className="stagger-5"
            data-animate="true"
          >
            <img
              alt="hero screenshot"
              loading="lazy"
              width="2400"
              height="1500"
              decoding="async"
              data-nimg="1"
              className="two-module__iAIncG__desktopImg"
              style={{ color: "transparent" }}
              src="/assets/asset_2.png"
            />
            <img
              alt="hero screenshot"
              loading="lazy"
              width="700"
              height="1040"
              decoding="async"
              data-nimg="1"
              className="two-module__iAIncG__mobileImg sf-hidden"
              style={{ color: "transparent" }}
              src="data:,"
            />
          </div>
        </section>
      </div>
      <div className="one-module__9f56Ia__container">
        <div className="one-module__9f56Ia__sectionTitleWrapper sf-hidden"></div>
        <div className="one-module__9f56Ia__featuresWrapper">
          <div className="bottom-module__JWJQYa__featureBlockWrapper">
            <svg
              className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderBottom"
              viewBox="0 0 383 1"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="0.5"
                x2="383"
                y2="0.5"
                className="bottom-module__JWJQYa__featureBlockBorderStroke"
              />
            </svg>
            <svg
              className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
              viewBox="0 0 1 158"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0.5"
                y1="0"
                x2="0.5"
                y2="158"
                className="bottom-module__JWJQYa__featureBlockBorderStroke"
              />
            </svg>
            <div className="one-module__9f56Ia__subFeatureBlock">
              <span className="one-module__9f56Ia__subFeatureBlockHeader">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="one-module__9f56Ia__featureIcon"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16M17 4v4M7 10v4m10 2v4"
                  ></path>
                </svg>
                <p className="one-module__9f56Ia__subFeatureBlockTitle">
                  Portfolio management
                </p>
              </span>
              <p className="one-module__9f56Ia__subFeatureBlockDescription">
                Effortlessly manage your portfolio with our intuitive and
                user-friendly platform.
              </p>
            </div>
          </div>
          <div className="bottom-module__JWJQYa__featureBlockWrapper">
            <svg
              className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderBottom"
              viewBox="0 0 352.265625 1"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="0.5"
                x2="352.265625"
                y2="0.5"
                className="bottom-module__JWJQYa__featureBlockBorderStroke"
              />
            </svg>
            <svg
              className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
              viewBox="0 0 1 158"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0.5"
                y1="0"
                x2="0.5"
                y2="158"
                className="bottom-module__JWJQYa__featureBlockBorderStroke"
              />
            </svg>
            <div className="one-module__9f56Ia__subFeatureBlock">
              <span className="one-module__9f56Ia__subFeatureBlockHeader">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="one-module__9f56Ia__featureIcon"
                >
                  <path
                    fill="currentColor"
                    d="M8 11.5a.5.5 0 0 0 0 1zm4 1a.5.5 0 0 0 0-1zm-4 3a.5.5 0 0 0 0 1zm2 1a.5.5 0 0 0 0-1zM16 8h-.5v12h1V8zm-1 13v-.5H5v1h10zM4 20h.5V8h-1v12zM5 7v.5h10v-1H5zm3 5v.5h4v-1H8zm0 4v.5h2v-1H8zm12 0h.5V4h-1v12zM19 3v-.5H9v1h10zM8 4h-.5v3h1V4zm8 13v.5h3v-1h-3zM9 3v-.5A1.5 1.5 0 0 0 7.5 4h1a.5.5 0 0 1 .5-.5zm11 1h.5A1.5 1.5 0 0 0 19 2.5v1a.5.5 0 0 1 .5.5zm0 12h-.5a.5.5 0 0 1-.5.5v1a1.5 1.5 0 0 0 1.5-1.5zM5 21v-.5a.5.5 0 0 1-.5-.5h-1A1.5 1.5 0 0 0 5 21.5zm11-1h-.5a.5.5 0 0 1-.5.5v1a1.5 1.5 0 0 0 1.5-1.5zm0-12h.5A1.5 1.5 0 0 0 15 6.5v1a.5.5 0 0 1 .5.5zM4 8h.5a.5.5 0 0 1 .5-.5v-1A1.5 1.5 0 0 0 3.5 8z"
                  ></path>
                </svg>
                <p className="one-module__9f56Ia__subFeatureBlockTitle">
                  One-click copy trading
                </p>
              </span>
              <p className="one-module__9f56Ia__subFeatureBlockDescription">
                Copy the trades of experienced traders with just a single click.
              </p>
            </div>
          </div>
          <div className="bottom-module__JWJQYa__featureBlockWrapper">
            <svg
              className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderRight"
              viewBox="0 0 1 158"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0.5"
                y1="0"
                x2="0.5"
                y2="158"
                className="bottom-module__JWJQYa__featureBlockBorderStroke"
              />
            </svg>
            <svg
              className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderBottom"
              viewBox="0 0 351.734375 1"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="0.5"
                x2="351.734375"
                y2="0.5"
                className="bottom-module__JWJQYa__featureBlockBorderStroke"
              />
            </svg>
            <svg
              className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
              viewBox="0 0 1 158"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0.5"
                y1="0"
                x2="0.5"
                y2="158"
                className="bottom-module__JWJQYa__featureBlockBorderStroke"
              />
            </svg>
            <div className="one-module__9f56Ia__subFeatureBlock">
              <span className="one-module__9f56Ia__subFeatureBlockHeader">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="one-module__9f56Ia__featureIcon"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 5v14h16M6.783 14.182l4.242-4.243 3.536 3.536L20.036 8H17"
                  ></path>
                </svg>
                <p className="one-module__9f56Ia__subFeatureBlockTitle">
                  Up to 100x leverage
                </p>
              </span>
              <p className="one-module__9f56Ia__subFeatureBlockDescription">
                Maximize your trading potential with up to 100x leverage.
              </p>
            </div>
          </div>
          <div className="bottom-module__JWJQYa__featureBlockWrapper">
            <svg
              className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
              viewBox="0 0 1 180"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0.5"
                y1="0"
                x2="0.5"
                y2="180"
                className="bottom-module__JWJQYa__featureBlockBorderStroke"
              />
            </svg>
            <div className="one-module__9f56Ia__subFeatureBlock">
              <span className="one-module__9f56Ia__subFeatureBlockHeader">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="one-module__9f56Ia__featureIcon"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    d="M12 7v2m0 6v2m3-8h-5a1.5 1.5 0 1 0 0 3h4a1.5 1.5 0 0 1 0 3H9m12-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  ></path>
                </svg>
                <p className="one-module__9f56Ia__subFeatureBlockTitle">
                  Demo Accounts
                </p>
              </span>
              <p className="one-module__9f56Ia__subFeatureBlockDescription">
                Test your trading strategies with our risk-free demo account
                before committing your funds.
              </p>
            </div>
          </div>
          <div className="bottom-module__JWJQYa__featureBlockWrapper">
            <svg
              className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
              viewBox="0 0 1 180"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0.5"
                y1="0"
                x2="0.5"
                y2="180"
                className="bottom-module__JWJQYa__featureBlockBorderStroke"
              />
            </svg>
            <div className="one-module__9f56Ia__subFeatureBlock">
              <span className="one-module__9f56Ia__subFeatureBlockHeader">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="one-module__9f56Ia__featureIcon"
                >
                  <path
                    stroke="currentColor"
                    strokeLinejoin="round"
                    d="M13.182 10 14 2 4 14h6.818L10 22l10-12z"
                  ></path>
                </svg>
                <p className="one-module__9f56Ia__subFeatureBlockTitle">
                  Real-time trading
                </p>
              </span>
              <p className="one-module__9f56Ia__subFeatureBlockDescription">
                Experience the thrill of real-time trading with seamless
                execution and tight spreads.
              </p>
            </div>
          </div>
          <div className="bottom-module__JWJQYa__featureBlockWrapper">
            <svg
              className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderRight"
              viewBox="0 0 1 180"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0.5"
                y1="0"
                x2="0.5"
                y2="180"
                className="bottom-module__JWJQYa__featureBlockBorderStroke"
              />
            </svg>
            <svg
              className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
              viewBox="0 0 1 180"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0.5"
                y1="0"
                x2="0.5"
                y2="180"
                className="bottom-module__JWJQYa__featureBlockBorderStroke"
              />
            </svg>
            <div className="one-module__9f56Ia__subFeatureBlock">
              <span className="one-module__9f56Ia__subFeatureBlockHeader">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="one-module__9f56Ia__featureIcon"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 11h6m-6 4h3m-8 6h8a9 9 0 1 0-9-9v8a1 1 0 0 0 1 1"
                  ></path>
                </svg>
                <p className="one-module__9f56Ia__subFeatureBlockTitle">
                  24/7 live-chat support
                </p>
              </span>
              <p className="one-module__9f56Ia__subFeatureBlockDescription">
                Access to a world-class support, ready to assist you with any
                questions you may have.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="section-divider"></div>
      <section className="one-module__niIkvG__whyChooseUsContainer">
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
            <div className="top-line-module__PKQ0Jq__lineTwo top-line-module__PKQ0Jq__isExpanded"></div>
            <div className="top-line-module__PKQ0Jq__lineThree"></div>
          </div>
        </div>
        <div className="stars-module__Sa4GPa__starsContainer">
          <div className="stars-module__Sa4GPa__starsInner stars-inner">
            <div
              className="stars-module__Sa4GPa__star stars-overlap"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
          </div>
        </div>
        <div className="backlight inView"></div>
        <div className="section-lockup-module__Aj2JOq__lockup">
          <div className="pill-module__qX7Pgq__pillContainer pill-module__qX7Pgq__noUrl">
            <div className="pill-module__qX7Pgq__pillBorderSvg">
              <svg
                className="pill-module__qX7Pgq__rotatingBorder"
                viewBox="0 0 127.0625 28"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="_R_325fjb_"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgba(125, 102, 255, 0.192)"
                    ></stop>
                    <stop
                      offset="100%"
                      stopColor="rgba(168, 153, 255, 0.28)"
                    ></stop>
                  </linearGradient>
                </defs>
                <rect
                  x="0.5"
                  y="0.5"
                  width="126.0625"
                  height="27"
                  rx="14"
                  fill="none"
                  stroke="url(#_R_325fjb_)"
                  strokeWidth="1"
                  strokeDasharray="6 8"
                  className="pill-module__qX7Pgq__rotatingStroke"
                />
              </svg>
            </div>
            <p className="pill-module__qX7Pgq__pillText">Why choose us?</p>
          </div>
          <h2 className="section-lockup-module__Aj2JOq__lockupTitle mixed-text">
            {" "}
            Everything you need to trade, in one place
          </h2>
          <p className="section-lockup-module__Aj2JOq__lockupSubtext">
            Manage assets, place trades, track progress, and move funds
            seamlessly across markets, accounts, and devices.
          </p>
        </div>
        <div className="one-module__niIkvG__content">
          <div className="one-module__niIkvG__topBlock">
            <svg
              className="one-module__niIkvG__topBlockBorder one-module__niIkvG__topBlockBorderTop"
              viewBox="0 0 1000 1"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="0.5"
                x2="1000"
                y2="0.5"
                className="one-module__niIkvG__rotatingBorderStroke"
              />
            </svg>
            <svg
              className="one-module__niIkvG__topBlockBorder one-module__niIkvG__topBlockBorderBottom"
              viewBox="0 0 1000 1"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="0.5"
                x2="1000"
                y2="0.5"
                className="one-module__niIkvG__rotatingBorderStroke"
              />
            </svg>
            <div className="main-module__R0_zcG__mainFeatureBlock">
              <div className="main-module__R0_zcG__mainFeatureBlockWrapper">
                <div className="main-module__R0_zcG__mainFeatureBlockTitleWrapper">
                  <p className="main-module__R0_zcG__mainFeatureBlockTitle">
                    Unified asset management
                  </p>
                </div>
                <p className="main-module__R0_zcG__mainFeatureBlockDesc">
                  Manage multiple assets and accounts from a single interface.
                </p>
              </div>
              <div
                className="main-module__R0_zcG__mainFeatureBlockCard"
                style={{
                  transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                  transition: "transform 0.1s ease-out",
                }}
              >
                <div className="one-module__niIkvG__mainBlockFeatureCard">
                  <div className="markets-module__N4Oanq__marketCardContainer">
                    <p className="markets-module__N4Oanq__marketCardTitle inter-alts">
                      Markets
                    </p>
                    <div className="markets-module__N4Oanq__marketCardList">
                      <div className="markets-module__N4Oanq__marketCardHeader">
                        <div className="markets-module__N4Oanq__marketsRow">
                          <p>Markets</p>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__marketCardHeaderIcon"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m7 15 5 5 5-5M7 9l5-5 5 5"
                            ></path>
                          </svg>
                        </div>
                        <div className="markets-module__N4Oanq__priceRow">
                          <p>Price (USD)</p>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__marketCardHeaderIcon"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m7 15 5 5 5-5M7 9l5-5 5 5"
                            ></path>
                          </svg>
                        </div>
                        <div className="markets-module__N4Oanq__priceRow">
                          <p>24h Chg.</p>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__marketCardHeaderIcon"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m7 15 5 5 5-5M7 9l5-5 5 5"
                            ></path>
                          </svg>
                        </div>
                      </div>
                      <div className="markets-module__N4Oanq__marketCardListItem">
                        <div className="markets-module__N4Oanq__marketsRow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__filledStar"
                          >
                            <path
                              fill="#ffb266"
                              d="M13.128 1.71c-.455-.947-1.805-.947-2.26 0L8.361 6.938l-5.773.757c-1.039.136-1.47 1.42-.698 2.15l4.22 3.985-1.059 5.69c-.194 1.047.912 1.824 1.828 1.33l5.119-2.764 5.12 2.764c.915.494 2.021-.283 1.826-1.33l-1.059-5.69 4.22-3.985c.773-.73.341-2.014-.697-2.15l-5.774-.757z"
                            ></path>
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 32 32"
                            className="markets-module__N4Oanq__marketIcon"
                          >
                            <path
                              fill="#f7931a"
                              d="M31.518 19.87c-2.137 8.572-10.819 13.788-19.391 11.651C3.557 29.384-1.66 20.702.479 12.131 2.615 3.56 11.297-1.659 19.867.48c8.572 2.137 13.788 10.82 11.65 19.392"
                            ></path>
                            <path
                              fill="#fff"
                              d="M23.054 13.72c.318-2.129-1.303-3.273-3.52-4.037l.72-2.884-1.756-.438-.7 2.809a73 73 0 0 0-1.407-.331l.705-2.827-1.755-.438-.72 2.884a58 58 0 0 1-1.12-.264l.002-.009-2.421-.605-.468 1.876s1.303.298 1.276.317c.71.177.84.648.818 1.02l-.82 3.287q.077.017.183.058l-.185-.046-1.148 4.603c-.087.216-.308.54-.805.417.018.026-1.276-.318-1.276-.318l-.872 2.01 2.285.57c.425.106.842.217 1.252.322l-.727 2.917 1.754.438.72-2.886q.717.194 1.399.363L13.75 25.4l1.755.437.727-2.912c2.994.567 5.245.338 6.192-2.37.764-2.18-.038-3.437-1.613-4.258 1.148-.264 2.011-1.019 2.241-2.578m-4.012 5.626c-.543 2.18-4.213 1.001-5.404.706l.965-3.865c1.19.297 5.006.885 4.439 3.159m.543-5.657c-.495 1.983-3.55.976-4.541.728l.874-3.505c.99.247 4.183.708 3.667 2.777"
                            ></path>
                          </svg>
                          <p>BTC</p>
                        </div>
                        <div className="markets-module__N4Oanq__priceRow">
                          <p>113,272.00</p>
                        </div>
                        <div className="markets-module__N4Oanq__changeRow">
                          <p className="positive">2.12%</p>
                        </div>
                      </div>
                      <div className="markets-module__N4Oanq__marketCardListItem">
                        <div className="markets-module__N4Oanq__marketsRow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__filledStar"
                          >
                            <path
                              fill="#ffb266"
                              d="M13.128 1.71c-.455-.947-1.805-.947-2.26 0L8.361 6.938l-5.773.757c-1.039.136-1.47 1.42-.698 2.15l4.22 3.985-1.059 5.69c-.194 1.047.912 1.824 1.828 1.33l5.119-2.764 5.12 2.764c.915.494 2.021-.283 1.826-1.33l-1.059-5.69 4.22-3.985c.773-.73.341-2.014-.697-2.15l-5.774-.757z"
                            ></path>
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__marketIcon"
                          >
                            <circle cx="12" cy="12" r="12" fill="#906ee0" />
                            <g fill="#fff" clipPath="url(#ETH_svg__a)">
                              <path d="m11.519 3.84-.103.35v10.156l.103.103 4.714-2.787z"></path>
                              <path d="m11.519 3.84-4.715 7.822 4.715 2.787zm0 11.502-.058.07v3.618l.058.17 4.717-6.643z"></path>
                              <path d="M11.519 19.2v-3.858l-4.715-2.786zm0-4.75 4.714-2.788-4.714-2.142z"></path>
                              <path d="m6.804 11.662 4.715 2.787V9.52z"></path>
                            </g>
                            <defs>
                              <clipPath id="ETH_svg__a">
                                <path
                                  fill="#fff"
                                  d="M3.84 3.84H19.2V19.2H3.84z"
                                ></path>
                              </clipPath>
                            </defs>
                          </svg>
                          <p>ETH</p>
                        </div>
                        <div className="markets-module__N4Oanq__priceRow">
                          <p>4,460.42</p>
                        </div>
                        <div className="markets-module__N4Oanq__changeRow">
                          <p className="positive">1.06%</p>
                        </div>
                      </div>
                      <div className="markets-module__N4Oanq__marketCardListItem">
                        <div className="markets-module__N4Oanq__marketsRow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__filledStar"
                          >
                            <path
                              fill="#ffb266"
                              d="M13.128 1.71c-.455-.947-1.805-.947-2.26 0L8.361 6.938l-5.773.757c-1.039.136-1.47 1.42-.698 2.15l4.22 3.985-1.059 5.69c-.194 1.047.912 1.824 1.828 1.33l5.119-2.764 5.12 2.764c.915.494 2.021-.283 1.826-1.33l-1.059-5.69 4.22-3.985c.773-.73.341-2.014-.697-2.15l-5.774-.757z"
                            ></path>
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__marketIcon"
                          >
                            <circle cx="12" cy="12" r="12" fill="#50af95" />
                            <path
                              fill="#fff"
                              fillRule="evenodd"
                              d="M13.22 11.942c-.067.005-.42.026-1.206.026a27 27 0 0 1-1.224-.026c-2.415-.107-4.218-.527-4.218-1.03 0-.504 1.803-.924 4.218-1.032v1.643c.158.011.61.038 1.235.038.75 0 1.126-.031 1.194-.037V9.88c2.41.108 4.209.528 4.209 1.03 0 .503-1.799.923-4.21 1.03zm0-2.23v-1.47h3.365V6H7.426v2.242h3.363V9.71C8.056 9.837 6 10.378 6 11.027s2.056 1.19 4.79 1.316v4.71h2.43v-4.712c2.728-.125 4.78-.666 4.78-1.315s-2.05-1.189-4.78-1.315"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                          <p>USDT</p>
                        </div>
                        <div className="markets-module__N4Oanq__priceRow">
                          <p>1.00</p>
                        </div>
                        <div className="markets-module__N4Oanq__changeRow">
                          <p className="neutral">0.00%</p>
                        </div>
                      </div>
                      <div className="markets-module__N4Oanq__marketCardListItem">
                        <div className="markets-module__N4Oanq__marketsRow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__filledStar"
                          >
                            <path
                              fill="#ffb266"
                              d="M13.128 1.71c-.455-.947-1.805-.947-2.26 0L8.361 6.938l-5.773.757c-1.039.136-1.47 1.42-.698 2.15l4.22 3.985-1.059 5.69c-.194 1.047.912 1.824 1.828 1.33l5.119-2.764 5.12 2.764c.915.494 2.021-.283 1.826-1.33l-1.059-5.69 4.22-3.985c.773-.73.341-2.014-.697-2.15l-5.774-.757z"
                            ></path>
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__marketIcon"
                          >
                            <g clipPath="url(#AAPL_svg__a)">
                              <circle cx="12" cy="12" r="12" fill="#6c6a82" />
                              <path
                                fill="url(#AAPL_svg__b)"
                                d="M-7 0h38.222v24H-7z"
                              ></path>
                            </g>
                            <defs>
                              <clipPath id="AAPL_svg__a">
                                <rect
                                  width="24"
                                  height="24"
                                  fill="#fff"
                                  rx="12"
                                />
                              </clipPath>
                              <pattern
                                id="AAPL_svg__b"
                                width="1"
                                height="1"
                                patternContentUnits="objectBoundingBox"
                              >
                                <use
                                  href="#AAPL_svg__c"
                                  transform="matrix(.0017 0 0 .0027 -.002 0)"
                                ></use>
                              </pattern>
                              <image
                                id="AAPL_svg__c"
                                width="592"
                                height="370"
                                href="/assets/asset_11.png"
                              ></image>
                            </defs>
                          </svg>
                          <p>AAPL</p>
                        </div>
                        <div className="markets-module__N4Oanq__priceRow">
                          <p>256.68</p>
                        </div>
                        <div className="markets-module__N4Oanq__changeRow">
                          <p className="negative">-0.02%</p>
                        </div>
                      </div>
                      <div className="markets-module__N4Oanq__marketCardListItem">
                        <div className="markets-module__N4Oanq__marketsRow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__filledStar"
                          >
                            <path
                              fill="#ffb266"
                              d="M13.128 1.71c-.455-.947-1.805-.947-2.26 0L8.361 6.938l-5.773.757c-1.039.136-1.47 1.42-.698 2.15l4.22 3.985-1.059 5.69c-.194 1.047.912 1.824 1.828 1.33l5.119-2.764 5.12 2.764c.915.494 2.021-.283 1.826-1.33l-1.059-5.69 4.22-3.985c.773-.73.341-2.014-.697-2.15l-5.774-.757z"
                            ></path>
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__marketIcon"
                          >
                            <rect width="24" height="24" fill="#000" rx="12" />
                            <rect
                              width="24"
                              height="24"
                              fill="url(#NFLX_svg__a)"
                              rx="12"
                            />
                            <defs>
                              <pattern
                                id="NFLX_svg__a"
                                width="1"
                                height="1"
                                patternContentUnits="objectBoundingBox"
                              >
                                <use
                                  href="#NFLX_svg__b"
                                  transform="scale(.00195)"
                                ></use>
                              </pattern>
                              <image
                                id="NFLX_svg__b"
                                width="512"
                                height="512"
                                href="/assets/asset_12.png"
                              ></image>
                            </defs>
                          </svg>
                          <p>NFLX</p>
                        </div>
                        <div className="markets-module__N4Oanq__priceRow">
                          <p>89.88</p>
                        </div>
                        <div className="markets-module__N4Oanq__changeRow">
                          <p className="positive">0.78%</p>
                        </div>
                      </div>
                      <div className="markets-module__N4Oanq__marketCardListItem">
                        <div className="markets-module__N4Oanq__marketsRow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__filledStar"
                          >
                            <path
                              fill="#ffb266"
                              d="M13.128 1.71c-.455-.947-1.805-.947-2.26 0L8.361 6.938l-5.773.757c-1.039.136-1.47 1.42-.698 2.15l4.22 3.985-1.059 5.69c-.194 1.047.912 1.824 1.828 1.33l5.119-2.764 5.12 2.764c.915.494 2.021-.283 1.826-1.33l-1.059-5.69 4.22-3.985c.773-.73.341-2.014-.697-2.15l-5.774-.757z"
                            ></path>
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__marketIcon"
                          >
                            <rect
                              width="24"
                              height="24"
                              fill="url(#ADBE_svg__a)"
                              rx="12"
                            />
                            <defs>
                              <pattern
                                id="ADBE_svg__a"
                                width="1"
                                height="1"
                                patternContentUnits="objectBoundingBox"
                              >
                                <use
                                  href="#ADBE_svg__b"
                                  transform="scale(.0039)"
                                ></use>
                              </pattern>
                              <image
                                id="ADBE_svg__b"
                                width="256"
                                height="256"
                                href="/assets/asset_13.png"
                              ></image>
                            </defs>
                          </svg>
                          <p>ADBE</p>
                        </div>
                        <div className="markets-module__N4Oanq__priceRow">
                          <p>338.42</p>
                        </div>
                        <div className="markets-module__N4Oanq__changeRow">
                          <p className="positive">0.28%</p>
                        </div>
                      </div>
                      <div className="markets-module__N4Oanq__marketCardListItem">
                        <div className="markets-module__N4Oanq__marketsRow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__filledStar"
                          >
                            <path
                              fill="#ffb266"
                              d="M13.128 1.71c-.455-.947-1.805-.947-2.26 0L8.361 6.938l-5.773.757c-1.039.136-1.47 1.42-.698 2.15l4.22 3.985-1.059 5.69c-.194 1.047.912 1.824 1.828 1.33l5.119-2.764 5.12 2.764c.915.494 2.021-.283 1.826-1.33l-1.059-5.69 4.22-3.985c.773-.73.341-2.014-.697-2.15l-5.774-.757z"
                            ></path>
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__marketIcon"
                          >
                            <g clipPath="url(#USD_svg__a)">
                              <path
                                fill="#0c6cf2"
                                d="M0 6a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6z"
                              ></path>
                              <path
                                fill="#fff"
                                fillRule="evenodd"
                                d="M15.8 13.892c0 1.542-1.252 2.566-3.1 2.72V18h-1.266v-1.402A6.9 6.9 0 0 1 8 15.21l.931-1.276c.83.645 1.615 1.066 2.562 1.206v-2.748c-2.125-.532-3.114-1.303-3.114-2.887 0-1.514 1.236-2.552 3.055-2.692V6H12.7v.841c.99.11 1.933.478 2.736 1.066l-.815 1.317c-.64-.462-1.295-.757-1.979-.897v2.664c2.212.533 3.158 1.388 3.158 2.901m-4.308-3.196V8.23c-.916.07-1.396.561-1.396 1.178 0 .588.276.967 1.397 1.29zm2.59 3.294c0-.63-.305-1.008-1.44-1.331v2.538c.917-.071 1.44-.534 1.44-1.206"
                                clipRule="evenodd"
                              ></path>
                            </g>
                            <defs>
                              <clipPath id="USD_svg__a">
                                <rect
                                  width="24"
                                  height="24"
                                  fill="#fff"
                                  rx="12"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                          <p>USD</p>
                        </div>
                        <div className="markets-module__N4Oanq__priceRow">
                          <p>1.00</p>
                        </div>
                        <div className="markets-module__N4Oanq__changeRow">
                          <p className="positive">0.98%</p>
                        </div>
                      </div>
                      <div className="markets-module__N4Oanq__marketCardListItem">
                        <div className="markets-module__N4Oanq__marketsRow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__filledStar"
                          >
                            <path
                              fill="#ffb266"
                              d="M13.128 1.71c-.455-.947-1.805-.947-2.26 0L8.361 6.938l-5.773.757c-1.039.136-1.47 1.42-.698 2.15l4.22 3.985-1.059 5.69c-.194 1.047.912 1.824 1.828 1.33l5.119-2.764 5.12 2.764c.915.494 2.021-.283 1.826-1.33l-1.059-5.69 4.22-3.985c.773-.73.341-2.014-.697-2.15l-5.774-.757z"
                            ></path>
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__marketIcon"
                          >
                            <g clipPath="url(#GBP_svg__a)">
                              <path
                                fill="#0c6cf2"
                                d="M0 6a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6z"
                              ></path>
                              <path
                                fill="#fff"
                                d="M15.122 10.215h-4.358c.41-1.557 1.403-2.31 2.68-2.31.999 0 1.769.468 2.316.901l.799-1.7C15.715 6.4 14.665 6 13.445 6 11.02 6 9.19 7.551 8.63 10.215H7.45L7 11.43h1.471a10 10 0 0 0 0 1.14h-1.02L7 13.802h1.631C9.191 16.46 11.021 18 13.445 18c1.175 0 2.264-.36 3.08-1.067l-.81-1.7c-.496.4-1.266.862-2.27.862-1.283 0-2.27-.736-2.68-2.293h2.714l.588-1.232h-3.49a10 10 0 0 1 0-1.14h3.992z"
                              ></path>
                            </g>
                            <defs>
                              <clipPath id="GBP_svg__a">
                                <rect
                                  width="24"
                                  height="24"
                                  fill="#fff"
                                  rx="12"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                          <p>GBP</p>
                        </div>
                        <div className="markets-module__N4Oanq__priceRow">
                          <p>0.7442</p>
                        </div>
                        <div className="markets-module__N4Oanq__changeRow">
                          <p className="positive">0.96%</p>
                        </div>
                      </div>
                      <div className="markets-module__N4Oanq__marketCardListItem">
                        <div className="markets-module__N4Oanq__marketsRow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__filledStar"
                          >
                            <path
                              fill="#ffb266"
                              d="M13.128 1.71c-.455-.947-1.805-.947-2.26 0L8.361 6.938l-5.773.757c-1.039.136-1.47 1.42-.698 2.15l4.22 3.985-1.059 5.69c-.194 1.047.912 1.824 1.828 1.33l5.119-2.764 5.12 2.764c.915.494 2.021-.283 1.826-1.33l-1.059-5.69 4.22-3.985c.773-.73.341-2.014-.697-2.15l-5.774-.757z"
                            ></path>
                          </svg>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="markets-module__N4Oanq__marketIcon"
                          >
                            <g clipPath="url(#ZAR_svg__a)">
                              <path
                                fill="#0c6cf2"
                                d="M0 6a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6z"
                              ></path>
                              <g clipPath="url(#ZAR_svg__b)">
                                <path
                                  fill="#fff"
                                  d="M9.54 11.328h.82q1.206 0 1.779-.404.575-.4.574-1.263c0-.574-.195-.976-.586-1.216q-.586-.36-1.818-.361h-.77zm0 2.067V18H7V6h3.496q2.442 0 3.613.89 1.172.89 1.172 2.704a3.2 3.2 0 0 1-.586 1.885q-.572.824-1.64 1.292Q15.76 16.817 16.582 18h-2.823l-2.863-4.605z"
                                ></path>
                              </g>
                            </g>
                            <defs>
                              <clipPath id="ZAR_svg__a">
                                <path fill="#fff" d="M0 0h24v24H0z"></path>
                              </clipPath>
                              <clipPath id="ZAR_svg__b">
                                <path fill="#fff" d="M7 6h9.583v12H7z"></path>
                              </clipPath>
                            </defs>
                          </svg>
                          <p>ZAR</p>
                        </div>
                        <div className="markets-module__N4Oanq__priceRow">
                          <p>16.5009</p>
                        </div>
                        <div className="markets-module__N4Oanq__changeRow">
                          <p className="positive">0.94%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="one-module__niIkvG__mainBlockDivider">
              <svg
                className="one-module__niIkvG__rotatingDividerSvg"
                viewBox="0 0 1 544"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="544"
                  className="one-module__niIkvG__rotatingBorderStroke"
                />
              </svg>
            </div>
            <div className="main-module__R0_zcG__mainFeatureBlock">
              <div className="main-module__R0_zcG__mainFeatureBlockWrapper">
                <div className="main-module__R0_zcG__mainFeatureBlockTitleWrapper">
                  <p className="main-module__R0_zcG__mainFeatureBlockTitle">
                    Copy trading
                  </p>
                </div>
                <p className="main-module__R0_zcG__mainFeatureBlockDesc">
                  Experience the thrill of real-time trading with seamless
                  execution and tight spreads.
                </p>
              </div>
              <div
                className="main-module__R0_zcG__mainFeatureBlockCard"
                style={{
                  transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                  transition: "transform 0.1s ease-out",
                }}
              >
                <div className="one-module__niIkvG__mainBlockFeatureCard">
                  <div className="copy-trading-module__1l76rq__copyTradingContainer">
                    <div className="copy-trading-module__1l76rq__copyTradingTop">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 64 64"
                        className="copy-trading-module__1l76rq__traderProfile"
                      >
                        <rect
                          width="64"
                          height="64"
                          fill="url(#user_svg__a)"
                          rx="8"
                        />
                        <defs>
                          <pattern
                            id="user_svg__a"
                            width="1"
                            height="1"
                            patternContentUnits="objectBoundingBox"
                          >
                            <use
                              href="#user_svg__b"
                              transform="scale(.00667)"
                            ></use>
                          </pattern>
                          <image
                            id="user_svg__b"
                            width="150"
                            height="150"
                            href="/assets/asset_14.png"
                            preserveAspectRatio="none"
                          ></image>
                        </defs>
                      </svg>
                      <div className="copy-trading-module__1l76rq__copyTradingTitles">
                        <div className="copy-trading-module__1l76rq__copyTradingUser">
                          <span className="copy-trading-module__1l76rq__traderNameRow">
                            <p className="copy-trading-module__1l76rq__traderName inter-alts">
                              Alertia Mars
                            </p>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              className="copy-trading-module__1l76rq__traderCheckMark"
                            >
                              <path
                                fill="url(#gold-tick_svg__a)"
                                fillRule="evenodd"
                                d="M14.534 4.197 12 1.745 9.464 4.197l-3.492-.494-.61 3.474L2.246 8.83 3.796 12l-1.55 3.168 3.116 1.654.61 3.473 3.492-.493 2.535 2.452 2.535-2.452 3.492.493.61-3.474 3.116-1.653L20.202 12l1.55-3.17-3.116-1.653-.61-3.474zM6.8 12.461l3.74 3.74 6.199-6.77-1.47-1.36-4.8 5.23-2.26-2.26z"
                                clipRule="evenodd"
                              ></path>
                              <path
                                fill="url(#gold-tick_svg__b)"
                                fillRule="evenodd"
                                d="M14.29 4.945 12 2.728 9.707 4.945l-3.159-.447-.55 3.142L3.18 9.134 4.58 12l-1.4 2.866 2.818 1.495.55 3.141 3.159-.447 2.292 2.218 2.292-2.218 3.158.447.55-3.141 2.819-1.495L19.417 12l1.4-2.866L18 7.64l-.551-3.142zm-7.492 7.517 3.741 3.74 6.2-6.77-1.47-1.361-4.8 5.23-2.26-2.26z"
                                clipRule="evenodd"
                              ></path>
                              <path
                                fill="#d18800"
                                fillRule="evenodd"
                                d="m6.8 12.462 3.74 3.74 6.165-6.731.041-.036-.005 1.525-6.2 6.77-3.74-3.74-.004-1.534.005.004z"
                                clipRule="evenodd"
                              ></path>
                              <defs>
                                <linearGradient
                                  id="gold-tick_svg__a"
                                  x1="4.811"
                                  x2="19.726"
                                  y1="2.721"
                                  y2="23.463"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#f4e72a"></stop>
                                  <stop
                                    offset="0.539"
                                    stopColor="#cd8105"
                                  ></stop>
                                  <stop
                                    offset="0.68"
                                    stopColor="#cb7b00"
                                  ></stop>
                                  <stop offset="1" stopColor="#f4e72a"></stop>
                                </linearGradient>
                                <linearGradient
                                  id="gold-tick_svg__b"
                                  x1="5.84"
                                  x2="17.847"
                                  y1="3.704"
                                  y2="20.873"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#f9e87f"></stop>
                                  <stop
                                    offset="0.406"
                                    stopColor="#e2b719"
                                  ></stop>
                                  <stop
                                    offset="0.989"
                                    stopColor="#e2b719"
                                  ></stop>
                                </linearGradient>
                              </defs>
                            </svg>
                          </span>
                          <p className="copy-trading-module__1l76rq__traderUsername inter-alts">
                            @alertiam_
                          </p>
                        </div>
                        <div className="copy-trading-module__1l76rq__copyTradingInfoRow">
                          <span className="copy-trading-module__1l76rq__copyTradingInfoRowIcons">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 12 12"
                              className="copy-trading-module__1l76rq__copyTradingRowIcon"
                            >
                              <path
                                stroke="#31aace"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M1.031 6.174a.5.5 0 0 1 0-.348 5.375 5.375 0 0 1 9.938 0 .5.5 0 0 1 0 .348 5.375 5.375 0 0 1-9.938 0"
                              ></path>
                              <path
                                stroke="#31aace"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 7.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
                              ></path>
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 10 10"
                              className="copy-trading-module__1l76rq__copyTradingRowIconCopy"
                            >
                              <g
                                stroke="#31aace"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                clipPath="url(#copy_svg__a)"
                              >
                                <path d="M8.332 3.333H4.165a.833.833 0 0 0-.833.833v4.167c0 .46.373.833.833.833h4.167c.46 0 .833-.373.833-.833V4.166a.833.833 0 0 0-.833-.833"></path>
                                <path d="M1.665 6.666a.836.836 0 0 1-.833-.833V1.666c0-.458.375-.833.833-.833h4.167c.458 0 .833.375.833.833"></path>
                              </g>
                              <defs>
                                <clipPath id="copy_svg__a">
                                  <path fill="#fff" d="M0 0h10v10H0z"></path>
                                </clipPath>
                              </defs>
                            </svg>
                          </span>
                          <span>
                            360 <strong>Watchers</strong>
                          </span>
                          <span>
                            69.6K <strong>Followers</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="copy-trading-module__1l76rq__copyTradingBottom">
                      <div className="copy-trading-module__1l76rq__stat">
                        <p className="copy-trading-module__1l76rq__title">
                          Win rate
                        </p>
                        <p className="copy-trading-module__1l76rq__value copy-trading-module__1l76rq__positive false">
                          54.81%
                        </p>
                      </div>
                      <div className="copy-trading-module__1l76rq__stat">
                        <p className="copy-trading-module__1l76rq__title">
                          Profit share
                        </p>
                        <p className="copy-trading-module__1l76rq__value false copy-trading-module__1l76rq__negative">
                          43.3%
                        </p>
                      </div>
                      <div className="copy-trading-module__1l76rq__stat">
                        <p className="copy-trading-module__1l76rq__title">
                          Wins
                        </p>
                        <p className="copy-trading-module__1l76rq__value false">
                          28
                        </p>
                      </div>
                      <div className="copy-trading-module__1l76rq__stat">
                        <p className="copy-trading-module__1l76rq__title">
                          Losses
                        </p>
                        <p className="copy-trading-module__1l76rq__value false">
                          0
                        </p>
                      </div>
                      <div className="copy-trading-module__1l76rq__stat">
                        <p className="copy-trading-module__1l76rq__title">
                          Trades
                        </p>
                        <p className="copy-trading-module__1l76rq__value false">
                          578
                        </p>
                      </div>
                      <div className="copy-trading-module__1l76rq__stat">
                        <p className="copy-trading-module__1l76rq__title">
                          Min. startup
                        </p>
                        <p className="copy-trading-module__1l76rq__value false">
                          $5,000
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="one-module__niIkvG__bottomBlock">
            <div className="one-module__niIkvG__subFeatureBlock">
              <span className="one-module__niIkvG__subFeatureBlockHeader">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  style={{
                    height: "18px",
                    width: "18px",
                    color: "var(--color-accent)",
                  }}
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 9h16l-4-4m4 10H4l4 4"
                  ></path>
                </svg>
                <p className="one-module__niIkvG__subFeatureBlockTitle">
                  Multi-account support
                </p>
              </span>
              <p className="one-module__niIkvG__subFeatureBlockDescription">
                Swap between accounts and currencies conveniently.
              </p>
            </div>
            <div className="one-module__niIkvG__subFeatureBlock">
              <span className="one-module__niIkvG__subFeatureBlockHeader">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  style={{
                    height: "18px",
                    width: "18px",
                    color: "var(--color-accent)",
                  }}
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    d="M10.863 12.999H11c3.148 0 6.934-1.108 9.762-3.063M10.862 13c-2.784-.037-5.59-1.205-7.6-3.161m7.6 3.16c.068 2.845 1.21 5.817 3.31 7.738M10.861 13c-.015-.68.03-1.351.138-2 .451-2.707 1.364-5.6 3.162-7.738M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  ></path>
                </svg>
                <p className="one-module__niIkvG__subFeatureBlockTitle">
                  Global market access
                </p>
              </span>
              <p className="one-module__niIkvG__subFeatureBlockDescription">
                Trade assets across crypto, stocks, and currencies in one
                unified view.
              </p>
            </div>
            <div className="one-module__niIkvG__subFeatureBlock">
              <span className="one-module__niIkvG__subFeatureBlockHeader">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  style={{
                    height: "18px",
                    width: "18px",
                    color: "var(--color-accent)",
                  }}
                >
                  <path
                    stroke="currentColor"
                    strokeLinejoin="round"
                    d="M13.182 10 14 2 4 14h6.818L10 22l10-12z"
                  ></path>
                </svg>
                <p className="one-module__niIkvG__subFeatureBlockTitle">
                  Fast Deposits & withdrawals
                </p>
              </span>
              <p className="one-module__niIkvG__subFeatureBlockDescription">
                Move funds in and out quickly with supported payment methods.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="one-module__oOI5iq__tradingToolsOneContainer">
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
            <div className="top-line-module__PKQ0Jq__lineTwo top-line-module__PKQ0Jq__isExpanded"></div>
            <div className="top-line-module__PKQ0Jq__lineThree"></div>
          </div>
        </div>
        <div className="stars-module__Sa4GPa__starsContainer">
          <div className="stars-module__Sa4GPa__starsInner stars-inner">
            <div
              className="stars-module__Sa4GPa__star stars-overlap"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
          </div>
        </div>
        <div className="backlight inView"></div>
        <TradingToolsOrb />
        <div className="one-module__oOI5iq__content">
          <div className="one-module__oOI5iq__bottomBlock">
            <svg
              className="one-module__oOI5iq__bottomBlockBorder one-module__oOI5iq__bottomBlockBorderTop"
              viewBox="0 0 1000 1"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="0.5"
                x2="1000"
                y2="0.5"
                className="one-module__oOI5iq__rotatingBorderStroke"
              />
            </svg>
            <svg
              className="one-module__oOI5iq__bottomBlockBorder one-module__oOI5iq__bottomBlockBorderBottom"
              viewBox="0 0 1000 1"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="0.5"
                x2="1000"
                y2="0.5"
                className="one-module__oOI5iq__rotatingBorderStroke"
              />
            </svg>
            <div className="main-module__R0_zcG__mainFeatureBlock">
              <div className="main-module__R0_zcG__mainFeatureBlockWrapper">
                <div className="main-module__R0_zcG__mainFeatureBlockTitleWrapper">
                  <p className="main-module__R0_zcG__mainFeatureBlockTitle">
                    Built for speed
                  </p>
                </div>
                <p className="main-module__R0_zcG__mainFeatureBlockDesc">
                  Built to keep up with live markets, seamless execution and
                  fast moving signals.
                </p>
              </div>
              <div
                className="main-module__R0_zcG__mainFeatureBlockCard"
                style={{
                  transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                  transition: "transform 0.1s ease-out",
                }}
              >
                <div className="one-module__oOI5iq__mainBlockFeatureCard">
                  <div className="speed-module__n6KH4W__speedContainer">
                    <div className="speed-module__n6KH4W__speedOverlay"></div>
                    <div className="speed-module__n6KH4W__verticalBarsWrapper">
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#46DFA5 0%,#2EB37A 100%)",
                          boxShadow: "0px 1px 3px 0px #46DFA540",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#46DFA5 0%,#2EB37A 100%)",
                          boxShadow: "0px 1px 3px 0px #46DFA540",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#46DFA5 0%,#2EB37A 100%)",
                          boxShadow: "0px 1px 3px 0px #46DFA540",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#46DFA5 0%,#2EB37A 100%)",
                          boxShadow: "0px 1px 3px 0px #46DFA540",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#46DFA5 0%,#2EB37A 100%)",
                          boxShadow: "0px 1px 3px 0px #46DFA540",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#46DFA5 0%,#2EB37A 100%)",
                          boxShadow: "0px 1px 3px 0px #46DFA540",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#74645D 0%,#5A5046 100%)",
                          boxShadow: "0px 1px 3px 0px #74645D40",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#74645D 0%,#5A5046 100%)",
                          boxShadow: "0px 1px 3px 0px #74645D40",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#74645D 0%,#5A5046 100%)",
                          boxShadow: "0px 1px 3px 0px #74645D40",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#74645D 0%,#5A5046 100%)",
                          boxShadow: "0px 1px 3px 0px #74645D40",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#B44A4E 0%,#8F3839 100%)",
                          boxShadow: "0px 1px 3px 0px #B44A4E40",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#B44A4E 0%,#8F3839 100%)",
                          boxShadow: "0px 1px 3px 0px #B44A4E40",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#B44A4E 0%,#8F3839 100%)",
                          boxShadow: "0px 1px 3px 0px #B44A4E40",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#B44A4E 0%,#8F3839 100%)",
                          boxShadow: "0px 1px 3px 0px #B44A4E40",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#884253 0%,#5C2E39 100%)",
                          boxShadow: "0px 1px 3px 0px #FC89C430",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#884253 0%,#5C2E39 100%)",
                          boxShadow: "0px 1px 3px 0px #FC89C430",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(180deg,#884253 0%,#5C2E39 100%)",
                          boxShadow: "0px 1px 3px 0px #FC89C430",
                          opacity: "1",
                          transition: "opacity 0.1s ease",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(rgb(136,66,83) 0%,rgb(92,46,57) 100%)",
                          boxShadow: "rgba(252,137,196,0.19) 0px 1px 3px 0px",
                          opacity: "0.5",
                          transition: "opacity 0.1s",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(rgb(136,66,83) 0%,rgb(92,46,57) 100%)",
                          boxShadow: "rgba(252,137,196,0.19) 0px 1px 3px 0px",
                          opacity: "0.5",
                          transition: "opacity 0.1s",
                        }}
                      ></div>
                      <div
                        className="speed-module__n6KH4W__verticalBar"
                        style={{
                          background:
                            "linear-gradient(rgb(136,66,83) 0%,rgb(92,46,57) 100%)",
                          boxShadow: "rgba(252,137,196,0.19) 0px 1px 3px 0px",
                          opacity: "0.5",
                          transition: "opacity 0.1s",
                        }}
                      ></div>
                    </div>
                    <div>
                      <div className="speed-module__n6KH4W__barsButtonsWrapper">
                        <div className="speed-module__n6KH4W__barsButtonLiner"></div>
                        <div className="speed-module__n6KH4W__barsButton">
                          <p className="speed-module__n6KH4W__barsButtonText">
                            1
                          </p>
                        </div>
                        <div className="speed-module__n6KH4W__barsButton">
                          <p className="speed-module__n6KH4W__barsButtonText">
                            2
                          </p>
                        </div>
                        <div className="speed-module__n6KH4W__barsButton">
                          <p className="speed-module__n6KH4W__barsButtonText">
                            3
                          </p>
                        </div>
                        <div className="speed-module__n6KH4W__barsButton">
                          <p className="speed-module__n6KH4W__barsButtonText">
                            4
                          </p>
                        </div>
                        <div className="speed-module__n6KH4W__barsButton">
                          <p className="speed-module__n6KH4W__barsButtonText">
                            5
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="speed-module__n6KH4W__barStats">
                      <div className="speed-module__n6KH4W__barLeftSideStats">
                        <p className="speed-module__n6KH4W__barStatsLeftSideText">
                          187{" "}
                        </p>
                        <p className="speed-module__n6KH4W__barStatsLeftSideTextAlt">
                          S/H
                        </p>
                      </div>
                      <div className="speed-module__n6KH4W__barRightSideStats">
                        <div className="speed-module__n6KH4W__barRightSideStat">
                          <p className="speed-module__n6KH4W__barRightSideStatTop">
                            TRADES
                          </p>
                          <p className="speed-module__n6KH4W__barRightSideStatBottom">
                            12
                          </p>
                        </div>
                        <div className="speed-module__n6KH4W__barRightSideStat">
                          <p className="speed-module__n6KH4W__barRightSideStatTop">
                            PROFITS
                          </p>
                          <p className="speed-module__n6KH4W__barRightSideStatBottom">
                            400
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="speed-module__n6KH4W__cardDivideLiner"></div>
                    <p className="speed-module__n6KH4W__signalLabel">
                      S: SIGNALS
                    </p>
                    <div className="speed-module__n6KH4W__cardFooter">
                      <div className="speed-module__n6KH4W__activeSignals">
                        <div className="speed-module__n6KH4W__activeSignalsIndicator">
                          <p className="speed-module__n6KH4W__activeSignalsButtonText">
                            20
                          </p>
                        </div>
                        <p className="speed-module__n6KH4W__activeSignalsLabel">
                          ACTIVE SIGNALS
                        </p>
                      </div>
                      <div className="speed-module__n6KH4W__signalStrength">
                        <p className="speed-module__n6KH4W__signalStrengthLabel">
                          STRENGTH
                        </p>
                        <div className="speed-module__n6KH4W__signalStrengthBarsWrapper">
                          <div
                            className="speed-module__n6KH4W__signalStrengthBar"
                            style={{
                              border: "1px solid transparent",
                              background:
                                "linear-gradient(180deg,#85F09B 0%,#1BBC94 100%)",
                            }}
                          ></div>
                          <div
                            className="speed-module__n6KH4W__signalStrengthBar"
                            style={{
                              border: "1px solid transparent",
                              background:
                                "linear-gradient(180deg,#85F09B 0%,#1BBC94 100%)",
                            }}
                          ></div>
                          <div
                            className="speed-module__n6KH4W__signalStrengthBar"
                            style={{
                              border: "1px solid transparent",
                              background:
                                "linear-gradient(180deg,#85F09B 0%,#1BBC94 100%)",
                            }}
                          ></div>
                          <div
                            className="speed-module__n6KH4W__signalStrengthBar"
                            style={{
                              border: "1px solid #54D797",
                              background: "transparent",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="one-module__oOI5iq__mainBlockDivider">
              <svg
                viewBox="0 0 1 550"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="550"
                  className="one-module__oOI5iq__rotatingBorderStroke"
                />
              </svg>
            </div>
            <div className="main-module__R0_zcG__mainFeatureBlock">
              <div className="main-module__R0_zcG__mainFeatureBlockWrapper">
                <div className="main-module__R0_zcG__mainFeatureBlockTitleWrapper">
                  <p className="main-module__R0_zcG__mainFeatureBlockTitle">
                    Up to 50x leverage
                  </p>
                </div>
                <p className="main-module__R0_zcG__mainFeatureBlockDesc">
                  Fine-tune exposure with responsive controls and clear risk
                  boundaries.
                </p>
              </div>
              <div
                className="main-module__R0_zcG__mainFeatureBlockCard"
                style={{
                  transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                  transition: "transform 0.1s ease-out",
                }}
              >
                <div
                  className="one-module__oOI5iq__mainBlockFeatureCard"
                  style={{ position: "relative" }}
                >
                  <div className="leverage-module__mLPE1q__leverageContainer">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 354 261"
                      className="leverage-module__mLPE1q__image"
                    >
                      <path
                        fill="#fff"
                        d="M1.959 161v-8.727h1.317v7.593H7.23V161zm9.442.132q-.967 0-1.666-.413a2.8 2.8 0 0 1-1.074-1.172q-.375-.759-.375-1.777 0-1.006.375-1.773.38-.766 1.057-1.197.682-.43 1.594-.431.554 0 1.073.184.52.183.934.575.412.392.652 1.018.238.622.238 1.513v.452H9.006v-.955h3.955q0-.503-.205-.89a1.54 1.54 0 0 0-.575-.618 1.6 1.6 0 0 0-.861-.226q-.537 0-.937.264a1.8 1.8 0 0 0-.614.682 2 2 0 0 0-.213.908v.745q0 .657.23 1.117.234.46.652.703.417.239.976.239.361 0 .66-.103.3-.107.516-.315.218-.209.332-.516l1.206.218q-.145.532-.52.933-.37.396-.933.618a3.5 3.5 0 0 1-1.274.217m9.584-6.677L18.61 161h-1.363l-2.378-6.545h1.368l1.657 5.036h.069l1.653-5.036zm3.746 6.677q-.967 0-1.667-.413a2.8 2.8 0 0 1-1.073-1.172q-.375-.759-.375-1.777 0-1.006.375-1.773.38-.766 1.056-1.197.682-.43 1.594-.431.555 0 1.074.184.52.183.933.575t.652 1.018q.24.622.239 1.513v.452h-5.203v-.955h3.954q0-.503-.204-.89a1.54 1.54 0 0 0-.575-.618 1.6 1.6 0 0 0-.861-.226q-.537 0-.938.264a1.8 1.8 0 0 0-.613.682 2 2 0 0 0-.213.908v.745q0 .657.23 1.117.234.46.652.703.417.239.976.239.36 0 .66-.103.298-.107.516-.315.216-.209.332-.516l1.206.218q-.145.532-.52.933-.37.396-.933.618a3.5 3.5 0 0 1-1.274.217m4.172-.132v-6.545h1.231v1.039h.068q.18-.528.631-.831a1.8 1.8 0 0 1 1.031-.306q.27 0 .482.063.213.064.375.175l-.41 1.066a1.3 1.3 0 0 0-.26-.09 1.3 1.3 0 0 0-.332-.038q-.443 0-.792.191-.346.188-.55.52-.2.333-.2.759V161zm6.923.128q-.793 0-1.414-.405-.618-.41-.972-1.163-.35-.76-.35-1.82t.354-1.815q.359-.755.98-1.155a2.55 2.55 0 0 1 1.41-.401q.61 0 .981.205.375.2.58.469.209.268.323.473h.077v-1.061h1.274V161h-1.244v-1.018h-.107a3.4 3.4 0 0 1-.332.477 1.9 1.9 0 0 1-.588.469q-.375.2-.972.2m.282-1.087q.55 0 .929-.29.382-.294.58-.813.2-.52.2-1.211 0-.681-.197-1.193a1.76 1.76 0 0 0-.575-.797q-.38-.285-.937-.285-.575 0-.96.298-.383.298-.579.814a3.3 3.3 0 0 0-.192 1.163q0 .656.197 1.181.195.523.58.831.387.302.954.302m7.474 3.55q-.78 0-1.342-.205a2.6 2.6 0 0 1-.912-.541 2.3 2.3 0 0 1-.529-.737l1.096-.452q.115.187.306.397a1.6 1.6 0 0 0 .529.362q.337.149.865.149.724 0 1.197-.354.474-.35.473-1.116v-1.287h-.08a3 3 0 0 1-.333.464 1.8 1.8 0 0 1-.588.443q-.375.188-.976.188-.775 0-1.398-.362-.617-.367-.98-1.078-.357-.716-.358-1.76 0-1.044.354-1.79.358-.746.98-1.142a2.55 2.55 0 0 1 1.41-.401q.61 0 .985.205.375.2.584.469.213.268.328.473h.094v-1.061h1.248v6.69q0 .843-.392 1.385a2.3 2.3 0 0 1-1.06.801q-.666.26-1.5.26m-.013-3.746q.55 0 .93-.256.383-.26.579-.741.2-.486.2-1.163 0-.66-.196-1.164a1.73 1.73 0 0 0-.575-.784q-.38-.285-.938-.285-.575 0-.959.298a1.8 1.8 0 0 0-.579.801 3.2 3.2 0 0 0-.192 1.134q0 .643.196 1.129t.58.758q.387.273.954.273m7.446 1.287q-.967 0-1.666-.413a2.8 2.8 0 0 1-1.074-1.172q-.375-.759-.375-1.777 0-1.006.375-1.773.38-.766 1.057-1.197.681-.43 1.594-.431.554 0 1.073.184.52.183.934.575.413.392.652 1.018.238.622.238 1.513v.452H48.62v-.955h3.955q0-.503-.205-.89a1.54 1.54 0 0 0-.575-.618 1.6 1.6 0 0 0-.86-.226q-.538 0-.938.264a1.8 1.8 0 0 0-.614.682 2 2 0 0 0-.213.908v.745q0 .657.23 1.117.235.46.652.703.418.239.976.239.362 0 .66-.103.3-.107.516-.315.218-.209.332-.516l1.206.218q-.144.532-.52.933-.37.396-.933.618a3.5 3.5 0 0 1-1.274.217"
                        opacity="0.5"
                      ></path>
                      <path
                        fill="#fb4780"
                        d="M1 173.5h1v13H1zm3.318 2.5h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zM74 173.5h1v13h-1zm3.318 2.5h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1z"
                      ></path>
                      <rect
                        width="6"
                        height="18"
                        x="143.682"
                        y="171"
                        fill="#fb4780"
                        rx="1"
                      />
                      <path
                        fill="#fff"
                        fillOpacity="0.095"
                        d="M152 176h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318-2.5h1v13h-1zm3.318 2.5h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.318 0h1v8h-1zm3.319 0h1v8h-1zm3.318-2.5h1v13h-1z"
                      ></path>
                      <path
                        fill="#fff"
                        fillOpacity="0.025"
                        d="M312 178a8 8 0 0 1 8-8h26a8 8 0 0 1 8 8v26a8 8 0 0 1-8 8h-26a8 8 0 0 1-8-8z"
                      ></path>
                      <path
                        fill="#fff"
                        d="M321.479 196v-1.114l3.446-3.569q.552-.582.91-1.019.362-.442.541-.841.18-.397.179-.845 0-.507-.238-.875a1.56 1.56 0 0 0-.652-.572 2.1 2.1 0 0 0-.929-.203q-.547 0-.955.223-.407.224-.626.632t-.219.954h-1.467q0-.929.428-1.625a2.9 2.9 0 0 1 1.173-1.079q.746-.388 1.696-.388.959 0 1.69.383.735.377 1.148 1.034.413.652.413 1.471 0 .567-.214 1.109-.209.542-.731 1.208-.522.661-1.451 1.606l-2.024 2.118v.075h4.584V196zm11.897.139q-.934 0-1.68-.358a3.05 3.05 0 0 1-1.184-.994 2.64 2.64 0 0 1-.472-1.442h1.492q.054.656.581 1.079.528.423 1.263.423.587 0 1.039-.269.458-.273.716-.751a2.2 2.2 0 0 0 .264-1.088q0-.622-.269-1.109a2 2 0 0 0-.741-.766 2.1 2.1 0 0 0-1.073-.283q-.464 0-.93.159a2.15 2.15 0 0 0-.756.418l-1.407-.209.572-5.131h5.598v1.318h-4.32l-.324 2.848h.06q.298-.288.791-.482a2.9 2.9 0 0 1 1.064-.194 3.12 3.12 0 0 1 2.803 1.651q.423.76.418 1.75.005.989-.447 1.765a3.25 3.25 0 0 1-1.243 1.223q-.79.442-1.815.442m6.464-7.775 1.686 2.973 1.7-2.973h1.626l-2.382 3.818 2.401 3.818h-1.625l-1.72-2.854L339.81 196h-1.63l2.376-3.818-2.347-3.818z"
                      ></path>
                      <path
                        fill="#fff"
                        d="M1.84 203v-.955l2.953-3.059q.473-.5.78-.874.31-.38.464-.72.153-.341.153-.724 0-.435-.204-.75a1.33 1.33 0 0 0-.558-.49 1.8 1.8 0 0 0-.797-.175q-.47 0-.819.192a1.3 1.3 0 0 0-.536.541 1.7 1.7 0 0 0-.188.818H1.831q0-.797.366-1.393a2.5 2.5 0 0 1 1.006-.925q.639-.333 1.453-.333.823 0 1.45.329.63.323.983.886.354.558.354 1.261 0 .486-.183.951-.18.463-.626 1.035-.448.567-1.245 1.376l-1.734 1.816v.064h3.929V203zm8.332-6.545 1.444 2.548 1.458-2.548h1.393l-2.041 3.272L14.484 203h-1.393l-1.475-2.446-1.47 2.446H8.748l2.037-3.273-2.011-3.272zm56.236-2.182V203h-1.321v-6.95h-.073q-.068.127-.315.277-.242.149-.627.26-.379.11-.877.11v-1.082q.48 0 .84-.17t.613-.409q.25-.243.383-.456a1.2 1.2 0 0 0 .15-.307zm5.346 8.872q-1.01-.005-1.726-.533-.717-.528-1.095-1.538-.38-1.01-.38-2.433 0-1.42.38-2.425.383-1.006 1.099-1.534.72-.529 1.722-.529 1.001 0 1.717.533.716.529 1.095 1.534.384 1.002.384 2.421 0 1.427-.38 2.437-.378 1.006-1.095 1.538-.715.53-1.721.529m0-1.138q.885 0 1.385-.865.502-.865.502-2.501 0-1.087-.23-1.837-.225-.755-.652-1.142a1.43 1.43 0 0 0-1.005-.392q-.882 0-1.385.869-.503.87-.507 2.502 0 1.09.225 1.845.23.75.652 1.138.423.383 1.015.383m5.68-5.552 1.445 2.548 1.457-2.548h1.394l-2.042 3.272L81.747 203h-1.394l-1.474-2.446-1.47 2.446H76.01l2.037-3.273-2.012-3.272z"
                        opacity="0.5"
                      ></path>
                      <path
                        fill="#fff"
                        d="M130.839 203v-.955l2.954-3.059q.473-.5.779-.874.312-.38.465-.72.153-.341.153-.724 0-.435-.204-.75a1.34 1.34 0 0 0-.558-.49 1.8 1.8 0 0 0-.797-.175q-.47 0-.819.192a1.3 1.3 0 0 0-.536.541 1.7 1.7 0 0 0-.188.818h-1.257q0-.797.366-1.393.367-.597 1.006-.925a3.1 3.1 0 0 1 1.453-.333q.824 0 1.449.329.631.323.984.886.354.558.354 1.261 0 .486-.183.951-.179.463-.626 1.035-.448.567-1.245 1.376l-1.734 1.816v.064h3.929V203zm10.191.119a3.3 3.3 0 0 1-1.441-.307 2.6 2.6 0 0 1-1.014-.852 2.25 2.25 0 0 1-.405-1.236h1.279q.047.563.498.925.452.363 1.083.362.503 0 .89-.23.393-.234.614-.643.226-.41.226-.933 0-.533-.23-.951a1.7 1.7 0 0 0-.635-.656 1.8 1.8 0 0 0-.921-.243q-.396 0-.797.136a1.9 1.9 0 0 0-.647.358l-1.206-.179.49-4.397h4.798v1.129h-3.703l-.277 2.442h.051q.255-.247.678-.414.426-.166.911-.166a2.68 2.68 0 0 1 2.404 1.415q.362.653.358 1.5a2.9 2.9 0 0 1-.384 1.513 2.8 2.8 0 0 1-1.065 1.048q-.678.38-1.555.379m5.533-6.664 1.445 2.548 1.457-2.548h1.393l-2.041 3.272 2.058 3.273h-1.393l-1.474-2.446-1.471 2.446h-1.397l2.037-3.273-2.012-3.272z"
                      ></path>
                      <path
                        fill="#fff"
                        d="M203.22 203.119a3.3 3.3 0 0 1-1.44-.307 2.6 2.6 0 0 1-1.014-.852 2.25 2.25 0 0 1-.405-1.236h1.278q.047.563.499.925t1.082.362q.502 0 .891-.23.392-.234.613-.643.226-.41.226-.933 0-.533-.23-.951a1.7 1.7 0 0 0-.635-.656 1.8 1.8 0 0 0-.92-.243q-.396 0-.797.136a1.9 1.9 0 0 0-.648.358l-1.206-.179.49-4.397h4.799v1.129h-3.704l-.277 2.442h.052a2 2 0 0 1 .677-.414q.426-.166.912-.166a2.7 2.7 0 0 1 1.419.379q.627.38.984 1.036.363.653.358 1.5a2.9 2.9 0 0 1-.383 1.513 2.8 2.8 0 0 1-1.065 1.048q-.678.38-1.556.379m7.549.026q-1.01-.005-1.726-.533t-1.095-1.538q-.38-1.01-.379-2.433 0-1.42.379-2.425.384-1.006 1.1-1.534.72-.529 1.721-.529t1.718.533q.716.529 1.095 1.534.383 1.002.383 2.421 0 1.427-.379 2.437-.38 1.006-1.095 1.538-.715.53-1.722.529m0-1.138q.887 0 1.385-.865.503-.865.503-2.501 0-1.087-.23-1.837-.226-.755-.652-1.142a1.43 1.43 0 0 0-1.006-.392q-.882 0-1.385.869-.502.87-.507 2.502 0 1.09.226 1.845.23.75.652 1.138.421.383 1.014.383m5.681-5.552 1.444 2.548 1.458-2.548h1.393l-2.041 3.272 2.058 3.273h-1.393l-1.475-2.446-1.47 2.446h-1.398l2.037-3.273-2.011-3.272zM269.839 203v-.955l2.954-3.059q.473-.5.779-.874.312-.38.465-.72.153-.341.153-.724 0-.435-.204-.75a1.34 1.34 0 0 0-.558-.49 1.8 1.8 0 0 0-.797-.175q-.47 0-.819.192a1.3 1.3 0 0 0-.536.541 1.7 1.7 0 0 0-.188.818h-1.257q0-.797.366-1.393.367-.597 1.006-.925a3.1 3.1 0 0 1 1.453-.333q.824 0 1.449.329.632.323.984.886.354.558.354 1.261 0 .486-.183.951-.179.463-.626 1.035-.448.567-1.245 1.376l-1.734 1.816v.064h3.929V203zm10.191.119a3.3 3.3 0 0 1-1.441-.307 2.6 2.6 0 0 1-1.014-.852 2.25 2.25 0 0 1-.405-1.236h1.279q.046.563.498.925t1.083.362q.503 0 .89-.23.392-.234.614-.643.226-.41.226-.933 0-.533-.23-.951a1.7 1.7 0 0 0-.635-.656 1.8 1.8 0 0 0-.921-.243q-.396 0-.797.136a1.9 1.9 0 0 0-.647.358l-1.206-.179.49-4.397h4.798v1.129h-3.703l-.277 2.442h.051q.255-.247.678-.414.426-.166.911-.166a2.68 2.68 0 0 1 2.404 1.415q.362.653.358 1.5a2.9 2.9 0 0 1-.384 1.513 2.8 2.8 0 0 1-1.065 1.048q-.678.38-1.555.379m7.549.026q-1.01-.005-1.726-.533-.717-.528-1.095-1.538-.38-1.01-.38-2.433 0-1.42.38-2.425.383-1.006 1.099-1.534.72-.529 1.722-.529 1.001 0 1.717.533.715.529 1.095 1.534.384 1.002.384 2.421 0 1.427-.38 2.437-.379 1.006-1.095 1.538-.716.53-1.721.529m0-1.138q.886 0 1.385-.865.502-.865.502-2.501 0-1.087-.23-1.837-.226-.755-.652-1.142a1.43 1.43 0 0 0-1.005-.392q-.882 0-1.385.869-.504.87-.507 2.502 0 1.09.225 1.845.23.75.652 1.138.423.383 1.015.383m5.68-5.552 1.445 2.548 1.457-2.548h1.394l-2.042 3.272 2.059 3.273h-1.394l-1.474-2.446-1.47 2.446h-1.398l2.037-3.273-2.012-3.272z"
                        opacity="0.5"
                      ></path>
                      <rect
                        width="16"
                        height="16"
                        x="1"
                        y="242"
                        fill="#fff"
                        fillOpacity="0.025"
                        rx="4"
                      />
                      <rect
                        width="15"
                        height="15"
                        x="1.5"
                        y="242.5"
                        stroke="#fff"
                        strokeOpacity="0.095"
                        rx="3.5"
                      />
                      <path
                        fill="#fff"
                        d="M25.528 246.406v-1.133h6.755v1.133H29.56V254h-1.313v-7.594zM33.725 254v-8.727h3.111q1.019 0 1.688.37.669.372 1 1.015.333.639.333 1.44 0 .805-.336 1.449a2.44 2.44 0 0 1-1.006 1.014q-.669.37-1.683.371h-2.14v-1.117h2.02q.644 0 1.044-.221.4-.226.588-.614.188-.387.188-.882t-.187-.878a1.34 1.34 0 0 0-.593-.601q-.401-.217-1.057-.217h-1.653V254zm10.848-9.136-2.813 10.448h-1.138l2.813-10.448zm5.894 2.701a1.24 1.24 0 0 0-.562-.937q-.495-.337-1.245-.337-.537 0-.929.171-.392.166-.609.46a1.1 1.1 0 0 0-.213.66.97.97 0 0 0 .145.537q.149.226.388.38.243.149.52.251.276.097.532.162l.852.222q.418.102.857.277.44.174.814.46.375.285.605.707.234.422.234 1.01 0 .741-.383 1.317-.379.575-1.104.907-.72.333-1.743.333-.98 0-1.696-.311-.715-.312-1.12-.882-.406-.575-.448-1.364h1.321q.039.473.307.788.273.312.694.465.427.149.934.149.558 0 .993-.175.438-.179.69-.494.252-.32.251-.746a.92.92 0 0 0-.221-.635 1.65 1.65 0 0 0-.593-.409 6 6 0 0 0-.839-.285l-1.031-.282q-1.05-.285-1.662-.839-.61-.554-.61-1.466 0-.754.41-1.317a2.7 2.7 0 0 1 1.108-.873q.698-.316 1.576-.316.886 0 1.564.311.682.311 1.074.857.392.542.41 1.244zM53.38 254v-8.727h1.317v7.593h3.954V254zm9.419-7.594v-1.133h6.754v1.133H66.83V254h-1.312v-7.594zM70.214 254v-6.545h1.231v1.039h.068q.18-.528.631-.831a1.8 1.8 0 0 1 1.031-.306 5 5 0 0 1 .541.029v1.219a2 2 0 0 0-.272-.047q-.197-.03-.392-.03-.453 0-.806.192a1.43 1.43 0 0 0-.758 1.283V254zm4.555 0v-6.545h1.274V254zm.643-7.555a.8.8 0 0 1-.57-.222.72.72 0 0 1-.235-.537q0-.315.234-.537.24-.226.572-.226a.8.8 0 0 1 .566.226q.24.222.239.537 0 .31-.239.537a.8.8 0 0 1-.567.222m5.04 10.146q-.78 0-1.343-.205a2.6 2.6 0 0 1-.912-.541 2.3 2.3 0 0 1-.528-.737l1.095-.452q.116.187.307.397a1.6 1.6 0 0 0 .528.362q.337.149.865.149.725 0 1.198-.354.473-.35.473-1.116v-1.287h-.081a3 3 0 0 1-.332.464 1.8 1.8 0 0 1-.588.443q-.375.188-.976.188a2.73 2.73 0 0 1-1.398-.362q-.618-.367-.98-1.078-.358-.716-.358-1.76t.353-1.79q.36-.746.98-1.142a2.55 2.55 0 0 1 1.411-.401q.609 0 .984.205.375.2.584.469.213.268.328.473h.094v-1.061h1.249v6.69q0 .843-.392 1.385a2.3 2.3 0 0 1-1.061.801q-.666.26-1.5.26m-.013-3.746q.55 0 .929-.256a1.6 1.6 0 0 0 .58-.741q.2-.486.2-1.163 0-.66-.196-1.164a1.73 1.73 0 0 0-.576-.784q-.379-.285-.937-.285-.576 0-.959.298a1.8 1.8 0 0 0-.58.801 3.2 3.2 0 0 0-.191 1.134q0 .643.196 1.129.195.486.58.758.387.273.954.273m7.369 3.746q-.78 0-1.342-.205a2.6 2.6 0 0 1-.912-.541 2.3 2.3 0 0 1-.529-.737l1.095-.452q.116.187.307.397a1.6 1.6 0 0 0 .529.362q.336.149.865.149.725 0 1.197-.354.473-.35.473-1.116v-1.287h-.08a3 3 0 0 1-.333.464 1.8 1.8 0 0 1-.588.443q-.375.188-.976.188-.775 0-1.398-.362-.618-.367-.98-1.078-.358-.716-.358-1.76t.354-1.79q.357-.746.98-1.142a2.55 2.55 0 0 1 1.41-.401q.61 0 .985.205.374.2.584.469.213.268.328.473h.093v-1.061h1.249v6.69q0 .843-.392 1.385a2.3 2.3 0 0 1-1.061.801q-.665.26-1.5.26m-.013-3.746q.55 0 .93-.256a1.6 1.6 0 0 0 .579-.741q.2-.486.2-1.163 0-.66-.196-1.164a1.73 1.73 0 0 0-.575-.784q-.38-.285-.938-.285-.575 0-.959.298a1.8 1.8 0 0 0-.58.801 3.2 3.2 0 0 0-.191 1.134q0 .643.196 1.129t.58.758q.387.273.954.273m7.446 1.287q-.967 0-1.666-.413a2.8 2.8 0 0 1-1.074-1.172q-.375-.759-.375-1.777 0-1.006.375-1.773.38-.766 1.057-1.197.681-.43 1.593-.431.555 0 1.074.184.52.183.933.575t.652 1.018q.24.622.24 1.513v.452h-5.204v-.955H96.8q0-.503-.204-.89a1.54 1.54 0 0 0-.575-.618 1.6 1.6 0 0 0-.861-.226q-.537 0-.938.264a1.8 1.8 0 0 0-.613.682 2 2 0 0 0-.213.908v.745q0 .657.23 1.117.234.46.652.703.417.239.976.239.362 0 .66-.103.298-.106.516-.315.217-.209.332-.516l1.206.218q-.145.532-.52.933-.37.396-.933.618a3.5 3.5 0 0 1-1.274.217m4.172-.132v-6.545h1.231v1.039h.069q.178-.528.63-.831a1.8 1.8 0 0 1 1.031-.306 5 5 0 0 1 .542.029v1.219a2 2 0 0 0-.273-.047 3 3 0 0 0-.392-.03q-.452 0-.806.192-.348.188-.554.524a1.4 1.4 0 0 0-.204.759V254zm9.46-4.947-1.155.204a1.4 1.4 0 0 0-.23-.422 1.14 1.14 0 0 0-.417-.328 1.5 1.5 0 0 0-.661-.128q-.542 0-.903.243-.363.238-.363.618a.65.65 0 0 0 .243.528q.244.2.784.329l1.04.238q.903.209 1.347.644.443.434.443 1.129 0 .588-.341 1.048-.336.456-.942.716-.6.26-1.393.26-1.1 0-1.794-.469-.694-.472-.853-1.342l1.232-.187q.115.481.473.728.359.243.933.243.627 0 1.002-.26.375-.264.375-.643a.67.67 0 0 0-.23-.516q-.227-.209-.695-.315l-1.108-.243q-.916-.209-1.355-.665-.435-.456-.435-1.155 0-.579.324-1.014t.895-.678a3.3 3.3 0 0 1 1.308-.247q1.061 0 1.671.461.609.456.805 1.223"
                      ></path>
                      <rect
                        width="67"
                        height="21"
                        x="286.5"
                        y="239.5"
                        fill="#fff"
                        fillOpacity="0.025"
                        rx="10.5"
                      />
                      <rect
                        width="67"
                        height="21"
                        x="286.5"
                        y="239.5"
                        stroke="url(#leverage-5_svg__a)"
                        rx="10.5"
                      />
                      <path
                        fill="#fff"
                        d="M298.766 248.638a1.04 1.04 0 0 0-.469-.781q-.412-.28-1.037-.281-.447 0-.774.142-.327.138-.508.384a.9.9 0 0 0-.178.55q0 .26.121.447.125.189.323.316.203.124.434.21.23.081.443.135l.711.185q.348.084.713.23.366.146.679.384.312.238.504.589.195.352.195.842 0 .618-.319 1.097-.317.48-.92.757-.6.276-1.452.277-.817 0-1.414-.259a2.17 2.17 0 0 1-.934-.736 2.13 2.13 0 0 1-.373-1.136h1.101q.033.394.256.657.227.26.579.387.355.124.777.124.466 0 .828-.145.365-.15.575-.412a.98.98 0 0 0 .21-.622.77.77 0 0 0-.185-.529 1.4 1.4 0 0 0-.494-.341 5 5 0 0 0-.699-.238l-.86-.234q-.873-.238-1.385-.699-.507-.462-.507-1.222 0-.629.341-1.097.34-.47.923-.728a3.15 3.15 0 0 1 1.314-.263q.739 0 1.303.259.568.26.895.714.327.451.341 1.037zm4.684 5.472q-.806 0-1.388-.344a2.33 2.33 0 0 1-.895-.977q-.313-.632-.313-1.481 0-.838.313-1.477.315-.64.88-.998.568-.359 1.329-.359.461 0 .894.153.434.153.778.48t.544.848q.198.519.198 1.261v.376h-4.336v-.795h3.296q0-.419-.171-.742a1.3 1.3 0 0 0-.479-.515 1.34 1.34 0 0 0-.717-.188q-.448 0-.782.22a1.5 1.5 0 0 0-.511.568 1.64 1.64 0 0 0-.177.756v.622q0 .546.191.93.196.384.544.586.348.2.813.199.302 0 .55-.085.249-.089.43-.263t.277-.43l1.005.181a1.8 1.8 0 0 1-.433.778q-.31.33-.778.515-.465.181-1.062.181m6.015-5.565v.853h-2.98v-.853zm-2.181-1.306h1.062v5.159q0 .309.092.466a.5.5 0 0 0 .238.209q.15.054.323.053.129 0 .224-.017l.149-.029.192.877a1.6 1.6 0 0 1-.263.071 2 2 0 0 1-.426.043 1.9 1.9 0 0 1-.781-.149 1.33 1.33 0 0 1-.586-.483q-.224-.327-.224-.82zm7.084 6.761-1.605-5.455h1.097l1.069 4.006h.054l1.072-4.006h1.097l1.066 3.988h.053l1.062-3.988h1.097L318.828 254h-1.083l-1.108-3.938h-.081L315.448 254zm7.02 0v-5.455h1.061V254zm.536-6.296a.68.68 0 0 1-.476-.185.6.6 0 0 1-.195-.447q0-.263.195-.448a.67.67 0 0 1 .476-.188q.277 0 .472.188a.6.6 0 0 1 .199.448.6.6 0 0 1-.199.447.66.66 0 0 1-.472.185m4.45.841v.853h-2.979v-.853zm-2.18-1.306h1.061v5.159q0 .309.093.466a.5.5 0 0 0 .238.209 1 1 0 0 0 .323.053q.128 0 .224-.017l.149-.029.191.877a2 2 0 0 1-.262.071 2 2 0 0 1-.426.043 1.9 1.9 0 0 1-.782-.149 1.34 1.34 0 0 1-.586-.483q-.223-.327-.223-.82zm4.484 3.522V254h-1.062v-7.273h1.047v2.706h.068q.192-.44.586-.699.394-.26 1.03-.26a2 2 0 0 1 .98.231q.422.231.653.689.234.454.234 1.137V254h-1.061v-3.342q0-.6-.309-.93-.31-.334-.86-.334-.377 0-.674.16a1.16 1.16 0 0 0-.466.469q-.166.305-.166.738m8.199 3.239h-1.164l2.617-7.273h1.268l2.617 7.273h-1.165l-2.056-5.952h-.057zm.196-2.848h3.778v.923h-3.778zm7.239-4.425V254h-1.097v-7.273z"
                        opacity="0.5"
                      ></path>
                      <path
                        fill="#fff"
                        d="M.528 7.406V6.273h6.755v1.133H4.56V15H3.247V7.406zM7.943 15V8.455h1.232v1.04h.068q.18-.53.63-.832a1.8 1.8 0 0 1 1.032-.306 5 5 0 0 1 .541.03v1.218a2 2 0 0 0-.273-.047q-.195-.03-.392-.03-.451 0-.805.192a1.43 1.43 0 0 0-.759 1.283V15zm6.772.128q-.793 0-1.415-.405-.618-.409-.972-1.163-.35-.76-.35-1.82t.354-1.815q.36-.755.98-1.155a2.55 2.55 0 0 1 1.411-.4q.61 0 .98.204.375.2.58.469.209.268.324.473h.076V8.455h1.274V15h-1.244v-1.018h-.106q-.116.209-.333.477a1.85 1.85 0 0 1-.588.469q-.375.2-.971.2m.28-1.087q.55 0 .93-.29.383-.294.58-.813.2-.52.2-1.21 0-.683-.196-1.194a1.75 1.75 0 0 0-.576-.797q-.378-.285-.937-.285-.575 0-.959.298t-.58.814a3.3 3.3 0 0 0-.191 1.163q0 .657.196 1.18.195.525.58.832.387.302.954.302m7.181 1.087q-.792 0-1.414-.405-.618-.409-.972-1.163-.35-.76-.35-1.82t.354-1.815q.359-.755.98-1.155.623-.4 1.41-.4.61 0 .981.204.375.2.58.469.209.268.323.473h.077V6.273h1.274V15h-1.244v-1.018h-.107q-.114.209-.332.477a1.85 1.85 0 0 1-.588.469q-.375.2-.972.2m.282-1.087q.55 0 .929-.29.382-.294.58-.813.2-.52.2-1.21 0-.683-.197-1.194a1.75 1.75 0 0 0-.575-.797q-.38-.285-.937-.285-.575 0-.96.298-.382.298-.579.814a3.3 3.3 0 0 0-.192 1.163q0 .657.197 1.18.195.525.58.832.387.302.954.302m7.55 1.091q-.967 0-1.665-.413a2.8 2.8 0 0 1-1.074-1.172q-.375-.759-.375-1.777 0-1.005.375-1.773.38-.766 1.057-1.197.681-.43 1.593-.43.555 0 1.074.183a2.6 2.6 0 0 1 .933.575q.414.391.652 1.018.24.623.239 1.513v.452h-5.203v-.955h3.954a1.9 1.9 0 0 0-.204-.89 1.55 1.55 0 0 0-.575-.618 1.6 1.6 0 0 0-.861-.226q-.537 0-.938.264-.396.26-.613.682a2 2 0 0 0-.213.908v.745q0 .657.23 1.117.234.46.652.703.417.239.976.239.361 0 .66-.103.298-.106.516-.315a1.4 1.4 0 0 0 .332-.516l1.206.218q-.145.533-.52.933a2.5 2.5 0 0 1-.933.618 3.5 3.5 0 0 1-1.274.217m9.749-.004q-.793 0-1.415-.405-.618-.409-.971-1.163-.35-.76-.35-1.82t.354-1.815q.357-.755.98-1.155.622-.4 1.41-.4.61 0 .98.204.376.2.58.469.21.268.324.473h.077V8.455H43V15h-1.245v-1.018h-.106q-.115.209-.333.477a1.85 1.85 0 0 1-.588.469q-.375.2-.971.2m.281-1.087q.55 0 .929-.29.384-.294.58-.813.2-.52.2-1.21 0-.683-.196-1.194a1.75 1.75 0 0 0-.575-.797q-.38-.285-.938-.285-.575 0-.959.298-.383.298-.58.814a3.3 3.3 0 0 0-.191 1.163q0 .657.196 1.18.195.525.58.832.387.302.954.302m4.73.959V8.455h1.223V9.52h.081q.205-.54.67-.844.464-.307 1.111-.307.657 0 1.1.307.447.307.66.844h.069q.234-.525.745-.835.512-.316 1.22-.316.89 0 1.452.559.567.558.567 1.683V15h-1.274v-4.27q0-.665-.362-.963a1.32 1.32 0 0 0-.865-.298q-.623 0-.968.383-.345.38-.345.976V15h-1.27v-4.35q0-.534-.332-.857-.333-.324-.865-.324-.363 0-.67.192-.301.188-.49.524a1.6 1.6 0 0 0-.183.78V15zm13.313.132q-.921 0-1.607-.422a2.85 2.85 0 0 1-1.065-1.18q-.38-.759-.38-1.773 0-1.019.38-1.781a2.84 2.84 0 0 1 1.065-1.185q.687-.422 1.607-.422t1.606.422a2.84 2.84 0 0 1 1.066 1.185q.378.762.379 1.781 0 1.014-.38 1.773-.378.759-1.065 1.18-.685.422-1.606.422m.004-1.07q.597 0 .989-.315.391-.315.58-.84a3.3 3.3 0 0 0 .191-1.154q0-.627-.192-1.15a1.87 1.87 0 0 0-.58-.849q-.39-.32-.988-.32-.6 0-.997.32a1.9 1.9 0 0 0-.584.848q-.187.525-.187 1.15 0 .631.187 1.156.192.524.584.84.396.315.997.315m8.565-1.776V8.455h1.279V15h-1.253v-1.133h-.068q-.225.524-.725.873-.495.345-1.231.345-.63 0-1.117-.277a1.95 1.95 0 0 1-.758-.83q-.273-.55-.273-1.36V8.455h1.274v4.01q0 .668.371 1.065.37.396.963.396.358 0 .712-.179a1.5 1.5 0 0 0 .592-.541q.24-.363.234-.92m4.215-1.172V15h-1.274V8.455h1.223V9.52h.08q.226-.52.708-.835.486-.316 1.223-.316.67 0 1.172.282.502.276.78.826.277.55.277 1.36V15H73.78v-4.01q0-.711-.37-1.112-.372-.405-1.02-.405-.443 0-.788.192a1.4 1.4 0 0 0-.54.562q-.198.367-.197.887m8.903-2.66v1.023h-3.575V8.455zm-2.616-1.568h1.274v6.192q0 .37.11.558.112.184.286.252.18.064.388.064.153 0 .268-.022l.18-.034.23 1.053a2.5 2.5 0 0 1-.827.136 2.2 2.2 0 0 1-.938-.179 1.6 1.6 0 0 1-.703-.58q-.268-.39-.268-.984z"
                        opacity="0.3"
                      ></path>
                      <g fill="#fff" opacity="0.3">
                        <path
                          fillOpacity="0.025"
                          d="M0 34a8 8 0 0 1 8-8h338a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8z"
                        ></path>
                        <path
                          d="M14.121 52.273V39.545h.816v12.728zm2.55-8.78a1.45 1.45 0 0 0-.655-1.094q-.578-.393-1.452-.393-.627 0-1.084.2-.458.192-.71.536a1.27 1.27 0 0 0-.25.77q0 .364.17.627.173.264.452.443.283.174.607.293.323.115.621.189l.994.258q.487.12 1 .324.511.204.95.536.436.334.705.826.274.492.274 1.178 0 .865-.448 1.536-.443.671-1.287 1.06-.84.387-2.034.387-1.144 0-1.978-.363-.836-.363-1.308-1.029-.473-.671-.522-1.59h1.541q.046.551.358.919.318.362.81.542.498.174 1.09.174.65 0 1.158-.204.512-.21.805-.577.293-.372.293-.87 0-.452-.258-.74a1.9 1.9 0 0 0-.691-.478 7 7 0 0 0-.98-.333l-1.203-.328q-1.222-.333-1.939-.98-.71-.645-.71-1.71 0-.879.477-1.536.477-.655 1.292-1.02.816-.366 1.84-.367 1.034 0 1.824.363.795.363 1.253 1 .457.63.477 1.45zm7.131-2.675V51h-1.541v-8.64h-.06l-2.436 1.59v-1.47l2.54-1.66zm4.07 8.79-.074.542q-.075.597-.254 1.243-.174.651-.363 1.208a33 33 0 0 1-.303.885h-1.054q.065-.309.179-.835.113-.522.224-1.169.109-.646.164-1.317l.05-.557zm5.205 1.561q-1.178-.005-2.013-.621-.835-.617-1.278-1.795-.442-1.179-.442-2.839 0-1.656.442-2.829.447-1.173 1.283-1.79.84-.615 2.008-.616 1.17 0 2.004.621.835.617 1.277 1.79.448 1.169.448 2.824 0 1.665-.442 2.844-.442 1.173-1.278 1.795-.836.615-2.009.616m0-1.327q1.034 0 1.616-1.01.587-1.008.587-2.918 0-1.268-.269-2.143-.263-.879-.76-1.332a1.67 1.67 0 0 0-1.174-.458q-1.029 0-1.615 1.015-.588 1.014-.592 2.918 0 1.273.263 2.153.27.875.761 1.327.492.448 1.183.448m8.987 1.327q-1.178-.005-2.013-.621-.835-.617-1.278-1.795-.442-1.179-.442-2.839 0-1.656.442-2.829.447-1.173 1.283-1.79.84-.615 2.008-.616 1.17 0 2.004.621.835.617 1.278 1.79.447 1.169.447 2.824 0 1.665-.442 2.844-.442 1.173-1.278 1.795-.835.615-2.009.616m0-1.327q1.035 0 1.616-1.01.587-1.008.587-2.918 0-1.268-.269-2.143-.263-.879-.76-1.332a1.66 1.66 0 0 0-1.174-.458q-1.029 0-1.615 1.015-.588 1.014-.592 2.918 0 1.273.264 2.153.268.875.76 1.327.492.448 1.183.448m8.987 1.327q-1.178-.005-2.013-.621-.835-.617-1.278-1.795-.442-1.179-.442-2.839 0-1.656.442-2.829.448-1.173 1.283-1.79.84-.615 2.008-.616 1.17 0 2.004.621.835.617 1.278 1.79.447 1.169.447 2.824 0 1.665-.442 2.844-.442 1.173-1.278 1.795-.835.615-2.009.616m0-1.327q1.035 0 1.616-1.01.587-1.008.587-2.918 0-1.268-.269-2.143-.263-.879-.76-1.332a1.66 1.66 0 0 0-1.174-.458q-1.029 0-1.615 1.015t-.592 2.918q0 1.273.264 2.153.268.875.76 1.327.492.448 1.183.448"
                          opacity="0.5"
                        ></path>
                      </g>
                      <g opacity="0.3">
                        <path
                          fill="#fff"
                          d="M.58 85.21v-.937h6.545v.937H4.381V93H3.324v-7.79zM7.89 93v-6.546h.972v.99h.068q.18-.487.647-.79a1.9 1.9 0 0 1 1.057-.302q.11 0 .277.004.166.005.252.013v1.023a3 3 0 0 0-.235-.038q-.178-.03-.379-.03-.477 0-.852.2a1.47 1.47 0 0 0-.801 1.334V93zm6.687.136a2.56 2.56 0 0 1-1.444-.413q-.627-.417-.98-1.176-.354-.763-.354-1.803 0-1.03.354-1.79.352-.758.984-1.171.63-.414 1.457-.414.64 0 1.01.213.375.21.571.478.2.263.311.434h.085v-1.04h1.006V93h-.971v-1.006h-.12q-.111.18-.315.452-.204.269-.584.482-.38.208-1.01.208m.137-.903q.605 0 1.022-.315.418-.32.635-.883.218-.566.218-1.308 0-.733-.213-1.282a1.87 1.87 0 0 0-.631-.861q-.418-.311-1.031-.311-.64 0-1.066.328-.422.324-.635.882-.208.555-.208 1.244 0 .7.213 1.27.216.567.639.904.426.332 1.057.332m7.266.903a2.56 2.56 0 0 1-1.444-.413q-.627-.417-.98-1.176-.354-.763-.354-1.803 0-1.03.354-1.79.352-.758.984-1.171.63-.414 1.457-.414.64 0 1.01.213.375.21.571.478.201.263.311.434h.086v-3.221h1.005V93h-.971v-1.006h-.12q-.11.18-.315.452-.203.269-.584.482-.38.208-1.01.208m.137-.903q.605 0 1.022-.315.418-.32.635-.883a3.6 3.6 0 0 0 .218-1.308q0-.733-.213-1.282a1.87 1.87 0 0 0-.631-.861q-.418-.311-1.031-.311-.64 0-1.066.328-.42.324-.635.882-.208.555-.208 1.244 0 .7.213 1.27.217.567.639.904.426.332 1.057.332m7.54.903q-.946 0-1.633-.417a2.8 2.8 0 0 1-1.053-1.176q-.366-.759-.366-1.765t.366-1.772a2.9 2.9 0 0 1 1.032-1.202q.665-.435 1.55-.435a3.1 3.1 0 0 1 1.01.17q.5.172.909.555.409.38.651 1.005.243.627.243 1.543v.426h-5.045v-.87h4.023q0-.552-.222-.988a1.67 1.67 0 0 0-.622-.686 1.74 1.74 0 0 0-.946-.251q-.6 0-1.04.298-.435.294-.669.767a2.25 2.25 0 0 0-.234 1.014v.58q0 .741.255 1.257.261.51.72.78a2.1 2.1 0 0 0 1.07.264q.396 0 .716-.11.324-.116.558-.342.235-.23.363-.57l.971.272q-.153.495-.516.87-.362.37-.894.579a3.3 3.3 0 0 1-1.198.204m8.009-8.863 2.59 7.346h.103l2.59-7.346h1.109L40.853 93h-1.09l-3.205-8.727zm9.427 8.863a2.56 2.56 0 0 1-1.445-.413q-.626-.417-.98-1.176-.354-.763-.354-1.803 0-1.03.354-1.79.354-.758.985-1.171.63-.414 1.457-.414.64 0 1.01.213.375.21.57.478.201.263.312.434h.085v-1.04h1.006V93h-.972v-1.006H49q-.11.18-.314.452-.205.269-.584.482-.38.208-1.01.208m.136-.903q.606 0 1.023-.315.417-.32.635-.883a3.6 3.6 0 0 0 .217-1.308q0-.733-.213-1.282a1.87 1.87 0 0 0-.63-.861q-.419-.311-1.032-.311-.639 0-1.065.328-.422.324-.635.882-.21.555-.209 1.244 0 .7.213 1.27.217.567.64.904.425.332 1.056.332m5.801-7.96V93h-1.006v-8.727zm5.917 6.05v-3.868h1.006V93h-1.006v-1.108h-.068a2.15 2.15 0 0 1-.716.848q-.486.345-1.227.345-.614 0-1.091-.268a1.9 1.9 0 0 1-.75-.818q-.273-.55-.273-1.385v-4.16h1.006v4.092q0 .715.4 1.141.405.427 1.032.427.375 0 .762-.192.392-.192.657-.588.267-.396.268-1.01m5.542 2.813q-.946 0-1.632-.417a2.8 2.8 0 0 1-1.053-1.176q-.366-.759-.366-1.765t.366-1.772a2.9 2.9 0 0 1 1.032-1.202q.665-.435 1.55-.435.512 0 1.01.17.5.172.908.555.41.38.652 1.005.243.627.243 1.543v.426h-5.045v-.87h4.023q0-.552-.222-.988a1.67 1.67 0 0 0-.622-.686 1.74 1.74 0 0 0-.946-.251q-.6 0-1.04.298-.435.294-.67.767a2.25 2.25 0 0 0-.233 1.014v.58q0 .741.255 1.257.261.51.72.78a2.1 2.1 0 0 0 1.07.264q.396 0 .716-.11.324-.116.558-.342.234-.23.362-.57l.972.272q-.153.495-.516.87-.362.37-.895.579a3.3 3.3 0 0 1-1.197.204"
                          opacity="0.5"
                        ></path>
                        <path
                          stroke="#fff"
                          strokeDasharray="1 2"
                          d="M97.5 88.5h150"
                          opacity="0.1"
                        ></path>
                        <path
                          fill="#fff"
                          d="M252.699 90.239q.009-.41.123-.848.115-.44.388-.976.273-.537.75-1.245l1.96-2.897h1.16l-2.302 3.358q.154-.052.316-.085.166-.035.332-.035.793 0 1.415.367.627.366.984 1.001.363.635.363 1.445t-.358 1.44q-.355.63-.976.993a2.74 2.74 0 0 1-1.411.362 2.73 2.73 0 0 1-1.423-.37 2.66 2.66 0 0 1-.976-1.023q-.354-.652-.345-1.487m1.006.068q0 .555.221.98.221.426.614.669.392.243.903.243t.904-.239q.392-.243.613-.664.222-.427.222-.972 0-.555-.222-.976a1.66 1.66 0 0 0-.613-.66 1.7 1.7 0 0 0-.904-.24 1.7 1.7 0 0 0-.903.24 1.63 1.63 0 0 0-.614.656 2 2 0 0 0-.221.963m8.886 2.812q-.963 0-1.641-.524-.678-.528-1.036-1.53-.357-1.005-.357-2.429 0-1.414.357-2.416.363-1.006 1.04-1.534.682-.533 1.637-.533.954 0 1.632.533.681.529 1.039 1.534.363 1.002.363 2.416 0 1.424-.358 2.43-.358 1-1.036 1.53-.677.523-1.64.523m0-.937q.954 0 1.483-.92.528-.921.528-2.626 0-1.133-.243-1.93-.238-.797-.69-1.215a1.53 1.53 0 0 0-1.078-.417q-.947 0-1.479.933-.533.93-.533 2.63 0 1.133.239 1.925.239.793.686 1.207.451.413 1.087.413m7.33.937q-.75 0-1.351-.298a2.5 2.5 0 0 1-.963-.818 2.24 2.24 0 0 1-.396-1.185h1.023q.06.593.537.98.481.384 1.15.384.537 0 .955-.252.421-.25.66-.69.243-.444.243-1.001 0-.571-.251-1.019a1.85 1.85 0 0 0-.682-.712 1.93 1.93 0 0 0-.993-.264 2.7 2.7 0 0 0-.822.124 2.3 2.3 0 0 0-.695.32l-.989-.12.529-4.295h4.534v.937h-3.648l-.307 2.574h.052a2.3 2.3 0 0 1 .673-.354q.405-.14.844-.14.801 0 1.427.383.631.38.989 1.04.362.66.362 1.509 0 .835-.375 1.491a2.74 2.74 0 0 1-1.023 1.031q-.651.375-1.483.375m4.797-.119 3.903-7.722v-.068h-4.5v-.937h5.591v.988L275.825 93zm5.782.068a.74.74 0 0 1-.541-.226.74.74 0 0 1-.226-.54q0-.317.226-.542a.74.74 0 0 1 .541-.226q.316 0 .541.226.226.225.226.541 0 .21-.106.384a.8.8 0 0 1-.277.28.73.73 0 0 1-.384.103m5.047.051q-.963 0-1.641-.524-.677-.528-1.035-1.53-.358-1.005-.358-2.429 0-1.414.358-2.416.362-1.006 1.04-1.534.681-.533 1.636-.533t1.632.533q.682.529 1.04 1.534.362 1.002.362 2.416 0 1.424-.358 2.43-.358 1-1.035 1.53-.678.523-1.641.523m0-.937q.954 0 1.483-.92.528-.921.528-2.626 0-1.133-.243-1.93-.238-.797-.69-1.215a1.52 1.52 0 0 0-1.078-.417q-.947 0-1.479.933-.532.93-.532 2.63 0 1.133.238 1.925.239.793.686 1.207.452.413 1.087.413m7.45.937q-.963 0-1.641-.524-.677-.528-1.035-1.53-.358-1.005-.358-2.429 0-1.414.358-2.416.362-1.006 1.04-1.534.682-.533 1.636-.533t1.632.533q.682.529 1.04 1.534.362 1.002.362 2.416 0 1.424-.358 2.43-.358 1-1.035 1.53-.678.523-1.641.523m0-.937q.954 0 1.483-.92.528-.921.528-2.626 0-1.133-.243-1.93-.239-.797-.69-1.215a1.52 1.52 0 0 0-1.078-.417q-.947 0-1.479.933-.532.93-.532 2.63 0 1.133.238 1.925.239.793.686 1.207.452.413 1.087.413m4.642.818 3.903-7.722v-.068h-4.5v-.937h5.591v.988L298.747 93zm5.578-1.79v-.87l3.494-6.067h1.04l-3.409 5.932v.068h5.182v.937zm4.108 1.79v-5.454h1.005V93zm4.018 0 3.904-7.722v-.068h-4.5v-.937h5.591v.988L312.451 93zm9.153.12q-.878 0-1.551-.312a2.54 2.54 0 0 1-1.044-.865q-.375-.555-.371-1.261a2.31 2.31 0 0 1 .822-1.811q.388-.32.865-.405v-.051a1.7 1.7 0 0 1-.997-.703 2.13 2.13 0 0 1-.366-1.24q-.005-.666.336-1.19.342-.523.938-.826.6-.303 1.368-.303.758 0 1.355.303.597.302.937.827.345.524.35 1.189a2.16 2.16 0 0 1-.379 1.24q-.372.54-.985.703v.05q.473.087.852.406.38.315.606.788.225.469.23 1.023a2.2 2.2 0 0 1-.384 1.261 2.54 2.54 0 0 1-1.044.865q-.665.311-1.538.311m0-.938q.593 0 1.022-.192t.665-.541q.234-.35.239-.818a1.57 1.57 0 0 0-.256-.874 1.73 1.73 0 0 0-.686-.597 2.15 2.15 0 0 0-.984-.217q-.558 0-.997.218-.435.216-.687.596a1.54 1.54 0 0 0-.242.874 1.43 1.43 0 0 0 .225.818q.236.35.669.541.435.192 1.032.192m0-4.142q.468 0 .831-.188.366-.188.575-.524t.213-.788a1.45 1.45 0 0 0-.209-.772 1.35 1.35 0 0 0-.567-.51 1.84 1.84 0 0 0-.843-.184q-.49 0-.857.183-.366.18-.567.511a1.44 1.44 0 0 0-.196.772q-.004.451.201.788.209.338.575.524.367.188.844.188m13.754-3.767h1.057v5.778q0 .896-.422 1.598a2.95 2.95 0 0 1-1.18 1.104q-.762.4-1.79.4-1.026 0-1.79-.4a3 3 0 0 1-1.184-1.104 3.06 3.06 0 0 1-.418-1.598v-5.778h1.057v5.693q0 .639.281 1.138.282.495.801.78.525.28 1.253.28.73 0 1.253-.28.525-.285.801-.78a2.27 2.27 0 0 0 .281-1.138zm7.89 2.182a1.34 1.34 0 0 0-.622-1.006q-.545-.358-1.338-.358-.579 0-1.014.187a1.6 1.6 0 0 0-.673.516 1.24 1.24 0 0 0-.239.746q0 .35.166.6.171.248.435.414.264.162.554.268.29.103.533.167l.886.238q.34.09.759.247.421.158.805.43.387.27.639.691.252.422.252 1.036 0 .707-.371 1.278-.367.57-1.074.908-.703.336-1.709.336-.937 0-1.623-.302a2.6 2.6 0 0 1-1.074-.844 2.4 2.4 0 0 1-.439-1.257h1.091q.042.495.332.818.294.32.742.478.452.153.971.153a2.9 2.9 0 0 0 1.087-.196 1.9 1.9 0 0 0 .763-.554q.28-.358.281-.835 0-.435-.243-.708a1.8 1.8 0 0 0-.639-.443 7 7 0 0 0-.857-.298l-1.074-.307q-1.023-.294-1.619-.84-.597-.545-.597-1.427 0-.734.397-1.278.4-.55 1.074-.853a3.6 3.6 0 0 1 1.512-.307q.844 0 1.5.303.656.299 1.04.818.388.52.409 1.18zM347.663 93h-2.693v-8.727h2.813q1.27 0 2.173.524a3.43 3.43 0 0 1 1.385 1.496q.481.971.481 2.326 0 1.365-.485 2.348a3.47 3.47 0 0 1-1.415 1.509q-.93.524-2.259.524m-1.636-.937h1.568q1.083 0 1.794-.418a2.57 2.57 0 0 0 1.061-1.189q.35-.771.35-1.837 0-1.056-.346-1.82a2.54 2.54 0 0 0-1.031-1.175q-.686-.414-1.709-.414h-1.687z"
                        ></path>
                      </g>
                      <g opacity="0.3">
                        <path
                          fill="#fff"
                          d="M8.08 111H7.023a2.2 2.2 0 0 0-.89-1.381 2.4 2.4 0 0 0-.73-.358 3 3 0 0 0-.835-.119q-.792 0-1.436.401-.64.4-1.018 1.18-.375.78-.375 1.913t.375 1.914q.378.78 1.018 1.18.645.4 1.436.401.435 0 .835-.12.4-.119.73-.353a2.25 2.25 0 0 0 .89-1.385H8.08q-.12.669-.435 1.197a3.27 3.27 0 0 1-1.837 1.458q-.58.19-1.24.191-1.116 0-1.986-.545-.87-.546-1.368-1.551-.498-1.006-.498-2.387 0-1.38.498-2.386.5-1.006 1.368-1.551.87-.546 1.986-.546.66 0 1.24.192.584.192 1.053.563a3.2 3.2 0 0 1 .784.895q.315.524.435 1.197m5.646 3.324v-3.869h1.006V117h-1.006v-1.108h-.068a2.15 2.15 0 0 1-.716.848q-.486.345-1.227.345-.614 0-1.091-.268a1.9 1.9 0 0 1-.75-.818q-.273-.55-.273-1.385v-4.159h1.006v4.09q0 .716.4 1.143.405.426 1.031.426.376 0 .763-.192.393-.192.656-.588.27-.396.269-1.01M16.524 117v-6.545h.971v.988h.068q.18-.485.648-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .528.017v1.023a3 3 0 0 0-.234-.038q-.18-.03-.38-.03-.476 0-.852.2a1.47 1.47 0 0 0-.801 1.334V117zm4.414 0v-6.545h.972v.988h.068q.18-.485.648-.788a1.9 1.9 0 0 1 1.057-.303 11 11 0 0 1 .528.017v1.023a3 3 0 0 0-.234-.038q-.18-.03-.38-.03-.477 0-.852.2a1.47 1.47 0 0 0-.801 1.334V117zm6.96.136q-.945 0-1.632-.417a2.8 2.8 0 0 1-1.052-1.176q-.367-.759-.367-1.765t.367-1.772q.37-.772 1.031-1.202.665-.435 1.551-.435.512 0 1.01.171.498.17.908.554.408.38.652 1.005.243.627.243 1.543v.426h-5.046v-.869h4.023a2.15 2.15 0 0 0-.222-.989 1.67 1.67 0 0 0-.622-.686 1.75 1.75 0 0 0-.946-.251q-.6 0-1.04.298-.434.294-.669.767a2.25 2.25 0 0 0-.234 1.014v.58q0 .741.256 1.257.26.512.72.78.46.264 1.07.264.396 0 .715-.111a1.5 1.5 0 0 0 .558-.341q.235-.23.363-.571l.971.273a2.16 2.16 0 0 1-.515.869q-.363.371-.895.58a3.3 3.3 0 0 1-1.198.204m5.196-4.074V117h-1.006v-6.545h.972v1.022h.085q.23-.498.7-.801.468-.306 1.21-.307.664 0 1.163.273.498.269.775.818.277.546.277 1.381V117h-1.005v-4.091q0-.771-.401-1.202-.4-.434-1.1-.434-.48 0-.86.209-.375.208-.593.609-.217.4-.217.971m8.81-2.607v.852h-3.392v-.852zm-2.403-1.569h1.006v6.239q0 .426.123.639a.64.64 0 0 0 .324.281q.2.069.422.069.166 0 .273-.017l.17-.035.205.904a2.2 2.2 0 0 1-.75.119q-.427 0-.835-.183a1.66 1.66 0 0 1-.674-.558q-.264-.376-.264-.946zM46.83 117v-8.727h3.05q.913 0 1.505.315.593.31.882.84.29.524.29 1.163 0 .563-.2.929-.196.366-.52.579a2.4 2.4 0 0 1-.695.316v.085q.4.026.806.281.405.256.677.733.273.477.273 1.168 0 .656-.298 1.18-.3.525-.942.831-.644.307-1.675.307zm1.056-.938h2.097q1.035 0 1.47-.4.44-.405.44-.98 0-.444-.227-.818a1.63 1.63 0 0 0-.643-.605q-.418-.231-.989-.231h-2.148zm0-3.954h1.96q.479 0 .861-.188.39-.188.614-.528.23-.34.23-.801 0-.576-.4-.976-.4-.405-1.27-.405h-1.995zm9.034 5.028q-.819 0-1.445-.413-.626-.417-.98-1.176-.354-.763-.354-1.803 0-1.031.354-1.789.354-.76.984-1.172.63-.414 1.458-.414.639 0 1.01.213.375.21.57.478.201.264.312.434h.085v-1.039h1.006V117h-.972v-1.006h-.12a6 6 0 0 1-.315.452q-.204.269-.583.482-.38.208-1.01.208m.136-.903q.604 0 1.023-.315.417-.32.635-.882.217-.567.217-1.309 0-.733-.213-1.282a1.86 1.86 0 0 0-.63-.861q-.42-.311-1.032-.311-.639 0-1.065.328-.422.324-.635.882-.21.554-.21 1.244 0 .699.214 1.27.217.567.64.904.425.332 1.056.332m5.8-7.96V117H61.85v-8.727zm4.264 8.863q-.818 0-1.444-.413-.627-.417-.98-1.176-.354-.763-.354-1.803 0-1.031.354-1.789.354-.76.984-1.172.63-.414 1.457-.414.64 0 1.01.213.375.21.571.478.201.264.311.434h.086v-1.039h1.005V117h-.971v-1.006h-.12q-.11.18-.315.452a1.9 1.9 0 0 1-.584.482q-.38.208-1.01.208m.137-.903q.605 0 1.022-.315.418-.32.635-.882.218-.567.218-1.309 0-.733-.213-1.282a1.86 1.86 0 0 0-.631-.861q-.417-.311-1.031-.311-.639 0-1.066.328-.42.324-.635.882-.208.554-.208 1.244 0 .699.213 1.27.217.567.639.904.426.332 1.057.332m5.8-3.171V117h-1.005v-6.545h.971v1.022h.086q.23-.498.699-.801.468-.306 1.21-.307.664 0 1.163.273.499.269.776.818.276.546.277 1.381V117h-1.006v-4.091q0-.771-.4-1.202-.401-.434-1.1-.434-.482 0-.86.209-.375.208-.593.609-.217.4-.217.971m8.624 4.074q-.921 0-1.586-.434a2.83 2.83 0 0 1-1.022-1.198q-.358-.762-.358-1.743 0-.996.366-1.76.37-.766 1.031-1.197.665-.435 1.551-.435.69 0 1.245.256.555.255.907.716.354.46.44 1.074H83.25a1.56 1.56 0 0 0-.512-.793q-.392-.35-1.056-.349-.589 0-1.032.307a2 2 0 0 0-.686.856q-.243.55-.243 1.291 0 .759.239 1.321.244.562.682.874.443.31 1.04.311.39 0 .711-.136.32-.137.541-.392.222-.256.316-.614h1.005a2.3 2.3 0 0 1-.421 1.044 2.36 2.36 0 0 1-.883.733q-.545.268-1.27.268m6.738 0q-.946 0-1.632-.417a2.8 2.8 0 0 1-1.053-1.176q-.366-.759-.366-1.765t.366-1.772a2.9 2.9 0 0 1 1.031-1.202q.665-.435 1.552-.435.51 0 1.01.171.498.17.907.554.41.38.652 1.005.243.627.243 1.543v.426h-5.045v-.869h4.022a2.15 2.15 0 0 0-.221-.989 1.67 1.67 0 0 0-.622-.686 1.75 1.75 0 0 0-.946-.251q-.601 0-1.04.298-.435.294-.67.767a2.25 2.25 0 0 0-.234 1.014v.58q0 .741.256 1.257.26.512.72.78.46.264 1.07.264.396 0 .716-.111a1.5 1.5 0 0 0 .558-.341q.234-.23.362-.571l.972.273a2.16 2.16 0 0 1-.516.869q-.362.371-.895.58a3.3 3.3 0 0 1-1.197.204"
                          opacity="0.5"
                        ></path>
                        <path
                          stroke="#fff"
                          strokeDasharray="1 2"
                          d="M111.5 112.5h150"
                          opacity="0.1"
                        ></path>
                        <path
                          fill="#fff"
                          d="M284.477 118.091v-10.909h.699v10.909zm2.353-7.636a1.34 1.34 0 0 0-.623-1.006q-.544-.358-1.338-.358-.579 0-1.014.187a1.6 1.6 0 0 0-.673.516 1.24 1.24 0 0 0-.239.746q0 .35.166.601.171.246.435.413.264.162.554.268.29.103.533.167l.886.238q.34.09.759.247.421.158.805.431.388.269.639.69.252.422.252 1.036a2.3 2.3 0 0 1-.371 1.278q-.366.571-1.074.908-.703.336-1.709.336-.937 0-1.623-.302a2.6 2.6 0 0 1-1.074-.844 2.4 2.4 0 0 1-.439-1.257h1.091q.042.495.332.818.294.32.742.477.452.154.971.154.606 0 1.087-.196.481-.2.763-.554.28-.358.281-.835 0-.435-.243-.708a1.8 1.8 0 0 0-.639-.443 7 7 0 0 0-.857-.298l-1.074-.307q-1.022-.294-1.619-.84-.597-.545-.597-1.427 0-.733.397-1.279.4-.549 1.074-.852a3.6 3.6 0 0 1 1.512-.307q.844 0 1.5.303.657.299 1.04.818.388.52.409 1.181zm5.471-2.182V117h-1.057v-7.193h-.068q-.06.119-.307.273a2.8 2.8 0 0 1-.639.264 3.3 3.3 0 0 1-.895.111v-.887q.507 0 .878-.183.37-.184.618-.43a2.6 2.6 0 0 0 .379-.448l.154-.234zm5.298 8.846q-.963 0-1.64-.524-.678-.528-1.036-1.53-.358-1.005-.358-2.429 0-1.414.358-2.416.363-1.006 1.04-1.534.681-.533 1.636-.533t1.632.533q.682.529 1.04 1.534.363 1.002.362 2.416 0 1.424-.358 2.429-.357 1.002-1.035 1.53-.678.524-1.641.524m0-.937q.955 0 1.483-.921.529-.92.529-2.625 0-1.133-.243-1.93-.239-.797-.691-1.215a1.52 1.52 0 0 0-1.078-.417q-.945 0-1.478.933-.534.929-.533 2.629 0 1.134.238 1.926.24.793.687 1.206a1.55 1.55 0 0 0 1.086.414m4.399-1.943q.009-.41.124-.848.115-.44.387-.976.273-.537.75-1.245l1.961-2.897h1.159l-2.301 3.358q.153-.051.315-.086.167-.034.332-.034.793 0 1.415.367.627.366.985 1.001.362.636.362 1.445 0 .81-.358 1.44a2.6 2.6 0 0 1-.976.993 2.73 2.73 0 0 1-1.411.362 2.73 2.73 0 0 1-1.423-.37 2.66 2.66 0 0 1-.976-1.023q-.354-.653-.345-1.487m1.006.068q0 .554.221.98.222.426.614.669t.903.243.904-.239q.392-.242.613-.665.222-.426.222-.971 0-.554-.222-.976a1.66 1.66 0 0 0-.613-.66 1.7 1.7 0 0 0-.904-.239q-.512 0-.903.239a1.63 1.63 0 0 0-.614.656 2 2 0 0 0-.221.963m7.556 1.5-.068.46a9 9 0 0 1-.221 1.04q-.145.553-.303 1.044-.158.49-.26.78h-.767l.145-.72q.09-.448.179-1.002.093-.549.153-1.125l.051-.477zm3.549-7.534V117h-1.057v-7.193h-.068q-.06.119-.307.273a2.8 2.8 0 0 1-.639.264 3.3 3.3 0 0 1-.895.111v-.887q.507 0 .878-.183.37-.184.618-.43.251-.247.379-.448l.154-.234zM316.56 117v-.767l2.881-3.153q.507-.555.835-.964.329-.413.486-.775.162-.366.162-.767a1.41 1.41 0 0 0-.818-1.317 1.9 1.9 0 0 0-.852-.183q-.503 0-.878.209a1.44 1.44 0 0 0-.576.575q-.2.37-.2.869h-1.005q0-.767.353-1.346.354-.58.963-.904a2.9 2.9 0 0 1 1.377-.324q.767 0 1.359.324.593.324.929.874t.337 1.223q0 .481-.175.942-.171.456-.597 1.018-.421.558-1.171 1.364l-1.961 2.096v.068h4.057V117zm9.943.119q-.75 0-1.351-.298a2.5 2.5 0 0 1-.963-.818 2.24 2.24 0 0 1-.396-1.185h1.023q.06.593.537.98.481.384 1.15.384.537 0 .955-.252.421-.25.66-.69.243-.443.243-1.001a2.05 2.05 0 0 0-.251-1.019 1.84 1.84 0 0 0-.682-.711 1.9 1.9 0 0 0-.993-.265 2.7 2.7 0 0 0-.822.124 2.3 2.3 0 0 0-.695.32l-.989-.12.529-4.295h4.534v.937h-3.648l-.307 2.574h.052a2.3 2.3 0 0 1 .673-.354q.405-.14.844-.14a2.68 2.68 0 0 1 2.416 1.423q.362.66.362 1.509 0 .835-.375 1.491a2.74 2.74 0 0 1-1.023 1.031q-.651.375-1.483.375m4.946-.051a.73.73 0 0 1-.541-.226.74.74 0 0 1-.226-.541q0-.315.226-.541a.73.73 0 0 1 .541-.226q.315 0 .541.226t.226.541a.8.8 0 0 1-.384.665.73.73 0 0 1-.383.102m5.046.051q-.963 0-1.64-.524-.678-.528-1.036-1.53-.358-1.005-.358-2.429 0-1.414.358-2.416.363-1.006 1.04-1.534.681-.533 1.636-.533.956 0 1.632.533.683.529 1.04 1.534.363 1.002.362 2.416 0 1.424-.358 2.429-.357 1.002-1.035 1.53-.678.524-1.641.524m0-.937q.955 0 1.483-.921.53-.92.529-2.625 0-1.133-.243-1.93-.238-.797-.691-1.215a1.52 1.52 0 0 0-1.078-.417q-.945 0-1.478.933-.533.929-.533 2.629 0 1.134.239 1.926.238.793.686 1.206a1.55 1.55 0 0 0 1.086.414m4.642.818 3.903-7.722v-.068h-4.5v-.937h5.591v.988L342.245 117zm9.152.119q-.877 0-1.551-.311a2.54 2.54 0 0 1-1.044-.865 2.17 2.17 0 0 1-.37-1.261 2.31 2.31 0 0 1 .822-1.811 1.86 1.86 0 0 1 .865-.405v-.051a1.7 1.7 0 0 1-.997-.703 2.14 2.14 0 0 1-.367-1.24q-.003-.666.337-1.189.34-.525.938-.827.6-.303 1.367-.303.759 0 1.356.303.596.302.937.827.345.523.35 1.189-.005.694-.38 1.24-.37.54-.984.703v.051q.472.085.852.405.38.315.605.788.227.469.23 1.023-.003.707-.383 1.261-.375.55-1.044.865-.664.311-1.539.311m0-.937q.592 0 1.023-.192t.665-.541.239-.818a1.57 1.57 0 0 0-.256-.874 1.7 1.7 0 0 0-.686-.596 2.15 2.15 0 0 0-.985-.218q-.558 0-.997.218a1.73 1.73 0 0 0-.686.596 1.54 1.54 0 0 0-.243.874 1.44 1.44 0 0 0 .226.818q.234.35.669.541t1.031.192m0-4.142q.47 0 .831-.188.368-.187.576-.524.208-.336.213-.788a1.46 1.46 0 0 0-.209-.772 1.35 1.35 0 0 0-.567-.511 1.85 1.85 0 0 0-.844-.183q-.49 0-.856.183-.366.179-.567.511a1.43 1.43 0 0 0-.196.772 1.46 1.46 0 0 0 .2.788q.21.337.576.524.366.188.843.188"
                        ></path>
                      </g>
                      <g opacity="0.3">
                        <rect
                          width="47"
                          height="22"
                          x="305"
                          fill="#fff"
                          fillOpacity="0.025"
                          rx="4"
                        />
                        <rect
                          width="23"
                          height="22"
                          x="305"
                          fill="#fb4780"
                          rx="4"
                        />
                        <path
                          fill="#fff"
                          d="M315.99 15.91V6.817h.582v9.091zm1.68-6.183a.97.97 0 0 0-.419-.725q-.366-.26-.952-.26-.412 0-.707.125a1.05 1.05 0 0 0-.451.338.8.8 0 0 0-.159.486q0 .228.103.394a.9.9 0 0 0 .287.284q.182.114.401.192t.444.132l.682.17q.413.095.792.26.384.162.685.411.306.249.483.6.178.353.178.824 0 .639-.327 1.126-.327.483-.944.756-.615.27-1.488.27-.849 0-1.474-.263a2.2 2.2 0 0 1-.973-.767q-.349-.504-.376-1.228h1.296q.029.38.234.632t.536.376q.334.124.746.124.43 0 .753-.127.327-.132.511-.363a.87.87 0 0 0 .188-.547.7.7 0 0 0-.166-.468 1.2 1.2 0 0 0-.459-.313 4.4 4.4 0 0 0-.681-.227l-.828-.213q-.898-.23-1.42-.7-.519-.472-.519-1.253 0-.643.348-1.126.352-.483.956-.75.603-.27 1.367-.27.774 0 1.356.27.587.267.92.743.334.472.345 1.087z"
                        ></path>
                        <path
                          fill="#fff"
                          d="M340.035 13.636v-.383q0-.423.177-.778.181-.355.526-.572t.834-.216q.505 0 .846.216.34.214.515.569.177.355.177.78v.384q0 .423-.177.778a1.4 1.4 0 0 1-.522.572q-.342.216-.839.216t-.841-.216a1.4 1.4 0 0 1-.522-.572 1.74 1.74 0 0 1-.174-.778m.927-.383v.383q0 .28.135.515t.475.235q.345 0 .473-.231.13-.235.131-.519v-.383q0-.284-.124-.519-.125-.237-.48-.238-.333 0-.472.238a1 1 0 0 0-.138.519m-4.624-3.779v-.383q0-.426.181-.781t.526-.569q.344-.216.834-.216.501 0 .842.216.344.214.518.569t.174.78v.384q0 .427-.177.782a1.37 1.37 0 0 1-.519.564q-.344.213-.838.213-.5 0-.845-.213a1.4 1.4 0 0 1-.518-.568 1.7 1.7 0 0 1-.178-.778m.934-.383v.383q0 .285.131.519.135.23.476.23.342 0 .469-.23.131-.235.131-.519v-.383q0-.284-.124-.519-.124-.237-.476-.237-.337 0-.472.237-.135.24-.135.519M336.743 15l5-7.273h.888l-5 7.273z"
                          opacity="0.5"
                        ></path>
                      </g>
                      <defs>
                        <linearGradient
                          id="leverage-5_svg__a"
                          x1="286"
                          x2="354.482"
                          y1="261"
                          y2="240.618"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#de4444" stopOpacity="0.5"></stop>
                          <stop
                            offset="0.105"
                            stopColor="#4c94ff"
                            stopOpacity="0.5"
                          ></stop>
                          <stop
                            offset="0.502"
                            stopColor="#4c94ff"
                            stopOpacity="0.5"
                          ></stop>
                          <stop
                            offset="0.779"
                            stopColor="#db33db"
                            stopOpacity="0.5"
                          ></stop>
                          <stop
                            offset="1"
                            stopColor="#de4444"
                            stopOpacity="0.5"
                          ></stop>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="leverage-module__mLPE1q__shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="our-security-measures-module__bx1UeG__container">
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
            <div className="top-line-module__PKQ0Jq__lineTwo top-line-module__PKQ0Jq__isExpanded"></div>
            <div className="top-line-module__PKQ0Jq__lineThree"></div>
          </div>
        </div>
        <div className="backlight inView"></div>
        <div className="section-lockup-module__Aj2JOq__lockup">
          <div className="pill-module__qX7Pgq__pillContainer pill-module__qX7Pgq__noUrl">
            <div className="pill-module__qX7Pgq__pillBorderSvg">
              <svg
                className="pill-module__qX7Pgq__rotatingBorder"
                viewBox="0 0 168.734375 28"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="_R_2r5fjb_"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgba(125, 102, 255, 0.192)"
                    ></stop>
                    <stop
                      offset="100%"
                      stopColor="rgba(168, 153, 255, 0.28)"
                    ></stop>
                  </linearGradient>
                </defs>
                <rect
                  x="0.5"
                  y="0.5"
                  width="167.734375"
                  height="27"
                  rx="14"
                  fill="none"
                  stroke="url(#_R_2r5fjb_)"
                  strokeWidth="1"
                  strokeDasharray="6 8"
                  className="pill-module__qX7Pgq__rotatingStroke"
                />
              </svg>
            </div>
            <p className="pill-module__qX7Pgq__pillText">
              Our security measures
            </p>
          </div>
          <h2 className="section-lockup-module__Aj2JOq__lockupTitle mixed-text">
            Built on a foundation you can trust
          </h2>
          <p className="section-lockup-module__Aj2JOq__lockupSubtext">
            A strong capital position, conservative balance sheet, and automated
            risk controls protect both our firm and the people who trade with
            us.
          </p>
        </div>
        <div className="our-security-measures-module__bx1UeG__content">
          <div className="our-security-measures-module__bx1UeG__statsGrid">
            <div className="bottom-module__JWJQYa__featureBlockWrapper">
              <svg
                className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
                viewBox="0 0 1 162"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="162"
                  className="bottom-module__JWJQYa__featureBlockBorderStroke"
                />
              </svg>
              <div className="our-security-measures-module__bx1UeG__stat">
                <p className="our-security-measures-module__bx1UeG__statValue">
                  <CountUp end={13.8} prefix="$" suffix="B" decimals={1} />
                </p>
                <p className="our-security-measures-module__bx1UeG__statTitle">
                  Equity capital
                </p>
              </div>
            </div>
            <div className="bottom-module__JWJQYa__featureBlockWrapper">
              <svg
                className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
                viewBox="0 0 1 162"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="162"
                  className="bottom-module__JWJQYa__featureBlockBorderStroke"
                />
              </svg>
              <div className="our-security-measures-module__bx1UeG__stat">
                <p className="our-security-measures-module__bx1UeG__statValue">
                  <CountUp end={8.5} prefix="$" suffix="B" decimals={1} />
                </p>
                <p className="our-security-measures-module__bx1UeG__statTitle">
                  Excess regulatory capital
                </p>
              </div>
            </div>
            <div className="bottom-module__JWJQYa__featureBlockWrapper">
              <svg
                className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
                viewBox="0 0 1 162"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="162"
                  className="bottom-module__JWJQYa__featureBlockBorderStroke"
                />
              </svg>
              <div className="our-security-measures-module__bx1UeG__stat">
                <p className="our-security-measures-module__bx1UeG__statValue">
                  <CountUp end={2.05} suffix="M" decimals={2} />
                </p>
                <p className="our-security-measures-module__bx1UeG__statTitle">
                  Client accounts
                </p>
              </div>
            </div>
            <div className="bottom-module__JWJQYa__featureBlockWrapper">
              <svg
                className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderRight"
                viewBox="0 0 1 162"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="162"
                  className="bottom-module__JWJQYa__featureBlockBorderStroke"
                />
              </svg>
              <svg
                className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
                viewBox="0 0 1 162"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="162"
                  className="bottom-module__JWJQYa__featureBlockBorderStroke"
                />
              </svg>
              <div className="our-security-measures-module__bx1UeG__stat">
                <p className="our-security-measures-module__bx1UeG__statValue">
                  <CountUp end={1.95} suffix="M" decimals={2} />
                </p>
                <p className="our-security-measures-module__bx1UeG__statTitle">
                  Daily avg. revenue trades
                </p>
              </div>
            </div>
          </div>
          <div className="our-security-measures-module__bx1UeG__featuresGrid">
            <div className="our-security-measures-module__bx1UeG__featureCard">
              <span className="our-security-measures-module__bx1UeG__featureIconWrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="our-security-measures-module__bx1UeG__featureIcon"
                >
                  <path
                    stroke="currentColor"
                    strokeLinejoin="round"
                    d="M19 9v-.586a1 1 0 0 0-.293-.707l-4.414-4.414A1 1 0 0 0 13.586 3H13m6 6v11a1 1 0 0 1-1 1h-5m6-12h-5.5a.5.5 0 0 1-.5-.5V3m0 0H6a1 1 0 0 0-1 1v4m0 8v5l2-1 2 1v-5m1-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  ></path>
                </svg>
              </span>
              <p className="our-security-measures-module__bx1UeG__featureTitle">
                FCA authorisation
              </p>
              <p className="our-security-measures-module__bx1UeG__featureDescription">
                We are authorised and regulated by the Financial Conduct
                Authority.
              </p>
            </div>
            <div className="our-security-measures-module__bx1UeG__featureCard">
              <span className="our-security-measures-module__bx1UeG__featureIconWrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="our-security-measures-module__bx1UeG__featureIcon"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    d="M12 15v2m0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5-6V8A5 5 0 0 0 7 8v1zM5 21h14a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1Z"
                  ></path>
                </svg>
              </span>
              <p className="our-security-measures-module__bx1UeG__featureTitle">
                FSCS protection
              </p>
              <p className="our-security-measures-module__bx1UeG__featureDescription">
                Eligible client funds are protected by the FSCS scheme up to
                $85,000.
              </p>
            </div>
            <div className="our-security-measures-module__bx1UeG__featureCard">
              <span className="our-security-measures-module__bx1UeG__featureIconWrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="our-security-measures-module__bx1UeG__featureIcon"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8h.002M11 11h1v6h.5m8.5-5a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
                  ></path>
                </svg>
              </span>
              <p className="our-security-measures-module__bx1UeG__featureTitle">
                Bcrypt hashing
              </p>
              <p className="our-security-measures-module__bx1UeG__featureDescription">
                Account passwords are stored with the industry-standard Bcrypt
                hashing algorithm.
              </p>
            </div>
            <div className="our-security-measures-module__bx1UeG__featureCard">
              <span className="our-security-measures-module__bx1UeG__featureIconWrap">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="our-security-measures-module__bx1UeG__featureIcon"
                >
                  <path
                    fill="#ffb266"
                    d="M13.128 1.71c-.455-.947-1.805-.947-2.26 0L8.361 6.938l-5.773.757c-1.039.136-1.47 1.42-.698 2.15l4.22 3.985-1.059 5.69c-.194 1.047.912 1.824 1.828 1.33l5.119-2.764 5.12 2.764c.915.494 2.021-.283 1.826-1.33l-1.059-5.69 4.22-3.985c.773-.73.341-2.014-.697-2.15l-5.774-.757z"
                  ></path>
                </svg>
              </span>
              <p className="our-security-measures-module__bx1UeG__featureTitle">
                Data protection
              </p>
              <p className="our-security-measures-module__bx1UeG__featureDescription">
                We follow industry best practices to safeguard your data at
                every layer.
              </p>
            </div>
          </div>
          <div className="our-security-measures-module__bx1UeG__badgeRow">
            <div className="our-security-measures-module__bx1UeG__badge">
              <span
                className="our-security-measures-module__bx1UeG__badgeGlow"
                aria-hidden="true"
              ></span>
              <img
                alt="FSCS protected"
                loading="lazy"
                width="132"
                height="56"
                decoding="async"
                data-nimg="1"
                className="our-security-measures-module__bx1UeG__badgeLogo"
                style={{ color: "transparent" }}
                src="/assets/asset_3.png"
              />
              <div
                className="our-security-measures-module__bx1UeG__badgeDivider"
                aria-hidden="true"
              ></div>
              <div className="our-security-measures-module__bx1UeG__badgeText">
                <p className="our-security-measures-module__bx1UeG__badgeTitle">
                  Protected by FSCS
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="one-module__x92xDa__testimonialsOneContainer">
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
            <div className="top-line-module__PKQ0Jq__lineTwo top-line-module__PKQ0Jq__isExpanded"></div>
            <div className="top-line-module__PKQ0Jq__lineThree"></div>
          </div>
        </div>
        <div className="stars-module__Sa4GPa__starsContainer">
          <div className="stars-module__Sa4GPa__starsInner stars-inner">
            <div
              className="stars-module__Sa4GPa__star stars-overlap"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
            <div
              className="stars-module__Sa4GPa__star"
              style={{ opacity: "1" }}
            ></div>
          </div>
        </div>
        <div className="backlight"></div>
        <div className="section-lockup-module__Aj2JOq__lockup">
          <div className="pill-module__qX7Pgq__pillContainer pill-module__qX7Pgq__noUrl">
            <div className="pill-module__qX7Pgq__pillBorderSvg">
              <svg
                className="pill-module__qX7Pgq__rotatingBorder"
                viewBox="0 0 101.140625 28"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id="_R_33lfjb_"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgba(125, 102, 255, 0.192)"
                    ></stop>
                    <stop
                      offset="100%"
                      stopColor="rgba(168, 153, 255, 0.28)"
                    ></stop>
                  </linearGradient>
                </defs>
                <rect
                  x="0.5"
                  y="0.5"
                  width="100.140625"
                  height="27"
                  rx="14"
                  fill="none"
                  stroke="url(#_R_33lfjb_)"
                  strokeWidth="1"
                  strokeDasharray="6 8"
                  className="pill-module__qX7Pgq__rotatingStroke"
                />
              </svg>
            </div>
            <p className="pill-module__qX7Pgq__pillText">Testimonials</p>
          </div>
          <h2 className="section-lockup-module__Aj2JOq__lockupTitle mixed-text">
            Traders and investors love Meta Gold 5
          </h2>
          <p className="section-lockup-module__Aj2JOq__lockupSubtext">
            Discover what people are saying about us.
          </p>
        </div>
        <div className="one-module__x92xDa__content">
          <div className="one-module__x92xDa__testimonialsWrapper">
            <div className="one-module__x92xDa__testimonialCard">
              <svg
                className="one-module__x92xDa__testimonialCardBorder"
                viewBox="0 0 357.40625 300"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="356.40625"
                  height="299"
                  rx="12"
                  fill="none"
                  className="one-module__x92xDa__testimonialCardBorderStroke"
                />
              </svg>
              <div>
                <p className="one-module__x92xDa__testimonialContent">
                  Incredible company, I've been trading for a while with them,
                  had two quick withdrawals and fee refund in less than 48
                  hours. I absolutely recommend the firm
                </p>
              </div>
              <div className="one-module__x92xDa__testimonialUserWrapper">
                <img
                  alt="testimonial of  Louis can Nuekerk"
                  loading="lazy"
                  width="40"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="one-module__x92xDa__image"
                  style={{ color: "transparent" }}
                  src="/assets/asset_4.png"
                />
                <div className="one-module__x92xDa__testimonialUser">
                  <p className="one-module__x92xDa__testimonialUserName">
                    Louis can Nuekerk
                  </p>
                  <p className="one-module__x92xDa__testimonialUserCompany">
                    Professional trader
                  </p>
                </div>
              </div>
            </div>
            <div className="one-module__x92xDa__testimonialCard">
              <svg
                className="one-module__x92xDa__testimonialCardBorder"
                viewBox="0 0 328.875 300"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="327.875"
                  height="299"
                  rx="12"
                  fill="none"
                  className="one-module__x92xDa__testimonialCardBorderStroke"
                />
              </svg>
              <div>
                <p className="one-module__x92xDa__testimonialContent">
                  This is an amazing platform which gives you opportunity to
                  achieve their goals and become successful traders with the
                  support of finances.
                </p>
              </div>
              <div className="one-module__x92xDa__testimonialUserWrapper">
                <img
                  alt="testimonial of  Adam"
                  loading="lazy"
                  width="40"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="one-module__x92xDa__image"
                  style={{ color: "transparent" }}
                  src="/assets/asset_5.png"
                />
                <div className="one-module__x92xDa__testimonialUser">
                  <p className="one-module__x92xDa__testimonialUserName">
                    Adam
                  </p>
                  <p className="one-module__x92xDa__testimonialUserCompany">
                    User
                  </p>
                </div>
              </div>
            </div>
            <div className="one-module__x92xDa__testimonialCard">
              <svg
                className="one-module__x92xDa__testimonialCardBorder"
                viewBox="0 0 327.71875 300"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="326.71875"
                  height="299"
                  rx="12"
                  fill="none"
                  className="one-module__x92xDa__testimonialCardBorderStroke"
                />
              </svg>
              <div>
                <p className="one-module__x92xDa__testimonialContent">
                  Great company, no issues with payouts, great customer support.
                  Highly recommended for experienced traders.
                </p>
              </div>
              <div className="one-module__x92xDa__testimonialUserWrapper">
                <img
                  alt="testimonial of  Jakub Szulc"
                  loading="lazy"
                  width="40"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="one-module__x92xDa__image"
                  style={{ color: "transparent" }}
                  src="/assets/asset_6.png"
                />
                <div className="one-module__x92xDa__testimonialUser">
                  <p className="one-module__x92xDa__testimonialUserName">
                    Jakub Szulc
                  </p>
                  <p className="one-module__x92xDa__testimonialUserCompany">
                    Trader
                  </p>
                </div>
              </div>
            </div>
            <div className="one-module__x92xDa__testimonialCard">
              <svg
                className="one-module__x92xDa__testimonialCardBorder"
                viewBox="0 0 357.40625 300"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="356.40625"
                  height="299"
                  rx="12"
                  fill="none"
                  className="one-module__x92xDa__testimonialCardBorderStroke"
                />
              </svg>
              <div>
                <p className="one-module__x92xDa__testimonialContent">
                  legitimate! thank you for the opportunity, nothing out there
                  can compare
                </p>
              </div>
              <div className="one-module__x92xDa__testimonialUserWrapper">
                <img
                  alt="testimonial of  Dee"
                  loading="lazy"
                  width="40"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="one-module__x92xDa__image"
                  style={{ color: "transparent" }}
                  src="/assets/asset_7.png"
                />
                <div className="one-module__x92xDa__testimonialUser">
                  <p className="one-module__x92xDa__testimonialUserName">Dee</p>
                  <p className="one-module__x92xDa__testimonialUserCompany">
                    Review expert
                  </p>
                </div>
              </div>
            </div>
            <div className="one-module__x92xDa__testimonialCard">
              <svg
                className="one-module__x92xDa__testimonialCardBorder"
                viewBox="0 0 328.875 300"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="327.875"
                  height="299"
                  rx="12"
                  fill="none"
                  className="one-module__x92xDa__testimonialCardBorderStroke"
                />
              </svg>
              <div>
                <p className="one-module__x92xDa__testimonialContent">
                  Meta Gold 5 has everything you can ask for, I'm super happy it
                  has been recommended to me as my first broker
                </p>
              </div>
              <div className="one-module__x92xDa__testimonialUserWrapper">
                <img
                  alt="testimonial of  Agata Vincent"
                  loading="lazy"
                  width="40"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="one-module__x92xDa__image"
                  style={{ color: "transparent" }}
                  src="/assets/asset_8.png"
                />
                <div className="one-module__x92xDa__testimonialUser">
                  <p className="one-module__x92xDa__testimonialUserName">
                    Agata Vincent
                  </p>
                  <p className="one-module__x92xDa__testimonialUserCompany">
                    Trader
                  </p>
                </div>
              </div>
            </div>
            <div className="one-module__x92xDa__testimonialCard">
              <svg
                className="one-module__x92xDa__testimonialCardBorder"
                viewBox="0 0 327.71875 300"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="326.71875"
                  height="299"
                  rx="12"
                  fill="none"
                  className="one-module__x92xDa__testimonialCardBorderStroke"
                />
              </svg>
              <div>
                <p className="one-module__x92xDa__testimonialContent">
                  Amazing experience. I have a very nice experience using this
                  platform. Execution speed is one of the best all over the
                  market.
                </p>
              </div>
              <div className="one-module__x92xDa__testimonialUserWrapper">
                <img
                  alt="testimonial of  Pro Kittisak"
                  loading="lazy"
                  width="40"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="one-module__x92xDa__image"
                  style={{ color: "transparent" }}
                  src="/assets/asset_9.png"
                />
                <div className="one-module__x92xDa__testimonialUser">
                  <p className="one-module__x92xDa__testimonialUserName">
                    Pro Kittisak
                  </p>
                  <p className="one-module__x92xDa__testimonialUserCompany">
                    User
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
