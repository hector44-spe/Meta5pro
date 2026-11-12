"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/dashboard")
  ) {
    return null;
  }
  return (
    <footer className="four-module__98-FTG__container">
      <div className="backlight"></div>
      <div className="four-module__98-FTG__footerContent">
        {/* Top/Middle Section with Logo and Navigation Columns */}
        <div className="four-module__98-FTG__footerMidSection">
          <svg
            className="four-module__98-FTG__footerMidSectionBorder"
            viewBox="0 0 1087 1"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="0.5"
              x2="1087"
              y2="0.5"
              className="four-module__98-FTG__footerBorderStroke"
            />
          </svg>

          {/* Platform Logo */}
          <Link href="/">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 1133 246"
                className="four-module__98-FTG__logoFull"
              >
                <path
                  fill="#fff"
                  d="M84.987 89.374 69.52 116.172h15.468v74.232L50.383 203v-46.364h15.474l-15.474-26.805V55.596L84.987 43zM34.613 129.83l-15.475 26.806h15.475v15.768L0 185V83.969l34.613-12.605zm100.756 32.201-34.604 12.605v-58.464h15.474l-15.474-26.81V73.595L135.378 61zM233.27 184h-21.073V61.074h25.99l38.459 97.638 38.282-97.638h25.99V184h-21.073V97.425L285.777 184h-18.439L233.27 97.6zm174.012 2.634c-28.449 0-47.941-20.37-47.941-48.819 0-30.731 20.195-49.697 46.185-49.697 26.341 0 43.902 18.439 44.429 48.643v4.917h-69.893c1.405 16.332 11.591 27.395 27.395 27.395 10.712 0 18.79-5.268 21.951-14.575h20.195c-4.741 20.019-20.37 32.136-42.321 32.136m-26.341-59.531h47.589c-2.634-13.346-10.887-21.424-23.004-21.424-12.293 0-21.425 8.078-24.585 21.424M516.765 184h-11.941c-20.195 0-31.083-10.01-31.083-28.449v-47.063H457.41v-17.56h16.331V59.142h20.722v31.786h24.058v17.56h-24.058v45.659c0 7.902 4.039 12.292 11.766 12.292h10.536zm47.659 1.932c-21.424 0-35.473-10.361-35.297-27.746.175-21.776 21.775-26.342 39.863-28.449 14.048-1.58 24.409-2.107 24.585-9.483-.176-9.131-7.2-15.102-19.141-15.102-12.293 0-21.074 6.673-22.303 16.331h-20.897c1.932-19.668 19.492-33.365 43.551-33.365 25.112 0 38.985 13.697 38.985 33.541v42.146c0 2.634 1.405 4.039 4.566 4.039h5.092V184h-9.834c-9.483 0-15.278-3.863-16.858-10.888a16.6 16.6 0 0 1-.878-3.161c-5.444 10.01-15.629 15.981-31.434 15.981m4.214-16.332c14.225 0 24.937-8.078 24.937-20.546v-12.995c-3.512 5.444-12.468 6.673-22.302 7.902-11.591 1.405-21.249 2.986-21.249 12.82 0 8.078 6.497 12.819 18.614 12.819m123.781 17.034c-34.419 0-58.653-25.287-58.653-64.448 0-37.23 23.531-63.746 61.638-63.746 31.961 0 53.912 18.966 59.18 50.048h-21.599c-3.864-19.317-18.088-31.082-37.581-31.082-24.585 0-40.038 17.21-40.038 44.78 0 27.922 15.629 45.307 39.16 45.307 19.142 0 31.61-12.468 31.61-30.029h-37.054v-17.737h41.971c15.805 0 24.409 7.903 24.409 22.829V184h-18.614v-37.58h-.351c-2.459 24.585-18.615 40.214-44.078 40.214m125.926 0c-30.204 0-47.765-21.248-47.765-50.048 0-30.381 20.546-48.468 47.765-48.468 30.029 0 47.59 21.073 47.59 48.468 0 31.434-19.844 50.048-47.59 50.048m0-17.736c16.683 0 26.517-13.698 26.517-32.312 0-18.439-10.361-30.732-26.517-30.732s-26.692 12.293-26.692 30.732c0 20.37 11.414 32.312 26.692 32.312M903.238 184h-20.722V52.294h20.722zm59.74 2.634c-25.112 0-43.2-20.37-43.2-49.697 0-28.8 17.737-48.82 42.498-48.82 13.17 0 24.058 5.445 30.555 14.225V52.294h20.719V184h-16.68l-1.931-16.507c-5.269 11.766-16.859 19.141-31.961 19.141m3.863-17.561c15.278 0 25.99-13.346 25.99-32.312 0-18.439-10.536-31.258-25.638-31.258-15.454 0-26.166 12.995-26.166 31.61 0 18.79 10.536 31.96 25.814 31.96m112.729 17.737c-25.64 0-44.6-15.454-47.77-40.39h22.31c1.93 12.819 12.29 21.073 25.64 21.073 14.92 0 23.88-10.537 23.88-23.883 0-12.995-8.78-23.707-23.53-23.707-8.08 0-14.93 3.161-21.25 9.834h-23.53l10.88-68.663h73.06v19.142h-55.67l-5.44 34.946c6.67-7.376 16.33-12.469 28.44-12.469 22.48 0 38.29 16.859 38.29 40.741 0 25.639-18.44 43.376-45.31 43.376"
                />
              </svg>
            </div>
          </Link>

          {/* Links Columns */}
          <div className="four-module__98-FTG__footerLinksContainer">
            {/* Explore Column */}
            <div className="four-module__98-FTG__footerLinksWrapper">
              <p className="four-module__98-FTG__footerLinkHeader">Explore</p>
              <ul className="four-module__98-FTG__footerLinks">
                <li className="four-module__98-FTG__footerLinksItem">
                  <Link
                    className="four-module__98-FTG__footerLink"
                    href="/staking"
                  >
                    Staking
                  </Link>
                </li>
                <li className="four-module__98-FTG__footerLinksItem">
                  <Link
                    className="four-module__98-FTG__footerLink"
                    href="/markets"
                  >
                    Markets
                  </Link>
                </li>
                <li className="four-module__98-FTG__footerLinksItem">
                  <Link
                    className="four-module__98-FTG__footerLink"
                    href="/real-estate"
                  >
                    Real Estate
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="four-module__98-FTG__footerLinksWrapper">
              <p className="four-module__98-FTG__footerLinkHeader">Company</p>
              <ul className="four-module__98-FTG__footerLinks">
                <li className="four-module__98-FTG__footerLinksItem">
                  <Link
                    className="four-module__98-FTG__footerLink"
                    href="/about"
                  >
                    About us
                  </Link>
                </li>
                <li className="four-module__98-FTG__footerLinksItem">
                  <Link
                    className="four-module__98-FTG__footerLink"
                    href="/contact"
                  >
                    Contact
                  </Link>
                </li>
                <li className="four-module__98-FTG__footerLinksItem">
                  <Link
                    className="four-module__98-FTG__footerLink"
                    href="/help-center"
                  >
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Trade Column */}
            <div className="four-module__98-FTG__footerLinksWrapper">
              <p className="four-module__98-FTG__footerLinkHeader">Trade</p>
              <ul className="four-module__98-FTG__footerLinks">
                <li className="four-module__98-FTG__footerLinksItem">
                  <Link
                    className="four-module__98-FTG__footerLink"
                    href="/crypto"
                  >
                    Crypto
                  </Link>
                </li>
                <li className="four-module__98-FTG__footerLinksItem">
                  <Link
                    className="four-module__98-FTG__footerLink"
                    href="/stocks"
                  >
                    Stocks and ETFs
                  </Link>
                </li>
                <li className="four-module__98-FTG__footerLinksItem">
                  <Link
                    className="four-module__98-FTG__footerLink"
                    href="/copy-trading"
                  >
                    Copy Trading
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Socials & Copyright Section */}
        <div className="four-module__98-FTG__socialsSection">
          <svg
            className="four-module__98-FTG__socialsSectionBorder"
            viewBox="0 0 1087 1"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line
              x1="0"
              y1="0.5"
              x2="1087"
              y2="0.5"
              className="four-module__98-FTG__footerBorderStroke"
            />
          </svg>

          <div className="four-module__98-FTG__socialSectionLinks">
            <p className="four-module__98-FTG__socialSectionLink">
              &copy; 2017 - 2026 Meta Gold 5 Ltd. All rights reserved
            </p>
            <Link
              className="four-module__98-FTG__socialSectionLink"
              href="/terms"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              className="four-module__98-FTG__socialSectionLink"
              href="/privacy"
            >
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Legal Risk Disclaimer */}
        <div className="four-module__98-FTG__disclaimerContainer">
          <p className="four-module__98-FTG__disclaimerText">
            The risk of loss in online trading of stocks, options, futures,
            currencies, foreign equities, and fixed Income can be substantial.
            <br />
            <br />
            Before trading, clients must read the relevant risk disclosure
            statements on our Warnings and Disclosures page. Trading on margin
            is only for experienced investors with high risk tolerance. You may
            lose more than your initial investment.
            <br />
            <br />
            For additional information about rates on margin loans, please see
            Margin Loan Rates. Security futures involve a high degree of risk
            and are not suitable for all investors. The amount you may lose may
            be greater than your initial investment. For trading security
            futures, read the Security Futures Risk Disclosure Statement.
            Structured products and fixed income products such as bonds are
            complex products that are more risky and are not suitable for all
            investors. Before trading, please read the Risk Warning and
            Disclosure Statement.
          </p>
        </div>
      </div>
    </footer>
  );
}
