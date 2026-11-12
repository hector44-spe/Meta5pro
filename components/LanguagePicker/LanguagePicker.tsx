"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

export default function LanguagePicker() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState({
    code: "en",
    label: "English",
    flag: "/assets/en.svg",
  });

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/dashboard")
  ) {
    return null;
  }

  const languages = [
    { code: "en", label: "English", flag: "/assets/en.svg" },
    {
      code: "es",
      label: "Spanish",
      flag: "https://cdn.gtranslate.net/flags/svg/es.svg",
    },
    {
      code: "de",
      label: "German",
      flag: "https://cdn.gtranslate.net/flags/svg/de.svg",
    },
    {
      code: "fr",
      label: "French",
      flag: "https://cdn.gtranslate.net/flags/svg/fr.svg",
    },
    {
      code: "it",
      label: "Italian",
      flag: "https://cdn.gtranslate.net/flags/svg/it.svg",
    },
    {
      code: "pt",
      label: "Portuguese",
      flag: "https://cdn.gtranslate.net/flags/svg/pt.svg",
    },
    {
      code: "ru",
      label: "Russian",
      flag: "https://cdn.gtranslate.net/flags/svg/ru.svg",
    },
    {
      code: "zh-CN",
      label: "Chinese",
      flag: "https://cdn.gtranslate.net/flags/svg/zh-CN.svg",
    },
    {
      code: "ja",
      label: "Japanese",
      flag: "https://cdn.gtranslate.net/flags/svg/ja.svg",
    },
    {
      code: "ar",
      label: "Arabic",
      flag: "https://cdn.gtranslate.net/flags/svg/ar.svg",
    },
  ];

  return (
    <div
      id="gt_float_wrapper"
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
          borderRadius: "4px",
          color: "#333",
          display: "inline-block",
          boxShadow: "rgba(0, 0, 0, 0.25) 0 4px 15px",
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
              maxHeight: "220px",
              overflowY: "auto",
              borderBottom: "1px solid #eee",
              background: "#fff",
            }}
          >
            {languages.map((lang) => (
              <div
                key={lang.code}
                onClick={() => {
                  setCurrentLang(lang);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 12px",
                  color: "#444",
                  fontSize: "13px",
                  transition: "background 0.2s",
                  background:
                    currentLang.code === lang.code ? "#f0f0f5" : "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#6070a0";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    currentLang.code === lang.code ? "#f0f0f5" : "transparent";
                  e.currentTarget.style.color = "#444";
                }}
              >
                <img
                  src={lang.flag}
                  alt={lang.code}
                  style={{
                    width: "22px",
                    height: "auto",
                    marginRight: "8px",
                    borderRadius: "2px",
                  }}
                />
                <span>{lang.label}</span>
              </div>
            ))}
          </div>
        )}
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
              src={currentLang.flag}
              alt={currentLang.code}
              style={{ width: "24px", height: "auto", borderRadius: "2px" }}
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
