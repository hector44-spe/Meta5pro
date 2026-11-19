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

  const zoho = window.$zoho?.salesiq;
  if (zoho) {
    try {
      if (zoho.floatwindow?.visible) {
        zoho.floatwindow.visible("show");
        return;
      }
      if (zoho.chat?.start) {
        zoho.chat.start();
        return;
      }
    } catch (err) {
      console.warn("Could not open Zoho chat window:", err);
    }
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
      "siq513c6505d2533af9b126785c07077fdf654c1f0926580539f03271bc7d08c35f";

    if (!widgetCode || typeof window === "undefined") return;

    window.$zoho = window.$zoho || {};
    window.$zoho.salesiq = window.$zoho.salesiq || {
      widgetcode: widgetCode,
      values: {},
      ready: function () {
        try {
          // Hide Zoho's duplicate generic floating launcher so our branded button controls it
          if (window.$zoho?.salesiq?.floatbutton?.visible) {
            window.$zoho.salesiq.floatbutton.visible("hide");
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
      script.src = "https://salesiq.zohopublic.com/widget";
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
