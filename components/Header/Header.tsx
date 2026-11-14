"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkItem {
  href: string;
  title: string;
  description: string;
  renderIcon: () => React.ReactNode;
}

interface NavCategory {
  title: string;
  links: NavLinkItem[];
}

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close any open menus after navigating (from PR #1).
  // No per-route hiding is needed: this header is only rendered by the marketing layout.
  useEffect(() => {
    setMobileOpen(false);
    setActiveMenu(null);
  }, [pathname]);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navCategories: NavCategory[] = [
    {
      title: "Explore",
      links: [
        {
          href: "/staking",
          title: "Staking",
          description: "Stake your tokens and earn",
          renderIcon: () => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M20 7.5c0 1.933-3.582 3.5-8 3.5S4 9.433 4 7.5m16 0C20 5.567 16.418 4 12 4S4 5.567 4 7.5m16 0v10c0 1.933-3.582 3.5-8 3.5s-8-1.567-8-3.5v-10m16 5c0 1.933-3.582 3.5-8 3.5s-8-1.567-8-3.5"
              />
            </svg>
          ),
        },
        {
          href: "/markets",
          title: "Markets",
          description: "Explore the markets",
          renderIcon: () => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 3v9h9m-9-9a9 9 0 1 0 9 9m-9-9a9 9 0 0 1 9 9"
              />
            </svg>
          ),
        },
        {
          href: "/real-estate",
          title: "Real Estate",
          description: "Invest in real estate",
          renderIcon: () => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path d="M8.5 7a1 1 0 0 0 0 2zm2 2a1 1 0 1 0 0-2zm-2 2a1 1 0 1 0 0 2zm2 2a1 1 0 1 0 0-2zm-2 2a1 1 0 1 0 0 2zm2 2a1 1 0 1 0 0-2zM3 19a1 1 0 1 0 0 2zm18 2a1 1 0 1 0 0-2zM5 20h1V5H4v15zM6 4v1h7V3H6zm8 1h-1v15h2V5zm0 5v1h4V9h-4zm5 1h-1v9h2v-9zM8.5 8v1h2V7h-2zm0 4v1h2v-2h-2zm0 4v1h2v-2h-2zM3 20v1h18v-2H3zm15-10v1h2a2 2 0 0 0-2-2zm-5-6v1h2a2 2 0 0 0-2-2zM5 5h1V3a2 2 0 0 0-2 2z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Company",
      links: [
        {
          href: "/about",
          title: "About us",
          description: "About Meta Gold 5",
          renderIcon: () => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 8h.002M11 11h1v6h.5m8.5-5a9 9 0 1 1-18 0 9 9 0 0 1 18 0"
              />
            </svg>
          ),
        },
        {
          href: "/contact",
          title: "Contact",
          description: "Send us a message",
          renderIcon: () => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                stroke="currentColor"
                strokeWidth="1.5"
                d="m3 6.5 8.68 7.233a.5.5 0 0 0 .64 0L21 6.5M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1"
              />
            </svg>
          ),
        },
        {
          href: "/help-center",
          title: "Help center",
          description: "Frequently asked questions",
          renderIcon: () => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 17h.002m-2.627-6.875a2.625 2.625 0 1 1 3.601 2.438c-.512.345-.974.782-.974 1.437v1"
              />
            </svg>
          ),
        },
      ],
    },
    {
      title: "Trade",
      links: [
        {
          href: "/stocks",
          title: "Stocks & ETFs",
          description: "Invest and trade shares",
          renderIcon: () => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 6V3m0 18v-5m9-8V3m0 18v-3m3-2v-6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M7 16h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2"
              />
            </svg>
          ),
        },
        {
          href: "/crypto",
          title: "Crypto",
          description: "Trade cryptocurrencies",
          renderIcon: () => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
                d="M10 7v2m3-2v2m-3 6v2m3-2v2M8 9h6.5a1.5 1.5 0 0 1 0 3H9m-1 3h6.505a1.495 1.495 0 1 0 0-2.99H9M9 9v6m12-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          ),
        },
        {
          href: "/copy-trading",
          title: "Copy Trading",
          description: "Copy expert trades",
          renderIcon: () => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              width="18"
              height="18"
            >
              <path d="M8 11.5a.5.5 0 0 0 0 1zm4 1a.5.5 0 0 0 0-1zm-4 3a.5.5 0 0 0 0 1zm2 1a.5.5 0 0 0 0-1zM16 8h-.5v12h1V8zm-1 13v-.5H5v1h10zM4 20h.5V8h-1v12zM5 7v.5h10v-1H5zm3 5v.5h4v-1H8zm0 4v.5h2v-1H8zm12 0h.5V4h-1v12zM19 3v-.5H9v1h10zM8 4h-.5v3h1V4zm8 13v.5h3v-1h-3zM9 3v-.5A1.5 1.5 0 0 0 7.5 4h1a.5.5 0 0 1 .5-.5zm11 1h.5A1.5" />
            </svg>
          ),
        },
      ],
    },
  ];

  const toggleMenu = (title: string) => {
    setActiveMenu((prev) => (prev === title ? null : title));
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 9999,
        backgroundColor: scrolled
          ? "rgba(5, 8, 11, 0.92)"
          : "rgba(5, 8, 11, 0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: scrolled
          ? "0 10px 30px -10px rgba(0, 0, 0, 0.6)"
          : "none",
        transition: "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div
        className="header-module__BjIITG__headerContainer"
        ref={headerRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "0 clamp(1rem, 3vw, 2rem)",
          height: "72px",
          boxSizing: "border-box",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 198 235"
            className="header-module__BjIITG__logoFull"
            style={{ height: "36px" }}
          >
            <path
              fill="#fff"
              d="m124.3 67.826-22.622 39.194H124.3v108.569l-50.611 18.422V166.2H96.32L73.69 126.996V18.422L124.3 0zm-73.676 59.17L27.99 166.2h22.634v23.063L0 207.685V59.92l50.624-18.435zm147.362 47.095-50.611 18.434V107.02h22.634l-22.634-39.213V44.748l50.624-18.422z"
            />
          </svg>
        </Link>

        {/* Desktop Navigation */}
        <div className="header-module__BjIITG__desktopNav">
          <nav className="index-module__Im9qRG__Root">
            <ul
              className="index-module__Im9qRG__List"
              style={{
                display: "flex",
                gap: "0.5rem",
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              {navCategories.map((category) => {
                const isOpen = activeMenu === category.title;
                return (
                  <li key={category.title} style={{ position: "relative" }}>
                    <button
                      type="button"
                      aria-expanded={isOpen ? "true" : "false"}
                      onClick={() => toggleMenu(category.title)}
                      className="index-module__Im9qRG__Trigger"
                      data-popup-open={isOpen ? "true" : undefined}
                      style={{
                        background: isOpen
                          ? "var(--color-outline)"
                          : "transparent",
                        border: "none",
                        color: isOpen
                          ? "var(--color-text-primary)"
                          : "var(--color-text-secondary)",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        lineHeight: "1.25rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "0.75rem",
                        transition: "all 0.15s ease-in-out",
                      }}
                    >
                      {category.title}
                      <span
                        aria-hidden="true"
                        className="index-module__Im9qRG__Icon"
                        style={{
                          transform: isOpen ? "rotate(180deg)" : "none",
                          transition: "transform 0.2s ease-out",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 10 10"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M1 3.5L5 7.5L9 3.5"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>

                    {/* Exact Meta Gold 5 Dropdown Popup */}
                    {isOpen && (
                      <div
                        className="index-module__Im9qRG__Popup"
                        style={{
                          position: "absolute",
                          top: "calc(100% + 10px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          backgroundColor: "rgba(10, 10, 14, 0.92)",
                          WebkitBackdropFilter: "blur(120px)",
                          backdropFilter: "blur(120px)",
                          color: "var(--color-text-primary)",
                          borderRadius: "0.75rem",
                          border: "1px solid var(--color-outline)",
                          zIndex: 9999,
                          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8)",
                          width: "max-content",
                          minWidth: "335px",
                        }}
                      >
                        <div
                          className="index-module__Im9qRG__Content"
                          style={{ padding: "16px", boxSizing: "border-box" }}
                        >
                          <h4
                            className="index-module__Im9qRG__MenuTitle"
                            style={{
                              color: "var(--color-text-extra)",
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              lineHeight: "0.75rem",
                              fontFamily: "var(--font-inter)",
                              margin: "8px 12px 14px 12px",
                              letterSpacing: "0.02em",
                              textTransform: "capitalize",
                            }}
                          >
                            {category.title}
                          </h4>
                          <ul
                            className="index-module__Im9qRG__FlexLinkList"
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                              margin: 0,
                              padding: 0,
                              listStyle: "none",
                              maxWidth: "335px",
                            }}
                          >
                            {category.links.map((link) => (
                              <li key={link.href}>
                                <Link
                                  href={link.href}
                                  onClick={() => setActiveMenu(null)}
                                  className="index-module__Im9qRG__LinkCard"
                                  style={{
                                    display: "block",
                                    color: "inherit",
                                    backgroundColor: "transparent",
                                    borderRadius: "12px",
                                    padding: "10px 12px",
                                    textDecoration: "none",
                                    transition:
                                      "background-color 0.15s ease-in-out",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "var(--color-faint-outline)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "transparent")
                                  }
                                >
                                  <div
                                    className="index-module__Im9qRG__LinkContent"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "12px",
                                    }}
                                  >
                                    <div
                                      className="index-module__Im9qRG__IconContainer"
                                      style={{
                                        width: "36px",
                                        height: "36px",
                                        minWidth: "36px",
                                        borderRadius: "0.5rem",
                                        backgroundColor:
                                          "rgba(255, 255, 255, 0.08)",
                                        border:
                                          "0.5px solid rgba(255, 255, 255, 0.18)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        WebkitBackdropFilter: "blur(4px)",
                                        backdropFilter: "blur(4px)",
                                        color: "var(--color-text-secondary)",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {link.renderIcon()}
                                    </div>
                                    <div
                                      className="index-module__Im9qRG__LinkText"
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2px",
                                        flex: 1,
                                      }}
                                    >
                                      <p
                                        className="index-module__Im9qRG__LinkTitle"
                                        style={{
                                          color: "var(--color-text-primary)",
                                          fontSize: "13px",
                                          fontWeight: 600,
                                          lineHeight: "18px",
                                          margin: 0,
                                        }}
                                      >
                                        {link.title}
                                      </p>
                                      <p
                                        className="index-module__Im9qRG__LinkDescription"
                                        style={{
                                          color: "var(--color-text-secondary)",
                                          fontSize: "12px",
                                          lineHeight: "16px",
                                          margin: 0,
                                        }}
                                      >
                                        {link.description}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Right CTA Buttons */}
        <div
          className="header-module__BjIITG__buttonsWrapper"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          {!mobileOpen && (
            <div className="header-module__BjIITG__primaryBtnWrapper">
              <Link
                href="/register"
                className="button-module__Q_cxDG__buttonContainer button-module__Q_cxDG__primary"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "#000",
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  fontWeight: 600,
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Get started
              </Link>
            </div>
          )}
          {!mobileOpen && (
            <Link
              href="/login"
              className="button-module__Q_cxDG__buttonContainer"
              style={{
                display: "inline-flex",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#fff",
                padding: "8px 18px",
                borderRadius: "9999px",
                fontWeight: 500,
                fontSize: "14px",
                textDecoration: "none",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--color-outline)",
              }}
            >
              Log in
            </Link>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: mobileOpen
                ? "rgba(255, 255, 255, 0.08)"
                : "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer (exact replica of Meta Gold Image 6, no buttons) */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: "72px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "#050508",
            padding: "16px 20px 48px",
            zIndex: 1000000,
            overflowY: "auto",
          }}
        >
          {navCategories.map((cat, idx) => (
            <div
              key={cat.title}
              style={{ marginTop: idx === 0 ? "8px" : "24px" }}
            >
              <h3
                style={{
                  color: "#ffffff",
                  fontSize: "20px",
                  fontWeight: 700,
                  fontFamily: "var(--font-mori), var(--font-inter), sans-serif",
                  letterSpacing: "-0.01em",
                  marginBottom: "14px",
                }}
              >
                {cat.title}
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {cat.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "14px 16px",
                        borderRadius: "14px",
                        background: isActive
                          ? "rgba(45, 40, 80, 0.65)"
                          : "rgba(255, 255, 255, 0.035)",
                        border: isActive
                          ? "1px solid rgba(168, 153, 255, 0.35)"
                          : "1px solid rgba(255, 255, 255, 0.05)",
                        color: "#fff",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          minWidth: "42px",
                          borderRadius: "10px",
                          background: "rgba(255, 255, 255, 0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                        }}
                      >
                        {link.renderIcon()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 600,
                            color: "#ffffff",
                            lineHeight: "1.25",
                          }}
                        >
                          {link.title}
                        </div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "var(--color-text-secondary)",
                            lineHeight: "1.35",
                            marginTop: "2px",
                          }}
                        >
                          {link.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Mobile Drawer CTA Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--color-accent)",
                color: "#000",
                padding: "14px 24px",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
              }}
            >
              Get started
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                color: "#fff",
                padding: "14px 24px",
                borderRadius: "9999px",
                fontWeight: 500,
                fontSize: "15px",
                textDecoration: "none",
                border: "1px solid var(--color-outline)",
              }}
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
