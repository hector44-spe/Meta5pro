"use client";

import React from "react";
import Link from "next/link";
import CountUp from "@/components/CountUp/CountUp";
import FaqSection from "@/components/FaqSection/FaqSection";
import { FAQS } from "@/data/faqs";

export default function CryptoPage() {
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
        <section className="crypto-module__qTDcTa__hero">
          <div className="crypto-module__qTDcTa__lockup">
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
                <p className="pill-module__qX7Pgq__pillText">Crypto</p>
              </div>
            </div>
            <h2
              className="crypto-module__qTDcTa__lockupTitle stagger-1"
              data-animate="true"
            >
              Trade cryptocurrencies{" "}
              <span
                style={{ display: "inline-block" }}
                className="stagger-2"
                data-animate="true"
              >
                on our platform
              </span>
            </h2>
            <p
              className="crypto-module__qTDcTa__lockupSubtext inter-alts stagger-3"
              data-animate="true"
            >
              Start trading cryptocurrencies quickly, easily and safely from
              wherever you are, in just seconds.
            </p>
            <div
              className="crypto-module__qTDcTa__lockupButtons stagger-4"
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
          <div className="crypto-module__qTDcTa__radialMask"></div>
          <div
            className="crypto-module__qTDcTa__cryptoImgContainer stagger-5"
            data-animate="true"
          >
            <div className="crypto-module__qTDcTa__cryptoImgWrapper">
              <img
                alt="crypto illustration"
                loading="lazy"
                width="832.01"
                height="402.6"
                decoding="async"
                data-nimg="1"
                className="crypto-module__qTDcTa__cryptoImg"
                style={{ color: "transparent" }}
                src="/assets/imgs/crypto.svg"
              />
            </div>
            <div className="crypto-module__qTDcTa__cryptoGridWrapper">
              <img
                alt="grid background"
                loading="lazy"
                width="1581"
                height="1097"
                decoding="async"
                data-nimg="1"
                className="crypto-module__qTDcTa__cryptoGrid"
                style={{ color: "transparent" }}
                src="/assets/imgs/flat-grid.svg"
              />
            </div>
          </div>
        </section>
      </div>
      <section className="crypto-module__41ZcWa__missionContainer">
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
        <div className="crypto-module__41ZcWa__content">
          <div className="crypto-module__41ZcWa__contentWrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 300 300"
              className="crypto-module__41ZcWa__coin"
            >
              <path
                fill="url(#staking_svg__a)"
                d="M101.411 54.184c-23.7-6.313-43.954-5.114-59.194 2.143l-2.729-4.01-9.782 12.309c-16.814 15.121-22.9 41.209-13.977 74.302 17.257 64.004 84.12 129.973 148.175 147.036 64.057 17.062 102.94-20.74 85.683-84.745-17.257-64.004-84.119-129.972-148.176-147.035"
              ></path>
              <path
                fill="url(#staking_svg__b)"
                d="M103.996 49.577c-23.557-6.274-43.709-5.128-58.916 2.011l-3.482-5.194-17.95 22.374v1.417c-9.984 15.49-12.503 37.553-5.335 64.137 17.258 64.004 84.121 129.973 148.177 147.035 64.056 17.063 102.939-20.74 85.682-84.744S168.052 66.64 103.996 49.577"
              ></path>
              <rect
                width="240.057"
                height="242.013"
                fill="url(#staking_svg__c)"
                rx="120.029"
                transform="matrix(.26033 .96552 -.9663 -.25739 233.859 68.22)"
              />
              <rect
                width="240.027"
                height="241.308"
                x="-0.812"
                y="0.814"
                fill="url(#staking_svg__d)"
                rx="120.013"
                transform="matrix(.26033 .96552 -.9663 -.25739 237.102 64.51)"
              />
              <rect
                width="240.027"
                height="241.308"
                x="-0.812"
                y="0.814"
                stroke="url(#staking_svg__e)"
                strokeWidth="2.3"
                rx="120.013"
                transform="matrix(.26033 .96552 -.9663 -.25739 237.102 64.51)"
              />
              <rect
                width="240.027"
                height="241.308"
                x="-0.812"
                y="0.814"
                stroke="url(#staking_svg__f)"
                strokeWidth="2.3"
                rx="120.013"
                transform="matrix(.26033 .96552 -.9663 -.25739 237.102 64.51)"
              />
              <g filter="url(#staking_svg__g)">
                <path
                  fill="url(#staking_svg__h)"
                  d="m132.047 88.351.424 2.295 18.393 35.372 9.052 3.291 32.545 10.319z"
                ></path>
              </g>
              <g filter="url(#staking_svg__i)">
                <path
                  fill="url(#staking_svg__j)"
                  d="m132.045 88.351-8.029 51.277 17.15-8.605 9.896-5.441z"
                ></path>
              </g>
              <g filter="url(#staking_svg__k)">
                <path
                  fill="url(#staking_svg__l)"
                  d="m172.702 167.951-.185.463 12.115 23.716.988 1.111 11.998-43.548z"
                ></path>
              </g>
              <g filter="url(#staking_svg__m)">
                <path
                  fill="url(#staking_svg__n)"
                  d="m185.623 193.241-12.919-25.29-43.548-18.258z"
                ></path>
              </g>
              <g filter="url(#staking_svg__o)">
                <path
                  fill="url(#staking_svg__p)"
                  d="m167.573 157.896 24.89-18.267-41.396-14.047z"
                ></path>
              </g>
              <g filter="url(#staking_svg__q)">
                <path
                  fill="url(#staking_svg__r)"
                  d="m124.017 139.628 43.551 18.267-16.506-32.314z"
                ></path>
              </g>
              <defs>
                <linearGradient
                  id="staking_svg__a"
                  x1="162.298"
                  x2="-40.32"
                  y1="282.092"
                  y2="61.248"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.03" />
                  <stop offset="0.069" stopColor="#000b72" />
                  <stop offset="0.117" stopColor="#232d85" />
                  <stop offset="0.358" stopColor="#8a6cff" />
                  <stop offset="0.532" stopColor="#424592" />
                  <stop offset="0.558" stopColor="#9695df" />
                  <stop offset="0.585" stopColor="#464493" />
                  <stop offset="0.626" stopColor="#352980" />
                  <stop offset="0.677" stopColor="#181757" />
                  <stop offset="0.725" stopColor="#4536a5" />
                  <stop offset="0.765" stopColor="#9b93f3" />
                  <stop offset="0.812" stopColor="#8a6cff" />
                  <stop offset="0.832" stopColor="#c3b4ff" />
                  <stop offset="0.84" stopColor="#fff" />
                </linearGradient>
                <linearGradient
                  id="staking_svg__b"
                  x1="189.75"
                  x2="-38.747"
                  y1="303.026"
                  y2="55.69"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.03" />
                  <stop offset="0.069" stopColor="#000b72" />
                  <stop offset="0.117" stopColor="#232d85" />
                  <stop offset="0.358" stopColor="#8a6cff" />
                  <stop offset="0.532" stopColor="#424592" />
                  <stop offset="0.558" stopColor="#9695df" />
                  <stop offset="0.585" stopColor="#464493" />
                  <stop offset="0.626" stopColor="#352980" />
                  <stop offset="0.677" stopColor="#181757" />
                  <stop offset="0.725" stopColor="#4536a5" />
                  <stop offset="0.765" stopColor="#9b93f3" />
                  <stop offset="0.812" stopColor="#8a6cff" />
                  <stop offset="0.832" stopColor="#c3b4ff" />
                  <stop offset="0.84" stopColor="#fff" />
                </linearGradient>
                <linearGradient
                  id="staking_svg__c"
                  x1="209.44"
                  x2="62.272"
                  y1="88.115"
                  y2="254.432"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.03" />
                  <stop offset="0.069" stopColor="#000b72" />
                  <stop offset="0.117" stopColor="#232d85" />
                  <stop offset="0.532" stopColor="#424592" />
                  <stop offset="0.558" stopColor="#7776ac" />
                  <stop offset="0.585" stopColor="#464493" />
                  <stop offset="0.626" stopColor="#352980" />
                  <stop offset="0.677" stopColor="#181757" />
                  <stop offset="0.725" stopColor="#4536a5" />
                  <stop offset="0.765" stopColor="#9b93f3" />
                  <stop offset="0.812" stopColor="#8a6cff" />
                  <stop offset="0.879" stopColor="#bebbff" />
                  <stop offset="0.914" stopColor="#d3d4ff" />
                  <stop offset="0.932" stopColor="#fff" />
                </linearGradient>
                <linearGradient
                  id="staking_svg__e"
                  x1="195.698"
                  x2="245.59"
                  y1="109.724"
                  y2="79.081"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#5b53be" stopOpacity="0" />
                  <stop offset="1" stopColor="#ccc8ff" />
                </linearGradient>
                <linearGradient
                  id="staking_svg__f"
                  x1="10.001"
                  x2="86.198"
                  y1="58.692"
                  y2="92.074"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#fff" />
                  <stop offset="0.398" stopColor="#ccc8ff" />
                  <stop offset="1" stopColor="#5b53be" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="staking_svg__h"
                  x1="164.118"
                  x2="143.474"
                  y1="120.096"
                  y2="73.641"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#fff" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="staking_svg__j"
                  x1="142.783"
                  x2="124.198"
                  y1="124.044"
                  y2="92.743"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#fff" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="staking_svg__l"
                  x1="198.387"
                  x2="194.826"
                  y1="167.805"
                  y2="149.885"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#fff" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                  id="staking_svg__n"
                  x1="140.52"
                  x2="169.143"
                  y1="155.631"
                  y2="192.755"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#fff" stopOpacity="0.6" />
                  <stop offset="1" stopColor="#fff" />
                </linearGradient>
                <linearGradient
                  id="staking_svg__p"
                  x1="170.26"
                  x2="157.923"
                  y1="156.618"
                  y2="123.857"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#fff" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient
                  id="staking_svg__r"
                  x1="154.744"
                  x2="143.065"
                  y1="150.695"
                  y2="116.271"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#fff" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <filter
                  id="staking_svg__g"
                  width="60.414"
                  height="52.277"
                  x="132.047"
                  y="88.351"
                  colorInterpolationFilters="sRGB"
                  filterUnits="userSpaceOnUse"
                >
                  <feFlood
                    floodOpacity="0"
                    result="BackgroundImageFix"
                  ></feFlood>
                  <feBlend
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  ></feColorMatrix>
                  <feOffset dy="3"></feOffset>
                  <feGaussianBlur stdDeviation="0.5"></feGaussianBlur>
                  <feComposite
                    in2="hardAlpha"
                    k2="-1"
                    k3="1"
                    operator="arithmetic"
                  ></feComposite>
                  <feColorMatrix values="0 0 0 0 0.329167 0 0 0 0 0.344412 0 0 0 0 1 0 0 0 1 0"></feColorMatrix>
                  <feBlend
                    in2="shape"
                    result="effect1_innerShadow_789_25887"
                  ></feBlend>
                </filter>
                <filter
                  id="staking_svg__i"
                  width="27.046"
                  height="52.277"
                  x="124.016"
                  y="88.351"
                  colorInterpolationFilters="sRGB"
                  filterUnits="userSpaceOnUse"
                >
                  <feFlood
                    floodOpacity="0"
                    result="BackgroundImageFix"
                  ></feFlood>
                  <feBlend
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  ></feColorMatrix>
                  <feOffset dy="3"></feOffset>
                  <feGaussianBlur stdDeviation="0.5"></feGaussianBlur>
                  <feComposite
                    in2="hardAlpha"
                    k2="-1"
                    k3="1"
                    operator="arithmetic"
                  ></feComposite>
                  <feColorMatrix values="0 0 0 0 0.329167 0 0 0 0 0.344412 0 0 0 0 1 0 0 0 1 0"></feColorMatrix>
                  <feBlend
                    in2="shape"
                    result="effect1_innerShadow_789_25887"
                  ></feBlend>
                </filter>
                <filter
                  id="staking_svg__k"
                  width="25.1"
                  height="45.549"
                  x="172.517"
                  y="149.693"
                  colorInterpolationFilters="sRGB"
                  filterUnits="userSpaceOnUse"
                >
                  <feFlood
                    floodOpacity="0"
                    result="BackgroundImageFix"
                  ></feFlood>
                  <feBlend
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  ></feColorMatrix>
                  <feOffset dy="3"></feOffset>
                  <feGaussianBlur stdDeviation="1"></feGaussianBlur>
                  <feComposite
                    in2="hardAlpha"
                    k2="-1"
                    k3="1"
                    operator="arithmetic"
                  ></feComposite>
                  <feColorMatrix values="0 0 0 0 0.329412 0 0 0 0 0.345098 0 0 0 0 1 0 0 0 1 0"></feColorMatrix>
                  <feBlend
                    in2="shape"
                    result="effect1_innerShadow_789_25887"
                  ></feBlend>
                </filter>
                <filter
                  id="staking_svg__m"
                  width="56.466"
                  height="44.549"
                  x="129.156"
                  y="149.693"
                  colorInterpolationFilters="sRGB"
                  filterUnits="userSpaceOnUse"
                >
                  <feFlood
                    floodOpacity="0"
                    result="BackgroundImageFix"
                  ></feFlood>
                  <feBlend
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  ></feColorMatrix>
                  <feOffset dy="3"></feOffset>
                  <feGaussianBlur stdDeviation="0.5"></feGaussianBlur>
                  <feComposite
                    in2="hardAlpha"
                    k2="-1"
                    k3="1"
                    operator="arithmetic"
                  ></feComposite>
                  <feColorMatrix values="0 0 0 0 0.329167 0 0 0 0 0.344412 0 0 0 0 1 0 0 0 1 0"></feColorMatrix>
                  <feBlend
                    in2="shape"
                    result="effect1_innerShadow_789_25887"
                  ></feBlend>
                </filter>
                <filter
                  id="staking_svg__o"
                  width="41.396"
                  height="33.314"
                  x="151.067"
                  y="125.582"
                  colorInterpolationFilters="sRGB"
                  filterUnits="userSpaceOnUse"
                >
                  <feFlood
                    floodOpacity="0"
                    result="BackgroundImageFix"
                  ></feFlood>
                  <feBlend
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  ></feColorMatrix>
                  <feOffset dy="3"></feOffset>
                  <feGaussianBlur stdDeviation="0.5"></feGaussianBlur>
                  <feComposite
                    in2="hardAlpha"
                    k2="-1"
                    k3="1"
                    operator="arithmetic"
                  ></feComposite>
                  <feColorMatrix values="0 0 0 0 0.329167 0 0 0 0 0.344412 0 0 0 0 1 0 0 0 1 0"></feColorMatrix>
                  <feBlend
                    in2="shape"
                    result="effect1_innerShadow_789_25887"
                  ></feBlend>
                </filter>
                <filter
                  id="staking_svg__q"
                  width="44.552"
                  height="33.314"
                  x="123.017"
                  y="125.581"
                  colorInterpolationFilters="sRGB"
                  filterUnits="userSpaceOnUse"
                >
                  <feFlood
                    floodOpacity="0"
                    result="BackgroundImageFix"
                  ></feFlood>
                  <feBlend
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feColorMatrix
                    in="SourceAlpha"
                    result="hardAlpha"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  ></feColorMatrix>
                  <feOffset dx="-1" dy="3"></feOffset>
                  <feGaussianBlur stdDeviation="0.5"></feGaussianBlur>
                  <feComposite
                    in2="hardAlpha"
                    k2="-1"
                    k3="1"
                    operator="arithmetic"
                  ></feComposite>
                  <feColorMatrix values="0 0 0 0 0.329167 0 0 0 0 0.344412 0 0 0 0 1 0 0 0 1 0"></feColorMatrix>
                  <feBlend
                    in2="shape"
                    result="effect1_innerShadow_789_25887"
                  ></feBlend>
                </filter>
                <radialGradient
                  id="staking_svg__d"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientTransform="matrix(134.923 -221.248 680.947 567.657 -3.715 173.425)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#fff" />
                  <stop offset="0.134" stopColor="#c8caff" />
                  <stop offset="0.332" stopColor="#9b84ff" />
                  <stop offset="0.519" stopColor="#6e5ad5" />
                  <stop offset="0.717" stopColor="#221b8f" />
                  <stop offset="0.888" stopColor="#060954" />
                  <stop offset="1" />
                </radialGradient>
              </defs>
            </svg>
            <div className="crypto-module__41ZcWa__contentLeft">
              <p className="crypto-module__41ZcWa__contentLeftTitle">
                The only platform you need to trade cryptocurrencies
              </p>
              <div className="crypto-module__41ZcWa__contentLeftStats">
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
                  <div className="crypto-module__41ZcWa__contentLeftStat">
                    <p className="crypto-module__41ZcWa__contentLeftStatValue">
                      <CountUp end={78.4} suffix="%" decimals={1} />
                    </p>
                    <p className="crypto-module__41ZcWa__contentLeftStatTitle">
                      Win Rate
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
                  <div className="crypto-module__41ZcWa__contentLeftStat">
                    <p className="crypto-module__41ZcWa__contentLeftStatValue">
                      <CountUp
                        end={5640}
                        suffix="+"
                        separator=","
                        decimals={0}
                      />
                    </p>
                    <p className="crypto-module__41ZcWa__contentLeftStatTitle">
                      Active traders
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
                  <div className="crypto-module__41ZcWa__contentLeftStat">
                    <p className="crypto-module__41ZcWa__contentLeftStatValue">
                      <CountUp end={4.8} suffix="/5" decimals={1} />
                    </p>
                    <p className="crypto-module__41ZcWa__contentLeftStatTitle">
                      Excellent Rating
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="crypto-module__41ZcWa__contentRight">
              <p className="crypto-module__41ZcWa__contentRightText">
                Enjoy trading and earning from a wide range of cryptocurrencies
                on our state-of-the-art platform. With access to real-time
                market data, comprehensive analysis tools, and dedicated
                customer support, we provide everything you need to navigate the
                dynamic world of digital currencies. Whether you're a seasoned
                trader or just starting out, our user-friendly interface and
                educational resources make it easy for you to engage with the
                crypto market. Join us and discover the potential for growth and
                innovation in this exciting financial frontier.
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
      <FaqSection type="Crypto" questions={FAQS.CRYPTO} />
    </main>
  );
}
