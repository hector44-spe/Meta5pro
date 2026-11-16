import React from "react";

export default function AssetBrandIcon({
  symbol,
  size = 28,
}: {
  symbol: string;
  size?: number;
}) {
  const sym = (symbol || "BTC").toUpperCase();

  if (sym === "BTC") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        style={{ borderRadius: "50%", flexShrink: 0 }}
      >
        <circle cx="16" cy="16" r="16" fill="#F7931A" />
        <path
          d="M23.05 13.72c.32-2.13-1.3-3.27-3.52-4.04l.72-2.88-1.76-.44-.7 2.81c-.46-.12-.93-.22-1.4-.33l.7-2.83-1.75-.44-.72 2.88c-.38-.08-.76-.17-1.12-.26l.01-.01-2.42-.6-.47 1.87s1.3.3 1.28.32c.71.18.84.65.82 1.02l-.82 3.29c.08.02.18.06.18.06l-.18-.05-1.15 4.6c-.09.22-.31.54-.8.42.02.03-1.28-.32-1.28-.32l-.87 2.01 2.28.57c.43.11.85.22 1.26.32l-.73 2.92 1.76.44.72-2.89c.48.13.94.25 1.4.36l-.72 2.91 1.75.44.73-2.91c2.99.56 5.25.34 6.19-2.37.76-2.18-.04-3.44-1.61-4.26 1.15-.26 2.01-1.02 2.24-2.58zm-4.01 5.63c-.54 2.18-4.21 1-5.4.7l.96-3.86c1.19.3 5.01.88 4.44 3.16zm.54-5.66c-.5 1.98-3.55.98-4.54.73l.87-3.5c.99.24 4.18.7 3.67 2.77z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  if (sym === "ETH") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ borderRadius: "50%", flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="12" fill="#627EEA" />
        <path d="M11.519 3.84v6.316l4.714 2.142-4.714-8.458z" fill="#ffffff" fillOpacity="0.6" />
        <path d="M11.519 3.84L6.804 12.298l4.715-2.142V3.84z" fill="#ffffff" />
        <path d="M11.519 14.449v4.751l4.717-6.643-4.717 1.892z" fill="#ffffff" fillOpacity="0.6" />
        <path d="M11.519 19.2v-4.751l-4.715-1.892L11.519 19.2z" fill="#ffffff" />
        <path d="M11.519 13.689l4.714-2.788-4.714-2.142v4.93z" fill="#ffffff" fillOpacity="0.2" />
        <path d="M6.804 10.901l4.715 2.788V8.759L6.804 10.901z" fill="#ffffff" fillOpacity="0.6" />
      </svg>
    );
  }

  if (sym === "SOL") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ borderRadius: "50%", flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="solGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9945FF" />
            <stop offset="100%" stopColor="#14F195" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="12" fill="url(#solGradIcon)" />
        <path
          d="M7.11 14.63a.43.43 0 0 1 .3-.12h10.38c.19 0 .28.22.15.36l-2.05 2.01a.43.43 0 0 1-.3.12H5.21c-.19 0-.28-.22-.15-.36l2.05-2.01zm0-7.51a.44.44 0 0 1 .3-.12h10.38c.19 0 .28.22.15.35l-2.05 2.02a.43.43 0 0 1-.3.12H5.21c-.19 0-.28-.23-.15-.36l2.05-2.01zm8.78 3.73a.43.43 0 0 0-.3-.12H5.21c-.19 0-.28.22-.15.35l2.05 2.02a.43.43 0 0 0 .3.12h10.38c.19 0 .28-.22.15-.36l-2.05-2.01z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  if (sym === "USDT") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ borderRadius: "50%", flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="12" fill="#26A17B" />
        <path
          d="M13.2 11.5v-.02c2.14-.09 3.8-.52 3.8-1.04 0-.57-2.03-1.04-4.5-1.04s-4.5.47-4.5 1.04c0 .52 1.66.95 3.8 1.04V11.5c-2.73.13-4.8.72-4.8 1.43 0 .71 2.07 1.3 4.8 1.43v4.64h1.4v-4.64c2.73-.13 4.8-.72 4.8-1.43 0-.71-2.07-1.3-4.8-1.43zM12.5 7h4v1.5h-9V7h4V5.5h1V7z"
          fill="#ffffff"
        />
      </svg>
    );
  }

  if (sym === "USD") {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: Math.round(size * 0.55),
          flexShrink: 0,
        }}
      >
        $
      </div>
    );
  }

  if (sym === "AAPL") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ borderRadius: "50%", flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="12" fill="#1c1c1e" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <path
          d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
          transform="translate(4.8 4.8) scale(0.6)"
          fill="#ffffff"
        />
      </svg>
    );
  }

  if (sym === "GOLD" || sym === "XAUUSD" || sym === "XAU") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ borderRadius: "50%", flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="12" fill="#EAB308" />
        <path d="M7 16h10l-2-8H9L7 16z" fill="#713F12" />
        <path d="M9 8l1.5-3h3L15 8H9z" fill="#FDE047" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ borderRadius: "50%", flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="12" fill="#334155" />
      <text x="12" y="15.5" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="700">
        {sym.slice(0, 3)}
      </text>
    </svg>
  );
}
