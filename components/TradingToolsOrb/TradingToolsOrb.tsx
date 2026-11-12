"use client";

import React, { useState, useEffect } from "react";

interface SymbolItem {
  id: string;
  symbol: string;
  renderIcon: () => React.ReactNode;
  renderOrbIcon: () => React.ReactNode;
}

export default function TradingToolsOrb() {
  const [offset, setOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [activeIndex, setActiveIndex] = useState(2);

  const symbols: SymbolItem[] = [
    {
      id: "AAPL",
      symbol: "AAPL",
      renderIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__symbolIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#6c6a82" />
          <path
            fill="#fff"
            d="M15.5 13.5c-.02-1.8 1.48-2.67 1.55-2.71-.85-1.24-2.17-1.41-2.64-1.43-1.12-.11-2.19.66-2.76.66-.57 0-1.46-.64-2.4-.63-1.23.02-2.37.72-3 1.83-1.29 2.22-.33 5.51.92 7.32.61.89 1.34 1.88 2.3 1.85.92-.04 1.27-.6 2.39-.6 1.11 0 1.43.6 2.4.58.98-.02 1.62-.89 2.22-1.78.7-1.02.99-2.02 1.01-2.07-.02-.01-1.95-.75-1.99-2.92zM14.2 8.35c.5-.61.84-1.45.75-2.3-.72.03-1.6.48-2.11 1.09-.45.52-.85 1.39-.74 2.21.81.06 1.63-.4 2.1-.99z"
          />
        </svg>
      ),
      renderOrbIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__orbIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#6c6a82" />
          <path
            fill="#fff"
            d="M15.5 13.5c-.02-1.8 1.48-2.67 1.55-2.71-.85-1.24-2.17-1.41-2.64-1.43-1.12-.11-2.19.66-2.76.66-.57 0-1.46-.64-2.4-.63-1.23.02-2.37.72-3 1.83-1.29 2.22-.33 5.51.92 7.32.61.89 1.34 1.88 2.3 1.85.92-.04 1.27-.6 2.39-.6 1.11 0 1.43.6 2.4.58.98-.02 1.62-.89 2.22-1.78.7-1.02.99-2.02 1.01-2.07-.02-.01-1.95-.75-1.99-2.92zM14.2 8.35c.5-.61.84-1.45.75-2.3-.72.03-1.6.48-2.11 1.09-.45.52-.85 1.39-.74 2.21.81.06 1.63-.4 2.1-.99z"
          />
        </svg>
      ),
    },
    {
      id: "ADBE",
      symbol: "ADBE",
      renderIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__symbolIcon"
        >
          <rect width="24" height="24" fill="#fa0f00" rx="12" />
          <path
            fill="#fff"
            d="M14.7 6.5h3.8L15 17.5h-2.5zm-5.4 0H5.5L9 17.5h2.5zM12 11.2l2.3 6.3h-1.9l-.7-2.1h-2.1l1.5-4.2z"
          />
        </svg>
      ),
      renderOrbIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__orbIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#fa0f00" />
          <path
            fill="#fff"
            d="M14.7 6.5h3.8L15 17.5h-2.5zm-5.4 0H5.5L9 17.5h2.5zM12 11.2l2.3 6.3h-1.9l-.7-2.1h-2.1l1.5-4.2z"
          />
        </svg>
      ),
    },
    {
      id: "BTC",
      symbol: "BTC",
      renderIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 32 32"
          className="one-module__oOI5iq__symbolIcon"
        >
          <path
            fill="#f7931a"
            d="M31.518 19.87c-2.137 8.572-10.819 13.788-19.391 11.651C3.557 29.384-1.66 20.702.479 12.131 2.615 3.56 11.297-1.659 19.867.48c8.572 2.137 13.788 10.82 11.65 19.392"
          />
          <path
            fill="#fff"
            d="M23.054 13.72c.318-2.129-1.303-3.273-3.52-4.037l.72-2.884-1.756-.438-.7 2.809a73 73 0 0 0-1.407-.331l.705-2.827-1.755-.438-.72 2.884a58 58 0 0 1-1.12-.264l.002-.009-2.421-.605-.468 1.876s1.303.298 1.276.317c.71.177.84.648.818 1.02l-.82 3.287q.077.017.183.058l-.185-.046-1.148 4.603c-.087.216-.308.54-.805.417.018.026-1.276-.318-1.276-.318l-.872 2.01 2.285.57c.425.106.842.217 1.252.322l-.727 2.917 1.754.438.72-2.886q.717.194 1.399.363L13.75 25.4l1.755.437.727-2.912c2.994.567 5.245.338 6.192-2.37.764-2.18-.038-3.437-1.613-4.258 1.148-.264 2.011-1.019 2.241-2.578m-4.012 5.626c-.543 2.18-4.213 1.001-5.404.706l.965-3.865c1.19.297 5.006.885 4.439 3.159m.543-5.657c-.495 1.983-3.55.976-4.541.728l.874-3.505c.99.247 4.183.708 3.667 2.777"
          />
        </svg>
      ),
      renderOrbIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 32 32"
          className="one-module__oOI5iq__orbIcon"
        >
          <circle cx="16" cy="16" r="16" fill="#f7931a" />
          <path
            fill="#fff"
            d="M23.054 13.72c.318-2.129-1.303-3.273-3.52-4.037l.72-2.884-1.756-.438-.7 2.809a73 73 0 0 0-1.407-.331l.705-2.827-1.755-.438-.72 2.884a58 58 0 0 1-1.12-.264l.002-.009-2.421-.605-.468 1.876s1.303.298 1.276.317c.71.177.84.648.818 1.02l-.82 3.287q.077.017.183.058l-.185-.046-1.148 4.603c-.087.216-.308.54-.805.417.018.026-1.276-.318-1.276-.318l-.872 2.01 2.285.57c.425.106.842.217 1.252.322l-.727 2.917 1.754.438.72-2.886q.717.194 1.399.363L13.75 25.4l1.755.437.727-2.912c2.994.567 5.245.338 6.192-2.37.764-2.18-.038-3.437-1.613-4.258 1.148-.264 2.011-1.019 2.241-2.578m-4.012 5.626c-.543 2.18-4.213 1.001-5.404.706l.965-3.865c1.19.297 5.006.885 4.439 3.159m.543-5.657c-.495 1.983-3.55.976-4.541.728l.874-3.505c.99.247 4.183.708 3.667 2.777"
          />
        </svg>
      ),
    },
    {
      id: "ETH",
      symbol: "ETH",
      renderIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__symbolIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#906ee0" />
          <path
            fill="#fff"
            d="m11.519 3.84-.103.35v10.156l.103.103 4.714-2.787z"
          />
          <path
            fill="#fff"
            d="m11.519 3.84-4.715 7.822 4.715 2.787zm0 11.502-.058.07v3.618l.058.17 4.717-6.643z"
          />
          <path
            fill="#fff"
            d="M11.519 19.2v-3.858l-4.715-2.786zm0-4.75 4.714-2.788-4.714-2.142z"
          />
          <path fill="#fff" d="m6.804 11.662 4.715 2.787V9.52z" />
        </svg>
      ),
      renderOrbIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__orbIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#906ee0" />
          <path
            fill="#fff"
            d="m11.519 3.84-.103.35v10.156l.103.103 4.714-2.787z"
          />
          <path
            fill="#fff"
            d="m11.519 3.84-4.715 7.822 4.715 2.787zm0 11.502-.058.07v3.618l.058.17 4.717-6.643z"
          />
          <path
            fill="#fff"
            d="M11.519 19.2v-3.858l-4.715-2.786zm0-4.75 4.714-2.788-4.714-2.142z"
          />
          <path fill="#fff" d="m6.804 11.662 4.715 2.787V9.52z" />
        </svg>
      ),
    },
    {
      id: "GBP",
      symbol: "GBP",
      renderIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__symbolIcon"
        >
          <rect width="24" height="24" fill="#0c6cf2" rx="12" />
          <path
            fill="#fff"
            d="M15.122 10.215h-4.358c.41-1.557 1.403-2.31 2.68-2.31.999 0 1.769.468 2.316.901l.799-1.7C15.715 6.4 14.665 6 13.445 6 11.02 6 9.19 7.551 8.63 10.215H7.45L7 11.43h1.471a10 10 0 0 0 0 1.14h-1.02L7 13.802h1.631C9.191 16.46 11.021 18 13.445 18c1.175 0 2.264-.36 3.08-1.067l-.81-1.7c-.496.4-1.266.862-2.27.862-1.283 0-2.27-.736-2.68-2.293h2.714l.588-1.232h-3.49a10 10 0 0 1 0-1.14h3.992z"
          />
        </svg>
      ),
      renderOrbIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__orbIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#0c6cf2" />
          <path
            fill="#fff"
            d="M15.122 10.215h-4.358c.41-1.557 1.403-2.31 2.68-2.31.999 0 1.769.468 2.316.901l.799-1.7C15.715 6.4 14.665 6 13.445 6 11.02 6 9.19 7.551 8.63 10.215H7.45L7 11.43h1.471a10 10 0 0 0 0 1.14h-1.02L7 13.802h1.631C9.191 16.46 11.021 18 13.445 18c1.175 0 2.264-.36 3.08-1.067l-.81-1.7c-.496.4-1.266.862-2.27.862-1.283 0-2.27-.736-2.68-2.293h2.714l.588-1.232h-3.49a10 10 0 0 1 0-1.14h3.992z"
          />
        </svg>
      ),
    },
    {
      id: "NFLX",
      symbol: "NFLX",
      renderIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__symbolIcon"
        >
          <rect width="24" height="24" fill="#000" rx="12" />
          <path
            fill="#e50914"
            d="M7 5h2.5l5 11.5h.1V5H17v14h-2.5l-5-11.5h-.1V19H7z"
          />
        </svg>
      ),
      renderOrbIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__orbIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#000" />
          <path
            fill="#e50914"
            d="M7 5h2.5l5 11.5h.1V5H17v14h-2.5l-5-11.5h-.1V19H7z"
          />
        </svg>
      ),
    },
    {
      id: "USD",
      symbol: "USD",
      renderIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__symbolIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#0c6cf2" />
          <path
            fill="#fff"
            fillRule="evenodd"
            d="M15.8 13.892c0 1.542-1.252 2.566-3.1 2.72V18h-1.266v-1.402A6.9 6.9 0 0 1 8 15.21l.931-1.276c.83.645 1.615 1.066 2.562 1.206v-2.748c-2.125-.532-3.114-1.303-3.114-2.887 0-1.514 1.236-2.552 3.055-2.692V6H12.7v.841c.99.11 1.933.478 2.736 1.066l-.815 1.317c-.64-.462-1.295-.757-1.979-.897v2.664c2.212.533 3.158 1.388 3.158 2.901m-4.308-3.196V8.23c-.916.07-1.396.561-1.396 1.178 0 .588.276.967 1.397 1.29zm2.59 3.294c0-.63-.305-1.008-1.44-1.331v2.538c.917-.071 1.44-.534 1.44-1.206"
            clipRule="evenodd"
          />
        </svg>
      ),
      renderOrbIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__orbIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#0c6cf2" />
          <path
            fill="#fff"
            fillRule="evenodd"
            d="M15.8 13.892c0 1.542-1.252 2.566-3.1 2.72V18h-1.266v-1.402A6.9 6.9 0 0 1 8 15.21l.931-1.276c.83.645 1.615 1.066 2.562 1.206v-2.748c-2.125-.532-3.114-1.303-3.114-2.887 0-1.514 1.236-2.552 3.055-2.692V6H12.7v.841c.99.11 1.933.478 2.736 1.066l-.815 1.317c-.64-.462-1.295-.757-1.979-.897v2.664c2.212.533 3.158 1.388 3.158 2.901m-4.308-3.196V8.23c-.916.07-1.396.561-1.396 1.178 0 .588.276.967 1.397 1.29zm2.59 3.294c0-.63-.305-1.008-1.44-1.331v2.538c.917-.071 1.44-.534 1.44-1.206"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "AMZN",
      symbol: "AMZN",
      renderIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__symbolIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#ff9900" />
          <path
            fill="#000"
            d="M6.5 15c3.2 2 7.8 2 11 0-.3-.3-.9-.2-1.2-.1-2.6 1.4-6.5 1.4-9.1-.1-.3-.2-.5 0-.7.2z"
          />
        </svg>
      ),
      renderOrbIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__orbIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#ff9900" />
          <path
            fill="#000"
            d="M6.5 15c3.2 2 7.8 2 11 0-.3-.3-.9-.2-1.2-.1-2.6 1.4-6.5 1.4-9.1-.1-.3-.2-.5 0-.7.2z"
          />
        </svg>
      ),
    },
    {
      id: "TSLA",
      symbol: "TSLA",
      renderIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__symbolIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#e82127" />
          <path
            fill="#fff"
            d="M12 6.5c2.5 0 4.8.8 6.5 2.1l-.8 1.4c-1.5-1.1-3.5-1.8-5.7-1.8s-4.2.7-5.7 1.8l-.8-1.4c1.7-1.3 4-2.1 6.5-2.1zm0 3.2c1.7 0 3.3.4 4.5 1.1l-.6 1.2c-1-.6-2.4-.9-3.9-.9s-2.9.3-3.9.9l-.6-1.2c1.2-.7 2.8-1.1 4.5-1.1zm0 3.1c.4 0 .7.1.9.4l2.1 3.8h-1.6l-1.4-2.5-1.4 2.5H9l2.1-3.8c.2-.3.5-.4.9-.4z"
          />
        </svg>
      ),
      renderOrbIcon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="one-module__oOI5iq__orbIcon"
        >
          <circle cx="12" cy="12" r="12" fill="#e82127" />
          <path
            fill="#fff"
            d="M12 6.5c2.5 0 4.8.8 6.5 2.1l-.8 1.4c-1.5-1.1-3.5-1.8-5.7-1.8s-4.2.7-5.7 1.8l-.8-1.4c1.7-1.3 4-2.1 6.5-2.1zm0 3.2c1.7 0 3.3.4 4.5 1.1l-.6 1.2c-1-.6-2.4-.9-3.9-.9s-2.9.3-3.9.9l-.6-1.2c1.2-.7 2.8-1.1 4.5-1.1zm0 3.1c.4 0 .7.1.9.4l2.1 3.8h-1.6l-1.4-2.5-1.4 2.5H9l2.1-3.8c.2-.3.5-.4.9-.4z"
          />
        </svg>
      ),
    },
  ];

  // Moving cycle animation
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setOffset(-64);

      setTimeout(() => {
        setIsAnimating(false);
        setOffset(0);
        setActiveIndex((prev) => (prev + 1) % symbols.length);
      }, 650);
    }, 2800);

    return () => clearInterval(timer);
  }, [symbols.length]);

  // Generate 7-window visible list centered around activeIndex
  const visibleItems = [];
  for (let i = -4; i <= 4; i++) {
    const idx = (activeIndex + i + symbols.length * 10) % symbols.length;
    visibleItems.push({
      ...symbols[idx],
      pos: i,
    });
  }

  const currentCenterSymbol = symbols[activeIndex];

  return (
    <div className="one-module__oOI5iq__illustrationContainer">
      <div className="one-module__oOI5iq__illustrationWrapper">
        {/* Horizontal sliding icons row */}
        <div className="one-module__oOI5iq__symbolIconContainer">
          <div
            className="one-module__oOI5iq__symbolIconList"
            style={{
              transform: `translate(calc(-50% + ${offset}px), -50%)`,
              transition: isAnimating
                ? "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
              gap: "40px",
            }}
          >
            {visibleItems.map((item, idx) => {
              const isMiddle = item.pos === 0;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className={`one-module__oOI5iq__symbolIconWrapper ${
                    isMiddle
                      ? "one-module__oOI5iq__symbolIconWrapperMiddle"
                      : ""
                  }`}
                  style={{
                    transform: isMiddle ? "scale(1.25)" : "scale(1)",
                    transition: "transform 0.4s ease, opacity 0.4s ease",
                    opacity: Math.abs(item.pos) > 2 ? 0.3 : 0.85,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.renderIcon()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Central glowing floating 3D Orb */}
        <div
          className="one-module__oOI5iq__toolsOrbWrapper"
          style={{ pointerEvents: "none" }}
        >
          <div className="one-module__oOI5iq__toolsOrbOverlay"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 90 90"
            className="one-module__oOI5iq__toolsOrb"
          >
            <rect
              width="89.053"
              height="90"
              fill="url(#orb_svg__a)"
              rx="44.526"
            />
            <defs>
              <pattern
                id="orb_svg__a"
                width="1"
                height="1"
                patternContentUnits="objectBoundingBox"
              >
                <use
                  href="#orb_svg__b"
                  transform="matrix(.00068 0 0 .00067 -.188 -.175)"
                ></use>
              </pattern>
              <image
                id="orb_svg__b"
                width="2048"
                height="2048"
                href="/assets/asset_18.png"
                preserveAspectRatio="none"
              ></image>
            </defs>
          </svg>

          {/* Active central symbol inside orb */}
          <div className="one-module__oOI5iq__toolsOrbIcon">
            <div
              style={{
                filter: "blur(0px)",
                opacity: 1,
                transition: "all 0.4s ease",
              }}
            >
              {currentCenterSymbol.renderOrbIcon()}
            </div>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 97 95"
            className="one-module__oOI5iq__orbShadow"
            style={{ color: "#906ee0" }}
          >
            <path
              fill="currentColor"
              fillOpacity="0.4"
              d="M96.053 47.5c0 26.234-21.278 47.5-47.527 47.5C22.278 95 1 73.734 1 47.5S22.278 0 48.526 0c26.25 0 47.527 21.266 47.527 47.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
