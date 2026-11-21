"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    $zoho?: any;
    openLiveSupport?: () => void;
  }
}

interface ZohoSalesIQProps {
  user?: {
    fullName?: string | null;
    email?: string | null;
    username?: string | null;
    balance?: number | string | null;
  } | null;
}

export function openLiveSupport(fallback?: () => void) {
  if (typeof window === "undefined") return;

  const tryOpenZoho = () => {
    const zoho = window.$zoho?.salesiq;
    if (zoho) {
      try {
        if (typeof zoho.floatwindow?.visible === "function") {
          zoho.floatwindow.visible("show");
          return true;
        }
        if (typeof zoho.chatwindow?.visible === "function") {
          zoho.chatwindow.visible("show");
          return true;
        }
        if (typeof zoho.chat?.open === "function") {
          zoho.chat.open();
          return true;
        }
        if (typeof zoho.chat?.start === "function") {
          zoho.chat.start();
          return true;
        }
        const zsiq = (window as any).ZohoSalesIQ;
        if (zsiq) {
          if (typeof zsiq.present === "function") {
            zsiq.present();
            return true;
          }
          if (typeof zsiq.openNewChat === "function") {
            zsiq.openNewChat();
            return true;
          }
        }
      } catch (err) {
        console.warn("Could not open Zoho chat window:", err);
      }
    }

    // Try finding and triggering the floating launcher button in the DOM
    const zohoLauncher = (document.getElementById("zsiq_float") ||
      document.querySelector("#zsiq_float, .zsiq_float, #zsiq_mwt, [id^='zsiq']")) as HTMLElement | null;
    if (zohoLauncher) {
      try {
        zohoLauncher.click();
        return true;
      } catch (err) {
        console.warn("Could not click Zoho launcher element:", err);
      }
    }

    return false;
  };

  if (tryOpenZoho()) return;

  // If Zoho script is injected but still initializing, retry briefly
  const scriptEl = document.getElementById("zsiqscript");
  if (scriptEl) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (tryOpenZoho()) {
        clearInterval(interval);
      } else if (attempts >= 10) {
        clearInterval(interval);
        if (fallback) fallback();
      }
    }, 200);
    return;
  }

  // Fallback to internal chat if Zoho is unavailable
  if (fallback) {
    fallback();
  }
}

export default function ZohoSalesIQ({ user }: ZohoSalesIQProps) {
  useEffect(() => {
    const widgetCode =
      process.env.NEXT_PUBLIC_ZOHO_SALESIQ_WIDGET_CODE ||
      "siq204029d34d78d2f47da12321a6b674a5a0b6216d2b6e3bc6760c7773daac2ff3";

    if (!widgetCode || typeof window === "undefined") return;

    window.$zoho = window.$zoho || {};
    window.$zoho.salesiq = window.$zoho.salesiq || {
      widgetcode: widgetCode,
      values: {},
      ready: function () {
        try {
          // Ensure Zoho's native floating launcher is visible
          if (window.$zoho?.salesiq?.floatbutton?.visible) {
            window.$zoho.salesiq.floatbutton.visible("show");
          }

          // Pass user details to Zoho agent console if user is logged in
          if (user && window.$zoho?.salesiq?.visitor) {
            const displayName = user.fullName || user.username || "";
            if (displayName && window.$zoho.salesiq.visitor.name) {
              window.$zoho.salesiq.visitor.name(displayName);
            }
            if (user.email && window.$zoho.salesiq.visitor.email) {
              window.$zoho.salesiq.visitor.email(user.email);
            }
            if (user.balance !== undefined && user.balance !== null && window.$zoho.salesiq.visitor.info) {
              window.$zoho.salesiq.visitor.info({ "Account Balance": `$${user.balance}` });
            }
          }
        } catch (e) {
          console.warn("Zoho SalesIQ ready callback error:", e);
        }
      },
    };

    // Global helper so any component or button can open support
    window.openLiveSupport = () => openLiveSupport();

    // Check if script is already injected
    if (!document.getElementById("zsiqscript")) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.id = "zsiqscript";
      script.defer = true;
      script.src = `https://salesiq.zohopublic.com/widget?wc=${encodeURIComponent(widgetCode)}`;
      document.body.appendChild(script);
    }
  }, [user]);

  // Sync user details on user state updates
  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    try {
      const visitor = window.$zoho?.salesiq?.visitor;
      if (visitor) {
        const displayName = user.fullName || user.username || "";
        if (displayName && visitor.name) visitor.name(displayName);
        if (user.email && visitor.email) visitor.email(user.email);
        if (user.balance !== undefined && user.balance !== null && visitor.info) {
          visitor.info({ "Account Balance": `$${user.balance}` });
        }
      }
    } catch {
      // ignore
    }
  }, [user]);

  return null;
}
