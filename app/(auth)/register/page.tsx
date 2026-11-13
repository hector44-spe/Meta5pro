"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Globe, ChevronDown, X } from "lucide-react";
import { COUNTRIES, CURRENCIES } from "@/data/authData";
import {
  ALL_LANGUAGES,
  getCurrentLanguageCode,
  changeLanguage,
  getFlagUrl,
} from "@/lib/languages";
import styles from "../login/auth.module.css";

export default function RegisterPage() {
  const router = useRouter();

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [hasReferral, setHasReferral] = useState(false);

  // Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selections
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c.code === "US") || COUNTRIES[0],
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    CURRENCIES[0] || { symbol: "USD", name: "US Dollar" },
  );
  const [currentCode, setCurrentCode] = useState("en");
  const [langSearch, setLangSearch] = useState("");

  useEffect(() => {
    setCurrentCode(getCurrentLanguageCode());
    const handleChanged = (e: any) => {
      if (e?.detail) setCurrentCode(e.detail);
    };
    window.addEventListener("mg5-lang-changed", handleChanged);
    return () => window.removeEventListener("mg5-lang-changed", handleChanged);
  }, []);

  const currentLang =
    ALL_LANGUAGES.find((l) => l.code === currentCode) || ALL_LANGUAGES[0];

  const filteredLangs = ALL_LANGUAGES.filter(
    (l) =>
      !langSearch.trim() ||
      l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  // Dropdown visibility
  const [countryOpen, setCountryOpen] = useState(false);
  const [phoneCountryOpen, setPhoneCountryOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Search filter inside country dropdown
  const [countrySearch, setCountrySearch] = useState("");
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    const q = countrySearch.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [countrySearch]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone ? `+${selectedCountry.phone}${phone}` : undefined,
          password,
        }),
      });
      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error("Unable to reach server. Please try again later.");
      }
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authWrapper}>
        {/* Exact Authentic Auth Header */}
        <header className={styles.authHeader}>
          <Link href="/" className={styles.logoWrapper}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 198 235"
              style={{ height: "36px", width: "auto" }}
            >
              <path
                fill="#fff"
                d="m124.3 67.826-22.622 39.194H124.3v108.569l-50.611 18.422V166.2H96.32L73.69 126.996V18.422L124.3 0zm-73.676 59.17L27.99 166.2h22.634v23.063L0 207.685V59.92l50.624-18.435zm147.362 47.095-50.611 18.434V107.02h22.634l-22.634-39.213V44.748l50.624-18.422z"
              />
            </svg>
          </Link>

          <Link href="/" className={styles.headerBackLink}>
            <div className={styles.headerBackBtn}>
              <p>Back to homepage</p>
            </div>
          </Link>
        </header>

        {/* Right-aligned Language Switcher Pill */}
        <div className={styles.authLangRow}>
          <div style={{ position: "relative" }}>
            <div
              className={styles.globeWrapper}
              onClick={() => setLangOpen(!langOpen)}
            >
              <div className={styles.globeContent}>
                <Globe size={15} />
                <span className={styles.globeCode}>{currentLang.code}</span>
              </div>
              <ChevronDown
                size={13}
                style={{
                  transform: langOpen ? "rotate(180deg)" : "none",
                  transition: "transform 150ms ease",
                }}
              />
            </div>

            {langOpen && (
              <div
                className={styles.dropdownMenu}
                style={{
                  width: "220px",
                  right: 0,
                  left: "auto",
                  maxHeight: "320px",
                  overflowY: "auto",
                  padding: "4px",
                  zIndex: 9999,
                }}
              >
                <div
                  style={{
                    padding: "6px",
                    position: "sticky",
                    top: 0,
                    background: "#18181b",
                    zIndex: 10,
                    borderBottom: "1px solid #27272a",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    placeholder="Search language..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: "12px",
                      background: "#09090b",
                      border: "1px solid #3f3f46",
                      borderRadius: "4px",
                      color: "#fff",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                {filteredLangs.map((l) => (
                  <div
                    key={l.code}
                    className={styles.dropdownItem}
                    onClick={() => {
                      changeLanguage(l.code);
                      setCurrentCode(l.code);
                      setLangOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "7px 10px",
                      background:
                        currentCode === l.code
                          ? "rgba(79, 70, 229, 0.25)"
                          : undefined,
                    }}
                  >
                    <img
                      src={getFlagUrl(l.countryCode)}
                      alt={l.code}
                      style={{
                        width: "18px",
                        height: "13px",
                        objectFit: "cover",
                        borderRadius: "2px",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "11px",
                        minWidth: "24px",
                      }}
                    >
                      {l.code}
                    </span>
                    <span className={styles.itemSecondary} style={{ fontSize: "12px" }}>
                      {l.label}
                    </span>
                  </div>
                ))}
                {filteredLangs.length === 0 && (
                  <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "#71717a" }}>
                    No languages found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Auth Form */}
        <main className={styles.authPageContent}>
          <div className={styles.authForm}>
            <span className={styles.authFormHeader}>
              <h3 className={styles.authFormTitle}>Get started</h3>
              <p className={styles.authFormSubtext}>Create a new account</p>
            </span>

            {error && (
              <div
                style={{
                  background: "rgba(255, 51, 68, 0.12)",
                  border: "1px solid rgba(255, 51, 68, 0.3)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                  color: "var(--color-negative)",
                  fontSize: "13px",
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className={styles.authFormFields}>
              {/* Multi field: First + Last Name */}
              <div className={styles.multiField}>
                <div className={styles.textBoxPrimary}>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      name="firstname"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      autoComplete="given-name"
                    />
                  </div>
                </div>

                <div className={styles.textBoxPrimary}>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      name="lastname"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              {/* Email address */}
              <div className={styles.textBoxPrimary}>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Country Dropdown */}
              <div className={styles.dropdownPrimary}>
                <div
                  className={styles.selectWrapper}
                  onClick={() => {
                    setCountryOpen(!countryOpen);
                    setPhoneCountryOpen(false);
                    setCurrencyOpen(false);
                  }}
                >
                  <button type="button">
                    {selectedCountry && (
                      <img
                        loading="lazy"
                        width="16"
                        src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png 2x`}
                        alt={`Flag of ${selectedCountry.label}`}
                      />
                    )}
                    <p className={selectedCountry ? styles.hasCountry : ""}>
                      {selectedCountry
                        ? selectedCountry.label
                        : "Select your country"}
                    </p>
                  </button>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: countryOpen ? "rotate(180deg)" : "none",
                      transition: "transform 150ms ease",
                    }}
                  />
                </div>

                {countryOpen && (
                  <div className={styles.dropdownMenu}>
                    <input
                      type="text"
                      className={styles.dropdownSearchInput}
                      placeholder="Search country..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {filteredCountries.slice(0, 50).map((c) => (
                      <div
                        key={c.code}
                        className={styles.dropdownItem}
                        onClick={() => {
                          setSelectedCountry(c);
                          setCountryOpen(false);
                          setCountrySearch("");
                        }}
                      >
                        <img
                          src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                          alt={c.label}
                        />
                        <span>{c.label}</span>
                        <span className={styles.itemSecondary}>+{c.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Phone Dropdown */}
              <div className={styles.dropdownPrimary}>
                <div className={styles.phoneWrapper}>
                  <div
                    className={styles.phoneLeft}
                    onClick={() => {
                      setPhoneCountryOpen(!phoneCountryOpen);
                      setCountryOpen(false);
                      setCurrencyOpen(false);
                    }}
                  >
                    <button type="button">
                      {selectedCountry && (
                        <img
                          loading="lazy"
                          width="16"
                          src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
                          alt={selectedCountry.label}
                        />
                      )}
                      <p>+{selectedCountry ? selectedCountry.phone : "1"}</p>
                    </button>
                    <ChevronDown
                      size={14}
                      style={{
                        transform: phoneCountryOpen ? "rotate(180deg)" : "none",
                        transition: "transform 150ms ease",
                      }}
                    />
                  </div>
                  <input
                    type="tel"
                    name="phonenumber"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    autoComplete="tel"
                  />
                </div>

                {phoneCountryOpen && (
                  <div className={styles.dropdownMenu}>
                    <input
                      type="text"
                      className={styles.dropdownSearchInput}
                      placeholder="Search dial code..."
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {filteredCountries.slice(0, 50).map((c) => (
                      <div
                        key={c.code}
                        className={styles.dropdownItem}
                        onClick={() => {
                          setSelectedCountry(c);
                          setPhoneCountryOpen(false);
                          setCountrySearch("");
                        }}
                      >
                        <img
                          src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                          alt={c.label}
                        />
                        <span>{c.label}</span>
                        <span className={styles.itemSecondary}>+{c.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className={styles.passwordBoxPrimary}>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min. 6 characters)"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.showBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={14} strokeWidth={1.5} />
                    ) : (
                      <Eye size={14} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className={styles.passwordBoxPrimary}>
                <div className={styles.inputWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className={styles.showBtn}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={14} strokeWidth={1.5} />
                    ) : (
                      <Eye size={14} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* Currency Dropdown */}
              <div className={styles.dropdownPrimary}>
                <div
                  className={styles.selectWrapper}
                  onClick={() => {
                    setCurrencyOpen(!currencyOpen);
                    setCountryOpen(false);
                    setPhoneCountryOpen(false);
                  }}
                >
                  <span>
                    <p>{selectedCurrency.symbol}</p>
                    <strong>(Account Currency)</strong>
                  </span>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: currencyOpen ? "rotate(180deg)" : "none",
                      transition: "transform 150ms ease",
                    }}
                  />
                </div>

                {currencyOpen && (
                  <div className={styles.dropdownMenu}>
                    {CURRENCIES.map((cur) => (
                      <div
                        key={cur.symbol}
                        className={styles.dropdownItem}
                        onClick={() => {
                          setSelectedCurrency(cur);
                          setCurrencyOpen(false);
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{cur.symbol}</span>
                        <span className={styles.itemSecondary}>{cur.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Referral Code */}
              {hasReferral ? (
                <div className={styles.textBoxPrimary}>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      name="referral"
                      value={referral}
                      onChange={(e) => setReferral(e.target.value)}
                      placeholder="Referral code (optional)"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setReferral("");
                        setHasReferral(false);
                      }}
                      className={styles.showBtn}
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setHasReferral(true)}
                  className={styles.textBtn}
                >
                  Have a referral code?
                </button>
              )}

              <br />

              <p className={styles.formActionText}>
                Already have an account?{" "}
                <Link href="/login" className={styles.action}>
                  Log in
                </Link>
              </p>

              <div className={styles.authFormFooter}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${styles.authBtn} ${loading ? styles.disabled : ""}`}
                >
                  <p>{loading ? "Creating account..." : "Create account"}</p>
                </button>
              </div>

              <p className={styles.formDisclaimer}>
                You agree to Meta Gold 5{" "}
                <Link
                  href="/terms"
                  className={styles.action}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className={styles.action}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy policy
                </Link>
                .
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
