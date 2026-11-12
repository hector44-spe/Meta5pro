"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  ALL_LANGUAGES,
  POPULAR_LANGUAGES,
  LanguageItem,
  getFlagUrl,
  getCurrentLanguageCode,
  changeLanguage,
} from "@/lib/languages";

export default function LanguagePicker() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentCode, setCurrentCode] = useState("en");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync current language from cookies/localStorage on mount and on custom event
  useEffect(() => {
    const code = getCurrentLanguageCode();
    setCurrentCode(code);

    const handleLangChange = (e: any) => {
      if (e?.detail) setCurrentCode(e.detail);
    };

    window.addEventListener("mg5-lang-changed", handleLangChange);
    return () => {
      window.removeEventListener("mg5-lang-changed", handleLangChange);
    };
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const currentLang = useMemo(() => {
    return (
      ALL_LANGUAGES.find((l) => l.code === currentCode) ||
      ALL_LANGUAGES[0] // fallback to English
    );
  }, [currentCode]);

  const filteredLanguages = useMemo(() => {
    if (!search.trim()) return ALL_LANGUAGES;
    const q = search.toLowerCase();
    return ALL_LANGUAGES.filter(
      (l) =>
        l.label.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [search]);

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/dashboard")
  ) {
    return null;
  }

  const handleSelect = (lang: LanguageItem) => {
    setCurrentCode(lang.code);
    setOpen(false);
    setSearch("");
    changeLanguage(lang.code);
  };

  return (
    <div
      ref={wrapperRef}
      id="gt_float_wrapper"
      className="notranslate"
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 9990,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        className="gt_float_switcher notranslate"
        style={{
          fontSize: "14px",
          borderRadius: "6px",
          color: "#333",
          display: "inline-block",
          boxShadow: "rgba(0, 0, 0, 0.3) 0 4px 18px",
          background: "#fff",
          overflow: "hidden",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {open && (
          <div
            className="gt_options gt-open"
            style={{
              width: "220px",
              maxHeight: "320px",
              overflowY: "auto",
              borderBottom: "1px solid #eee",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Search Input */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "#f9f9fb",
                padding: "8px 10px",
                borderBottom: "1px solid #eee",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                placeholder="Search language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  fontSize: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  outline: "none",
                  color: "#111",
                  boxSizing: "border-box",
                }}
                autoFocus
              />
            </div>

            {/* Language List */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {!search.trim() && (
                <div
                  style={{
                    padding: "6px 12px 2px",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#888",
                    letterSpacing: "0.5px",
                  }}
                >
                  Popular
                </div>
              )}
              {(!search.trim() ? POPULAR_LANGUAGES : []).map((lang) => (
                <div
                  key={`pop-${lang.code}`}
                  onClick={() => handleSelect(lang)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 12px",
                    color: "#333",
                    fontSize: "13px",
                    transition: "background 0.15s",
                    background:
                      currentCode === lang.code ? "#eef2ff" : "transparent",
                    fontWeight: currentCode === lang.code ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#4f46e5";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      currentCode === lang.code ? "#eef2ff" : "transparent";
                    e.currentTarget.style.color = "#333";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={getFlagUrl(lang.countryCode)}
                      alt={lang.code}
                      style={{
                        width: "20px",
                        height: "14px",
                        objectFit: "cover",
                        marginRight: "8px",
                        borderRadius: "2px",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span>{lang.label}</span>
                  </div>
                  {currentCode === lang.code && (
                    <span style={{ color: "#4f46e5", fontSize: "12px", fontWeight: "bold" }}>✓</span>
                  )}
                </div>
              ))}

              {!search.trim() && (
                <div
                  style={{
                    padding: "8px 12px 2px",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#888",
                    borderTop: "1px solid #f0f0f0",
                    marginTop: "4px",
                    letterSpacing: "0.5px",
                  }}
                >
                  All Languages ({ALL_LANGUAGES.length})
                </div>
              )}

              {filteredLanguages.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 12px",
                    color: "#333",
                    fontSize: "13px",
                    transition: "background 0.15s",
                    background:
                      currentCode === lang.code ? "#eef2ff" : "transparent",
                    fontWeight: currentCode === lang.code ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#4f46e5";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      currentCode === lang.code ? "#eef2ff" : "transparent";
                    e.currentTarget.style.color = "#333";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={getFlagUrl(lang.countryCode)}
                      alt={lang.code}
                      style={{
                        width: "20px",
                        height: "14px",
                        objectFit: "cover",
                        marginRight: "8px",
                        borderRadius: "2px",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span>{lang.label}</span>
                  </div>
                  {currentCode === lang.code && (
                    <span style={{ color: "#4f46e5", fontSize: "12px", fontWeight: "bold" }}>✓</span>
                  )}
                </div>
              ))}

              {filteredLanguages.length === 0 && (
                <div style={{ padding: "16px", textAlign: "center", fontSize: "12px", color: "#888" }}>
                  No languages found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selected Trigger Button */}
        <div
          className="gt-selected"
          onClick={() => setOpen(!open)}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 14px",
            background: "#fff",
          }}
        >
          <div
            className="gt-current-lang"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 700,
            }}
          >
            <img
              src={getFlagUrl(currentLang.countryCode)}
              alt={currentLang.code}
              style={{ width: "22px", height: "15px", objectFit: "cover", borderRadius: "2px" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span
              className="gt-lang-code"
              style={{
                textTransform: "uppercase",
                color: "#111",
                fontSize: "13px",
              }}
            >
              {currentLang.code}
            </span>
            <span
              className="gt_float_switcher-arrow"
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderLeft: "2px solid #555",
                borderBottom: "2px solid #555",
                transform: open ? "rotate(135deg)" : "rotate(-45deg)",
                transition: "transform 0.2s",
                marginLeft: "4px",
                marginBottom: open ? "-2px" : "3px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
