"use client";

import React from "react";
import Link from "next/link";

export default function ContactPage() {
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
        <section className="contact-module__fBAZnG__hero">
          <div className="contact-module__fBAZnG__lockup">
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
                <p className="pill-module__qX7Pgq__pillText">Contact us</p>
              </div>
            </div>
            <h2
              className="contact-module__fBAZnG__lockupTitle stagger-1"
              data-animate="true"
            >
              How can we help?
            </h2>
            <p
              className="contact-module__fBAZnG__lockupSubtext inter-alts stagger-3"
              data-animate="true"
            >
              Share your support, concern, comment, or technical issue below, or
              check out our help center.
            </p>
          </div>
          <div
            className="contact-module__fBAZnG__stepsContainer stagger-5"
            data-animate="true"
          >
            <div className="contact-module__fBAZnG__stepsWrapper">
              <div className="contact-module__fBAZnG__supportCard">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 416 315"
                  className="contact-module__fBAZnG__cardGrid"
                >
                  <g
                    stroke="#969696"
                    strokeDasharray="3.15 3.15"
                    strokeOpacity="0.7"
                    strokeWidth="0.63"
                    clipPath="url(#card-grid_svg__a)"
                    opacity="0.3"
                  >
                    <path d="M0 0h415.8M0 52.606h415.8M0 105.212h415.8M0 157.813h415.8M0 210.419h415.8M0 263.025h415.8M0 0v315M69.3 0v315M138.602 0v315M207.898 0v315M277.199 0v315M346.5 0v315M415.801 0v315"></path>
                  </g>
                  <defs>
                    <clipPath id="card-grid_svg__a">
                      <path fill="#fff" d="M0 0h416v315H0z"></path>
                    </clipPath>
                  </defs>
                </svg>
                <svg
                  className="contact-module__fBAZnG__supportCardBorder"
                  viewBox="0 0 1000 1000"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="999"
                    height="999"
                    rx="24"
                    fill="none"
                    className="contact-module__fBAZnG__supportCardBorderStroke"
                  />
                </svg>
                <div>
                  <div>
                    <div className="contact-module__fBAZnG__supportCardMainTitles">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="contact-module__fBAZnG__supportCardIcon"
                      >
                        <path
                          stroke="currentColor"
                          d="m3 6.5 8.68 7.233a.5.5 0 0 0 .64 0L21 6.5M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
                        ></path>
                      </svg>
                      <p className="contact-module__fBAZnG__supportCardTitle">
                        Send us an email
                      </p>
                    </div>
                    <p className="contact-module__fBAZnG__supportCardTitleDescription">
                      Send us an email and our team will get back to you as soon
                      as possible.
                    </p>
                  </div>
                  <div style={{ marginTop: "24px", width: "max-content" }}>
                    <a
                      href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@platform.internal"}`}
                      className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary  button-module__Q_cxDG__outline"
                    >
                      <p className="button-module__Q_cxDG__buttonText inter-alts">
                        Email us
                      </p>{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="button-module__Q_cxDG__buttonArrow"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.343 6.343 15 12l-5.657 5.657"
                        ></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              <div className="contact-module__fBAZnG__supportCard">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 416 315"
                  className="contact-module__fBAZnG__cardGrid"
                >
                  <g
                    stroke="#969696"
                    strokeDasharray="3.15 3.15"
                    strokeOpacity="0.7"
                    strokeWidth="0.63"
                    clipPath="url(#card-grid_svg__a)"
                    opacity="0.3"
                  >
                    <path d="M0 0h415.8M0 52.606h415.8M0 105.212h415.8M0 157.813h415.8M0 210.419h415.8M0 263.025h415.8M0 0v315M69.3 0v315M138.602 0v315M207.898 0v315M277.199 0v315M346.5 0v315M415.801 0v315"></path>
                  </g>
                  <defs>
                    <clipPath id="card-grid_svg__a">
                      <path fill="#fff" d="M0 0h416v315H0z"></path>
                    </clipPath>
                  </defs>
                </svg>
                <svg
                  className="contact-module__fBAZnG__supportCardBorder"
                  viewBox="0 0 1000 1000"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="999"
                    height="999"
                    rx="24"
                    fill="none"
                    className="contact-module__fBAZnG__supportCardBorderStroke"
                  />
                </svg>
                <div>
                  <div>
                    <div className="contact-module__fBAZnG__supportCardMainTitles">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="contact-module__fBAZnG__supportCardIcon"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 17h.002m-2.627-6.875a2.625 2.625 0 1 1 3.601 2.438c-.512.205-.976.635-.976 1.187V14m9-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
                        ></path>
                      </svg>
                      <p className="contact-module__fBAZnG__supportCardTitle">
                        Help Center
                      </p>
                    </div>
                    <p className="contact-module__fBAZnG__supportCardTitleDescription">
                      Check out our frequently asked questions in our help
                      center and find the answers you need.
                    </p>
                  </div>
                  <div style={{ marginTop: "24px", width: "max-content" }}>
                    <a
                      className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__secondary  button-module__Q_cxDG__outline"
                      href="/help-center"
                    >
                      <p className="button-module__Q_cxDG__buttonText inter-alts">
                        Go to help center
                      </p>{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="button-module__Q_cxDG__buttonArrow"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.343 6.343 15 12l-5.657 5.657"
                        ></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
