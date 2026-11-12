"use client";

import React from "react";
import Link from "next/link";
import CountUp from "@/components/CountUp/CountUp";
import FaqSection from "@/components/FaqSection/FaqSection";
import { FAQS } from "@/data/faqs";

export default function RealEstatePage() {
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
        <section className="real-estate-module___lOCRG__hero">
          <div className="real-estate-module___lOCRG__lockup">
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
                <p className="pill-module__qX7Pgq__pillText">Real estate</p>
              </div>
            </div>
            <h2
              className="real-estate-module___lOCRG__lockupTitle stagger-1"
              data-animate="true"
            >
              <span className="whitespace-nowrap">A new way to invest </span> in
              real estate.
            </h2>
            <p
              className="real-estate-module___lOCRG__lockupSubtext inter-alts stagger-3"
              data-animate="true"
            >
              We're providing an easier way to build a real estate portfolio, no
              landlording required.
            </p>
            <div
              className="real-estate-module___lOCRG__lockupButtons stagger-4"
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
          <div className="real-estate-module___lOCRG__radialMask"></div>
          <div
            className="real-estate-module___lOCRG__realEstateImgContainer stagger-5"
            data-animate="true"
          >
            <div className="real-estate-module___lOCRG__realEstateImgWrapper">
              <img
                alt="copy"
                loading="lazy"
                width="884"
                height="495"
                decoding="async"
                data-nimg="1"
                className="real-estate-module___lOCRG__realEstateImg"
                style={{ color: "transparent" }}
                src="/assets/imgs/real-estate.svg"
              />
            </div>
            <div
              style={{
                height: "1097px",
                width: "1581px",
                background: "transparent",
                position: "absolute",
                top: "0",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <img
                alt="copy"
                loading="lazy"
                width="1581"
                height="1097"
                decoding="async"
                data-nimg="1"
                style={{
                  color: "transparent",
                  width: "100%",
                  height: "auto",
                  backgroundColor: "transparent",
                }}
                src="/assets/imgs/flat-grid.svg"
              />
            </div>
          </div>
        </section>
      </div>
      <section className="real-estate-mission-module__P7A78q__container">
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
        <div className="real-estate-mission-module__P7A78q__content">
          <img
            alt="mission"
            loading="lazy"
            width="1238"
            height="495"
            decoding="async"
            data-nimg="1"
            className="real-estate-mission-module__P7A78q__realEstateImg"
            style={{ color: "transparent" }}
            src="/assets/imgs/real-estate-mission.avif"
          />
          <div className="real-estate-mission-module__P7A78q__contentWrapper">
            <div className="real-estate-mission-module__P7A78q__contentLeft">
              <p className="real-estate-mission-module__P7A78q__contentLeftTitle">
                Creating a simple marketplace for seamless investing, where
                individuals and businesses alike can connect with the financial
                opportunities they seek.
              </p>
              <p className="real-estate-mission-module__P7A78q__contentLeftText">
                Whether you're taking your first step into the investment world
                or looking to diversify your portfolio, we provide a
                transparent, user-friendly environment that fosters confidence
                and success. Our commitment to innovation and accessibility
                ensures that you have everything you need to make informed
                decisions and reach your financial goals.
                <br />
                <br />
                <br />
                Join us and experience a new way of investing that puts you in
                control, simplifying the complex and making the path to
                financial growth more attainable than ever before.
              </p>
            </div>
            <div className="real-estate-mission-module__P7A78q__contentRight">
              <div className="real-estate-mission-module__P7A78q__contentLeftStats">
                <div className="real-estate-mission-module__P7A78q__contentLeftStat">
                  <p className="real-estate-mission-module__P7A78q__contentLeftStatValue">
                    <CountUp end={1200} suffix="+" separator="," decimals={0} />
                  </p>
                  <p className="real-estate-mission-module__P7A78q__contentLeftStatTitle">
                    Deals funded since inception
                  </p>
                </div>
                <div className="real-estate-mission-module__P7A78q__contentLeftStat">
                  <p className="real-estate-mission-module__P7A78q__contentLeftStatValue">
                    <CountUp end={4} prefix="$" suffix="B+" decimals={0} />
                  </p>
                  <p className="real-estate-mission-module__P7A78q__contentLeftStatTitle">
                    Amount invested in real estate
                  </p>
                </div>
                <div className="real-estate-mission-module__P7A78q__contentLeftStat">
                  <p className="real-estate-mission-module__P7A78q__contentLeftStatValue">
                    <CountUp
                      end={150000}
                      suffix="+"
                      separator=","
                      decimals={0}
                    />
                  </p>
                  <p className="real-estate-mission-module__P7A78q__contentLeftStatTitle">
                    Actively earning users
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="real-estate-mission-module__P7A78q__featureDropSection">
            <p className="real-estate-mission-module__P7A78q__featureDropTitle">
              Real estate is already the foundation of your community. We help
              you make it the foundation of your portfolio.
            </p>
            <div className="real-estate-mission-module__P7A78q__featureDrop">
              <div>
                <div className="real-estate-mission-module__P7A78q__subFeatureBlock">
                  <span className="real-estate-mission-module__P7A78q__subFeatureBlockHeader">
                    <p className="real-estate-mission-module__P7A78q__subFeatureBlockTitle">
                      You should be earning like a landlord, not working like
                      one
                    </p>
                  </span>
                  <p className="real-estate-mission-module__P7A78q__subFeatureBlockDescription">
                    Our investments are passive, giving you the potential to
                    earn income without the maintenance or operational
                    responsibilities of owning a building.
                  </p>
                </div>
              </div>
              <div>
                <div className="real-estate-mission-module__P7A78q__subFeatureBlock">
                  <span className="real-estate-mission-module__P7A78q__subFeatureBlockHeader">
                    <p className="real-estate-mission-module__P7A78q__subFeatureBlockTitle">
                      The value of real estate, without buying an entire
                      building
                    </p>
                  </span>
                  <p className="real-estate-mission-module__P7A78q__subFeatureBlockDescription">
                    Invest in large-scale real estate projects with other
                    investors, without having to foot the entire bill. Leverage
                    the power of the passive income.
                  </p>
                </div>
              </div>
              <div>
                <div className="real-estate-mission-module__P7A78q__subFeatureBlock">
                  <span className="real-estate-mission-module__P7A78q__subFeatureBlockHeader">
                    <p className="real-estate-mission-module__P7A78q__subFeatureBlockTitle">
                      Take a break from the stock market. You deserve it
                    </p>
                  </span>
                  <p className="real-estate-mission-module__P7A78q__subFeatureBlockDescription">
                    Historically, private real estate has not been directly
                    correlated with the stock market, which may mitigate your
                    exposure to market volatility and may improve portfolio
                    stability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FaqSection type="Real estate" questions={FAQS.REAL_ESTATE} />
    </main>
  );
}
