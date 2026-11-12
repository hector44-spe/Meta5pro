export interface LanguageItem {
  code: string;
  label: string;
  nativeName?: string;
  countryCode: string;
}

export const ALL_LANGUAGES: LanguageItem[] = [
  { code: "en", label: "English", countryCode: "gb" },
  { code: "es", label: "Spanish", countryCode: "es" },
  { code: "de", label: "German", countryCode: "de" },
  { code: "fr", label: "French", countryCode: "fr" },
  { code: "it", label: "Italian", countryCode: "it" },
  { code: "pt", label: "Portuguese", countryCode: "pt" },
  { code: "ru", label: "Russian", countryCode: "ru" },
  { code: "zh-CN", label: "Chinese (Simplified)", countryCode: "cn" },
  { code: "zh-TW", label: "Chinese (Traditional)", countryCode: "tw" },
  { code: "ja", label: "Japanese", countryCode: "jp" },
  { code: "ar", label: "Arabic", countryCode: "sa" },
  { code: "af", label: "Afrikaans", countryCode: "za" },
  { code: "sq", label: "Albanian", countryCode: "al" },
  { code: "am", label: "Amharic", countryCode: "et" },
  { code: "hy", label: "Armenian", countryCode: "am" },
  { code: "az", label: "Azerbaijani", countryCode: "az" },
  { code: "eu", label: "Basque", countryCode: "es" },
  { code: "be", label: "Belarusian", countryCode: "by" },
  { code: "bn", label: "Bengali", countryCode: "bd" },
  { code: "bs", label: "Bosnian", countryCode: "ba" },
  { code: "bg", label: "Bulgarian", countryCode: "bg" },
  { code: "ca", label: "Catalan", countryCode: "es" },
  { code: "ceb", label: "Cebuano", countryCode: "ph" },
  { code: "ny", label: "Chichewa", countryCode: "mw" },
  { code: "co", label: "Corsican", countryCode: "fr" },
  { code: "hr", label: "Croatian", countryCode: "hr" },
  { code: "cs", label: "Czech", countryCode: "cz" },
  { code: "da", label: "Danish", countryCode: "dk" },
  { code: "nl", label: "Dutch", countryCode: "nl" },
  { code: "eo", label: "Esperanto", countryCode: "eu" },
  { code: "et", label: "Estonian", countryCode: "ee" },
  { code: "tl", label: "Filipino", countryCode: "ph" },
  { code: "fi", label: "Finnish", countryCode: "fi" },
  { code: "fy", label: "Frisian", countryCode: "nl" },
  { code: "gl", label: "Galician", countryCode: "es" },
  { code: "ka", label: "Georgian", countryCode: "ge" },
  { code: "el", label: "Greek", countryCode: "gr" },
  { code: "gu", label: "Gujarati", countryCode: "in" },
  { code: "ht", label: "Haitian Creole", countryCode: "ht" },
  { code: "ha", label: "Hausa", countryCode: "ng" },
  { code: "haw", label: "Hawaiian", countryCode: "us" },
  { code: "iw", label: "Hebrew", countryCode: "il" },
  { code: "hi", label: "Hindi", countryCode: "in" },
  { code: "hmn", label: "Hmong", countryCode: "la" },
  { code: "hu", label: "Hungarian", countryCode: "hu" },
  { code: "is", label: "Icelandic", countryCode: "is" },
  { code: "ig", label: "Igbo", countryCode: "ng" },
  { code: "id", label: "Indonesian", countryCode: "id" },
  { code: "ga", label: "Irish", countryCode: "ie" },
  { code: "jw", label: "Javanese", countryCode: "id" },
  { code: "kn", label: "Kannada", countryCode: "in" },
  { code: "kk", label: "Kazakh", countryCode: "kz" },
  { code: "km", label: "Khmer", countryCode: "kh" },
  { code: "ko", label: "Korean", countryCode: "kr" },
  { code: "ku", label: "Kurdish", countryCode: "iq" },
  { code: "ky", label: "Kyrgyz", countryCode: "kg" },
  { code: "lo", label: "Lao", countryCode: "la" },
  { code: "la", label: "Latin", countryCode: "va" },
  { code: "lv", label: "Latvian", countryCode: "lv" },
  { code: "lt", label: "Lithuanian", countryCode: "lt" },
  { code: "lb", label: "Luxembourgish", countryCode: "lu" },
  { code: "mk", label: "Macedonian", countryCode: "mk" },
  { code: "mg", label: "Malagasy", countryCode: "mg" },
  { code: "ms", label: "Malay", countryCode: "my" },
  { code: "ml", label: "Malayalam", countryCode: "in" },
  { code: "mt", label: "Maltese", countryCode: "mt" },
  { code: "mi", label: "Maori", countryCode: "nz" },
  { code: "mr", label: "Marathi", countryCode: "in" },
  { code: "mn", label: "Mongolian", countryCode: "mn" },
  { code: "my", label: "Burmese", countryCode: "mm" },
  { code: "ne", label: "Nepali", countryCode: "np" },
  { code: "no", label: "Norwegian", countryCode: "no" },
  { code: "ps", label: "Pashto", countryCode: "af" },
  { code: "fa", label: "Persian", countryCode: "ir" },
  { code: "pl", label: "Polish", countryCode: "pl" },
  { code: "pa", label: "Punjabi", countryCode: "in" },
  { code: "ro", label: "Romanian", countryCode: "ro" },
  { code: "sm", label: "Samoan", countryCode: "ws" },
  { code: "gd", label: "Scottish Gaelic", countryCode: "gb" },
  { code: "sr", label: "Serbian", countryCode: "rs" },
  { code: "st", label: "Sesotho", countryCode: "ls" },
  { code: "sn", label: "Shona", countryCode: "zw" },
  { code: "sd", label: "Sindhi", countryCode: "pk" },
  { code: "si", label: "Sinhala", countryCode: "lk" },
  { code: "sk", label: "Slovak", countryCode: "sk" },
  { code: "sl", label: "Slovenian", countryCode: "si" },
  { code: "so", label: "Somali", countryCode: "so" },
  { code: "su", label: "Sundanese", countryCode: "id" },
  { code: "sw", label: "Swahili", countryCode: "ke" },
  { code: "sv", label: "Swedish", countryCode: "se" },
  { code: "tg", label: "Tajik", countryCode: "tj" },
  { code: "ta", label: "Tamil", countryCode: "in" },
  { code: "te", label: "Telugu", countryCode: "in" },
  { code: "th", label: "Thai", countryCode: "th" },
  { code: "tr", label: "Turkish", countryCode: "tr" },
  { code: "uk", label: "Ukrainian", countryCode: "ua" },
  { code: "ur", label: "Urdu", countryCode: "pk" },
  { code: "uz", label: "Uzbek", countryCode: "uz" },
  { code: "vi", label: "Vietnamese", countryCode: "vn" },
  { code: "cy", label: "Welsh", countryCode: "gb" },
  { code: "xh", label: "Xhosa", countryCode: "za" },
  { code: "yi", label: "Yiddish", countryCode: "il" },
  { code: "yo", label: "Yoruba", countryCode: "ng" },
  { code: "zu", label: "Zulu", countryCode: "za" },
];

export const POPULAR_LANGUAGES: LanguageItem[] = ALL_LANGUAGES.slice(0, 11);
export const LANGUAGES: LanguageItem[] = ALL_LANGUAGES;

// List of locally available flags in /dashboard_files/
const LOCAL_FLAG_CODES = new Set([
  "af", "al", "am", "az", "ba", "bd", "bg", "cn", "cz", "de", "dk", "ee",
  "es", "et", "fi", "fj", "fr", "ge", "gh", "gr", "hr", "hu", "id", "il",
  "in", "iq", "ir", "is", "jp", "kg", "kh", "kr", "kz", "la", "lt", "lv",
  "ma", "mg", "mk", "mm", "mn", "mt", "ng", "nl", "no", "nz", "pf", "ph",
  "pl", "pt", "ro", "rs", "ru", "rw", "sa", "se", "si", "sk", "so", "th",
  "tj", "tm", "to", "tr", "tz", "ua", "us", "uz", "vn", "ws", "za"
]);

export function getFlagUrl(countryCode: string): string {
  const code = countryCode.toLowerCase();
  if (code === "en" || code === "gb") {
    return "/assets/en.svg";
  }
  if (LOCAL_FLAG_CODES.has(code)) {
    return `/dashboard_files/${code}.png`;
  }
  return `https://flagcdn.com/w40/${code}.png`;
}

export function getCurrentLanguageCode(): string {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("mg5_selected_lang");
    if (saved) return saved;
    // Check googtrans cookie: format "/en/es"
    const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    if (match && match[1]) return match[1];
  } catch {
    // fallback
  }
  return "en";
}

export function changeLanguage(langCode: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem("mg5_selected_lang", langCode);
  } catch {
    // ignore
  }

  const isEn = langCode === "en";
  const cookieVal = isEn ? "" : `/en/${langCode}`;
  const expires = isEn
    ? "Thu, 01 Jan 1970 00:00:00 UTC"
    : "Fri, 31 Dec 2030 23:59:59 UTC";
  const hostname = window.location.hostname;

  // Set googtrans cookie for current domain and root domain
  document.cookie = `googtrans=${cookieVal}; path=/; expires=${expires}`;
  document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname}; expires=${expires}`;
  if (hostname && hostname.includes(".") && !hostname.startsWith("localhost")) {
    const rootDomain = hostname.substring(hostname.indexOf("."));
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${rootDomain}; expires=${expires}`;
  }

  // Also support GTranslate localStorage format if GTranslate lib is active
  try {
    if (isEn) {
      localStorage.removeItem("__GT_TRANSLATE_LANGS");
    } else {
      localStorage.setItem("__GT_TRANSLATE_LANGS", JSON.stringify({ srcLang: "en", tgtLang: langCode }));
    }
  } catch {
    // ignore
  }

  // Trigger Google Translate combo box if present
  let selectUpdated = false;
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
    selectUpdated = true;
  }

  // Also trigger window.doGTranslate if available
  if ((window as any).doGTranslate) {
    try {
      (window as any).doGTranslate(`en|${langCode}`);
      selectUpdated = true;
    } catch {
      // ignore
    }
  }

  // If translation selector wasn't ready yet or page needs refresh to apply cookie
  if (!selectUpdated) {
    window.location.reload();
  }

  // Notify active components
  window.dispatchEvent(new CustomEvent("mg5-lang-changed", { detail: langCode }));
}
