"use client";

import React from "react";
import Link from "next/link";
import FaqSection from "@/components/FaqSection/FaqSection";
import LightRays from "@/components/LightRays/LightRays";
import { FAQS } from "@/data/faqs";

export default function StakingPage() {
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
        <section className="staking-module__8ZBEmW__hero">
          <div className="staking-module__8ZBEmW__lockup">
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
                        id="_R_canpfjb_"
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
                      stroke="url(#_R_canpfjb_)"
                      strokeWidth="1"
                      strokeDasharray="6 8"
                      className="pill-module__qX7Pgq__rotatingStroke"
                    />
                  </svg>
                </div>
                <p className="pill-module__qX7Pgq__pillText">Staking</p>
              </div>
            </div>
            <h2
              className="staking-module__8ZBEmW__lockupTitle stagger-1"
              data-animate="true"
            >
              Stake your crypto{" "}
              <span
                style={{ display: "inline-block" }}
                className="stagger-2"
                data-animate="true"
              >
                and earn rewards
              </span>
            </h2>
            <p
              className="staking-module__8ZBEmW__lockupSubtext inter-alts stagger-3"
              data-animate="true"
            >
              Earn daily reward by staking your crypto
            </p>
            <div
              className="staking-module__8ZBEmW__lockupButtons stagger-4"
              data-animate="true"
            >
              <Link
                className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__primary"
                href="/dashboard?action=stake"
              >
                <div className="button-module__Q_cxDG__overlay"></div>
                <p className="button-module__Q_cxDG__buttonText inter-alts">
                  Get started
                </p>
              </Link>
            </div>
            <div className="stagger-5" data-animate="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 300 300"
                className="staking-module__8ZBEmW__coin"
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
            </div>
          </div>
        </section>
      </div>
      <section className="staking-module__2GPFPG__container">
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
        <div className="staking-module__2GPFPG__content">
          <div className="staking-module__2GPFPG__contentWrapper">
            <div className="staking-module__2GPFPG__introSection">
              <p className="staking-module__2GPFPG__introSectionTitle mixed-text">
                Earn weekly staking rewards on your crypto. Easy, fast and
                reliable.
              </p>
              <div className="staking-module__2GPFPG__introSectionButtonWrapper">
                <Link
                  className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__primary"
                  href="/dashboard?action=stake"
                >
                  <div className="button-module__Q_cxDG__overlay"></div>
                  <p className="button-module__Q_cxDG__buttonText inter-alts">
                    Get started
                  </p>
                </Link>
              </div>
            </div>
            <div className="section-divider"></div>
            <div className="staking-module__2GPFPG__featureDropBlock">
              <svg
                className="staking-module__2GPFPG__featureDropBlockBorder staking-module__2GPFPG__featureDropBlockBorderTop"
                viewBox="0 0 1000 1"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0"
                  y1="0.5"
                  x2="1000"
                  y2="0.5"
                  className="staking-module__2GPFPG__rotatingBorderStroke"
                />
              </svg>
              <svg
                className="staking-module__2GPFPG__featureDropBlockBorder staking-module__2GPFPG__featureDropBlockBorderBottom"
                viewBox="0 0 1000 1"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  x1="0"
                  y1="0.5"
                  x2="1000"
                  y2="0.5"
                  className="staking-module__2GPFPG__rotatingBorderStroke"
                />
              </svg>
              <div className="main-module__R0_zcG__mainFeatureBlock">
                <div className="main-module__R0_zcG__mainFeatureBlockWrapper">
                  <div className="main-module__R0_zcG__mainFeatureBlockTitleWrapper">
                    <p className="main-module__R0_zcG__mainFeatureBlockTitle">
                      Stake eligible asset
                    </p>
                  </div>
                  <p className="main-module__R0_zcG__mainFeatureBlockDesc">
                    Simply fund your account with any eligible staking asset, to
                    auto earn rewards.
                  </p>
                </div>
                <div
                  className="main-module__R0_zcG__mainFeatureBlockCard"
                  style={{
                    transform:
                      "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                    transition: "transform 0.1s ease-out",
                  }}
                >
                  <div className="staking-module__2GPFPG__mainBlockFeatureCard">
                    <div className="staking-pools-module__4c1p2a__leverageContainer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 414 221"
                        className="staking-pools-module__4c1p2a__image"
                      >
                        <path
                          fill="#fff"
                          d="M13.119 15V4.818h3.629q1.188 0 1.969.433.78.432 1.168 1.183.387.746.388 1.68 0 .94-.393 1.69-.388.746-1.173 1.184-.78.432-1.964.433h-2.496v-1.303h2.357q.75 0 1.218-.259.467-.263.686-.716.219-.451.219-1.029t-.22-1.024a1.57 1.57 0 0 0-.69-.7q-.468-.254-1.233-.254h-1.93V15zm11.906.154q-1.074 0-1.874-.492a3.3 3.3 0 0 1-1.243-1.377q-.442-.886-.442-2.068 0-1.189.442-2.079a3.3 3.3 0 0 1 1.243-1.382q.8-.492 1.874-.492t1.875.492q.8.494 1.242 1.382.444.891.443 2.079 0 1.183-.443 2.068a3.3 3.3 0 0 1-1.242 1.377q-.801.492-1.875.492m.005-1.248q.696 0 1.154-.368.457-.367.676-.98.224-.61.224-1.346 0-.732-.224-1.343a2.2 2.2 0 0 0-.676-.989q-.458-.373-1.154-.373-.7 0-1.163.373a2.2 2.2 0 0 0-.681.99 4 4 0 0 0-.219 1.342q0 .736.219 1.347.224.611.68.98.464.367 1.164.367m8.38 1.248q-1.073 0-1.873-.492a3.3 3.3 0 0 1-1.243-1.377q-.443-.886-.443-2.068 0-1.189.443-2.079a3.3 3.3 0 0 1 1.242-1.382q.801-.492 1.875-.492t1.874.492q.8.494 1.243 1.382.443.891.443 2.079 0 1.183-.443 2.068a3.3 3.3 0 0 1-1.243 1.377q-.8.492-1.874.492m.006-1.248q.696 0 1.153-.368.457-.367.676-.98.224-.61.224-1.346 0-.732-.224-1.343a2.2 2.2 0 0 0-.676-.989q-.458-.373-1.153-.373-.7 0-1.164.373a2.2 2.2 0 0 0-.68.99 4 4 0 0 0-.22 1.342q0 .736.22 1.347.224.611.68.98.464.367 1.164.367m6.65-9.088V15H38.58V4.818zm7.672 4.41-1.347.239a1.6 1.6 0 0 0-.268-.493 1.3 1.3 0 0 0-.488-.382q-.308-.15-.77-.15-.631 0-1.054.284-.423.278-.423.72 0 .383.284.617t.914.383l1.214.278q1.054.244 1.57.751.518.507.518 1.318 0 .686-.398 1.223-.393.531-1.099.835-.701.303-1.626.303-1.282 0-2.093-.547-.81-.552-.994-1.566l1.437-.219q.134.562.552.85.417.284 1.088.284.731 0 1.169-.303.437-.309.437-.751a.78.78 0 0 0-.268-.602q-.264-.243-.81-.368l-1.293-.283q-1.07-.243-1.581-.775-.507-.532-.507-1.348 0-.675.378-1.183.378-.507 1.044-.79.666-.29 1.526-.289 1.238 0 1.949.537.71.532.94 1.427"
                        ></path>
                        <rect
                          width="391"
                          height="36"
                          x="11"
                          y="33"
                          fill="#fff"
                          fillOpacity="0.025"
                          rx="5"
                        />
                        <g clipPath="url(#staking-pools_svg__a)">
                          <path
                            fill="#f7931a"
                            d="M34.759 52.935a7.998 7.998 0 1 1-15.52-3.87 7.998 7.998 0 0 1 15.52 3.87"
                          ></path>
                          <path
                            fill="#fff"
                            d="M30.527 49.86c.159-1.064-.652-1.637-1.76-2.018l.36-1.443-.878-.218-.35 1.404q-.348-.086-.704-.166l.353-1.413-.877-.219-.36 1.442a29 29 0 0 1-.56-.132v-.005l-1.21-.302-.234.938s.652.15.638.158c.355.089.42.324.409.51l-.41 1.644a1 1 0 0 1 .092.029l-.093-.023-.574 2.302c-.044.108-.154.27-.402.208.008.013-.639-.16-.639-.16l-.435 1.006 1.142.285.626.161-.363 1.459.877.218.36-1.443q.358.097.699.182l-.359 1.436.878.219.363-1.456c1.497.283 2.623.17 3.097-1.185.381-1.09-.02-1.719-.807-2.129.574-.132 1.006-.51 1.12-1.289m-2.006 2.813c-.271 1.09-2.107.5-2.702.353l.482-1.933c.595.149 2.504.443 2.22 1.58m.271-2.829c-.247.992-1.775.488-2.27.365l.437-1.753c.495.124 2.091.354 1.834 1.388"
                          ></path>
                        </g>
                        <path
                          fill="#d9d5f1"
                          d="M44.145 55.5v-9.455h3.305q.988 0 1.63.342.642.337.956.91.313.567.313 1.26 0 .609-.216 1.006-.213.397-.564.628-.345.231-.752.342v.092q.434.028.872.305.439.276.734.794.296.516.296 1.265 0 .711-.323 1.278-.324.568-1.02.9-.697.333-1.815.333zm1.145-1.016h2.271q1.122 0 1.593-.434.475-.438.475-1.061 0-.48-.244-.887a1.77 1.77 0 0 0-.697-.655q-.453-.25-1.072-.25H45.29zm0-4.284h2.123q.518 0 .933-.203.42-.203.665-.572.249-.37.249-.868 0-.624-.434-1.057-.434-.44-1.376-.439h-2.16zm7.162 5.3v-7.09h1.09v7.09zm.554-8.273a.78.78 0 0 1-.55-.217.7.7 0 0 1-.225-.521q0-.305.226-.522a.77.77 0 0 1 .55-.217q.318 0 .544.217a.7.7 0 0 1 .23.522.7.7 0 0 1-.23.521.76.76 0 0 1-.545.217m5.615 1.182v.923h-3.675v-.923zm-2.604-1.699h1.09v6.759q0 .46.134.692.138.227.35.305.217.075.458.074.18 0 .295-.019l.185-.037.221.98a2 2 0 0 1-.309.082q-.198.046-.503.046-.462 0-.905-.198a1.8 1.8 0 0 1-.73-.605q-.285-.405-.286-1.025zm7.047 8.938q-.997 0-1.717-.471a3.07 3.07 0 0 1-1.108-1.297q-.388-.826-.388-1.889 0-1.08.397-1.906.402-.83 1.117-1.297.72-.471 1.68-.471.75 0 1.349.277.6.276.983.775t.476 1.164h-1.09a1.7 1.7 0 0 0-.554-.859q-.425-.379-1.145-.379-.637 0-1.117.333a2.17 2.17 0 0 0-.743.928q-.263.595-.263 1.399 0 .82.258 1.43.264.61.739.947.48.337 1.126.337.425 0 .771-.148.347-.147.587-.424.24-.278.341-.665h1.09a2.5 2.5 0 0 1-.457 1.13q-.36.5-.956.795-.59.29-1.376.29m7.262 0q-.96 0-1.685-.457a3.1 3.1 0 0 1-1.126-1.28q-.402-.82-.402-1.92 0-1.107.402-1.934a3.1 3.1 0 0 1 1.126-1.283q.725-.457 1.685-.457t1.68.457q.726.456 1.127 1.283.406.827.406 1.935 0 1.098-.406 1.92a3.06 3.06 0 0 1-1.126 1.279q-.72.457-1.68.457m0-.979q.729 0 1.2-.374t.698-.983.226-1.32-.227-1.325-.697-.993-1.2-.379-1.2.379a2.23 2.23 0 0 0-.697.992q-.227.615-.227 1.326 0 .71.227 1.32.225.61.697.983.471.375 1.2.374m4.876.831v-7.09h1.09v7.09zm.554-8.273a.78.78 0 0 1-.55-.217.7.7 0 0 1-.225-.521q0-.305.226-.522a.77.77 0 0 1 .55-.217q.318 0 .544.217a.7.7 0 0 1 .23.522.7.7 0 0 1-.23.521.76.76 0 0 1-.545.217m3.62 4.007V55.5h-1.089v-7.09h1.053v1.107h.092q.25-.54.757-.868.508-.332 1.311-.332.72 0 1.26.295.54.291.84.887.3.59.3 1.495V55.5h-1.089v-4.432q0-.835-.434-1.302-.434-.47-1.19-.47-.523 0-.933.226-.407.225-.642.66-.235.434-.235 1.052"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M94.145 55.5v-9.455h3.305q.988 0 1.63.342.641.337.956.91.313.567.313 1.26 0 .609-.217 1.006a1.7 1.7 0 0 1-.563.628q-.345.231-.752.342v.092q.434.028.872.305.439.276.734.794.296.516.296 1.265 0 .711-.323 1.278-.324.568-1.02.9-.698.333-1.815.333zm1.145-1.016h2.271q1.122 0 1.593-.434.475-.438.475-1.061 0-.48-.244-.887a1.77 1.77 0 0 0-.698-.655q-.452-.25-1.07-.25H95.29zm0-4.284h2.123q.518 0 .933-.203.42-.203.665-.572.249-.37.249-.868 0-.624-.434-1.057-.435-.44-1.376-.439h-2.16zm6.793-3.139v-1.016h7.091v1.016h-2.973V55.5h-1.145v-8.439zM118.155 49h-1.145a2.37 2.37 0 0 0-.965-1.496 2.6 2.6 0 0 0-.789-.387 3.2 3.2 0 0 0-.905-.13q-.858 0-1.556.434-.692.435-1.103 1.279-.406.844-.406 2.073 0 1.228.406 2.072.411.846 1.103 1.28.698.433 1.556.433.471 0 .905-.129a2.7 2.7 0 0 0 .789-.383 2.42 2.42 0 0 0 .965-1.5h1.145a3.8 3.8 0 0 1-.471 1.297 3.5 3.5 0 0 1-.849.974 3.7 3.7 0 0 1-1.14.605 4.3 4.3 0 0 1-1.344.207q-1.209 0-2.151-.59-.942-.592-1.482-1.681-.54-1.09-.54-2.585 0-1.496.54-2.586t1.482-1.68 2.151-.59q.716 0 1.344.207.632.207 1.14.61.508.396.849.969.342.567.471 1.297"
                        ></path>
                        <path
                          fill="#01b28b"
                          d="M335.933 55.63a3.25 3.25 0 0 1-1.463-.324 2.7 2.7 0 0 1-1.044-.886 2.4 2.4 0 0 1-.429-1.284h1.108q.065.642.582 1.062.522.416 1.246.416.582 0 1.034-.273a1.9 1.9 0 0 0 .716-.748q.263-.48.263-1.085 0-.618-.272-1.103a2 2 0 0 0-.739-.77 2.1 2.1 0 0 0-1.076-.287 3 3 0 0 0-.891.134q-.456.135-.752.346l-1.071-.13.572-4.653h4.912v1.016h-3.951l-.333 2.788h.056q.29-.23.729-.383.438-.152.914-.152.868 0 1.547.415.683.411 1.071 1.127.392.716.392 1.634 0 .905-.406 1.616a2.97 2.97 0 0 1-1.108 1.117q-.707.406-1.607.406m9.036-5.365v1.016h-4.137v-1.016zm4.927 5.364q-.95 0-1.681-.337a2.76 2.76 0 0 1-1.131-.937 2.36 2.36 0 0 1-.401-1.366q-.005-.6.235-1.108.24-.513.656-.854.42-.346.937-.439v-.055a1.82 1.82 0 0 1-1.08-.762 2.3 2.3 0 0 1-.397-1.343q-.005-.72.364-1.288a2.57 2.57 0 0 1 1.016-.896q.651-.328 1.482-.328.822 0 1.468.328.646.327 1.015.896.375.567.379 1.288a2.34 2.34 0 0 1-.411 1.343q-.402.586-1.066.762v.055q.512.093.923.439.41.34.656.854.244.508.249 1.108-.005.765-.416 1.366-.405.596-1.131.937-.72.337-1.666.337m0-1.015q.642 0 1.108-.208t.72-.586.258-.887a1.7 1.7 0 0 0-.277-.946 1.9 1.9 0 0 0-.743-.646 2.3 2.3 0 0 0-1.066-.236q-.604 0-1.08.236a1.9 1.9 0 0 0-.744.646q-.267.412-.263.946a1.55 1.55 0 0 0 .245.887q.254.378.725.586.47.207 1.117.208m0-4.488q.507 0 .9-.203.397-.202.623-.568.227-.364.231-.854a1.57 1.57 0 0 0-.226-.835 1.47 1.47 0 0 0-.614-.554 2 2 0 0 0-.914-.199 2.05 2.05 0 0 0-.928.199q-.397.195-.614.554a1.53 1.53 0 0 0-.212.835q-.005.49.216.855.226.364.624.567.396.203.914.203m9.802 3.601v-.498q0-.517.212-.947.217-.434.628-.692.415-.263 1.006-.263.6 0 1.007.263.406.258.614.692.207.43.207.947v.498q0 .517-.212.951a1.67 1.67 0 0 1-.619.693q-.406.258-.997.258-.6 0-1.011-.258a1.7 1.7 0 0 1-.623-.693 2.1 2.1 0 0 1-.212-.95m.941-.498v.498q0 .43.204.771.203.337.701.337.484 0 .684-.337.203-.34.203-.77v-.5q0-.428-.194-.766-.194-.34-.693-.341-.484 0-.697.341-.207.337-.208.767m-5.65-4.912v-.499q0-.516.212-.946.217-.434.628-.693.416-.263 1.006-.263.601 0 1.007.263.406.26.614.693.207.43.208.946v.499q0 .516-.213.95a1.67 1.67 0 0 1-.618.693q-.407.26-.998.259-.6 0-1.011-.259a1.7 1.7 0 0 1-.623-.692 2.14 2.14 0 0 1-.212-.951m.942-.499v.499q0 .43.203.77.203.338.701.338.485 0 .684-.337.203-.342.203-.771v-.499q0-.429-.194-.766-.194-.342-.693-.342-.484 0-.697.342-.207.336-.207.766m-.591 7.682 6.5-9.455h1.052l-6.5 9.455zm14.311 0h-1.2l3.471-9.455h1.182l3.472 9.455h-1.201l-2.825-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zm7.954 3.693v-9.455h3.195q1.113 0 1.819.402.711.397 1.052 1.076.342.678.342 1.514 0 .835-.342 1.519a2.53 2.53 0 0 1-1.043 1.09q-.706.4-1.81.4h-2.289v-1.015h2.252q.762 0 1.224-.263a1.57 1.57 0 0 0 .669-.71q.213-.453.212-1.021 0-.568-.212-1.016a1.5 1.5 0 0 0-.674-.701q-.466-.26-1.237-.259h-2.013V55.5zm8.252 0v-9.455h3.195q1.107 0 1.819.379.71.375 1.052 1.03.342.656.342 1.49 0 .837-.342 1.482-.342.647-1.048 1.016-.706.365-1.805.365h-2.585v-1.034h2.548q.757 0 1.219-.222.467-.222.674-.628.212-.411.212-.978 0-.569-.212-.993a1.45 1.45 0 0 0-.679-.655q-.465-.236-1.232-.236h-2.013V55.5zm4.45-4.247 2.327 4.247h-1.329l-2.29-4.247z"
                        ></path>
                        <g clipPath="url(#staking-pools_svg__b)">
                          <path
                            fill="#23292f"
                            d="M27 97a8 8 0 1 0 0-16 8 8 0 0 0 0 16"
                          ></path>
                          <path
                            fill="#fff"
                            d="M30.77 93h1.542l-3.208-2.877c-1.162-1.041-3.046-1.041-4.208 0L21.686 93h1.543l2.437-2.186A2 2 0 0 1 27 90.32c.498 0 .977.178 1.332.495zm-7.56-8h-1.544l3.23 2.895c1.162 1.041 3.045 1.041 4.208 0L32.334 85H30.79l-2.458 2.203a2 2 0 0 1-1.332.495c-.499 0-.978-.178-1.333-.495z"
                          ></path>
                        </g>
                        <path
                          fill="#d9d5f1"
                          d="M44.145 93.5v-9.454h3.194q1.109 0 1.82.378.71.374 1.052 1.03t.342 1.49q0 .837-.342 1.483-.342.645-1.048 1.015-.706.365-1.805.365h-2.585v-1.034h2.548q.757 0 1.219-.222a1.4 1.4 0 0 0 .674-.628q.212-.411.212-.978 0-.569-.212-.993a1.45 1.45 0 0 0-.679-.656q-.466-.234-1.232-.235H45.29V93.5zm4.45-4.247 2.327 4.247h-1.33l-2.29-4.247zm3.718 4.247v-7.09h1.09v7.09zm.554-8.273a.78.78 0 0 1-.55-.217.7.7 0 0 1-.226-.521q0-.305.226-.522a.77.77 0 0 1 .55-.217q.319 0 .544.217a.7.7 0 0 1 .231.522.7.7 0 0 1-.23.521.76.76 0 0 1-.545.217m2.53 10.932v-9.75h1.053v1.126h.13q.12-.185.332-.47.216-.291.618-.517.406-.231 1.1-.231.894 0 1.578.448.682.447 1.066 1.27.383.82.383 1.938 0 1.127-.383 1.953-.383.822-1.062 1.274-.678.448-1.565.448-.683 0-1.094-.227a2 2 0 0 1-.632-.521 7 7 0 0 1-.342-.49h-.092v3.75zm1.072-6.205q0 .804.235 1.418.235.61.688.955.451.342 1.108.342.682 0 1.14-.36.462-.365.693-.979.235-.618.235-1.376a3.7 3.7 0 0 0-.23-1.347 2.1 2.1 0 0 0-.689-.956q-.456-.355-1.15-.355-.664 0-1.116.336-.453.333-.684.933-.23.595-.23 1.39m6.85 6.205v-9.75h1.053v1.126h.13q.12-.185.332-.47.216-.291.618-.517.406-.231 1.099-.231.895 0 1.579.448.682.447 1.066 1.27.383.82.383 1.938 0 1.127-.383 1.953-.383.822-1.062 1.274-.678.448-1.565.448-.683 0-1.094-.227a2 2 0 0 1-.632-.521 7 7 0 0 1-.342-.49h-.092v3.75zm1.071-6.205q0 .804.236 1.418.235.61.688.955.451.342 1.108.342.682 0 1.14-.36.462-.365.692-.979a3.8 3.8 0 0 0 .236-1.376q0-.747-.23-1.347a2.1 2.1 0 0 0-.689-.956q-.457-.355-1.15-.355-.664 0-1.117.336-.452.333-.683.933-.23.595-.23 1.39m7.94-5.908V93.5h-1.089v-9.454zm4.97 9.602q-1.025 0-1.769-.453a3.04 3.04 0 0 1-1.14-1.274q-.397-.822-.397-1.911 0-1.09.397-1.92.402-.837 1.117-1.302.72-.471 1.68-.471.554 0 1.095.184.54.185.983.6.442.412.706 1.09.263.68.263 1.671v.462H74.77v-.942h4.358q0-.6-.24-1.07a1.8 1.8 0 0 0-.674-.744 1.9 1.9 0 0 0-1.024-.272q-.651 0-1.127.323-.47.318-.725.83a2.44 2.44 0 0 0-.254 1.1v.627q0 .804.277 1.362.282.554.78.845.5.285 1.16.286.428 0 .775-.12a1.7 1.7 0 0 0 .605-.37q.254-.249.392-.618l1.053.295q-.166.537-.559.942a2.7 2.7 0 0 1-.97.628 3.6 3.6 0 0 1-1.297.222"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="m90.699 84.046 2.437 3.933h.074l2.438-3.933h1.348l-2.973 4.727 2.973 4.727h-1.348l-2.438-3.86h-.074L90.7 93.5h-1.35l3.047-4.727-3.047-4.727zm7.787 9.454v-9.454h3.194q1.108 0 1.819.378.711.374 1.053 1.03t.341 1.49q0 .837-.341 1.483-.342.645-1.048 1.015-.707.365-1.805.365h-2.585v-1.034h2.548q.757 0 1.219-.222.465-.222.674-.628.212-.411.212-.978a2.2 2.2 0 0 0-.212-.993 1.45 1.45 0 0 0-.679-.656q-.466-.234-1.233-.235h-2.012V93.5zm4.45-4.247 2.327 4.247h-1.33l-2.29-4.247zm3.865 4.247v-9.454h3.195q1.112 0 1.819.401.71.397 1.052 1.076.342.678.342 1.514 0 .835-.342 1.519a2.53 2.53 0 0 1-1.043 1.09q-.706.4-1.81.4h-2.29v-1.015h2.253q.762 0 1.224-.263a1.57 1.57 0 0 0 .669-.71q.213-.454.212-1.021 0-.568-.212-1.016a1.5 1.5 0 0 0-.674-.701q-.466-.26-1.237-.259h-2.013V93.5z"
                        ></path>
                        <path
                          fill="#01b28b"
                          d="M315.757 91.561v-.942l3.786-6.573h1.126l-3.693 6.426v.074h5.613v1.015zm4.45 1.939v-5.909h1.09V93.5zm4.481.074a.8.8 0 0 1-.587-.245.8.8 0 0 1-.244-.586.8.8 0 0 1 .244-.586.8.8 0 0 1 .587-.245.8.8 0 0 1 .586.245.8.8 0 0 1 .245.586q0 .226-.116.415a.9.9 0 0 1-.3.305.8.8 0 0 1-.415.11m5.531.055a3.25 3.25 0 0 1-1.463-.323 2.7 2.7 0 0 1-1.043-.886 2.4 2.4 0 0 1-.43-1.284h1.108q.065.642.582 1.062.522.416 1.246.416.582 0 1.034-.273a1.9 1.9 0 0 0 .716-.748q.263-.48.263-1.085 0-.618-.272-1.103a2 2 0 0 0-.739-.77 2.1 2.1 0 0 0-1.075-.287 3 3 0 0 0-.891.134q-.457.135-.753.346l-1.071-.13.572-4.652h4.912v1.015h-3.951l-.333 2.788h.056q.291-.23.729-.383.438-.152.914-.152.868 0 1.547.415.682.411 1.071 1.127.392.716.392 1.634 0 .905-.406 1.616a2.97 2.97 0 0 1-1.108 1.117q-.706.405-1.607.406m9.036-5.364v1.016h-4.136v-1.016zm4.927-4.22V93.5h-1.145v-7.793h-.074q-.065.13-.332.296-.269.162-.693.286-.424.12-.969.12v-.96q.549 0 .951-.199.402-.198.669-.466.273-.267.411-.485.143-.216.166-.254zm5.794 9.584q-1.044 0-1.778-.568-.734-.572-1.122-1.657-.387-1.089-.387-2.631 0-1.533.387-2.618.393-1.089 1.127-1.662.738-.577 1.773-.577 1.033 0 1.768.577.738.573 1.126 1.662.393 1.085.393 2.618 0 1.542-.388 2.631-.388 1.085-1.122 1.657-.734.568-1.777.568m0-1.015q1.033 0 1.606-.998.573-.996.573-2.843 0-1.229-.264-2.091-.258-.864-.747-1.316a1.65 1.65 0 0 0-1.168-.453q-1.026 0-1.602 1.011-.577 1.006-.577 2.849 0 1.228.258 2.086.258.859.743 1.307.49.448 1.178.448m9.86-.887v-.498q0-.517.213-.947a1.7 1.7 0 0 1 .628-.692q.415-.263 1.006-.263.6 0 1.006.263.407.258.614.692.208.43.208.947v.498q0 .518-.212.951a1.7 1.7 0 0 1-.619.693q-.406.258-.997.258-.6 0-1.011-.258a1.7 1.7 0 0 1-.623-.693 2.1 2.1 0 0 1-.213-.95m.942-.498v.498q0 .429.203.771.204.337.702.337.485 0 .683-.337.204-.342.203-.77v-.5q0-.428-.194-.766-.194-.34-.692-.341-.485 0-.697.341-.208.337-.208.767m-5.65-4.912v-.499q0-.516.212-.946.217-.434.628-.693.415-.263 1.006-.263.6 0 1.007.263.405.259.614.693.207.43.207.946v.499q0 .518-.212.95a1.7 1.7 0 0 1-.619.693q-.406.26-.997.259-.6 0-1.011-.259a1.7 1.7 0 0 1-.623-.692 2.1 2.1 0 0 1-.212-.951m.941-.499v.499q0 .43.203.77.204.338.702.338.485 0 .683-.337.204-.342.204-.771v-.499q0-.429-.194-.766-.194-.342-.693-.342-.484 0-.697.342-.208.337-.208.766m-.591 7.682 6.5-9.454h1.053l-6.5 9.454zm14.312 0h-1.201l3.472-9.454h1.182l3.471 9.454h-1.2l-2.825-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zm7.954 3.693v-9.454h3.194q1.113 0 1.819.401.711.397 1.053 1.076.342.678.342 1.514 0 .835-.342 1.519a2.55 2.55 0 0 1-1.043 1.09q-.706.4-1.81.4h-2.29v-1.015h2.253q.762 0 1.223-.263t.67-.71q.212-.454.212-1.021a2.35 2.35 0 0 0-.212-1.016 1.5 1.5 0 0 0-.674-.701q-.466-.26-1.237-.259h-2.013V93.5zm8.252 0v-9.454h3.194q1.108 0 1.819.378.711.374 1.053 1.03t.342 1.49q0 .837-.342 1.483-.342.645-1.048 1.015-.707.365-1.805.365h-2.585v-1.034h2.548q.757 0 1.219-.222.466-.222.674-.628.212-.411.212-.978a2.2 2.2 0 0 0-.212-.993 1.45 1.45 0 0 0-.679-.656q-.467-.234-1.232-.235h-2.013V93.5zm4.45-4.247 2.327 4.247h-1.33l-2.289-4.247z"
                        ></path>
                        <g filter="url(#staking-pools_svg__c)">
                          <rect
                            width="405.861"
                            height="37.368"
                            x="4"
                            y="108.632"
                            fill="#fff"
                            fillOpacity="0.025"
                            rx="6.176"
                            shapeRendering="crispEdges"
                          />
                          <rect
                            width="405.861"
                            height="37.368"
                            x="4"
                            y="108.632"
                            fill="#fb4780"
                            fillOpacity="0.024"
                            rx="6.176"
                            shapeRendering="crispEdges"
                          />
                          <rect
                            width="405.361"
                            height="36.868"
                            x="4.25"
                            y="108.882"
                            stroke="#fb4780"
                            strokeWidth="0.5"
                            rx="5.926"
                            shapeRendering="crispEdges"
                          />
                          <g clipPath="url(#staking-pools_svg__d)">
                            <path
                              fill="#906ee0"
                              d="M20.608 135.62a8.304 8.304 0 1 0 0-16.608 8.304 8.304 0 0 0 0 16.608"
                            ></path>
                            <mask
                              id="staking-pools_svg__e"
                              width="12"
                              height="12"
                              x="14"
                              y="121"
                              maskUnits="userSpaceOnUse"
                              style={{ maskType: "luminance" }}
                            >
                              <path
                                fill="#fff"
                                d="M25.591 121.669h-10.63v10.629h10.63z"
                              ></path>
                            </mask>
                            <g fill="#fff" mask="url(#staking-pools_svg__e)">
                              <path d="m20.275 121.669-.07.242v7.028l.07.072 3.263-1.929z"></path>
                              <path d="m20.275 121.669-3.262 5.413 3.262 1.929zm.001 7.959-.04.049v2.504l.04.117 3.264-4.597z"></path>
                              <path d="M20.275 132.298v-2.67l-3.262-1.927zm0-3.287 3.263-1.929-3.263-1.483z"></path>
                              <path d="m17.013 127.082 3.262 1.929v-3.412z"></path>
                            </g>
                          </g>
                          <path
                            fill="#d9d5f1"
                            d="M38.405 132.316v-9.814h5.923v1.054h-4.735v3.316h4.428v1.054h-4.428v3.336h4.811v1.054zm11.112-7.361v.959h-3.814v-.959zm-2.702-1.763h1.13v7.015q0 .48.14.719a.72.72 0 0 0 .364.316q.225.078.474.077.187 0 .307-.019l.191-.038.23 1.016a2.5 2.5 0 0 1-.843.134q-.48 0-.94-.206a1.87 1.87 0 0 1-.756-.628q-.297-.422-.297-1.064zm5.692 4.696v4.428h-1.13v-9.814h1.13v3.603h.096q.259-.57.776-.905.523-.34 1.39-.34.753 0 1.318.301.566.298.877.916.316.613.316 1.562v4.677h-1.13v-4.6q0-.877-.456-1.357-.45-.483-1.25-.484-.557 0-.997.235-.436.235-.69.686-.25.45-.25 1.092m9.928 4.581q-1.064 0-1.835-.469a3.16 3.16 0 0 1-1.184-1.323q-.412-.853-.412-1.984 0-1.13.412-1.993a3.25 3.25 0 0 1 1.16-1.352q.747-.488 1.744-.488.575 0 1.136.191.561.192 1.02.623.46.428.734 1.131.273.705.273 1.735v.479h-5.674v-.978h4.524a2.4 2.4 0 0 0-.25-1.111 1.9 1.9 0 0 0-.7-.772 1.96 1.96 0 0 0-1.063-.283q-.675 0-1.17.336-.488.33-.751.862a2.54 2.54 0 0 0-.264 1.141v.652q0 .834.288 1.413.291.576.81.877.516.297 1.202.297.446 0 .805-.124.364-.13.628-.384.263-.258.407-.642l1.093.307a2.4 2.4 0 0 1-.58.977 2.8 2.8 0 0 1-1.006.652q-.6.23-1.347.23m4.768-.153v-7.361h1.093v1.112h.076q.202-.546.729-.886a2.14 2.14 0 0 1 1.188-.341q.124 0 .312.005.186.004.282.015v1.15a3 3 0 0 0-.263-.043 2.5 2.5 0 0 0-.427-.034q-.537 0-.958.225a1.65 1.65 0 0 0-.9 1.5v4.658zm7.883.153q-1.064 0-1.835-.469a3.16 3.16 0 0 1-1.184-1.323q-.412-.853-.412-1.984 0-1.13.412-1.993a3.25 3.25 0 0 1 1.16-1.352q.748-.488 1.744-.488.575 0 1.135.191.561.192 1.021.623.46.428.733 1.131.274.705.273 1.735v.479H72.46v-.978h4.523q0-.622-.249-1.111a1.9 1.9 0 0 0-.7-.772 1.96 1.96 0 0 0-1.063-.283q-.675 0-1.17.336-.488.33-.752.862a2.54 2.54 0 0 0-.263 1.141v.652q0 .834.287 1.413.293.576.81.877.517.297 1.203.297.445 0 .805-.124.364-.13.628-.384.263-.258.407-.642l1.093.307a2.4 2.4 0 0 1-.58.977 2.8 2.8 0 0 1-1.007.652q-.599.23-1.346.23m9.406-3.162v-4.352h1.131v7.361h-1.13v-1.246h-.077q-.26.561-.805.954-.547.387-1.38.388-.69 0-1.227-.302a2.1 2.1 0 0 1-.844-.92q-.306-.618-.306-1.558v-4.677h1.13v4.601q0 .804.451 1.284.456.479 1.16.479.42 0 .858-.216.44-.215.737-.661.303-.445.302-1.135m3.203 3.009v-7.361h1.092v1.15h.096q.23-.589.743-.915.513-.33 1.231-.33.729 0 1.213.33.489.326.762.915h.076a2.14 2.14 0 0 1 .848-.905q.566-.34 1.357-.34.987 0 1.614.618.628.613.628 1.912v4.926h-1.13v-4.926q-.001-.814-.446-1.165a1.65 1.65 0 0 0-1.05-.35q-.775 0-1.203.47-.426.465-.426 1.179v4.792h-1.15v-5.041q0-.629-.407-1.011-.408-.389-1.05-.389-.441 0-.824.235a1.8 1.8 0 0 0-.614.652q-.23.412-.23.954v4.6z"
                          ></path>
                          <path
                            fill="#9793b2"
                            d="M108.709 132.316v-9.814h5.923v1.054h-4.735v3.316h4.428v1.054h-4.428v3.336h4.811v1.054zm7.528-8.76v-1.054h7.36v1.054h-3.086v8.76h-1.188v-8.76zm9.195 8.76v-9.814h1.188v4.37h5.233v-4.37h1.188v9.814h-1.188v-4.39h-5.233v4.39z"
                          ></path>
                          <path
                            fill="#01b28b"
                            d="M334.889 132.45q-.948 0-1.692-.326a2.9 2.9 0 0 1-1.174-.905 2.44 2.44 0 0 1-.469-1.357h1.207q.04.475.326.82.288.34.753.527.464.187 1.03.187.633 0 1.121-.221.49-.22.767-.613.278-.393.278-.91 0-.541-.269-.954a1.77 1.77 0 0 0-.785-.652q-.518-.234-1.265-.235h-.786v-1.054h.786q.584 0 1.025-.211a1.64 1.64 0 0 0 .695-.594q.254-.383.254-.901 0-.498-.221-.867a1.5 1.5 0 0 0-.623-.575 2 2 0 0 0-.939-.206q-.508 0-.958.187a1.8 1.8 0 0 0-.729.532q-.282.345-.306.833h-1.15q.029-.77.465-1.351.435-.585 1.14-.91a3.7 3.7 0 0 1 1.557-.326q.91 0 1.563.369a2.6 2.6 0 0 1 1.001.963q.35.599.35 1.294 0 .829-.436 1.413a2.2 2.2 0 0 1-1.174.81v.077q.93.153 1.452.791.522.632.522 1.567 0 .8-.436 1.437-.431.633-1.179.997-.747.364-1.701.364m9.512-5.568v1.054h-4.294v-1.054zm5.114-4.38v9.814h-1.188v-8.089h-.077q-.067.135-.345.307a3 3 0 0 1-.719.297 3.7 3.7 0 0 1-1.006.124v-.996q.57 0 .987-.206a2.6 2.6 0 0 0 .695-.484q.283-.278.427-.503l.172-.264zm2.813 9.814v-.863l3.239-3.546q.571-.622.94-1.083.369-.465.546-.872.182-.412.182-.862 0-.518-.249-.896a1.6 1.6 0 0 0-.671-.585 2.2 2.2 0 0 0-.958-.206q-.565 0-.988.235a1.6 1.6 0 0 0-.646.647 2 2 0 0 0-.226.977h-1.131q0-.863.398-1.514a2.76 2.76 0 0 1 1.083-1.016q.69-.364 1.548-.364.863 0 1.529.364t1.044.982q.38.618.379 1.376 0 .542-.197 1.059-.19.512-.671 1.145-.474.628-1.317 1.533l-2.205 2.358v.077h4.562v1.054zm13.173-1.84v-.518q0-.537.221-.982.225-.45.651-.719.432-.273 1.045-.273.622 0 1.045.273.421.269.637.719.216.445.216.982v.518q0 .537-.221.987a1.75 1.75 0 0 1-.642.719q-.421.268-1.035.268-.623 0-1.049-.268a1.77 1.77 0 0 1-.647-.719 2.2 2.2 0 0 1-.221-.987m.978-.518v.518q0 .446.211.8.21.35.728.35.503 0 .709-.35a1.53 1.53 0 0 0 .211-.8v-.518q0-.446-.201-.795-.201-.355-.719-.355-.503 0-.724.355a1.5 1.5 0 0 0-.215.795m-5.866-5.098v-.518q0-.537.221-.982.225-.451.652-.719.43-.273 1.044-.273.623 0 1.045.273.421.268.637.719.216.445.216.982v.518q0 .536-.221.987a1.74 1.74 0 0 1-.642.719q-.422.267-1.035.268-.623 0-1.049-.268a1.8 1.8 0 0 1-.647-.719 2.2 2.2 0 0 1-.221-.987m.978-.518v.518q0 .445.211.8.21.35.728.35.504 0 .709-.35.211-.355.211-.8v-.518q0-.445-.201-.795-.201-.355-.719-.355-.502 0-.723.355a1.5 1.5 0 0 0-.216.795m-.613 7.974 6.747-9.814h1.092l-6.747 9.814zm14.855 0h-1.246l3.603-9.814h1.227l3.604 9.814h-1.246l-2.933-8.261h-.077zm.46-3.834h5.022v1.055h-5.022zm8.256 3.834v-9.814h3.316q1.155 0 1.888.417.738.413 1.093 1.116.354.705.354 1.572t-.354 1.577a2.64 2.64 0 0 1-1.083 1.131q-.733.416-1.879.416h-2.376v-1.054h2.338q.79 0 1.27-.273.479-.273.695-.738.22-.47.22-1.059a2.4 2.4 0 0 0-.22-1.054 1.57 1.57 0 0 0-.7-.728q-.485-.269-1.284-.269h-2.089v8.76zm8.566 0v-9.814h3.316q1.15 0 1.888.393.738.388 1.092 1.069t.355 1.547q0 .868-.355 1.539-.354.67-1.087 1.054-.734.378-1.874.378h-2.684v-1.073h2.646q.786 0 1.265-.23a1.45 1.45 0 0 0 .699-.652q.22-.426.221-1.016 0-.59-.221-1.03a1.5 1.5 0 0 0-.704-.68q-.484-.245-1.28-.245h-2.089v8.76zm4.619-4.409 2.415 4.409h-1.38l-2.377-4.409z"
                          ></path>
                        </g>
                        <g clipPath="url(#staking-pools_svg__f)">
                          <path
                            fill="#8247e5"
                            d="M35 165a8 8 0 1 0-16 0 8 8 0 0 0 16 0"
                          ></path>
                          <mask
                            id="staking-pools_svg__g"
                            width="10"
                            height="8"
                            x="22"
                            y="161"
                            maskUnits="userSpaceOnUse"
                            style={{ maskType: "luminance" }}
                          >
                            <path
                              fill="#fff"
                              d="M31.667 161h-9.333v8h9.333z"
                            ></path>
                          </mask>
                          <g mask="url(#staking-pools_svg__g)">
                            <path
                              fill="#fff"
                              d="M29.382 163.436a.63.63 0 0 0-.583 0l-1.361.788-.924.501-1.337.788a.63.63 0 0 1-.583 0l-1.045-.62a.58.58 0 0 1-.292-.502v-1.194c0-.191.097-.382.292-.501l1.045-.597a.63.63 0 0 1 .583 0l1.045.62c.17.096.292.287.292.502v.788l.924-.525v-.812a.59.59 0 0 0-.292-.502l-1.945-1.122a.63.63 0 0 0-.583 0l-1.993 1.146a.53.53 0 0 0-.291.478v2.244c0 .191.097.383.291.502l1.969 1.122c.17.096.389.096.583 0l1.337-.764.924-.525 1.337-.764a.63.63 0 0 1 .583 0l1.045.597a.58.58 0 0 1 .292.501v1.194a.59.59 0 0 1-.292.502l-1.02.597a.63.63 0 0 1-.584 0l-1.045-.597a.58.58 0 0 1-.292-.502v-.764l-.924.525v.788a.59.59 0 0 0 .292.502l1.969 1.122c.17.096.389.096.583 0l1.969-1.122a.58.58 0 0 0 .291-.502v-2.268a.59.59 0 0 0-.291-.502z"
                            ></path>
                          </g>
                        </g>
                        <path
                          fill="#d9d5f1"
                          d="M44.145 169.5v-9.455h3.194q1.113 0 1.82.402.71.397 1.052 1.076.342.678.342 1.514a3.35 3.35 0 0 1-.342 1.519 2.54 2.54 0 0 1-1.043 1.089q-.707.402-1.81.402h-2.29v-1.016h2.253q.762 0 1.223-.263t.67-.711q.212-.452.212-1.02t-.212-1.016a1.5 1.5 0 0 0-.674-.701q-.467-.26-1.237-.259H45.29v8.439zm10.909.148q-.96 0-1.685-.457a3.1 3.1 0 0 1-1.127-1.279q-.401-.822-.401-1.921 0-1.107.401-1.934.407-.827 1.127-1.283.724-.457 1.685-.457.96 0 1.68.457a3.05 3.05 0 0 1 1.126 1.283q.407.827.407 1.934 0 1.1-.407 1.921a3.06 3.06 0 0 1-1.126 1.279q-.72.456-1.68.457m0-.979q.729 0 1.2-.374.47-.374.697-.983.226-.61.226-1.321a3.8 3.8 0 0 0-.226-1.324 2.23 2.23 0 0 0-.697-.993q-.471-.379-1.2-.379-.73 0-1.2.379a2.23 2.23 0 0 0-.698.993 3.8 3.8 0 0 0-.226 1.324q0 .711.226 1.321t.697.983 1.2.374m5.965-8.624v9.455h-1.09v-9.455zm2.697 12.114q-.276 0-.494-.046a1.3 1.3 0 0 1-.3-.083l.277-.96q.398.101.702.073a.84.84 0 0 0 .54-.272q.24-.24.439-.78l.203-.554-2.622-7.128h1.182l1.957 5.651h.074l1.957-5.651h1.182l-3.01 8.125a3.1 3.1 0 0 1-.503.91q-.3.364-.697.54a2.15 2.15 0 0 1-.887.175m9.143.148q-.789 0-1.357-.203a2.9 2.9 0 0 1-.946-.527 2.9 2.9 0 0 1-.596-.692l.868-.609q.148.194.374.443.226.254.619.438.396.19 1.038.19.859 0 1.418-.416t.558-1.302v-1.44h-.092q-.12.194-.342.48a1.9 1.9 0 0 1-.628.503q-.406.217-1.098.217a2.96 2.96 0 0 1-1.542-.406q-.679-.406-1.076-1.182-.392-.776-.392-1.883 0-1.09.383-1.898.382-.812 1.066-1.255.684-.448 1.58-.448.69 0 1.098.231.41.226.628.517.22.285.341.471h.111v-1.127h1.053v7.294q0 .914-.416 1.487a2.37 2.37 0 0 1-1.108.844 4.2 4.2 0 0 1-1.542.273m-.037-3.896q.657 0 1.108-.301.453-.3.688-.863.236-.563.236-1.348 0-.767-.231-1.352a2.03 2.03 0 0 0-.683-.919q-.453-.333-1.118-.333-.692 0-1.154.351a2.14 2.14 0 0 0-.687.942q-.227.591-.227 1.311 0 .739.231 1.307a2 2 0 0 0 .693.886q.461.319 1.144.319m7.978 1.237q-.96 0-1.685-.457a3.1 3.1 0 0 1-1.127-1.279q-.4-.822-.401-1.921 0-1.107.401-1.934.407-.827 1.127-1.283.725-.457 1.685-.457t1.68.457a3.05 3.05 0 0 1 1.126 1.283q.407.827.407 1.934 0 1.1-.407 1.921a3.06 3.06 0 0 1-1.126 1.279q-.72.456-1.68.457m0-.979q.729 0 1.2-.374.47-.374.697-.983.226-.61.226-1.321a3.8 3.8 0 0 0-.226-1.324 2.23 2.23 0 0 0-.697-.993q-.471-.379-1.2-.379-.73 0-1.2.379a2.23 2.23 0 0 0-.698.993 3.8 3.8 0 0 0-.226 1.324q0 .711.226 1.321t.697.983 1.2.374m5.965-3.435v4.266h-1.09v-7.091h1.053v1.108h.093q.249-.54.757-.868.507-.332 1.31-.332.721 0 1.261.295.54.291.84.887.3.59.3 1.495v4.506H90.2v-4.432q0-.835-.434-1.302-.434-.471-1.191-.471a1.9 1.9 0 0 0-.933.227q-.405.226-.641.66t-.236 1.052"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M102.145 160.045h1.366l3.213 7.848h.111l3.213-7.848h1.367v9.455h-1.071v-7.183h-.093l-2.954 7.183h-1.034l-2.955-7.183h-.092v7.183h-1.071zm11.953 9.455h-1.2l3.471-9.455h1.182l3.472 9.455h-1.2l-2.826-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zm6.333-4.746v-1.016h7.091v1.016h-2.973v8.439h-1.145v-8.439zm10.003-1.016v9.455h-1.145v-9.455zM140.78 163h-1.145a2.37 2.37 0 0 0-.965-1.496 2.6 2.6 0 0 0-.789-.388 3.2 3.2 0 0 0-.905-.129 2.9 2.9 0 0 0-1.556.434q-.692.434-1.103 1.279-.406.844-.406 2.073 0 1.227.406 2.073.411.844 1.103 1.278.698.434 1.556.434.471 0 .905-.129.434-.13.789-.383a2.42 2.42 0 0 0 .965-1.501h1.145a3.8 3.8 0 0 1-.471 1.298 3.6 3.6 0 0 1-.849.974 3.8 3.8 0 0 1-1.14.605 4.3 4.3 0 0 1-1.344.207q-1.209 0-2.151-.591t-1.482-1.68-.54-2.585.54-2.585 1.482-1.681 2.151-.591q.716 0 1.344.208.631.208 1.14.609.508.397.849.97.342.567.471 1.297"
                        ></path>
                        <path
                          fill="#01b28b"
                          d="M336.173 169.629q-.913 0-1.629-.314a2.8 2.8 0 0 1-1.131-.872 2.35 2.35 0 0 1-.453-1.307h1.164q.036.457.314.79.276.327.724.508.448.18.993.18.609 0 1.08-.213.47-.211.739-.591a1.48 1.48 0 0 0 .267-.877q0-.522-.258-.918a1.7 1.7 0 0 0-.757-.628q-.5-.226-1.219-.226h-.757v-1.016h.757q.564 0 .988-.203.429-.203.669-.573.245-.369.245-.868 0-.48-.212-.835a1.46 1.46 0 0 0-.6-.554 1.95 1.95 0 0 0-.905-.199q-.489 0-.924.18-.43.175-.701.513-.272.332-.296.803h-1.108q.028-.743.448-1.302.42-.563 1.099-.877a3.55 3.55 0 0 1 1.5-.314q.878 0 1.505.356a2.5 2.5 0 0 1 .965.928q.337.577.337 1.246 0 .798-.42 1.362a2.13 2.13 0 0 1-1.131.78v.074q.895.147 1.399.762.503.609.503 1.509 0 .771-.42 1.385a2.85 2.85 0 0 1-1.136.96q-.72.351-1.639.351m9.164-5.364v1.016h-4.136v-1.016zm4.853 5.364a3.24 3.24 0 0 1-1.463-.323 2.7 2.7 0 0 1-1.044-.886 2.43 2.43 0 0 1-.429-1.284h1.108q.065.642.582 1.062.521.416 1.246.416a1.96 1.96 0 0 0 1.034-.273q.457-.272.716-.748.263-.48.263-1.084a2.2 2.2 0 0 0-.273-1.104 2 2 0 0 0-.738-.771 2.1 2.1 0 0 0-1.076-.286 3 3 0 0 0-.891.134 2.5 2.5 0 0 0-.752.346l-1.071-.129.572-4.654h4.912v1.016h-3.952l-.332 2.788h.055q.29-.23.73-.383.438-.152.914-.152a2.9 2.9 0 0 1 1.546.415q.684.411 1.071 1.127.393.716.393 1.634 0 .905-.406 1.616a3 3 0 0 1-1.108 1.117q-.707.406-1.607.406m9.774-1.902v-.498q0-.517.213-.947.216-.434.628-.692.415-.263 1.006-.263.6 0 1.006.263.407.258.614.692.208.43.208.947v.498q0 .518-.212.951a1.7 1.7 0 0 1-.619.693q-.406.258-.997.258-.6 0-1.011-.258a1.7 1.7 0 0 1-.623-.693 2.1 2.1 0 0 1-.213-.951m.942-.498v.498q0 .429.203.771.204.337.702.337.485 0 .683-.337.203-.342.203-.771v-.498q0-.43-.194-.767-.194-.34-.692-.341-.485 0-.697.341-.208.337-.208.767m-5.65-4.912v-.499q0-.517.212-.946.217-.433.628-.693.415-.263 1.006-.263.6 0 1.006.263.407.26.614.693.208.429.208.946v.499q0 .516-.212.951a1.7 1.7 0 0 1-.619.692q-.406.26-.997.259-.6 0-1.011-.259a1.7 1.7 0 0 1-.623-.692 2.1 2.1 0 0 1-.212-.951m.941-.499v.499q0 .429.203.771.204.337.702.337.485 0 .683-.337.203-.342.203-.771v-.499q0-.429-.193-.766-.195-.342-.693-.342-.484 0-.697.342-.207.337-.208.766m-.591 7.682 6.5-9.455h1.053l-6.5 9.455zm14.311 0h-1.2l3.472-9.455h1.182l3.471 9.455h-1.2l-2.825-7.959h-.074zm.444-3.693h4.838v1.015h-4.838zm7.954 3.693v-9.455h3.194q1.113 0 1.819.402.711.397 1.053 1.076.341.678.341 1.514 0 .835-.341 1.519a2.55 2.55 0 0 1-1.043 1.089q-.707.402-1.81.402h-2.29v-1.016h2.253q.762 0 1.223-.263t.67-.711a2.4 2.4 0 0 0 .212-1.02q0-.568-.212-1.016a1.5 1.5 0 0 0-.674-.701q-.467-.26-1.238-.259h-2.012v8.439zm8.252 0v-9.455h3.194q1.108 0 1.819.379.711.374 1.053 1.029.342.657.341 1.492 0 .836-.341 1.481-.342.647-1.048 1.016-.707.365-1.805.365h-2.585v-1.034h2.548q.757 0 1.219-.222.465-.222.674-.628.212-.411.212-.978a2.2 2.2 0 0 0-.212-.993 1.45 1.45 0 0 0-.679-.655q-.466-.236-1.233-.236h-2.012v8.439zm4.45-4.247 2.327 4.247h-1.33l-2.29-4.247z"
                        ></path>
                        <rect
                          width="391"
                          height="36"
                          x="11"
                          y="185"
                          fill="#fff"
                          fillOpacity="0.025"
                          rx="5"
                        />
                        <g clipPath="url(#staking-pools_svg__h)">
                          <path
                            fill="#fff"
                            d="M30.333 197.667h-6.666A2.667 2.667 0 0 0 21 200.333v4A2.667 2.667 0 0 0 23.667 207h6.666A2.667 2.667 0 0 0 33 204.333v-4a2.667 2.667 0 0 0-2.667-2.666"
                          ></path>
                          <path
                            fill="#e84142"
                            fillRule="evenodd"
                            d="M35 203a8 8 0 1 1-16 0 8 8 0 0 1 16 0m-10.267 3.184H23.18c-.326 0-.487 0-.585-.063a.4.4 0 0 1-.179-.309c-.006-.116.075-.257.236-.54l3.833-6.757c.163-.287.246-.431.35-.484a.4.4 0 0 1 .358 0c.104.053.186.197.35.484l.788 1.375.004.007c.176.308.265.464.304.628.044.179.044.368 0 .546-.04.166-.127.323-.306.635l-2.014 3.56-.005.009c-.177.31-.267.468-.392.586-.136.13-.299.224-.477.277-.164.046-.346.046-.712.046m3.92 0h2.226c.328 0 .493 0 .591-.065a.4.4 0 0 0 .179-.311c.006-.112-.073-.248-.228-.514l-.016-.028-1.114-1.906-.013-.022c-.156-.265-.235-.398-.337-.45a.4.4 0 0 0-.356 0c-.102.053-.184.192-.348.473l-1.11 1.907-.004.006c-.162.281-.244.421-.238.536a.4.4 0 0 0 .18.311c.095.063.26.063.589.063"
                            clipRule="evenodd"
                          ></path>
                        </g>
                        <path
                          fill="#d9d5f1"
                          d="M44.533 207.5h-1.2l3.471-9.455h1.182l3.471 9.455h-1.2l-2.825-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zm12.716-3.398L55.07 207.5h-1.108l-2.622-7.091h1.181l1.958 5.651h.074l1.957-5.651zm3.862 7.239q-.887 0-1.565-.448-.68-.452-1.062-1.274-.383-.826-.383-1.953 0-1.117.383-1.939.382-.822 1.066-1.269.684-.448 1.58-.448.69 0 1.093.231.406.226.619.517.217.285.337.471h.092v-1.127h1.09v7.091H63.75v-1.089h-.13q-.12.194-.34.489a2 2 0 0 1-.633.522q-.411.225-1.094.226m.147-.979q.656 0 1.108-.342.453-.345.688-.955.236-.615.236-1.417 0-.795-.231-1.39-.231-.6-.684-.933-.451-.337-1.117-.337-.692 0-1.154.356a2.13 2.13 0 0 0-.688.956q-.225.6-.226 1.348 0 .756.231 1.375.235.615.693.979.461.36 1.144.36m6.339-8.624v9.455h-1.09v-9.455zm4.673 9.603q-.887 0-1.565-.448-.679-.452-1.062-1.274-.383-.826-.383-1.953 0-1.117.383-1.939.382-.822 1.066-1.269.683-.448 1.58-.448.691 0 1.093.231.406.226.619.517.217.285.337.471h.092v-1.127h1.09v7.091H74.91v-1.089h-.129q-.12.194-.342.489a2 2 0 0 1-.632.522q-.411.225-1.094.226m.148-.979q.655 0 1.108-.342.452-.345.687-.955.236-.615.236-1.417 0-.795-.231-1.39-.231-.6-.683-.933-.453-.337-1.117-.337-.693 0-1.155.356a2.1 2.1 0 0 0-.687.956q-.227.6-.227 1.348 0 .756.231 1.375.236.615.693.979.46.36 1.145.36m6.338-3.435v4.266h-1.09v-7.091h1.053v1.108h.092q.25-.54.757-.868.508-.332 1.312-.332.72 0 1.26.295.54.291.84.887.3.59.3 1.495v4.506h-1.09v-4.432q0-.835-.433-1.302-.435-.471-1.191-.471a1.9 1.9 0 0 0-.933.227q-.406.226-.642.66-.235.434-.235 1.052m9.396 4.414q-.998 0-1.718-.471a3.07 3.07 0 0 1-1.108-1.297q-.387-.827-.387-1.889 0-1.08.397-1.906a3.13 3.13 0 0 1 1.117-1.297q.72-.471 1.68-.471.748 0 1.348.277.6.276.983.775t.476 1.164h-1.09a1.7 1.7 0 0 0-.553-.859q-.426-.379-1.145-.379-.637 0-1.117.333-.475.327-.744.928-.263.595-.263 1.399 0 .82.259 1.431.263.609.738.946.48.337 1.127.337.425 0 .77-.148.347-.148.587-.424.24-.278.341-.665h1.09a2.5 2.5 0 0 1-.457 1.131q-.36.498-.956.794-.59.291-1.375.291m5.47-4.414v4.266h-1.09v-9.455h1.09v3.472h.093q.249-.55.747-.872.503-.328 1.34-.328.723 0 1.269.291.544.285.845.881.304.591.304 1.505v4.506h-1.09v-4.432q0-.845-.438-1.306-.434-.467-1.205-.467-.535 0-.96.227a1.65 1.65 0 0 0-.665.66q-.24.434-.24 1.052m9.564 4.414q-1.024 0-1.768-.453a3.03 3.03 0 0 1-1.14-1.274q-.397-.822-.397-1.911 0-1.09.397-1.921.402-.836 1.117-1.301.72-.471 1.681-.471.554 0 1.094.184.54.186.983.601.443.41.706 1.089.264.679.263 1.671v.462H101.1v-.942h4.357q0-.6-.24-1.071a1.8 1.8 0 0 0-.674-.743 1.9 1.9 0 0 0-1.024-.273q-.651 0-1.127.324a2.1 2.1 0 0 0-.725.831 2.44 2.44 0 0 0-.254 1.098v.628q0 .804.277 1.362a2 2 0 0 0 .781.845 2.3 2.3 0 0 0 1.158.286q.43 0 .776-.12.35-.124.605-.369.254-.25.392-.619l1.053.296a2.3 2.3 0 0 1-.559.941 2.7 2.7 0 0 1-.969.628 3.6 3.6 0 0 1-1.298.222"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M117.533 207.5h-1.201l3.472-9.455h1.182l3.471 9.455h-1.2l-2.825-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zm7.453-5.762 2.807 7.959h.111l2.807-7.959h1.2l-3.472 9.455H127.7l-3.471-9.455zm7.973 9.455h-1.2l3.471-9.455h1.182l3.472 9.455h-1.201l-2.825-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zm8.508-5.762 2.438 3.934h.074l2.437-3.934h1.348l-2.973 4.728 2.973 4.727h-1.348l-2.437-3.859h-.074l-2.438 3.859h-1.348l3.047-4.727-3.047-4.728z"
                        ></path>
                        <path
                          fill="#01b28b"
                          d="M336.173 207.629q-.913 0-1.629-.314a2.8 2.8 0 0 1-1.131-.872 2.35 2.35 0 0 1-.453-1.307h1.164q.036.457.314.79.276.327.724.508.448.18.993.18.609 0 1.08-.213.47-.211.739-.591a1.48 1.48 0 0 0 .267-.877q0-.522-.258-.918a1.7 1.7 0 0 0-.757-.628q-.5-.226-1.219-.226h-.757v-1.016h.757q.564 0 .988-.203.429-.203.669-.573.245-.369.245-.868 0-.48-.212-.835a1.46 1.46 0 0 0-.6-.554 1.95 1.95 0 0 0-.905-.199q-.489 0-.924.18-.43.175-.701.513-.272.332-.296.803h-1.108q.028-.743.448-1.302.42-.563 1.099-.877a3.55 3.55 0 0 1 1.5-.314q.878 0 1.505.356a2.5 2.5 0 0 1 .965.928q.337.577.337 1.246 0 .798-.42 1.362a2.13 2.13 0 0 1-1.131.78v.074q.895.147 1.399.762.503.609.503 1.509 0 .771-.42 1.385a2.85 2.85 0 0 1-1.136.96q-.72.351-1.639.351m9.164-5.364v1.016h-4.136v-1.016zm4.853 5.364a3.24 3.24 0 0 1-1.463-.323 2.7 2.7 0 0 1-1.044-.886 2.43 2.43 0 0 1-.429-1.284h1.108q.065.642.582 1.062.521.416 1.246.416a1.96 1.96 0 0 0 1.034-.273q.457-.272.716-.748.263-.48.263-1.084a2.2 2.2 0 0 0-.273-1.104 2 2 0 0 0-.738-.771 2.1 2.1 0 0 0-1.076-.286 3 3 0 0 0-.891.134 2.5 2.5 0 0 0-.752.346l-1.071-.129.572-4.654h4.912v1.016h-3.952l-.332 2.788h.055q.29-.23.73-.383.438-.152.914-.152a2.9 2.9 0 0 1 1.546.415q.684.411 1.071 1.127.393.716.393 1.634 0 .905-.406 1.616a3 3 0 0 1-1.108 1.117q-.707.406-1.607.406m9.774-1.902v-.498q0-.517.213-.947.216-.434.628-.692.415-.263 1.006-.263.6 0 1.006.263.407.258.614.692.208.43.208.947v.498q0 .518-.212.951a1.7 1.7 0 0 1-.619.693q-.406.258-.997.258-.6 0-1.011-.258a1.7 1.7 0 0 1-.623-.693 2.1 2.1 0 0 1-.213-.951m.942-.498v.498q0 .429.203.771.204.337.702.337.485 0 .683-.337.203-.342.203-.771v-.498q0-.43-.194-.767-.194-.34-.692-.341-.485 0-.697.341-.208.337-.208.767m-5.65-4.912v-.499q0-.517.212-.946.217-.433.628-.693.415-.263 1.006-.263.6 0 1.006.263.407.26.614.693.208.429.208.946v.499q0 .516-.212.951a1.7 1.7 0 0 1-.619.692q-.406.26-.997.259-.6 0-1.011-.259a1.7 1.7 0 0 1-.623-.692 2.1 2.1 0 0 1-.212-.951m.941-.499v.499q0 .429.203.771.204.337.702.337.485 0 .683-.337.203-.342.203-.771v-.499q0-.429-.193-.766-.195-.342-.693-.342-.484 0-.697.342-.207.337-.208.766m-.591 7.682 6.5-9.455h1.053l-6.5 9.455zm14.311 0h-1.2l3.472-9.455h1.182l3.471 9.455h-1.2l-2.825-7.959h-.074zm.444-3.693h4.838v1.015h-4.838zm7.954 3.693v-9.455h3.194q1.113 0 1.819.402.711.397 1.053 1.076.341.678.341 1.514 0 .835-.341 1.519a2.55 2.55 0 0 1-1.043 1.089q-.707.402-1.81.402h-2.29v-1.016h2.253q.762 0 1.223-.263t.67-.711a2.4 2.4 0 0 0 .212-1.02q0-.568-.212-1.016a1.5 1.5 0 0 0-.674-.701q-.467-.26-1.238-.259h-2.012v8.439zm8.252 0v-9.455h3.194q1.108 0 1.819.379.711.374 1.053 1.029.342.657.341 1.492 0 .836-.341 1.481-.342.647-1.048 1.016-.707.365-1.805.365h-2.585v-1.034h2.548q.757 0 1.219-.222.465-.222.674-.628.212-.411.212-.978a2.2 2.2 0 0 0-.212-.993 1.45 1.45 0 0 0-.679-.655q-.466-.236-1.233-.236h-2.012v8.439zm4.45-4.247 2.327 4.247h-1.33l-2.29-4.247z"
                        ></path>
                        <defs>
                          <clipPath id="staking-pools_svg__a">
                            <path fill="#fff" d="M19 43h16v16H19z"></path>
                          </clipPath>
                          <clipPath id="staking-pools_svg__b">
                            <path fill="#fff" d="M19 81h16v16H19z"></path>
                          </clipPath>
                          <clipPath id="staking-pools_svg__d">
                            <path
                              fill="#fff"
                              d="M12.304 119.012h16.608v16.608H12.304z"
                            ></path>
                          </clipPath>
                          <clipPath id="staking-pools_svg__f">
                            <path fill="#fff" d="M19 157h16v16H19z"></path>
                          </clipPath>
                          <clipPath id="staking-pools_svg__h">
                            <path fill="#fff" d="M19 195h16v16H19z"></path>
                          </clipPath>
                          <filter
                            id="staking-pools_svg__c"
                            width="413.861"
                            height="45.368"
                            x="0"
                            y="108.632"
                            colorInterpolationFilters="sRGB"
                            filterUnits="userSpaceOnUse"
                          >
                            <feFlood
                              floodOpacity="0"
                              result="BackgroundImageFix"
                            ></feFlood>
                            <feColorMatrix
                              in="SourceAlpha"
                              result="hardAlpha"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            ></feColorMatrix>
                            <feOffset dy="4"></feOffset>
                            <feGaussianBlur stdDeviation="2"></feGaussianBlur>
                            <feComposite
                              in2="hardAlpha"
                              operator="out"
                            ></feComposite>
                            <feColorMatrix values="0 0 0 0 0.984314 0 0 0 0 0.278431 0 0 0 0 0.501961 0 0 0 0.12 0"></feColorMatrix>
                            <feBlend
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow_791_19749"
                            ></feBlend>
                            <feBlend
                              in="SourceGraphic"
                              in2="effect1_dropShadow_791_19749"
                              result="shape"
                            ></feBlend>
                          </filter>
                        </defs>
                      </svg>
                      <div className="staking-pools-module__4c1p2a__shimmer "></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="staking-module__2GPFPG__mainBlockDivider">
                <svg
                  className="staking-module__2GPFPG__rotatingDividerSvg"
                  viewBox="0 0 1 520"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <line
                    x1="0.5"
                    y1="0"
                    x2="0.5"
                    y2="520"
                    className="staking-module__2GPFPG__rotatingBorderStroke"
                  />
                </svg>
              </div>
              <div className="main-module__R0_zcG__mainFeatureBlock">
                <div className="main-module__R0_zcG__mainFeatureBlockWrapper">
                  <div className="main-module__R0_zcG__mainFeatureBlockTitleWrapper">
                    <p className="main-module__R0_zcG__mainFeatureBlockTitle">
                      Receive daily rewards
                    </p>
                  </div>
                  <p className="main-module__R0_zcG__mainFeatureBlockDesc">
                    Your earnings automatically accrue in your account, with a
                    full history available.
                  </p>
                </div>
                <div
                  className="main-module__R0_zcG__mainFeatureBlockCard"
                  style={{
                    transform:
                      "perspective(1000px) rotateX(0deg) rotateY(0deg)",
                    transition: "transform 0.1s ease-out",
                  }}
                >
                  <div
                    className="staking-module__2GPFPG__mainBlockFeatureCard"
                    style={{ position: "relative" }}
                  >
                    <div className="staking-rewards-module__UBpJwq__leverageContainer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 391 256"
                        className="staking-rewards-module__UBpJwq__image"
                      >
                        <rect
                          width="391"
                          height="50"
                          fill="#fff"
                          fillOpacity="0.025"
                          rx="5"
                        />
                        <g clipPath="url(#staking-rewards_svg__a)">
                          <path
                            fill="#23292f"
                            d="M25 42c9.389 0 17-7.611 17-17S34.389 8 25 8 8 15.611 8 25s7.611 17 17 17"
                          ></path>
                          <path
                            fill="#fff"
                            d="M33.013 33.5h3.276l-6.818-6.114c-2.468-2.212-6.471-2.212-8.942 0l-6.82 6.114h3.278l5.18-4.644c.755-.674 1.772-1.051 2.831-1.051 1.06 0 2.077.377 2.832 1.05zm-16.068-17h-3.279l6.863 6.151c2.468 2.213 6.471 2.213 8.942 0l6.862-6.151h-3.276l-5.224 4.682c-.755.673-1.771 1.051-2.831 1.051s-2.077-.378-2.831-1.051z"
                          ></path>
                        </g>
                        <path
                          fill="#d9d5f1"
                          d="m51.699 11.046 2.437 3.933h.074l2.438-3.933h1.348l-2.973 4.727 2.973 4.727h-1.348l-2.438-3.86h-.074L51.7 20.5h-1.35l3.047-4.727-3.047-4.727zm7.787 9.454v-9.454h3.194q1.108 0 1.82.378.71.375 1.052 1.03.34.654.341 1.49 0 .837-.341 1.483-.342.645-1.048 1.015-.707.365-1.805.365h-2.585v-1.034h2.548q.757 0 1.219-.222a1.4 1.4 0 0 0 .674-.628q.212-.411.212-.978 0-.569-.212-.993a1.45 1.45 0 0 0-.679-.655q-.466-.236-1.233-.236h-2.012V20.5zm4.45-4.247 2.327 4.247h-1.33l-2.29-4.247zm3.865 4.247v-9.454h3.195q1.113 0 1.819.401.71.397 1.052 1.076.342.678.342 1.514a3.35 3.35 0 0 1-.342 1.519 2.54 2.54 0 0 1-1.043 1.09q-.706.4-1.81.4h-2.29v-1.015h2.253q.762 0 1.224-.263.46-.263.669-.71.213-.454.212-1.021 0-.568-.212-1.016a1.5 1.5 0 0 0-.674-.701q-.466-.26-1.237-.259h-2.013V20.5z"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M50.58 30.71v-.937h6.545v.937h-2.744v7.79h-1.057v-7.79zm9.75 7.926q-.887 0-1.556-.422a2.87 2.87 0 0 1-1.04-1.18q-.37-.758-.37-1.773 0-1.022.37-1.785a2.86 2.86 0 0 1 1.04-1.185q.67-.422 1.556-.422t1.55.422q.67.421 1.04 1.185.375.763.375 1.785 0 1.014-.375 1.773-.37.76-1.04 1.18-.665.422-1.55.422m0-.903q.672 0 1.108-.345.435-.345.643-.908.21-.562.209-1.219 0-.656-.209-1.223a2.06 2.06 0 0 0-.644-.916q-.435-.35-1.107-.35-.675 0-1.108.35a2.06 2.06 0 0 0-.644.916 3.5 3.5 0 0 0-.209 1.223q0 .657.21 1.22.207.562.643.907.435.345 1.108.345m6.972.903a2.56 2.56 0 0 1-1.444-.413q-.627-.417-.98-1.176-.354-.764-.354-1.803 0-1.03.353-1.79.354-.758.985-1.171.63-.414 1.457-.414.64 0 1.01.213.375.21.571.478.2.264.311.434h.085v-3.221h1.006V38.5h-.971v-1.006h-.12q-.111.18-.315.452-.204.269-.584.482-.38.208-1.01.208m.137-.903q.605 0 1.022-.315.418-.32.635-.883.218-.566.218-1.308 0-.733-.213-1.282a1.87 1.87 0 0 0-.631-.861q-.418-.311-1.031-.311-.64 0-1.066.328-.422.324-.635.882-.209.554-.209 1.244 0 .7.214 1.27.217.568.639.904.426.332 1.057.332m6.77.92a2.7 2.7 0 0 1-1.128-.234 1.94 1.94 0 0 1-.806-.686q-.298-.452-.298-1.091 0-.562.221-.912.222-.353.593-.554.37-.2.818-.298a10 10 0 0 1 .908-.162q.596-.077.967-.115.375-.043.546-.14.174-.099.174-.342v-.034q0-.63-.345-.98-.34-.35-1.035-.35-.72 0-1.13.316t-.575.673l-.955-.34q.255-.597.682-.93.43-.336.938-.468.51-.137 1.005-.137.315 0 .725.077.413.073.797.303.387.23.643.694.256.465.256 1.245V38.5h-1.006v-.886h-.05a1.8 1.8 0 0 1-.342.456q-.238.242-.635.413-.396.17-.967.17m.154-.903q.597 0 1.006-.234a1.6 1.6 0 0 0 .835-1.385v-.92q-.063.075-.281.14-.213.06-.494.106a22 22 0 0 1-.963.128q-.393.052-.733.166a1.26 1.26 0 0 0-.546.337q-.204.222-.204.605 0 .525.387.793.393.264.993.264m5.096 3.205a2.2 2.2 0 0 1-.733-.12l.255-.886q.367.093.648.068a.78.78 0 0 0 .499-.251q.221-.222.405-.72l.187-.512-2.42-6.58h1.09l1.807 5.216h.069l1.806-5.216h1.091l-2.778 7.5q-.187.508-.465.84-.276.337-.643.499a2 2 0 0 1-.818.162"
                        ></path>
                        <path
                          fill="#01b28b"
                          d="M299.767 17.338v-6.094h1.034v6.094zm-2.53-2.53v-1.034h6.094v1.034zm11.635-5.263V19h-1.145v-8.254h-.055l-2.309 1.532v-1.163l2.364-1.57zm5.803 9.584q-1.043 0-1.778-.568-.734-.572-1.121-1.657-.388-1.089-.388-2.631 0-1.533.388-2.618.392-1.089 1.126-1.662.739-.576 1.773-.577 1.034 0 1.768.577.739.573 1.126 1.662.393 1.085.393 2.618 0 1.542-.388 2.631-.389 1.085-1.122 1.657-.734.568-1.777.568m0-1.015q1.034 0 1.606-.998.573-.996.573-2.843 0-1.228-.263-2.091-.26-.864-.748-1.316a1.65 1.65 0 0 0-1.168-.453q-1.024 0-1.602 1.011-.577 1.006-.577 2.849 0 1.228.258 2.086.259.859.744 1.307a1.68 1.68 0 0 0 1.177.448m5.523.96a.8.8 0 0 1-.586-.245.8.8 0 0 1-.245-.586.8.8 0 0 1 .245-.586.8.8 0 0 1 .586-.245.8.8 0 0 1 .587.245.8.8 0 0 1 .244.586q0 .226-.115.415a.9.9 0 0 1-.3.305.8.8 0 0 1-.416.11m5.607.055q-.913 0-1.629-.314a2.8 2.8 0 0 1-1.132-.872 2.35 2.35 0 0 1-.452-1.307h1.163q.038.457.314.79.278.328.725.508.448.18.993.18.609 0 1.08-.213.47-.212.739-.59.267-.379.267-.878 0-.522-.258-.918a1.7 1.7 0 0 0-.757-.628q-.5-.226-1.219-.226h-.757v-1.016h.757q.563 0 .988-.203.429-.203.669-.573.245-.369.245-.868 0-.48-.212-.835a1.45 1.45 0 0 0-.601-.554 1.94 1.94 0 0 0-.904-.199q-.49 0-.924.18-.43.176-.701.513-.273.333-.296.803h-1.108q.028-.743.448-1.302.42-.563 1.099-.877.682-.315 1.5-.314.877 0 1.505.356.628.35.965.928.337.576.337 1.246 0 .799-.42 1.362a2.13 2.13 0 0 1-1.131.78v.074q.895.147 1.399.762.503.61.503 1.51 0 .77-.42 1.384a2.86 2.86 0 0 1-1.136.96q-.72.351-1.639.351m8.222 0a3.5 3.5 0 0 1-1.163-.221 2.8 2.8 0 0 1-1.062-.716q-.48-.508-.771-1.371-.291-.868-.291-2.179 0-1.256.236-2.225.235-.975.683-1.639a3.1 3.1 0 0 1 1.08-1.016q.637-.345 1.436-.346.794 0 1.412.319.624.313 1.016.877.393.563.508 1.297h-1.127a2.1 2.1 0 0 0-.609-1.057q-.453-.42-1.2-.42-1.1 0-1.731.955-.628.956-.633 2.683h.074a2.77 2.77 0 0 1 1.408-1.104q.434-.152.919-.152.812 0 1.486.406.675.402 1.08 1.113.407.705.407 1.62 0 .877-.393 1.607a3 3 0 0 1-1.103 1.154q-.707.424-1.662.415m0-1.015q.582 0 1.043-.291.467-.291.734-.78.273-.49.273-1.09 0-.585-.263-1.066a2 2 0 0 0-.716-.771 1.9 1.9 0 0 0-1.034-.287q-.438 0-.817.176-.378.17-.665.47-.281.3-.443.689a2.18 2.18 0 0 0 .831 2.65q.466.3 1.057.3m8.168 1.015q-.915 0-1.63-.314a2.8 2.8 0 0 1-1.131-.872 2.34 2.34 0 0 1-.452-1.307h1.163q.037.457.314.79.277.328.725.508t.992.18q.61 0 1.081-.213.47-.212.738-.59.268-.379.268-.878a1.64 1.64 0 0 0-.259-.918 1.7 1.7 0 0 0-.757-.628q-.498-.226-1.218-.226h-.758v-1.016h.758q.562 0 .988-.203.429-.203.669-.573.245-.369.245-.868 0-.48-.213-.835a1.45 1.45 0 0 0-.6-.554 1.94 1.94 0 0 0-.905-.199q-.49 0-.923.18-.429.176-.702.513-.272.333-.295.803h-1.108q.027-.743.448-1.302a2.8 2.8 0 0 1 1.098-.877q.684-.315 1.501-.314.876 0 1.505.356.627.35.965.928.337.576.337 1.246 0 .799-.421 1.362a2.13 2.13 0 0 1-1.131.78v.074q.896.147 1.399.762.503.61.503 1.51 0 .77-.42 1.384a2.85 2.85 0 0 1-1.135.96q-.72.351-1.639.351m8.222 0a3.6 3.6 0 0 1-1.164-.221 2.8 2.8 0 0 1-1.061-.716q-.48-.508-.771-1.371-.291-.868-.291-2.179 0-1.256.235-2.225.236-.975.683-1.639a3.1 3.1 0 0 1 1.081-1.016q.636-.345 1.435-.346.795 0 1.413.319.624.313 1.016.877.392.563.508 1.297h-1.127a2.1 2.1 0 0 0-.609-1.057q-.453-.42-1.201-.42-1.098 0-1.731.955-.627.956-.632 2.683h.074a2.77 2.77 0 0 1 1.408-1.104q.433-.152.918-.152.813 0 1.487.406.674.402 1.08 1.113.406.705.406 1.62 0 .877-.392 1.607a3 3 0 0 1-1.103 1.154q-.706.424-1.662.415m0-1.015q.582 0 1.043-.291.467-.291.734-.78.273-.49.272-1.09 0-.585-.263-1.066a2 2 0 0 0-.715-.771 1.9 1.9 0 0 0-1.034-.287q-.44 0-.817.176-.379.17-.665.47-.282.3-.443.689a2.1 2.1 0 0 0-.162.808q0 .563.263 1.052.268.49.73.79.465.3 1.057.3"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="m359.766 9.545 2.438 3.934h.074l2.437-3.934h1.348l-2.973 4.728L366.063 19h-1.348l-2.437-3.86h-.074L359.766 19h-1.348l3.047-4.727-3.047-4.728zM367.553 19V9.545h3.195q1.108 0 1.819.379.71.375 1.052 1.03.342.654.342 1.49 0 .837-.342 1.483t-1.048 1.015q-.706.365-1.805.365h-2.585v-1.034h2.548q.757 0 1.219-.222.466-.222.674-.628.212-.411.212-.978 0-.569-.212-.993a1.45 1.45 0 0 0-.679-.655q-.465-.236-1.232-.236h-2.013V19zm4.45-4.247L374.33 19h-1.329l-2.29-4.247zM375.869 19V9.545h3.194q1.113 0 1.819.402.711.397 1.053 1.076.34.678.341 1.514 0 .835-.341 1.519a2.54 2.54 0 0 1-1.044 1.09q-.707.4-1.809.4h-2.29v-1.015h2.253q.76 0 1.223-.263.462-.263.669-.71.213-.454.213-1.021 0-.568-.213-1.016a1.5 1.5 0 0 0-.674-.701q-.465-.26-1.237-.259h-2.013V19zm-12.392 19.09V27.183h.699V38.09zm2.353-7.636a1.34 1.34 0 0 0-.623-1.005q-.544-.358-1.338-.358-.579 0-1.014.187a1.6 1.6 0 0 0-.673.516 1.24 1.24 0 0 0-.239.746q0 .35.166.6.171.247.435.414.264.162.554.268.29.103.533.167l.886.238q.34.09.759.247.421.159.805.43.388.27.639.691.252.422.252 1.036 0 .706-.371 1.278-.366.57-1.074.908-.703.336-1.709.336-.937 0-1.623-.302a2.6 2.6 0 0 1-1.074-.844 2.4 2.4 0 0 1-.439-1.257h1.091q.042.494.332.818.294.32.742.477.452.154.971.154a2.9 2.9 0 0 0 1.087-.196 1.9 1.9 0 0 0 .763-.554q.28-.358.281-.835 0-.435-.243-.708a1.8 1.8 0 0 0-.639-.443 7 7 0 0 0-.857-.298l-1.074-.307q-1.022-.294-1.619-.84-.597-.545-.597-1.427 0-.733.397-1.279.4-.549 1.074-.852a3.6 3.6 0 0 1 1.512-.307q.845 0 1.5.303.657.299 1.04.818.388.52.409 1.18zM368.556 37v-.767l2.88-3.153q.508-.554.836-.963.327-.414.485-.776.162-.366.162-.767 0-.46-.221-.797a1.44 1.44 0 0 0-.597-.52 1.9 1.9 0 0 0-.852-.183q-.503 0-.878.209a1.44 1.44 0 0 0-.575.575q-.2.37-.2.87h-1.006q0-.768.354-1.347.353-.58.963-.904a2.9 2.9 0 0 1 1.376-.324q.767 0 1.359.324.593.324.929.874t.337 1.223q0 .48-.175.942-.17.456-.596 1.018a18 18 0 0 1-1.172 1.364l-1.96 2.096v.069h4.056V37zm10.112.12q-.963 0-1.641-.525-.677-.528-1.035-1.53-.358-1.005-.358-2.429 0-1.414.358-2.416.362-1.005 1.04-1.534.682-.533 1.636-.533t1.632.533q.682.529 1.04 1.534.362 1.002.362 2.416 0 1.424-.358 2.43-.358 1-1.035 1.53-.678.523-1.641.523m0-.938q.954 0 1.483-.92.528-.922.528-2.626 0-1.133-.243-1.93-.238-.796-.69-1.215a1.52 1.52 0 0 0-1.078-.417q-.947 0-1.479.933-.532.93-.532 2.63 0 1.133.238 1.925.239.793.686 1.207.452.413 1.087.413"
                        ></path>
                        <g clipPath="url(#staking-rewards_svg__b)">
                          <path
                            fill="#906ee0"
                            d="M24 92c8.837 0 16-7.163 16-16s-7.163-16-16-16S8 67.163 8 76s7.163 16 16 16"
                          ></path>
                          <mask
                            id="staking-rewards_svg__c"
                            width="21"
                            height="21"
                            x="13"
                            y="65"
                            maskUnits="userSpaceOnUse"
                            style={{ maskType: "luminance" }}
                          >
                            <path
                              fill="#fff"
                              d="M33.6 65.12H13.12V85.6H33.6z"
                            ></path>
                          </mask>
                          <g fill="#fff" mask="url(#staking-rewards_svg__c)">
                            <path d="m23.358 65.12-.137.467v13.541l.137.138 6.286-3.716z"></path>
                            <path d="m23.358 65.12-6.286 10.43 6.286 3.716zm0 15.336-.077.094v4.824l.077.226 6.29-8.858z"></path>
                            <path d="M23.358 85.6v-5.144l-6.286-3.714zm0-6.335 6.286-3.715-6.286-2.857zm-6.286-3.715 6.286 3.715v-6.572z"></path>
                          </g>
                        </g>
                        <path
                          fill="#d9d5f1"
                          d="M49.145 71.5v-9.455h5.706v1.016H50.29v3.195h4.265v1.015H50.29v3.213h4.635V71.5zm7.252-8.439v-1.016h7.091v1.016h-2.973V71.5H59.37v-8.439zm8.858 8.439v-9.455H66.4v4.21h5.041v-4.21h1.145V71.5h-1.145v-4.229h-5.04V71.5z"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M48.307 80.773h1.21l2.42 4.074h.103l2.42-4.074h1.21l-3.153 5.13V89.5H51.46v-3.597zm10.412 8.863q-.945 0-1.632-.417a2.8 2.8 0 0 1-1.052-1.176q-.366-.759-.367-1.765 0-1.005.367-1.772a2.9 2.9 0 0 1 1.031-1.202q.665-.435 1.551-.435.512 0 1.01.17.498.172.908.555.41.38.652 1.005.243.627.243 1.543v.426h-5.046v-.87h4.023q0-.552-.222-.988a1.67 1.67 0 0 0-.622-.686 1.74 1.74 0 0 0-.946-.251q-.6 0-1.04.298-.434.294-.669.767a2.25 2.25 0 0 0-.234 1.014v.58q0 .741.256 1.257.26.51.72.78a2.1 2.1 0 0 0 1.07.264q.396 0 .715-.11.324-.116.559-.342.234-.23.362-.57l.971.272q-.153.495-.515.87-.363.37-.895.579a3.3 3.3 0 0 1-1.198.204m8.877-5.215-.904.255a1.7 1.7 0 0 0-.25-.439 1.2 1.2 0 0 0-.444-.358q-.282-.14-.72-.14-.6 0-1.002.277-.396.272-.396.694 0 .375.273.593.272.216.852.362l.972.238q.877.214 1.308.652.43.435.43 1.121 0 .562-.324 1.006a2.15 2.15 0 0 1-.895.699q-.575.255-1.338.255-1.001 0-1.657-.434-.657-.435-.831-1.27l.954-.239q.136.53.516.793.384.264 1.001.264.704 0 1.117-.298.417-.303.417-.725a.76.76 0 0 0-.238-.57q-.24-.235-.733-.35l-1.091-.256q-.9-.213-1.321-.66-.418-.453-.418-1.13 0-.554.311-.98.315-.426.857-.669a3 3 0 0 1 1.236-.243q.971 0 1.525.427.559.425.793 1.124m4.48-1.467v.853h-3.392v-.853zm-2.404-1.568h1.006v6.239q0 .426.124.64a.64.64 0 0 0 .323.28q.201.069.422.069.166 0 .273-.017l.17-.034.205.903a2 2 0 0 1-.286.077 2 2 0 0 1-.464.042q-.426 0-.835-.183a1.66 1.66 0 0 1-.674-.558q-.264-.376-.264-.946zm6.59 8.25q-.945 0-1.632-.417a2.8 2.8 0 0 1-1.052-1.176q-.367-.759-.367-1.765t.367-1.772a2.9 2.9 0 0 1 1.031-1.202q.664-.435 1.551-.435.512 0 1.01.17.498.172.908.555.409.38.652 1.005.243.627.243 1.543v.426h-5.046v-.87h4.023q0-.552-.222-.988a1.67 1.67 0 0 0-.622-.686 1.74 1.74 0 0 0-.946-.251q-.6 0-1.04.298-.434.294-.669.767a2.25 2.25 0 0 0-.234 1.014v.58q0 .741.256 1.257.26.51.72.78a2.1 2.1 0 0 0 1.07.264q.396 0 .715-.11.324-.116.559-.342.234-.23.362-.57l.971.272q-.153.495-.515.87-.363.37-.895.579a3.3 3.3 0 0 1-1.198.204m4.24-.136v-6.546h.972v.99h.068q.18-.487.648-.79a1.9 1.9 0 0 1 1.057-.302q.11 0 .277.004.165.005.251.013v1.023a3 3 0 0 0-.234-.038q-.18-.03-.38-.03-.477 0-.852.2a1.47 1.47 0 0 0-.801 1.334V89.5zm6.738.136a2.56 2.56 0 0 1-1.445-.413q-.627-.417-.98-1.176-.354-.763-.354-1.803 0-1.03.354-1.79.354-.758.984-1.171t1.458-.414q.638 0 1.01.213.375.21.57.478.201.263.312.434h.085v-3.221h1.006V89.5h-.972v-1.006h-.12q-.11.18-.314.452-.206.269-.584.482-.38.208-1.01.208m.136-.903q.605 0 1.023-.315.417-.32.635-.883.217-.566.217-1.308 0-.733-.213-1.282a1.87 1.87 0 0 0-.63-.861q-.42-.311-1.032-.311-.639 0-1.065.328-.422.324-.635.882-.21.555-.209 1.244 0 .7.213 1.27.217.567.64.904.425.332 1.056.332m6.771.92a2.7 2.7 0 0 1-1.129-.234 1.94 1.94 0 0 1-.805-.686q-.3-.452-.299-1.091 0-.562.222-.912.222-.353.592-.554.371-.2.819-.298a10 10 0 0 1 .907-.162q.597-.077.968-.115.375-.043.545-.14.175-.099.175-.342v-.034q0-.63-.346-.98-.34-.35-1.035-.35-.72 0-1.13.316-.408.315-.575.673l-.954-.34q.255-.597.682-.93.431-.336.937-.468.511-.137 1.006-.137.316 0 .724.077.414.073.797.303.388.23.644.694.255.465.255 1.245V89.5h-1.005v-.886h-.051a1.8 1.8 0 0 1-.341.456q-.24.243-.635.413-.396.17-.968.17m.154-.903q.596 0 1.005-.234a1.6 1.6 0 0 0 .836-1.385v-.92q-.065.075-.282.14-.212.06-.494.106a22 22 0 0 1-.963.128q-.392.052-.733.166a1.26 1.26 0 0 0-.545.337q-.205.222-.205.605 0 .525.388.793.391.264.993.264m5.095 3.204a2.2 2.2 0 0 1-.733-.119l.256-.886q.366.093.648.068a.77.77 0 0 0 .498-.251q.222-.222.405-.72l.188-.512-2.42-6.58h1.09l1.807 5.217h.068l1.807-5.217h1.091l-2.779 7.5a2.8 2.8 0 0 1-.464.84q-.277.337-.644.499a2 2 0 0 1-.818.161"
                        ></path>
                        <path
                          fill="#01b28b"
                          d="M308.767 69.338v-6.094h1.034v6.094zm-2.53-2.53v-1.034h6.094v1.034zm11.395 4.321q-1.044 0-1.778-.568-.734-.572-1.121-1.657-.388-1.089-.388-2.631 0-1.533.388-2.618.392-1.089 1.126-1.662.739-.577 1.773-.577t1.768.577q.738.573 1.126 1.662.393 1.085.393 2.618 0 1.542-.388 2.631-.388 1.085-1.122 1.657-.734.568-1.777.568m0-1.015q1.034 0 1.606-.998.573-.996.573-2.843 0-1.229-.263-2.091-.26-.864-.748-1.316a1.65 1.65 0 0 0-1.168-.453q-1.024 0-1.602 1.011-.577 1.006-.577 2.849 0 1.227.258 2.086.259.859.744 1.307a1.68 1.68 0 0 0 1.177.448m5.523.96a.8.8 0 0 1-.586-.245.8.8 0 0 1-.245-.586.8.8 0 0 1 .245-.586.8.8 0 0 1 .586-.245.8.8 0 0 1 .587.245.8.8 0 0 1 .244.586q0 .226-.115.415a.9.9 0 0 1-.3.305.8.8 0 0 1-.416.11m5.522.055q-1.043 0-1.778-.568-.734-.572-1.121-1.657-.388-1.089-.388-2.631 0-1.533.388-2.618.392-1.089 1.126-1.662.738-.577 1.773-.577t1.768.577q.738.573 1.126 1.662.393 1.085.393 2.618 0 1.542-.388 2.631-.388 1.085-1.122 1.657-.734.568-1.777.568m0-1.015q1.034 0 1.606-.998.573-.996.573-2.843 0-1.229-.263-2.091-.26-.864-.748-1.316a1.65 1.65 0 0 0-1.168-.453q-1.024 0-1.602 1.011-.577 1.006-.577 2.849 0 1.227.258 2.086.259.859.744 1.307a1.68 1.68 0 0 0 1.177.448m8.365-8.569V71h-1.145v-8.254h-.055l-2.309 1.532v-1.163l2.364-1.57zm5.803 9.584q-1.043 0-1.778-.568-.734-.572-1.121-1.657-.388-1.089-.388-2.631 0-1.533.388-2.618.392-1.089 1.126-1.662.738-.577 1.773-.577 1.033 0 1.768.577.738.573 1.126 1.662.393 1.085.393 2.618 0 1.542-.388 2.631-.389 1.085-1.122 1.657-.734.568-1.777.568m0-1.015q1.034 0 1.606-.998.573-.996.573-2.843 0-1.229-.263-2.091-.26-.864-.748-1.316a1.65 1.65 0 0 0-1.168-.453q-1.025 0-1.602 1.011-.577 1.006-.577 2.849 0 1.227.258 2.086.259.859.744 1.307a1.68 1.68 0 0 0 1.177.448m8.365-8.569V71h-1.145v-8.254h-.056l-2.308 1.532v-1.163l2.364-1.57z"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M357.751 71v-9.455h5.706v1.016h-4.561v3.195h4.266v1.015h-4.266v3.213h4.635V71zm7.253-8.439v-1.016h7.091v1.016h-2.973V71h-1.145v-8.439zM373.862 71v-9.455h1.145v4.21h5.041v-4.21h1.145V71h-1.145v-4.229h-5.041V71zm-10.385 19.09V79.183h.699V90.09zm2.353-7.636a1.34 1.34 0 0 0-.623-1.005q-.544-.358-1.338-.358-.579 0-1.014.187a1.6 1.6 0 0 0-.673.516 1.24 1.24 0 0 0-.239.746q0 .35.166.6.171.248.435.414.264.162.554.268.29.103.533.167l.886.238q.34.09.759.247.421.158.805.43.388.27.639.691.252.422.252 1.036 0 .707-.371 1.278-.366.57-1.074.908-.703.336-1.709.336-.937 0-1.623-.302a2.6 2.6 0 0 1-1.074-.844 2.4 2.4 0 0 1-.439-1.257h1.091q.042.495.332.818.294.32.742.478.452.153.971.153a2.9 2.9 0 0 0 1.087-.196 1.9 1.9 0 0 0 .763-.554q.28-.358.281-.835 0-.435-.243-.708a1.8 1.8 0 0 0-.639-.443 7 7 0 0 0-.857-.298l-1.074-.307q-1.022-.294-1.619-.84-.597-.545-.597-1.427 0-.734.397-1.278.4-.55 1.074-.853a3.6 3.6 0 0 1 1.512-.307q.845 0 1.5.303.657.299 1.04.818.388.52.409 1.18zm2.589 4.364h1.074q.047.444.303.75.26.303.673.46.414.154.916.154.546 0 .98-.183.435-.184.691-.546.255-.367.255-.907 0-.474-.221-.878-.222-.41-.712-.66-.49-.252-1.3-.252h-.698v-.853l2.181-2.625v-.068h-3.715v-.937h5.164v.767l-2.335 2.83v.067q.563.026 1.048.23.49.206.853.555.366.35.571.814t.204 1.01q0 .745-.383 1.329-.38.579-1.053.912-.67.332-1.547.332-.776 0-1.427-.272a2.6 2.6 0 0 1-1.061-.789 2.2 2.2 0 0 1-.461-1.24m10.519 2.301q-.964 0-1.641-.524-.678-.528-1.036-1.53-.358-1.005-.358-2.429 0-1.414.358-2.416.363-1.006 1.04-1.534.682-.533 1.637-.533.954 0 1.632.533.682.529 1.039 1.534.363 1.002.363 2.416 0 1.424-.358 2.43-.358 1-1.036 1.53-.678.523-1.64.523m0-.937q.954 0 1.482-.92.53-.921.529-2.626 0-1.133-.243-1.93-.239-.797-.69-1.215a1.53 1.53 0 0 0-1.078-.417q-.947 0-1.479.933-.533.93-.533 2.63 0 1.133.239 1.925.239.793.686 1.207.451.413 1.087.413"
                        ></path>
                        <rect
                          width="391"
                          height="50"
                          y="102"
                          fill="#fff"
                          fillOpacity="0.025"
                          rx="5"
                        />
                        <g clipPath="url(#staking-rewards_svg__d)">
                          <path
                            fill="#fff"
                            d="M32.083 115.667H17.917a5.667 5.667 0 0 0-5.667 5.666v8.5a5.667 5.667 0 0 0 5.667 5.667h14.166a5.667 5.667 0 0 0 5.667-5.667v-8.5a5.667 5.667 0 0 0-5.667-5.666"
                          ></path>
                          <path
                            fill="#e84142"
                            fillRule="evenodd"
                            d="M42 127c0 9.389-7.611 17-17 17s-17-7.611-17-17 7.611-17 17-17 17 7.611 17 17m-21.817 6.765h-3.3c-.693 0-1.035 0-1.244-.133a.84.84 0 0 1-.38-.656c-.013-.246.159-.547.501-1.149l8.146-14.358c.347-.61.522-.915.744-1.028a.84.84 0 0 1 .76 0c.221.113.396.418.743 1.028l1.675 2.923.008.015c.375.654.565.986.647 1.334.092.38.092.781 0 1.161-.083.351-.271.685-.651 1.349l-4.28 7.564-.01.019c-.377.66-.568.994-.833 1.246a2.5 2.5 0 0 1-1.014.589c-.347.096-.736.096-1.512.096m8.331 0h4.728c.697 0 1.048 0 1.257-.138a.83.83 0 0 0 .38-.659c.012-.239-.155-.528-.484-1.094l-.034-.059-2.368-4.051-.027-.046c-.333-.562-.5-.846-.716-.956a.83.83 0 0 0-.756 0c-.217.112-.393.409-.74 1.006l-2.359 4.051-.008.014c-.345.596-.518.894-.506 1.139a.85.85 0 0 0 .38.66c.205.133.556.133 1.253.133"
                            clipRule="evenodd"
                          ></path>
                        </g>
                        <path
                          fill="#d9d5f1"
                          d="M51.533 122.5h-1.2l3.471-9.455h1.182l3.471 9.455h-1.2l-2.825-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zm7.453-5.762 2.807 7.959h.11l2.808-7.959h1.2l-3.472 9.455h-1.181l-3.472-9.455zm7.973 9.455h-1.2l3.471-9.455h1.182l3.471 9.455h-1.2l-2.825-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zm8.508-5.762 2.438 3.934h.074l2.437-3.934h1.348l-2.973 4.728 2.973 4.727h-1.348l-2.437-3.859h-.074l-2.438 3.859h-1.348l3.047-4.727-3.047-4.728z"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M50.903 140.5v-.767l2.881-3.153q.508-.555.835-.964.33-.413.486-.775.162-.366.162-.767 0-.46-.222-.797a1.44 1.44 0 0 0-.596-.52 1.9 1.9 0 0 0-.852-.183q-.504 0-.878.209a1.44 1.44 0 0 0-.575.575 1.8 1.8 0 0 0-.2.869h-1.007q0-.767.354-1.346t.963-.904q.614-.324 1.377-.324.766 0 1.36.324.592.324.928.874t.337 1.223q0 .481-.175.942-.17.456-.597 1.018-.421.558-1.172 1.364l-1.96 2.096v.068h4.057v.938zm13.13.136q-.819 0-1.445-.413-.626-.417-.98-1.176-.354-.763-.354-1.803 0-1.031.354-1.789.354-.76.984-1.172.63-.414 1.458-.414.64 0 1.01.213.375.21.57.478.201.264.312.434h.085v-3.221h1.006v8.727h-.972v-1.006h-.12q-.11.18-.315.452a1.9 1.9 0 0 1-.583.482q-.38.208-1.01.208m.136-.903q.605 0 1.023-.315.417-.32.635-.882.217-.567.217-1.309 0-.732-.213-1.282a1.86 1.86 0 0 0-.63-.861q-.42-.312-1.032-.311-.639 0-1.065.328-.423.324-.635.882-.21.554-.21 1.244 0 .699.214 1.27.217.567.64.904.425.332 1.056.332m6.771.92q-.62 0-1.129-.234a1.94 1.94 0 0 1-.805-.686q-.3-.452-.299-1.091 0-.562.222-.912.222-.353.592-.554a3.1 3.1 0 0 1 .819-.298 10 10 0 0 1 .907-.162q.597-.077.968-.115.374-.043.545-.141.174-.098.175-.341v-.034q0-.63-.346-.98-.34-.35-1.035-.349-.72 0-1.13.315-.408.316-.575.673l-.954-.341q.255-.596.682-.929.431-.336.937-.468a4 4 0 0 1 1.006-.137 4 4 0 0 1 .724.077q.413.072.797.303.388.23.644.694.255.465.255 1.245v4.312h-1.005v-.886h-.052a1.8 1.8 0 0 1-.34.456q-.24.243-.635.413-.396.17-.968.17m.154-.903q.597 0 1.005-.234a1.6 1.6 0 0 0 .836-1.385v-.921q-.065.077-.282.141a5 5 0 0 1-.494.106 21 21 0 0 1-.963.128q-.392.051-.733.166a1.26 1.26 0 0 0-.545.337q-.205.221-.205.605 0 .525.388.793.391.264.993.264m5.095 3.205a2.2 2.2 0 0 1-.456-.043 1.2 1.2 0 0 1-.277-.077l.256-.886q.366.093.648.068a.78.78 0 0 0 .498-.251q.222-.222.405-.721l.188-.511-2.42-6.579h1.09l1.807 5.215h.068l1.807-5.215h1.09l-2.778 7.5q-.188.506-.464.839-.278.336-.644.499a2 2 0 0 1-.818.162m10.669-7.535-.904.256a1.7 1.7 0 0 0-.251-.439 1.2 1.2 0 0 0-.443-.358q-.282-.14-.72-.14-.601 0-1.002.277-.396.272-.396.694 0 .375.272.593.273.216.853.362l.971.238q.878.214 1.308.652.43.435.43 1.121 0 .562-.323 1.006a2.16 2.16 0 0 1-.895.699q-.575.255-1.338.255-1.002 0-1.658-.434-.656-.435-.83-1.27l.954-.239q.136.528.516.793.383.264 1.001.264.703 0 1.116-.298.418-.303.418-.725a.76.76 0 0 0-.239-.571q-.239-.234-.732-.349l-1.091-.256q-.9-.213-1.321-.66-.418-.452-.418-1.13 0-.554.311-.98.315-.426.857-.669a3 3 0 0 1 1.235-.243q.972 0 1.526.426.558.427.793 1.125m6.934 5.233q-.622 0-1.13-.234a1.94 1.94 0 0 1-.805-.686q-.298-.452-.298-1.091 0-.562.222-.912.221-.353.592-.554.37-.2.818-.298.452-.102.908-.162.596-.077.967-.115.375-.043.546-.141.174-.098.174-.341v-.034q0-.63-.345-.98-.34-.35-1.035-.349-.72 0-1.13.315-.408.316-.575.673l-.955-.341q.255-.596.682-.929.43-.336.938-.468a4 4 0 0 1 1.005-.137 4 4 0 0 1 .725.077q.413.072.797.303.387.23.643.694.256.465.256 1.245v4.312h-1.006v-.886h-.05a1.8 1.8 0 0 1-.342.456q-.238.243-.635.413-.396.17-.967.17m.153-.903q.597 0 1.006-.234.414-.235.622-.605.213-.372.213-.78v-.921q-.063.077-.281.141-.213.06-.494.106a21 21 0 0 1-.963.128 4 4 0 0 0-.733.166 1.26 1.26 0 0 0-.546.337q-.204.221-.204.605 0 .525.387.793.393.264.993.264m7.325 3.341q-.73 0-1.253-.188a2.7 2.7 0 0 1-.874-.485 2.7 2.7 0 0 1-.55-.64l.801-.562q.136.179.346.409.208.234.571.405.366.174.959.175.792 0 1.308-.384.515-.383.515-1.202v-1.329h-.085a6 6 0 0 1-.315.443 1.8 1.8 0 0 1-.58.464q-.375.201-1.014.201a2.73 2.73 0 0 1-1.423-.375 2.63 2.63 0 0 1-.993-1.091q-.362-.716-.362-1.739 0-1.005.353-1.751.354-.75.985-1.159.63-.414 1.457-.414.639 0 1.014.213.38.21.58.478.204.264.315.434h.102v-1.039h.972v6.733q0 .843-.383 1.372a2.2 2.2 0 0 1-1.023.779 3.9 3.9 0 0 1-1.423.252m-.035-3.597q.606 0 1.023-.277.418-.276.635-.797.217-.52.217-1.244 0-.707-.213-1.248a1.87 1.87 0 0 0-.63-.848q-.418-.307-1.032-.307-.639 0-1.065.324a1.96 1.96 0 0 0-.635.869q-.209.546-.209 1.21 0 .683.213 1.206.217.52.64.818.426.294 1.056.294m7.364 1.142q-.886 0-1.555-.422a2.86 2.86 0 0 1-1.04-1.18q-.37-.759-.371-1.773 0-1.022.371-1.785.374-.763 1.04-1.185.669-.422 1.555-.422t1.551.422q.67.421 1.04 1.185.375.763.375 1.785 0 1.014-.375 1.773a2.8 2.8 0 0 1-1.04 1.18q-.664.423-1.551.422m0-.903q.673 0 1.108-.345t.643-.908q.21-.562.209-1.219 0-.656-.209-1.223a2.06 2.06 0 0 0-.643-.916q-.435-.35-1.108-.349-.673 0-1.108.349-.435.35-.643.916-.21.567-.209 1.223 0 .657.209 1.219.208.563.643.908t1.108.345"
                        ></path>
                        <path
                          fill="#01b28b"
                          d="M299.767 119.338v-6.094h1.034v6.094zm-2.53-2.53v-1.034h6.094v1.034zm11.635-5.263V121h-1.145v-8.254h-.055l-2.309 1.532v-1.163l2.364-1.57zm2.973 9.529a.8.8 0 0 1-.586-.245.8.8 0 0 1-.245-.586q0-.342.245-.586a.8.8 0 0 1 .586-.245q.342 0 .586.245a.8.8 0 0 1 .245.586.8.8 0 0 1-.116.415.84.84 0 0 1-.3.305.8.8 0 0 1-.415.111m5.521.055q-1.043 0-1.777-.568-.733-.572-1.122-1.657-.387-1.089-.388-2.631 0-1.533.388-2.618.393-1.089 1.126-1.662.74-.576 1.773-.577 1.035 0 1.768.577.739.573 1.127 1.662.392 1.085.392 2.618 0 1.542-.388 2.631-.387 1.085-1.121 1.657-.735.568-1.778.568m0-1.015q1.034 0 1.607-.998.572-.996.572-2.843 0-1.228-.263-2.092-.258-.863-.748-1.315a1.65 1.65 0 0 0-1.168-.453q-1.024 0-1.602 1.011-.577 1.007-.577 2.849 0 1.227.259 2.086.258.859.743 1.307.49.448 1.177.448m7.996 1.015q-.813 0-1.463-.323a2.7 2.7 0 0 1-1.044-.886 2.4 2.4 0 0 1-.429-1.284h1.108q.065.642.582 1.062.521.416 1.246.416.582 0 1.034-.273.457-.272.716-.748.263-.48.263-1.084a2.2 2.2 0 0 0-.273-1.104 2 2 0 0 0-.738-.771 2.1 2.1 0 0 0-1.076-.286 3 3 0 0 0-.891.134 2.5 2.5 0 0 0-.752.346l-1.071-.129.572-4.654h4.912v1.016h-3.952l-.332 2.788h.055q.29-.23.73-.383.438-.152.914-.152a2.9 2.9 0 0 1 1.546.415q.684.411 1.071 1.127.393.716.393 1.634 0 .905-.407 1.616a2.96 2.96 0 0 1-1.108 1.117q-.706.406-1.606.406m7.965-9.713a3.4 3.4 0 0 1 1.163.222q.582.216 1.062.72.48.498.771 1.362.29.863.29 2.165 0 1.26-.24 2.239-.235.974-.683 1.643a3 3 0 0 1-1.08 1.016 2.93 2.93 0 0 1-1.431.346q-.795 0-1.417-.314a2.8 2.8 0 0 1-1.016-.881 3.1 3.1 0 0 1-.503-1.316h1.126q.152.65.605 1.076.457.42 1.205.42 1.094 0 1.726-.956.637-.955.637-2.701h-.073a2.9 2.9 0 0 1-.614.67 2.7 2.7 0 0 1-1.713.586 2.87 2.87 0 0 1-1.491-.402q-.675-.405-1.081-1.112-.4-.711-.401-1.625 0-.868.388-1.588a3 3 0 0 1 1.098-1.154q.71-.43 1.672-.416m0 1.016q-.582 0-1.048.291a2.1 2.1 0 0 0-.734.775 2.2 2.2 0 0 0-.268 1.076q0 .59.258 1.076.263.48.716.766.457.282 1.039.281.438 0 .817-.17.378-.176.66-.476a2.3 2.3 0 0 0 .448-.688q.16-.388.161-.808 0-.554-.268-1.038a2.1 2.1 0 0 0-.729-.785 1.9 1.9 0 0 0-1.052-.3m8.186 8.697q-1.043 0-1.778-.568-.734-.572-1.121-1.657-.388-1.089-.388-2.631 0-1.533.388-2.618.392-1.089 1.126-1.662.738-.576 1.773-.577 1.033 0 1.768.577.739.573 1.126 1.662.393 1.085.393 2.618 0 1.542-.388 2.631-.389 1.085-1.122 1.657-.734.568-1.777.568m0-1.015q1.034 0 1.606-.998.573-.996.573-2.843 0-1.228-.263-2.092-.26-.863-.748-1.315a1.65 1.65 0 0 0-1.168-.453q-1.026 0-1.602 1.011-.577 1.007-.577 2.849 0 1.227.258 2.086.259.859.743 1.307.49.448 1.178.448"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M350.764 121h-1.2l3.471-9.455h1.182l3.472 9.455h-1.2l-2.826-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zm7.454-5.762 2.806 7.959h.111l2.807-7.959h1.2L362.114 121h-1.182l-3.472-9.455zm7.972 9.455h-1.2l3.472-9.455h1.181l3.472 9.455h-1.2l-2.826-7.959h-.073zm.443-3.693h4.839v1.015h-4.839zm8.509-5.762 2.437 3.934h.074l2.437-3.934h1.348l-2.973 4.728 2.973 4.727h-1.348l-2.437-3.859h-.074L375.585 121h-1.348l3.046-4.727-3.046-4.728zm-10.108 28.546v-10.909h.699v10.909zm2.353-7.636a1.34 1.34 0 0 0-.623-1.006q-.544-.358-1.338-.358-.579 0-1.014.187a1.6 1.6 0 0 0-.673.516 1.24 1.24 0 0 0-.239.746q0 .35.166.601.171.246.435.413.264.162.554.268.29.103.533.167l.886.238q.34.09.759.247.421.159.805.431.388.268.639.69.252.422.252 1.036a2.3 2.3 0 0 1-.371 1.278q-.366.571-1.074.908-.703.336-1.709.336-.937 0-1.623-.302a2.6 2.6 0 0 1-1.074-.844 2.4 2.4 0 0 1-.439-1.257h1.091q.042.495.332.818.294.32.742.477.452.154.971.154.606 0 1.087-.196.481-.2.763-.554.28-.358.281-.835 0-.435-.243-.708a1.8 1.8 0 0 0-.639-.443 7 7 0 0 0-.857-.298l-1.074-.307q-1.022-.294-1.619-.84-.597-.545-.597-1.427 0-.733.397-1.279.4-.549 1.074-.852a3.6 3.6 0 0 1 1.512-.307q.845 0 1.5.303.657.299 1.04.818.388.52.409 1.181zm5.521-2.182V139h-1.057v-7.193h-.068q-.06.119-.307.273a2.8 2.8 0 0 1-.639.264 3.3 3.3 0 0 1-.895.111v-.887q.507 0 .878-.183.37-.184.618-.43a2.6 2.6 0 0 0 .379-.448l.154-.234zm2.365 6.545h1.074q.047.444.303.75.26.303.673.46a2.6 2.6 0 0 0 .916.154 2.5 2.5 0 0 0 .98-.183q.435-.184.691-.546.255-.366.255-.908 0-.473-.221-.877-.222-.41-.712-.661t-1.3-.251h-.699v-.853l2.182-2.625v-.068h-3.716v-.937h5.165v.767l-2.335 2.829v.069q.562.025 1.048.23.49.204.853.554.366.35.571.814t.204 1.009q0 .747-.383 1.33a2.6 2.6 0 0 1-1.053.912q-.67.332-1.547.332-.776 0-1.427-.272a2.6 2.6 0 0 1-1.062-.789 2.2 2.2 0 0 1-.46-1.24"
                        ></path>
                        <g clipPath="url(#staking-rewards_svg__e)">
                          <path
                            fill="#f7931a"
                            d="M41.488 183.112c-2.27 9.108-11.495 14.65-20.603 12.379-9.105-2.27-14.647-11.495-12.376-20.602 2.27-9.108 11.494-14.651 20.6-12.38s14.65 11.496 12.379 20.603"
                          ></path>
                          <path
                            fill="#fff"
                            d="M32.495 176.578c.338-2.262-1.384-3.478-3.74-4.29l.764-3.064-1.865-.465-.744 2.984a70 70 0 0 0-1.495-.352l.75-3.004-1.865-.464-.764 3.063a60 60 0 0 1-1.191-.28l.002-.009-2.573-.643-.496 1.993s1.384.317 1.355.336c.755.189.892.689.87 1.085l-.871 3.492c.052.013.12.032.194.062l-.197-.049-1.22 4.891c-.093.229-.327.574-.855.443.019.027-1.356-.338-1.356-.338l-.926 2.135 2.428.605c.451.113.894.232 1.33.343l-.772 3.1 1.863.465.765-3.067a71 71 0 0 0 1.486.386l-.762 3.052 1.866.465.772-3.094c3.18.602 5.572.359 6.58-2.518.81-2.316-.041-3.653-1.715-4.524 1.22-.281 2.137-1.083 2.382-2.739m-4.263 5.977c-.576 2.316-4.476 1.064-5.741.75l1.024-4.107c1.265.316 5.32.941 4.717 3.357m.577-6.011c-.526 2.107-3.772 1.037-4.825.774l.929-3.724c1.053.263 4.444.753 3.896 2.95"
                          ></path>
                        </g>
                        <path
                          fill="#d9d5f1"
                          d="M51.145 174.5v-9.455h3.305q.988 0 1.63.342.642.337.956.91.313.567.313 1.26 0 .61-.216 1.006-.213.397-.564.628-.345.231-.752.342v.092q.434.027.872.305.439.276.734.794.296.516.296 1.265 0 .711-.323 1.278-.324.568-1.02.901-.697.332-1.815.332zm1.145-1.016h2.271q1.122 0 1.593-.434a1.39 1.39 0 0 0 .475-1.061q0-.48-.244-.887a1.77 1.77 0 0 0-.697-.655q-.453-.25-1.072-.25H52.29zm0-4.284h2.123q.518 0 .933-.203.42-.203.665-.572.249-.37.249-.868 0-.624-.434-1.057-.434-.44-1.376-.439h-2.16zm6.793-3.139v-1.016h7.09v1.016h-2.972v8.439h-1.145v-8.439zM75.155 168H74.01a2.38 2.38 0 0 0-.965-1.496 2.6 2.6 0 0 0-.789-.388 3.2 3.2 0 0 0-.905-.129q-.858 0-1.555.434-.693.434-1.104 1.279-.405.844-.406 2.073 0 1.227.406 2.073.411.844 1.104 1.278.697.434 1.555.434.471 0 .905-.129a2.7 2.7 0 0 0 .79-.383 2.43 2.43 0 0 0 .964-1.501h1.145a3.8 3.8 0 0 1-.47 1.298q-.343.572-.85.974a3.8 3.8 0 0 1-1.14.605 4.3 4.3 0 0 1-1.344.207q-1.209 0-2.151-.591t-1.482-1.68-.54-2.585.54-2.585 1.482-1.681 2.151-.591q.715 0 1.344.208.632.208 1.14.609.507.397.85.97.34.567.47 1.297"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M50.767 190.318h1.074q.047.444.303.75.26.303.673.46.412.154.916.154.545 0 .98-.183.435-.184.69-.546.255-.366.256-.908 0-.473-.221-.877-.222-.41-.712-.661t-1.3-.251h-.699v-.853l2.182-2.625v-.068h-3.716v-.937h5.165v.767l-2.335 2.829v.069q.562.025 1.048.23.49.204.852.554.367.35.571.814.205.464.205 1.009 0 .747-.384 1.33-.378.579-1.052.912-.67.332-1.547.332-.776 0-1.428-.272a2.6 2.6 0 0 1-1.06-.789 2.2 2.2 0 0 1-.461-1.24m13.535 2.318q-.818 0-1.444-.413-.627-.417-.98-1.176-.354-.763-.354-1.803 0-1.031.353-1.789.354-.76.985-1.172.63-.414 1.457-.414.64 0 1.01.213.375.21.571.478.2.264.311.434h.085v-3.221h1.006v8.727h-.971v-1.006h-.12a6 6 0 0 1-.315.452q-.204.269-.584.482-.38.208-1.01.208m.137-.903q.605 0 1.022-.315.418-.32.635-.882.218-.567.218-1.309 0-.732-.213-1.282a1.86 1.86 0 0 0-.631-.861q-.418-.312-1.031-.311-.64 0-1.066.328-.422.324-.635.882-.209.554-.209 1.244 0 .699.213 1.27.217.567.64.904.426.332 1.057.332m6.77.92q-.621 0-1.128-.234a1.94 1.94 0 0 1-.806-.686q-.298-.452-.298-1.091 0-.562.221-.912.222-.353.593-.554a3.1 3.1 0 0 1 .818-.298q.452-.102.908-.162.596-.077.967-.115.375-.043.546-.141.174-.098.174-.341v-.034q0-.63-.345-.98-.34-.35-1.035-.349-.72 0-1.13.315-.409.316-.575.673l-.955-.341q.255-.596.682-.929.43-.336.938-.468a4 4 0 0 1 1.005-.137 4 4 0 0 1 .725.077q.413.072.797.303.387.23.643.694.256.465.256 1.245v4.312h-1.006v-.886h-.05a1.8 1.8 0 0 1-.342.456 2 2 0 0 1-.635.413q-.396.17-.967.17m.154-.903q.597 0 1.006-.234a1.6 1.6 0 0 0 .835-1.385v-.921q-.063.077-.281.141a5 5 0 0 1-.494.106 21 21 0 0 1-.963.128 4 4 0 0 0-.733.166 1.26 1.26 0 0 0-.546.337q-.204.221-.204.605 0 .525.387.793.393.264.993.264m5.096 3.205a2.2 2.2 0 0 1-.456-.043 1.2 1.2 0 0 1-.277-.077l.255-.886q.367.093.648.068a.78.78 0 0 0 .499-.251q.221-.222.405-.721l.187-.511-2.42-6.579h1.09l1.807 5.215h.069l1.806-5.215h1.091l-2.778 7.5q-.187.506-.465.839-.276.337-.643.499a2 2 0 0 1-.818.162m10.668-7.535-.903.256a1.7 1.7 0 0 0-.252-.439 1.2 1.2 0 0 0-.443-.358q-.28-.14-.72-.14-.6 0-1.001.277-.397.272-.397.694 0 .375.273.593.273.216.852.362l.972.238q.877.214 1.308.652.43.435.43 1.121 0 .562-.323 1.006a2.16 2.16 0 0 1-.895.699q-.576.255-1.338.255-1.002 0-1.658-.434-.656-.435-.831-1.27l.955-.239q.135.529.515.793.384.264 1.002.264.702 0 1.116-.298.418-.303.418-.725a.76.76 0 0 0-.239-.571q-.239-.234-.733-.349l-1.09-.256q-.9-.213-1.322-.66-.417-.452-.417-1.13 0-.554.31-.98.315-.426.857-.669a3 3 0 0 1 1.236-.243q.971 0 1.526.426.558.428.792 1.125m6.934 5.233q-.62 0-1.129-.234a1.94 1.94 0 0 1-.805-.686q-.299-.452-.298-1.091 0-.562.221-.912.222-.353.592-.554a3.1 3.1 0 0 1 .819-.298 10 10 0 0 1 .907-.162q.596-.077.968-.115.374-.043.545-.141.175-.098.175-.341v-.034q0-.63-.345-.98-.342-.35-1.036-.349-.72 0-1.13.315-.408.316-.575.673l-.954-.341q.255-.596.682-.929.431-.336.937-.468a4 4 0 0 1 1.006-.137 4 4 0 0 1 .724.077q.414.072.797.303.388.23.644.694.255.465.255 1.245v4.312h-1.005v-.886h-.051a1.8 1.8 0 0 1-.341.456q-.24.243-.635.413-.396.17-.968.17m.154-.903q.597 0 1.005-.234a1.6 1.6 0 0 0 .836-1.385v-.921q-.065.077-.281.141a5 5 0 0 1-.495.106 21 21 0 0 1-.963.128q-.392.052-.733.166a1.26 1.26 0 0 0-.545.337q-.205.221-.205.605 0 .525.388.793.392.264.993.264m7.324 3.341q-.728 0-1.253-.188a2.7 2.7 0 0 1-.873-.485 2.7 2.7 0 0 1-.55-.64l.801-.562q.137.179.345.409.209.234.571.405.367.175.959.175.793 0 1.308-.384.516-.384.516-1.202v-1.329h-.085a5 5 0 0 1-.316.443 1.8 1.8 0 0 1-.579.464q-.375.201-1.014.201a2.73 2.73 0 0 1-1.424-.375 2.63 2.63 0 0 1-.993-1.091q-.362-.716-.362-1.739 0-1.005.354-1.751.354-.75.984-1.159.632-.414 1.458-.414.639 0 1.014.213.38.21.579.478.205.264.316.434h.102v-1.039h.972v6.733q0 .843-.384 1.372a2.2 2.2 0 0 1-1.023.779q-.639.252-1.423.252m-.034-3.597q.605 0 1.023-.277.417-.276.635-.797.217-.52.217-1.244 0-.707-.213-1.248a1.87 1.87 0 0 0-.631-.848q-.417-.307-1.031-.307-.639 0-1.065.324a1.96 1.96 0 0 0-.635.869q-.21.546-.21 1.21 0 .683.214 1.206.218.52.639.818.427.294 1.057.294m7.364 1.142q-.887 0-1.556-.422a2.86 2.86 0 0 1-1.04-1.18q-.37-.759-.37-1.773 0-1.022.37-1.785.375-.763 1.04-1.185.67-.422 1.556-.422.887 0 1.551.422.669.421 1.04 1.185.375.763.375 1.785 0 1.014-.375 1.773a2.83 2.83 0 0 1-1.04 1.18q-.664.423-1.551.422m0-.903q.672 0 1.108-.345.434-.345.643-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.07 2.07 0 0 0-.643-.916q-.436-.35-1.108-.349-.674 0-1.108.349-.435.35-.644.916a3.5 3.5 0 0 0-.209 1.223q0 .657.209 1.219t.644.908q.434.345 1.108.345"
                        ></path>
                        <path
                          fill="#01b28b"
                          d="M308.767 171.338v-6.094h1.034v6.094zm-2.53-2.53v-1.034h6.094v1.034zm11.395 4.321q-1.044 0-1.778-.568-.734-.572-1.121-1.657-.388-1.089-.388-2.631 0-1.533.388-2.618.392-1.089 1.126-1.662.739-.577 1.773-.577t1.768.577q.738.573 1.126 1.662.393 1.085.393 2.618 0 1.542-.388 2.631-.388 1.085-1.122 1.657-.734.568-1.777.568m0-1.015q1.034 0 1.606-.998.573-.996.573-2.843 0-1.228-.263-2.092-.26-.863-.748-1.315a1.65 1.65 0 0 0-1.168-.453q-1.024 0-1.602 1.011-.577 1.007-.577 2.849 0 1.227.258 2.086.259.859.744 1.307.489.447 1.177.448m5.523.96a.8.8 0 0 1-.586-.245.8.8 0 0 1-.245-.586.8.8 0 0 1 .245-.586.8.8 0 0 1 .586-.245q.342 0 .587.245a.8.8 0 0 1 .244.586.86.86 0 0 1-.415.72.8.8 0 0 1-.416.111m5.522.055q-1.043 0-1.778-.568-.734-.572-1.121-1.657-.388-1.089-.388-2.631 0-1.533.388-2.618.392-1.089 1.126-1.662.738-.577 1.773-.577t1.768.577q.738.573 1.126 1.662.393 1.085.393 2.618 0 1.542-.388 2.631-.388 1.085-1.122 1.657-.734.568-1.777.568m0-1.015q1.034 0 1.606-.998.573-.996.573-2.843 0-1.228-.263-2.092-.26-.863-.748-1.315a1.65 1.65 0 0 0-1.168-.453q-1.024 0-1.602 1.011-.577 1.007-.577 2.849 0 1.227.258 2.086.259.859.744 1.307.489.447 1.177.448m8.125 1.015q-1.043 0-1.778-.568-.734-.572-1.121-1.657-.388-1.089-.388-2.631 0-1.533.388-2.618.392-1.089 1.126-1.662.738-.577 1.773-.577t1.768.577q.738.573 1.126 1.662.393 1.085.393 2.618 0 1.542-.388 2.631-.388 1.085-1.122 1.657-.734.568-1.777.568m0-1.015q1.034 0 1.606-.998.573-.996.573-2.843 0-1.228-.263-2.092-.26-.863-.748-1.315a1.65 1.65 0 0 0-1.168-.453q-1.024 0-1.602 1.011-.577 1.007-.577 2.849 0 1.227.258 2.086.259.859.744 1.307.489.447 1.177.448m8.365-8.569V173h-1.145v-8.254h-.055l-2.309 1.532v-1.163l2.364-1.57zm6.043 0V173h-1.145v-8.254h-.056l-2.308 1.532v-1.163l2.364-1.57z"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M357.751 173v-9.455h3.306q.988 0 1.629.342.642.337.956.91.314.567.314 1.26 0 .61-.217 1.006a1.7 1.7 0 0 1-.563.628 2.6 2.6 0 0 1-.753.342v.092q.434.027.873.305.438.276.734.794.295.516.295 1.265 0 .711-.323 1.278-.322.568-1.02.901-.698.332-1.814.332zm1.145-1.016h2.272q1.12 0 1.592-.434.476-.438.476-1.061 0-.48-.245-.887a1.76 1.76 0 0 0-.697-.655q-.453-.25-1.071-.25h-2.327zm0-4.284h2.124q.516 0 .932-.203.42-.203.665-.572.249-.37.249-.868 0-.624-.434-1.057-.433-.44-1.375-.439h-2.161zm6.793-3.139v-1.016h7.091v1.016h-2.973V173h-1.145v-8.439zm16.073 1.939h-1.145a2.38 2.38 0 0 0-.965-1.496 2.6 2.6 0 0 0-.79-.388 3.2 3.2 0 0 0-.904-.129q-.859 0-1.556.434-.693.434-1.103 1.279-.407.844-.407 2.073 0 1.227.407 2.073.41.844 1.103 1.278.697.434 1.556.434.47 0 .904-.129.435-.13.79-.383a2.43 2.43 0 0 0 .965-1.501h1.145a3.9 3.9 0 0 1-.471 1.298 3.6 3.6 0 0 1-.85.974 3.7 3.7 0 0 1-1.14.605 4.3 4.3 0 0 1-1.343.207q-1.21 0-2.152-.591-.94-.591-1.482-1.68-.54-1.09-.54-2.585 0-1.496.54-2.585.541-1.09 1.482-1.681.942-.591 2.152-.591.715 0 1.343.208a3.7 3.7 0 0 1 1.14.609q.508.397.85.97.34.567.471 1.297m-23.285 25.591v-10.909h.699v10.909zm2.353-7.636a1.34 1.34 0 0 0-.623-1.006q-.544-.358-1.338-.358-.579 0-1.014.187a1.6 1.6 0 0 0-.673.516 1.24 1.24 0 0 0-.239.746q0 .35.166.601.171.246.435.413.264.162.554.268.29.103.533.167l.886.238q.34.09.759.247.421.159.805.431.388.268.639.69.252.422.252 1.036a2.3 2.3 0 0 1-.371 1.278q-.366.571-1.074.908-.703.336-1.709.336-.937 0-1.623-.302a2.6 2.6 0 0 1-1.074-.844 2.4 2.4 0 0 1-.439-1.257h1.091q.042.495.332.818.294.32.742.477.452.154.971.154.606 0 1.087-.196.481-.2.763-.554.28-.358.281-.835 0-.435-.243-.708a1.8 1.8 0 0 0-.639-.443 7 7 0 0 0-.857-.298l-1.074-.307q-1.022-.294-1.619-.84-.597-.545-.597-1.427 0-.733.397-1.279.4-.549 1.074-.852a3.6 3.6 0 0 1 1.512-.307q.845 0 1.5.303.657.299 1.04.818.388.52.409 1.181zm5.521-2.182V191h-1.057v-7.193h-.068q-.06.119-.307.273a2.8 2.8 0 0 1-.639.264 3.3 3.3 0 0 1-.895.111v-.887q.507 0 .878-.183.37-.183.618-.43a2.6 2.6 0 0 0 .379-.448l.154-.234zm5.348 8.846q-.963 0-1.64-.524-.678-.528-1.036-1.53-.358-1.005-.358-2.429 0-1.414.358-2.416.362-1.005 1.04-1.534.681-.533 1.636-.533t1.632.533q.682.529 1.04 1.534.363 1.002.362 2.416 0 1.424-.358 2.429-.357 1.002-1.035 1.53-.678.524-1.641.524m0-.937q.955 0 1.483-.921.528-.92.529-2.625 0-1.133-.243-1.93-.239-.797-.691-1.215a1.52 1.52 0 0 0-1.078-.417q-.945 0-1.478.933-.534.929-.533 2.629 0 1.134.238 1.926.24.793.687 1.206a1.55 1.55 0 0 0 1.086.414m7.5.937q-.963 0-1.64-.524-.678-.528-1.036-1.53-.358-1.005-.358-2.429 0-1.414.358-2.416.362-1.005 1.04-1.534.681-.533 1.636-.533t1.632.533q.682.529 1.04 1.534.363 1.002.362 2.416 0 1.424-.358 2.429-.357 1.002-1.035 1.53-.678.524-1.641.524m0-.937q.955 0 1.483-.921.528-.92.529-2.625 0-1.133-.243-1.93-.239-.797-.691-1.215a1.52 1.52 0 0 0-1.078-.417q-.945 0-1.478.933-.534.929-.533 2.629 0 1.134.238 1.926.24.793.687 1.206a1.55 1.55 0 0 0 1.086.414"
                        ></path>
                        <rect
                          width="391"
                          height="50"
                          y="206"
                          fill="#fff"
                          fillOpacity="0.025"
                          rx="5"
                        />
                        <g clipPath="url(#staking-rewards_svg__f)">
                          <path
                            fill="#e0edff"
                            d="M25 248c9.389 0 17-7.611 17-17s-7.611-17-17-17-17 7.611-17 17 7.611 17 17 17"
                          ></path>
                          <path
                            fill="#0033ad"
                            d="M19.881 230.216a1.54 1.54 0 0 0 1.439 1.631h.09a1.53 1.53 0 0 0 1.523-1.552 1.53 1.53 0 0 0-1.529-1.545c-.81 0-1.48.644-1.523 1.466m-5.694-.399a.49.49 0 0 0-.52.472.5.5 0 0 0 .465.528.496.496 0 0 0 .52-.473.5.5 0 0 0-.465-.527m5.597-8.592a.51.51 0 0 0 .218-.674.494.494 0 1 0-.883.447.485.485 0 0 0 .665.227m1.547 2.742a.78.78 0 0 0 .339-1.037.76.76 0 0 0-1.022-.343.78.78 0 0 0-.338 1.036.76.76 0 0 0 1.021.344m-5.21 1.882c.29.19.677.111.87-.184a.647.647 0 0 0-.18-.883.627.627 0 0 0-.871.184.64.64 0 0 0 .181.883m.925 3.692a.764.764 0 0 0-.804.73.767.767 0 0 0 .72.816.764.764 0 0 0 .803-.73.77.77 0 0 0-.72-.816m-.839 5.195a.643.643 0 0 0-.278.858.626.626 0 0 0 .846.282.643.643 0 0 0 .278-.858.627.627 0 0 0-.846-.282m2.962-6.795a.88.88 0 0 0 1.239-.264.91.91 0 0 0-.26-1.257.88.88 0 0 0-1.24.263.914.914 0 0 0 .26 1.258m9.4-4.036a.76.76 0 0 0 1.057-.221.785.785 0 0 0-.217-1.073.76.76 0 0 0-1.058.221.773.773 0 0 0 .218 1.073m1.559-2.729c.23.153.532.086.683-.147a.5.5 0 0 0-.145-.693.49.49 0 0 0-.683.141.52.52 0 0 0 .145.699m-1.444 7.562a1.53 1.53 0 0 0-1.608 1.459c-.049.853.598 1.589 1.438 1.632h.085c.84 0 1.523-.693 1.523-1.552a1.53 1.53 0 0 0-1.438-1.539m-6.849-.908c.26.521.786.853 1.366.853.84 0 1.523-.693 1.523-1.552 0-.239-.054-.478-.163-.699a1.513 1.513 0 0 0-2.049-.687 1.565 1.565 0 0 0-.677 2.085m11.962-1.981a.643.643 0 0 0 .272-.858.625.625 0 0 0-.846-.276.644.644 0 0 0-.278.852.634.634 0 0 0 .852.282m-3.868.491a.916.916 0 0 0-.4 1.22.89.89 0 0 0 1.203.405.915.915 0 0 0 .4-1.22.895.895 0 0 0-1.203-.405m-4.987-5.397a.64.64 0 0 0 .072-1.276.636.636 0 0 0-.664.595.644.644 0 0 0 .592.681m-.006 4.005a.896.896 0 0 0 .943-.859.897.897 0 0 0-.846-.956.894.894 0 0 0-.944.858.903.903 0 0 0 .847.957m-4.86 9.297a.916.916 0 0 0 .4-1.22.89.89 0 0 0-1.204-.405.915.915 0 0 0-.399 1.22.89.89 0 0 0 1.203.405m5.44-7.966a1.557 1.557 0 0 0 .441 2.14 1.51 1.51 0 0 0 2.11-.448 1.557 1.557 0 0 0-.442-2.14 1.5 1.5 0 0 0-.834-.252c-.513 0-.99.264-1.275.7m2.654 6.476a1.513 1.513 0 0 0-2.05-.687 1.556 1.556 0 0 0-.676 2.079c.38.767 1.3 1.073 2.049.687a1.55 1.55 0 0 0 .683-2.067c0-.006 0-.006-.006-.012m2.665-.111a.88.88 0 0 0-1.239.264.91.91 0 0 0 .26 1.257.88.88 0 0 0 1.24-.263.914.914 0 0 0-.26-1.258m2.925-2.324a.767.767 0 0 0-.72-.816.764.764 0 0 0-.803.73.767.767 0 0 0 .719.816.77.77 0 0 0 .804-.73m2.11-.552a.493.493 0 0 0-.52.472.5.5 0 0 0 .465.528.502.502 0 0 0 .054-1m-1.988 4.968a.626.626 0 0 0-.87.184.647.647 0 0 0 .18.883c.29.19.678.11.87-.184a.64.64 0 0 0-.18-.883m-14.011 4.673a.49.49 0 0 0-.684.141.507.507 0 0 0 .14.693.49.49 0 0 0 .683-.141.497.497 0 0 0-.14-.693m10.349-.049a.51.51 0 0 0-.218.674.494.494 0 0 0 .665.221.5.5 0 0 0 .218-.668.485.485 0 0 0-.665-.227m-5.73-5.054a1.566 1.566 0 0 0-.442-2.146 1.517 1.517 0 0 0-2.115.448 1.56 1.56 0 0 0 .441 2.146c.248.166.538.251.834.251.52.007.998-.257 1.282-.699m-3.053 2.374a.76.76 0 0 0-1.058.221.785.785 0 0 0 .218 1.073.76.76 0 0 0 1.058-.221.774.774 0 0 0-.218-1.073m3.561 2.962a.64.64 0 0 0-.073 1.275.635.635 0 0 0 .665-.594.645.645 0 0 0-.593-.681m.006-4.005a.895.895 0 0 0-.943.859.9.9 0 0 0 .847.956.9.9 0 0 0 .942-.858.9.9 0 0 0-.846-.957m3.67.981a.78.78 0 0 0-.333 1.043.76.76 0 0 0 1.027.337.78.78 0 0 0 .339-1.036.767.767 0 0 0-1.034-.344"
                          ></path>
                        </g>
                        <path
                          fill="#d9d5f1"
                          d="M51.533 226.5h-1.2l3.471-9.455h1.182l3.471 9.455h-1.2l-2.825-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zm10.872 3.693H59.93v-9.455h3.047q1.376 0 2.354.568a3.7 3.7 0 0 1 1.5 1.621q.523 1.052.522 2.52 0 1.477-.526 2.544a3.75 3.75 0 0 1-1.533 1.634q-1.005.568-2.446.568m-1.773-1.016h1.699q1.173 0 1.943-.452a2.8 2.8 0 0 0 1.15-1.288q.378-.835.378-1.99 0-1.145-.374-1.971a2.76 2.76 0 0 0-1.117-1.274q-.743-.448-1.85-.448h-1.83zm8.142 1.016h-1.2l3.472-9.455h1.181l3.472 9.455h-1.2l-2.826-7.959h-.073zm.443-3.693h4.84v1.015h-4.84z"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M50.699 242.71v-.869l3.494-6.068h1.04l-3.41 5.932v.068h5.183v.937zm4.108 1.79v-5.455h1.005v5.455zm9.66.136q-.82 0-1.445-.413-.627-.417-.98-1.176-.354-.763-.354-1.803 0-1.031.353-1.789.355-.76.985-1.172.63-.414 1.457-.414.64 0 1.01.213.375.21.571.478.201.264.311.434h.086v-3.221h1.005v8.727h-.971v-1.006h-.12q-.11.18-.315.452-.204.269-.584.482-.38.208-1.01.208m.136-.903q.605 0 1.022-.315.418-.32.635-.882.218-.567.218-1.309 0-.732-.213-1.282a1.86 1.86 0 0 0-.631-.861q-.417-.312-1.031-.311-.64 0-1.066.328-.422.324-.635.882-.209.554-.209 1.244 0 .699.214 1.27.217.567.639.904.426.332 1.057.332m6.77.92q-.621 0-1.128-.234a1.94 1.94 0 0 1-.806-.686q-.298-.452-.298-1.091 0-.562.222-.912.221-.353.592-.554a3.1 3.1 0 0 1 .818-.298 10 10 0 0 1 .908-.162q.597-.077.967-.115.375-.043.546-.141.174-.098.174-.341v-.034q0-.63-.345-.98-.34-.35-1.035-.349-.72 0-1.13.315-.408.316-.575.673l-.954-.341q.255-.596.681-.929.43-.336.938-.468a4 4 0 0 1 1.006-.137 4 4 0 0 1 .724.077q.413.072.797.303.387.23.643.694.256.465.256 1.245v4.312h-1.006v-.886h-.05a1.8 1.8 0 0 1-.342.456q-.238.243-.635.413-.396.17-.967.17m.154-.903q.597 0 1.006-.234a1.6 1.6 0 0 0 .835-1.385v-.921q-.063.077-.281.141a5 5 0 0 1-.494.106 21 21 0 0 1-.963.128q-.393.052-.733.166a1.26 1.26 0 0 0-.546.337q-.204.221-.204.605 0 .525.387.793.393.264.993.264m5.096 3.205a2.2 2.2 0 0 1-.456-.043 1.2 1.2 0 0 1-.277-.077l.256-.886q.366.093.647.068a.78.78 0 0 0 .499-.251q.222-.222.405-.721l.187-.511-2.42-6.579h1.09l1.808 5.215h.068l1.806-5.215h1.091l-2.778 7.5q-.187.506-.465.839-.276.337-.643.499a2 2 0 0 1-.818.162m10.668-7.535-.903.256a1.7 1.7 0 0 0-.252-.439 1.2 1.2 0 0 0-.443-.358q-.28-.14-.72-.14-.6 0-1.001.277-.397.272-.397.694 0 .375.273.593.273.216.852.362l.972.238q.877.214 1.308.652.43.435.43 1.121 0 .562-.323 1.006a2.15 2.15 0 0 1-.895.699q-.576.255-1.338.255-1.002 0-1.658-.434-.656-.435-.83-1.27l.954-.239q.135.529.515.793.384.264 1.002.264.702 0 1.116-.298.418-.303.418-.725a.76.76 0 0 0-.239-.571q-.238-.234-.733-.349l-1.09-.256q-.9-.213-1.322-.66-.417-.452-.417-1.13 0-.554.31-.98.315-.426.857-.669a3 3 0 0 1 1.236-.243q.972 0 1.526.426.558.428.792 1.125m6.935 5.233q-.623 0-1.13-.234a1.94 1.94 0 0 1-.805-.686q-.298-.452-.298-1.091 0-.562.221-.912.221-.353.593-.554.37-.2.818-.298.45-.102.907-.162.597-.077.968-.115.374-.043.545-.141.175-.098.175-.341v-.034q0-.63-.345-.98-.342-.35-1.036-.349-.72 0-1.13.315-.409.316-.574.673l-.955-.341q.255-.596.682-.929.431-.336.937-.468a4 4 0 0 1 1.006-.137 4 4 0 0 1 .724.077q.414.072.797.303.388.23.644.694.255.465.255 1.245v4.312H96.22v-.886h-.051a1.8 1.8 0 0 1-.341.456q-.24.243-.635.413-.396.17-.968.17m.153-.903q.597 0 1.006-.234a1.6 1.6 0 0 0 .835-1.385v-.921q-.064.077-.281.141-.213.06-.495.106a21 21 0 0 1-.963.128 4 4 0 0 0-.733.166 1.26 1.26 0 0 0-.545.337q-.205.221-.205.605 0 .525.388.793.391.264.993.264m7.324 3.341q-.728 0-1.253-.188a2.7 2.7 0 0 1-.873-.485 2.7 2.7 0 0 1-.55-.64l.801-.562q.136.179.345.409.21.234.571.405.367.175.959.175.793 0 1.308-.384.516-.384.516-1.202v-1.329h-.085a5 5 0 0 1-.316.443 1.8 1.8 0 0 1-.579.464q-.375.201-1.014.201a2.73 2.73 0 0 1-1.424-.375 2.64 2.64 0 0 1-.992-1.091q-.363-.716-.363-1.739 0-1.005.354-1.751.354-.75.984-1.159.631-.414 1.458-.414.639 0 1.014.213.38.21.579.478.205.264.316.434h.102v-1.039h.972v6.733q0 .843-.384 1.372a2.2 2.2 0 0 1-1.023.779q-.639.252-1.423.252m-.034-3.597q.605 0 1.023-.277.417-.276.635-.797.217-.52.217-1.244 0-.707-.213-1.248a1.87 1.87 0 0 0-.631-.848q-.417-.307-1.031-.307-.639 0-1.065.324a1.96 1.96 0 0 0-.635.869 3.4 3.4 0 0 0-.21 1.21q0 .683.214 1.206.217.52.639.818.427.294 1.057.294m7.364 1.142q-.887 0-1.556-.422a2.86 2.86 0 0 1-1.039-1.18q-.371-.759-.371-1.773 0-1.022.371-1.785.375-.763 1.039-1.185.67-.422 1.556-.422t1.551.422q.669.421 1.04 1.185.375.763.375 1.785 0 1.014-.375 1.773a2.83 2.83 0 0 1-1.04 1.18q-.665.423-1.551.422m0-.903q.673 0 1.108-.345.434-.345.643-.908a3.5 3.5 0 0 0 .209-1.219q0-.656-.209-1.223a2.07 2.07 0 0 0-.643-.916q-.435-.35-1.108-.349-.674 0-1.108.349-.435.35-.644.916a3.5 3.5 0 0 0-.209 1.223q0 .657.209 1.219t.644.908q.434.345 1.108.345"
                        ></path>
                        <path
                          fill="#01b28b"
                          d="M290.767 223.338v-6.094h1.034v6.094zm-2.53-2.53v-1.034h6.094v1.034zm11.321-5.392q.582.005 1.163.222.582.216 1.062.72.48.498.771 1.362.291.863.291 2.165 0 1.26-.24 2.239-.236.974-.683 1.643a3 3 0 0 1-1.081 1.016 2.9 2.9 0 0 1-1.431.346q-.794 0-1.417-.314a2.8 2.8 0 0 1-1.016-.881 3.1 3.1 0 0 1-.503-1.316h1.127q.152.65.604 1.076.458.42 1.205.42 1.094 0 1.727-.956.637-.955.637-2.701h-.074a2.9 2.9 0 0 1-.614.67 2.7 2.7 0 0 1-1.713.586 2.9 2.9 0 0 1-1.491-.402 3.04 3.04 0 0 1-1.08-1.112q-.402-.711-.402-1.625a3.3 3.3 0 0 1 .388-1.588 3 3 0 0 1 1.099-1.154q.711-.43 1.671-.416m0 1.016q-.582 0-1.048.291-.462.286-.734.775a2.2 2.2 0 0 0-.268 1.076q0 .59.259 1.076.263.48.715.766.457.281 1.039.281.438 0 .817-.17.38-.176.66-.476a2.3 2.3 0 0 0 .448-.688q.162-.388.162-.808 0-.554-.268-1.038a2.1 2.1 0 0 0-.729-.785 1.9 1.9 0 0 0-1.053-.3m8.426-.887V225h-1.145v-8.254h-.055l-2.308 1.532v-1.163l2.363-1.57zm5.729-.129a3.4 3.4 0 0 1 1.164.222q.58.216 1.061.72.48.498.771 1.362.291.863.291 2.165 0 1.26-.24 2.239-.236.974-.683 1.643a3.04 3.04 0 0 1-1.08 1.016 2.93 2.93 0 0 1-1.431.346 3.1 3.1 0 0 1-1.418-.314 2.8 2.8 0 0 1-1.015-.881 3.1 3.1 0 0 1-.504-1.316h1.127q.152.65.605 1.076.456.42 1.205.42 1.093 0 1.726-.956.637-.955.637-2.701h-.074a2.9 2.9 0 0 1-.614.67 2.7 2.7 0 0 1-1.712.586 2.9 2.9 0 0 1-1.492-.402 3.04 3.04 0 0 1-1.08-1.112q-.402-.711-.401-1.625a3.3 3.3 0 0 1 .387-1.588 3 3 0 0 1 1.099-1.154q.711-.43 1.671-.416m0 1.016q-.582 0-1.048.291-.46.286-.734.775a2.2 2.2 0 0 0-.267 1.076q0 .59.258 1.076.263.48.716.766.457.281 1.038.281.44 0 .817-.17a2.1 2.1 0 0 0 .661-.476q.286-.304.447-.688.162-.388.162-.808 0-.554-.268-1.038a2.1 2.1 0 0 0-.729-.785 1.9 1.9 0 0 0-1.053-.3m5.585 8.642a.8.8 0 0 1-.586-.245.8.8 0 0 1-.245-.586.8.8 0 0 1 .245-.586.8.8 0 0 1 .586-.245q.342 0 .586.245a.8.8 0 0 1 .245.586.86.86 0 0 1-.415.72.8.8 0 0 1-.416.111m5.504.055q-.951 0-1.68-.337a2.74 2.74 0 0 1-1.131-.937 2.35 2.35 0 0 1-.402-1.366q-.005-.6.235-1.108.24-.513.656-.854a2 2 0 0 1 .937-.439v-.055a1.83 1.83 0 0 1-1.08-.762 2.3 2.3 0 0 1-.397-1.343q-.005-.721.365-1.288a2.56 2.56 0 0 1 1.015-.896q.651-.328 1.482-.328.822 0 1.468.328.646.327 1.016.896.373.567.378 1.288a2.34 2.34 0 0 1-.411 1.343 1.82 1.82 0 0 1-1.066.762v.055q.512.093.923.439.411.34.656.854.244.507.249 1.108a2.4 2.4 0 0 1-.415 1.366 2.75 2.75 0 0 1-1.131.937q-.721.337-1.667.337m0-1.015q.642 0 1.108-.208t.72-.586.259-.887a1.7 1.7 0 0 0-.277-.946 1.9 1.9 0 0 0-.744-.646 2.3 2.3 0 0 0-1.066-.236q-.604 0-1.08.236a1.9 1.9 0 0 0-.743.646 1.66 1.66 0 0 0-.264.946q-.004.508.245.887.254.378.725.586.47.207 1.117.208m0-4.488q.509 0 .9-.203.398-.202.623-.568.227-.364.231-.854a1.57 1.57 0 0 0-.226-.835 1.47 1.47 0 0 0-.614-.554 2 2 0 0 0-.914-.199q-.53 0-.928.199a1.43 1.43 0 0 0-.614.554 1.54 1.54 0 0 0-.212.835q-.005.49.217.854.226.366.623.568.397.204.914.203m4.982 5.374v-.831l3.121-3.416q.55-.6.905-1.043a4 4 0 0 0 .526-.841 2 2 0 0 0 .176-.831q0-.498-.24-.863a1.56 1.56 0 0 0-.647-.563 2.1 2.1 0 0 0-.923-.199q-.544 0-.951.227a1.54 1.54 0 0 0-.623.623 1.95 1.95 0 0 0-.217.942h-1.09q0-.832.383-1.459a2.67 2.67 0 0 1 1.044-.979q.664-.351 1.491-.351.831 0 1.473.351.641.35 1.006.946t.365 1.325q0 .522-.19 1.021-.184.494-.646 1.103-.458.605-1.269 1.477l-2.124 2.272v.073h4.395V225zm10.9.129q-.95 0-1.681-.337a2.75 2.75 0 0 1-1.131-.937q-.405-.6-.401-1.366-.005-.6.235-1.108.24-.513.656-.854a2 2 0 0 1 .937-.439v-.055a1.82 1.82 0 0 1-1.08-.762 2.3 2.3 0 0 1-.397-1.343 2.3 2.3 0 0 1 .364-1.288 2.57 2.57 0 0 1 1.016-.896q.651-.328 1.482-.328.822 0 1.468.328.646.327 1.016.896.374.567.378 1.288a2.34 2.34 0 0 1-.411 1.343 1.82 1.82 0 0 1-1.066.762v.055q.512.093.923.439.411.34.656.854.244.507.249 1.108a2.4 2.4 0 0 1-.416 1.366q-.405.596-1.131.937-.72.337-1.666.337m0-1.015q.642 0 1.108-.208t.72-.586q.253-.379.259-.887a1.7 1.7 0 0 0-.277-.946 1.9 1.9 0 0 0-.744-.646 2.3 2.3 0 0 0-1.066-.236q-.604 0-1.08.236a1.9 1.9 0 0 0-.744.646 1.67 1.67 0 0 0-.263.946q-.004.508.245.887.254.378.725.586.47.207 1.117.208m0-4.488q.507 0 .9-.203.397-.202.623-.568.227-.364.231-.854a1.57 1.57 0 0 0-.226-.835 1.47 1.47 0 0 0-.614-.554 2 2 0 0 0-.914-.199q-.53 0-.928.199a1.43 1.43 0 0 0-.614.554 1.54 1.54 0 0 0-.212.835q-.005.49.217.854.225.366.623.568.396.204.914.203m5.278 5.374 4.228-8.365v-.074h-4.875v-1.016h6.057v1.071l-4.21 8.384z"
                        ></path>
                        <path
                          fill="#9793b2"
                          d="M357.303 225h-1.2l3.471-9.455h1.182l3.472 9.455h-1.2l-2.826-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zM368.618 225h-2.917v-9.455h3.046q1.376 0 2.355.568a3.7 3.7 0 0 1 1.5 1.621q.522 1.052.522 2.52 0 1.477-.526 2.544a3.75 3.75 0 0 1-1.533 1.634q-1.007.568-2.447.568m-1.773-1.016h1.699q1.173 0 1.944-.452a2.8 2.8 0 0 0 1.149-1.288q.38-.835.379-1.99 0-1.145-.374-1.971a2.76 2.76 0 0 0-1.117-1.274q-.744-.448-1.851-.448h-1.829zm8.143 1.016h-1.201l3.472-9.455h1.182l3.471 9.455h-1.2l-2.825-7.959h-.074zm.443-3.693h4.838v1.015h-4.838zm-19.954 22.784v-10.909h.699v10.909zm2.353-7.636a1.34 1.34 0 0 0-.623-1.006q-.544-.358-1.338-.358-.579 0-1.014.187a1.6 1.6 0 0 0-.673.516 1.24 1.24 0 0 0-.239.746q0 .35.166.601.171.246.435.413.264.162.554.268.29.103.533.167l.886.238q.34.09.759.247.421.159.805.431.388.268.639.69.252.422.252 1.036a2.3 2.3 0 0 1-.371 1.278q-.366.571-1.074.908-.703.336-1.709.336-.937 0-1.623-.302a2.6 2.6 0 0 1-1.074-.844 2.4 2.4 0 0 1-.439-1.257h1.091q.042.495.332.818.294.32.742.477.452.154.971.154.606 0 1.087-.196.481-.2.763-.554.28-.358.281-.835 0-.435-.243-.708a1.8 1.8 0 0 0-.639-.443 7 7 0 0 0-.857-.298l-1.074-.307q-1.022-.294-1.619-.84-.597-.545-.597-1.427 0-.733.397-1.279.4-.549 1.074-.852a3.6 3.6 0 0 1 1.512-.307q.845 0 1.5.303.657.299 1.04.818.388.52.409 1.181zm2.589 4.363h1.074q.047.444.303.75.26.303.673.46a2.6 2.6 0 0 0 .916.154 2.5 2.5 0 0 0 .98-.183q.435-.184.691-.546.255-.366.255-.908a1.8 1.8 0 0 0-.221-.877q-.222-.41-.712-.661t-1.3-.251h-.698v-.853l2.181-2.625v-.068h-3.715v-.937h5.164v.767l-2.335 2.829v.069q.563.025 1.048.23.49.204.853.554.366.35.571.814t.204 1.009q0 .747-.383 1.33a2.6 2.6 0 0 1-1.053.912q-.67.332-1.547.332-.776 0-1.427-.272a2.6 2.6 0 0 1-1.061-.789 2.2 2.2 0 0 1-.461-1.24m7.536 0h1.073q.048.444.303.75.26.303.673.46a2.6 2.6 0 0 0 .916.154q.546 0 .981-.183a1.6 1.6 0 0 0 .69-.546q.255-.366.256-.908 0-.473-.222-.877-.222-.41-.712-.661t-1.299-.251h-.699v-.853l2.182-2.625v-.068h-3.716v-.937h5.164v.767l-2.335 2.829v.069q.563.025 1.049.23.489.204.852.554.366.35.571.814t.204 1.009q0 .747-.383 1.33a2.6 2.6 0 0 1-1.053.912q-.669.332-1.547.332-.775 0-1.427-.272a2.6 2.6 0 0 1-1.061-.789q-.41-.516-.46-1.24m7.535 0h1.074q.047.444.302.75.26.303.673.46.414.154.917.154.545 0 .98-.183.434-.184.69-.546.256-.366.256-.908 0-.473-.222-.877-.222-.41-.711-.661-.49-.251-1.3-.251h-.699v-.853l2.182-2.625v-.068h-3.716v-.937h5.165v.767l-2.336 2.829v.069q.563.025 1.049.23.489.204.852.554.366.35.571.814t.205 1.009q0 .747-.384 1.33a2.6 2.6 0 0 1-1.053.912q-.669.332-1.546.332-.775 0-1.428-.272a2.6 2.6 0 0 1-1.061-.789q-.41-.516-.46-1.24"
                        ></path>
                        <defs>
                          <clipPath id="staking-rewards_svg__a">
                            <path fill="#fff" d="M8 8h34v34H8z"></path>
                          </clipPath>
                          <clipPath id="staking-rewards_svg__b">
                            <path fill="#fff" d="M8 60h32v32H8z"></path>
                          </clipPath>
                          <clipPath id="staking-rewards_svg__d">
                            <path fill="#fff" d="M8 110h34v34H8z"></path>
                          </clipPath>
                          <clipPath id="staking-rewards_svg__e">
                            <path fill="#fff" d="M8 162h34v34H8z"></path>
                          </clipPath>
                          <clipPath id="staking-rewards_svg__f">
                            <path fill="#fff" d="M8 214h34v34H8z"></path>
                          </clipPath>
                        </defs>
                      </svg>
                      <div className="staking-rewards-module__UBpJwq__shimmer "></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="staking-module__2GPFPG__intSection">
              <p className="staking-module__2GPFPG__introSectionTitle mixed-text">
                All in one intuitive and easy to use platform
              </p>
              <div className="staking-module__2GPFPG__imgsWrapper">
                <img
                  alt="hero screenshot"
                  loading="lazy"
                  width="2400"
                  height="1500"
                  decoding="async"
                  data-nimg="1"
                  className="staking-module__2GPFPG__desktopImg"
                  style={{ color: "transparent" }}
                  src="/assets/imgs/desktop-preview.png"
                />
                <img
                  alt="hero screenshot"
                  loading="lazy"
                  width="700"
                  height="860"
                  decoding="async"
                  data-nimg="1"
                  className="staking-module__2GPFPG__mobileImg"
                  style={{ color: "transparent" }}
                  src="/assets/imgs/mobile-preview.png"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <FaqSection type="Staking" questions={FAQS.STAKING} />
    </main>
  );
}
