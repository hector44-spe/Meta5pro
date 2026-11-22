"use client";

import { useEffect } from "react";

const KEYBOARD_THRESHOLD = 120;

function isEditableElement(element: Element | null): element is HTMLElement {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    (element instanceof HTMLElement && element.isContentEditable)
  );
}

/**
 * Publishes one viewport contract for every route. Mobile browsers resize the
 * visual viewport when the keyboard opens, but `vh` and layout viewport values
 * are inconsistent between Safari and Chromium. CSS consumes these properties
 * instead of guessing which viewport the browser currently exposes.
 */
export default function ViewportMetrics() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let stableHeight = window.innerHeight;
    let stableWidth = window.innerWidth;
    let frame = 0;
    let keyboardWasOpen = false;

    const publish = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const visualHeight = Math.round(viewport?.height ?? window.innerHeight);
        const offsetTop = Math.round(viewport?.offsetTop ?? 0);
        const widthChanged = Math.abs(window.innerWidth - stableWidth) > 40;
        const activeInput = isEditableElement(document.activeElement);
        const possibleInset = Math.max(0, stableHeight - visualHeight - offsetTop);
        const keyboardOpen = activeInput && possibleInset >= KEYBOARD_THRESHOLD;

        if (widthChanged || (!keyboardOpen && visualHeight >= stableHeight - KEYBOARD_THRESHOLD)) {
          stableHeight = window.innerHeight;
          stableWidth = window.innerWidth;
        }

        const keyboardInset = keyboardOpen
          ? Math.max(0, stableHeight - visualHeight - offsetTop)
          : 0;
        // `interactive-widget=resizes-content` already places fixed elements
        // above the keyboard. Only add an offset on browsers that leave the
        // layout viewport at its original height (notably older iOS Safari).
        const layoutAlreadyResized = Math.abs(window.innerHeight - visualHeight) < 2;
        const fixedBottomOffset = layoutAlreadyResized ? 0 : keyboardInset;

        root.style.setProperty("--app-viewport-height", `${stableHeight}px`);
        root.style.setProperty("--visual-viewport-height", `${visualHeight}px`);
        root.style.setProperty("--visual-viewport-offset-top", `${offsetTop}px`);
        root.style.setProperty("--app-keyboard-inset", `${keyboardInset}px`);
        root.style.setProperty("--fixed-bottom-keyboard-offset", `${fixedBottomOffset}px`);
        // Compatibility for existing dashboard styles.
        root.style.setProperty("--dashboard-viewport-height", `${stableHeight}px`);
        root.style.setProperty("--dashboard-keyboard-inset", `${keyboardInset}px`);
        root.dataset.keyboardOpen = keyboardOpen ? "true" : "false";

        // When keyboard closes, iOS Safari fails to reset window.scrollY, causing
        // the top navbar to disappear and the bottom of the page to crop.
        if (keyboardWasOpen && !keyboardOpen && window.scrollY !== 0) {
          window.scrollTo(0, 0);
        }
        if (activeInput && window.scrollY !== 0 && document.querySelector(".project-edit-modal-overlay, [class*='modalBackdrop'], [class*='modalOverlay'], [role='dialog'], .dm-backdrop")) {
          window.scrollTo(0, 0);
        }
        keyboardWasOpen = keyboardOpen;
      });
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && isEditableElement(target)) {
        const modal = target.closest(
          ".project-edit-modal-overlay, [class*='modalBackdrop'], [class*='modalOverlay'], [role='dialog'], .dm-backdrop"
        );
        if (modal) {
          if (window.scrollY !== 0) {
            window.scrollTo(0, 0);
          }
          setTimeout(() => {
            if (window.scrollY !== 0) {
              window.scrollTo(0, 0);
            }
            try {
              target.scrollIntoView({ block: "nearest", behavior: "smooth" });
            } catch {}
          }, 80);
        }
      }
    };

    const handleWindowScroll = () => {
      if (document.querySelector(".project-edit-modal-overlay, [class*='modalBackdrop'], [class*='modalOverlay'], [role='dialog'], .dm-backdrop")) {
        if (window.scrollY !== 0) {
          window.scrollTo(0, 0);
        }
      }
    };

    const handleFocusOut = () => {
      // Restore window scroll when inputs blur so headers never get scrolled off-screen
      setTimeout(() => {
        if (keyboardWasOpen && !isEditableElement(document.activeElement)) {
          window.scrollTo(0, 0);
          keyboardWasOpen = false;
        }
      }, 80);
    };

    publish();
    viewport?.addEventListener("resize", publish);
    viewport?.addEventListener("scroll", publish);
    window.addEventListener("resize", publish);
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    window.addEventListener("orientationchange", publish);
    document.addEventListener("focusin", publish);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", publish);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", publish);
      viewport?.removeEventListener("scroll", publish);
      window.removeEventListener("resize", publish);
      window.removeEventListener("scroll", handleWindowScroll);
      window.removeEventListener("orientationchange", publish);
      document.removeEventListener("focusin", publish);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", publish);
      document.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return null;
}
