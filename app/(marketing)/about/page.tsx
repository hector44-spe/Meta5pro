"use client";

import React from "react";
import Link from "next/link";
import CountUp from "@/components/CountUp/CountUp";
import LightRays from "@/components/LightRays/LightRays";

export default function AboutPage() {
  return (
    <main className="page-module___8aEwW__mainContainer">
      <div
        style={{
          padding: "0px var(--container-padding-inline)",
          maxWidth: "1440px",
          boxSizing: "border-box",
          margin: "0 auto",
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100vw",
            height: "100%",
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
        <section className="about-module__WyQbRG__hero" style={{ padding: "160px 0 100px 0" }}>
          <div className="about-module__WyQbRG__lockup">
            <h2
              className="about-module__WyQbRG__lockupTitle stagger-1 mixed-text"
              data-animate="true"
            >
              Built on honesty and{" "}
              <span
                style={{ display: "inline-block" }}
                className="stagger-2 mixed-text "
                data-animate="true"
              >
                financial transparency
              </span>
            </h2>
            <p
              className="about-module__WyQbRG__lockupSubtext inter-alts stagger-2"
              data-animate="true"
            >
              Explore our core principles, mission, vision, and objectives.
            </p>
          </div>
        </section>
      </div>
      <section className="mission-module___9g6Sa__missionContainer">
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
            <div className="top-line-module__PKQ0Jq__lineTwo false"></div>
            <div className="top-line-module__PKQ0Jq__lineThree"></div>
          </div>
        </div>
        <div className="backlight false"></div>
        <div className="mission-module___9g6Sa__content">
          <div className="mission-module___9g6Sa__contentWrapper">
            <div className="mission-module___9g6Sa__contentLeft">
              <div className="mission-module___9g6Sa__contentLeftTop">
                <div style={{ marginBottom: "12px" }}>
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
                            id="_R_5einpfjb_"
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
                          stroke="url(#_R_5einpfjb_)"
                          strokeWidth="1"
                          strokeDasharray="6 8"
                          className="pill-module__qX7Pgq__rotatingStroke"
                        />
                      </svg>
                    </div>
                    <p className="pill-module__qX7Pgq__pillText">Our mission</p>
                  </div>
                </div>
                <p className="mission-module___9g6Sa__contentLeftTitle">
                  We bring honesty and transparency to financial services
                  technology
                </p>
              </div>
              <div className="mission-module___9g6Sa__contentLeftStats">
                <div className="bottom-module__JWJQYa__featureBlockWrapper">
                  <svg
                    className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
                    viewBox="0 0 1 1000"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <line
                      x1="0.5"
                      y1="0"
                      x2="0.5"
                      y2="1000"
                      className="bottom-module__JWJQYa__featureBlockBorderStroke"
                    />
                  </svg>
                  <div className="mission-module___9g6Sa__contentLeftStat">
                    <p className="mission-module___9g6Sa__contentLeftStatValue">
                      <CountUp end={250} prefix="$" suffix="M+" decimals={0} />
                    </p>
                    <p className="mission-module___9g6Sa__contentLeftStatTitle">
                      Payouts
                    </p>
                  </div>
                </div>
                <div className="bottom-module__JWJQYa__featureBlockWrapper">
                  <svg
                    className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
                    viewBox="0 0 1 1000"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <line
                      x1="0.5"
                      y1="0"
                      x2="0.5"
                      y2="1000"
                      className="bottom-module__JWJQYa__featureBlockBorderStroke"
                    />
                  </svg>
                  <div className="mission-module___9g6Sa__contentLeftStat">
                    <p className="mission-module___9g6Sa__contentLeftStatValue">
                      <CountUp end={120} suffix="+" decimals={0} />
                    </p>
                    <p className="mission-module___9g6Sa__contentLeftStatTitle">
                      Countries registered
                    </p>
                  </div>
                </div>
                <div className="bottom-module__JWJQYa__featureBlockWrapper">
                  <svg
                    className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderRight"
                    viewBox="0 0 1 1000"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <line
                      x1="0.5"
                      y1="0"
                      x2="0.5"
                      y2="1000"
                      className="bottom-module__JWJQYa__featureBlockBorderStroke"
                    />
                  </svg>
                  <svg
                    className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
                    viewBox="0 0 1 1000"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <line
                      x1="0.5"
                      y1="0"
                      x2="0.5"
                      y2="1000"
                      className="bottom-module__JWJQYa__featureBlockBorderStroke"
                    />
                  </svg>
                  <div className="mission-module___9g6Sa__contentLeftStat">
                    <p className="mission-module___9g6Sa__contentLeftStatValue">
                      <CountUp end={13} suffix="M+" decimals={0} />
                    </p>
                    <p className="mission-module___9g6Sa__contentLeftStatTitle">
                      Trades processed
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mission-module___9g6Sa__contentRight">
              <p className="mission-module___9g6Sa__contentRightText">
                Welcome to Meta Gold 5, a global online trading firm providing
                24-hour access to a wide range of markets, including crypto,
                forex, commodities, futures, indices, and stocks, supported by
                high liquidity, low spreads, mobile trading, and advanced
                technical analysis tools through our platform.
                <br />
                <br />
                <br />
                We uphold strict security standards and deliver tailored trading
                conditions while empowering traders with the knowledge, tools,
                and products designed to improve efficiency, performance, and
                sustainable growth.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="why-we-are-better-module__dqkM4q__whyChooseUsContainer">
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
            <div className="top-line-module__PKQ0Jq__lineTwo false"></div>
            <div className="top-line-module__PKQ0Jq__lineThree"></div>
          </div>
        </div>
        <div className="backlight false"></div>
        <div className="section-lockup-module__Aj2JOq__lockup">
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
                    id="_R_mqnpfjb_"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="rgba(125, 102, 255, 0.192)" />
                    <stop offset="100%" stopColor="rgba(168, 153, 255, 0.28)" />
                  </linearGradient>
                </defs>
                <rect
                  x="0.5"
                  y="0.5"
                  width="199"
                  height="39"
                  rx="20"
                  fill="none"
                  stroke="url(#_R_mqnpfjb_)"
                  strokeWidth="1"
                  strokeDasharray="6 8"
                  className="pill-module__qX7Pgq__rotatingStroke"
                />
              </svg>
            </div>
            <p className="pill-module__qX7Pgq__pillText">Why we're better</p>
          </div>
          <h2 className="section-lockup-module__Aj2JOq__lockupTitle mixed-text">
            Expanding access to global markets
          </h2>
          <p className="section-lockup-module__Aj2JOq__lockupSubtext">
            Our team comprises of industry experts who are driven to
            consistently improve your trading experience.
          </p>
        </div>
        <div className="why-we-are-better-module__dqkM4q__content">
          <div className="why-we-are-better-module__dqkM4q__bottomBlock">
            <div className="bottom-module__JWJQYa__featureBlockWrapper">
              <svg
                className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
                viewBox="0 0 1 1000"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="1000"
                  className="bottom-module__JWJQYa__featureBlockBorderStroke"
                />
              </svg>
              <div className="why-we-are-better-module__dqkM4q__subFeatureBlock">
                <span className="why-we-are-better-module__dqkM4q__subFeatureBlockHeader">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="why-we-are-better-module__dqkM4q__featureIcon"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinejoin="round"
                      d="M19 9v-.586a1 1 0 0 0-.293-.707l-4.414-4.414A1 1 0 0 0 13.586 3H13m6 6v11a1 1 0 0 1-1 1h-5m6-12h-5.5a.5.5 0 0 1-.5-.5V3m0 0H6a1 1 0 0 0-1 1v4m0 8v5l2-1 2 1v-5m1-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    ></path>
                  </svg>
                  <p className="why-we-are-better-module__dqkM4q__subFeatureBlockTitle">
                    Licensed and Regulated
                  </p>
                </span>
                <p className="why-we-are-better-module__dqkM4q__subFeatureBlockDescription">
                  We hold ourselves to the highest levels of integrity and
                  professionalism.
                </p>
              </div>
            </div>
            <div className="bottom-module__JWJQYa__featureBlockWrapper">
              <svg
                className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
                viewBox="0 0 1 1000"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="1000"
                  className="bottom-module__JWJQYa__featureBlockBorderStroke"
                />
              </svg>
              <div className="why-we-are-better-module__dqkM4q__subFeatureBlock">
                <span className="why-we-are-better-module__dqkM4q__subFeatureBlockHeader">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="why-we-are-better-module__dqkM4q__featureIcon"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      d="M12 15v2m0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5-6V8A5 5 0 0 0 7 8v1zM5 21h14a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1Z"
                    ></path>
                  </svg>
                  <p className="why-we-are-better-module__dqkM4q__subFeatureBlockTitle">
                    Secure Trading account
                  </p>
                </span>
                <p className="why-we-are-better-module__dqkM4q__subFeatureBlockDescription">
                  Secure trading account built to streamline your trading
                  experience.
                </p>
              </div>
            </div>
            <div className="bottom-module__JWJQYa__featureBlockWrapper">
              <svg
                className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderRight"
                viewBox="0 0 1 1000"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="1000"
                  className="bottom-module__JWJQYa__featureBlockBorderStroke"
                />
              </svg>
              <svg
                className="bottom-module__JWJQYa__featureBlockBorder bottom-module__JWJQYa__featureBlockBorderLeft"
                viewBox="0 0 1 1000"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0.5"
                  y1="0"
                  x2="0.5"
                  y2="1000"
                  className="bottom-module__JWJQYa__featureBlockBorderStroke"
                />
              </svg>
              <div className="why-we-are-better-module__dqkM4q__subFeatureBlock">
                <span className="why-we-are-better-module__dqkM4q__subFeatureBlockHeader">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="why-we-are-better-module__dqkM4q__featureIcon"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinejoin="round"
                      d="M13.182 10 14 2 4 14h6.818L10 22l10-12z"
                    ></path>
                  </svg>
                  <p className="why-we-are-better-module__dqkM4q__subFeatureBlockTitle">
                    Open an account in seconds
                  </p>
                </span>
                <p className="why-we-are-better-module__dqkM4q__subFeatureBlockDescription">
                  Simple and easy registration process with your convenience in
                  mind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="two-module__OgUdIq__testimonialsOneContainer">
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
            <div className="top-line-module__PKQ0Jq__lineTwo false"></div>
            <div className="top-line-module__PKQ0Jq__lineThree"></div>
          </div>
        </div>
        <div className="backlight"></div>
        <div className="section-lockup-module__Aj2JOq__lockup">
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
                    id="_R_n2npfjb_"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="rgba(125, 102, 255, 0.192)" />
                    <stop offset="100%" stopColor="rgba(168, 153, 255, 0.28)" />
                  </linearGradient>
                </defs>
                <rect
                  x="0.5"
                  y="0.5"
                  width="199"
                  height="39"
                  rx="20"
                  fill="none"
                  stroke="url(#_R_n2npfjb_)"
                  strokeWidth="1"
                  strokeDasharray="6 8"
                  className="pill-module__qX7Pgq__rotatingStroke"
                />
              </svg>
            </div>
            <p className="pill-module__qX7Pgq__pillText">Testimonials</p>
          </div>
          <h2 className="section-lockup-module__Aj2JOq__lockupTitle mixed-text">
            Tools that move at market speed
          </h2>
          <p className="section-lockup-module__Aj2JOq__lockupSubtext">
            Discover what people are saying about us.
          </p>
        </div>
        <div className="two-module__OgUdIq__content">
          <div className="two-module__OgUdIq__testimonialsWrapper">
            <div className="two-module__OgUdIq__testimonialCard">
              <svg
                className="two-module__OgUdIq__testimonialCardBorder"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="999"
                  height="999"
                  rx="12"
                  fill="none"
                  className="two-module__OgUdIq__testimonialCardBorderStroke"
                />
              </svg>
              <div>
                <p className="two-module__OgUdIq__testimonialContent">
                  This is an amazing platform which gives you opportunity to
                  achieve their goals and become successful traders with the
                  support of finances.
                </p>
              </div>
              <div className="two-module__OgUdIq__testimonialUserWrapper">
                <img
                  alt="testimonial of  Adam"
                  loading="lazy"
                  width="40"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="two-module__OgUdIq__image"
                  style={{ color: "transparent" }}
                  src="https://user-images.trustpilot.com/5cac659ab628b746a119fd61/73x73.png"
                />
                <div className="two-module__OgUdIq__testimonialUser">
                  <p className="two-module__OgUdIq__testimonialUserName">
                    Adam
                  </p>
                  <p className="two-module__OgUdIq__testimonialUserCompany">
                    User
                  </p>
                </div>
              </div>
            </div>
            <div className="two-module__OgUdIq__testimonialCard">
              <svg
                className="two-module__OgUdIq__testimonialCardBorder"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="999"
                  height="999"
                  rx="12"
                  fill="none"
                  className="two-module__OgUdIq__testimonialCardBorderStroke"
                />
              </svg>
              <div>
                <p className="two-module__OgUdIq__testimonialContent">
                  legitimate! thank you for the opportunity, nothing out there
                  can compare
                </p>
              </div>
              <div className="two-module__OgUdIq__testimonialUserWrapper">
                <img
                  alt="testimonial of  Dee"
                  loading="lazy"
                  width="40"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="two-module__OgUdIq__image"
                  style={{ color: "transparent" }}
                  src="https://user-images.trustpilot.com/6321c934f2a8b90013faaf15/73x73.png"
                />
                <div className="two-module__OgUdIq__testimonialUser">
                  <p className="two-module__OgUdIq__testimonialUserName">Dee</p>
                  <p className="two-module__OgUdIq__testimonialUserCompany">
                    Review expert
                  </p>
                </div>
              </div>
            </div>
            <div className="two-module__OgUdIq__testimonialCard">
              <svg
                className="two-module__OgUdIq__testimonialCardBorder"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="999"
                  height="999"
                  rx="12"
                  fill="none"
                  className="two-module__OgUdIq__testimonialCardBorderStroke"
                />
              </svg>
              <div>
                <p className="two-module__OgUdIq__testimonialContent">
                  Amazing experience. I have a very nice experience using this
                  platform. Execution speed is one of the best all over the
                  market.
                </p>
              </div>
              <div className="two-module__OgUdIq__testimonialUserWrapper">
                <img
                  alt="testimonial of  Pro Kittisak"
                  loading="lazy"
                  width="40"
                  height="40"
                  decoding="async"
                  data-nimg="1"
                  className="two-module__OgUdIq__image"
                  style={{ color: "transparent" }}
                  src="https://user-images.trustpilot.com/64c13a9a79f4110012303256/73x73.png"
                />
                <div className="two-module__OgUdIq__testimonialUser">
                  <p className="two-module__OgUdIq__testimonialUserName">
                    Pro Kittisak
                  </p>
                  <p className="two-module__OgUdIq__testimonialUserCompany">
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
