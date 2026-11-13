"use client";

import React, { useEffect } from "react";
import Script from "next/script";

// Patch DOM methods to prevent React reconciliation crashes with Google Translate font tags
function patchDomForGoogleTranslate() {
  if (typeof window === "undefined") return;
  if ((window as any).__gt_dom_patched) return;
  (window as any).__gt_dom_patched = true;

  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      return child;
    }
    return originalRemoveChild.apply(this, [child]) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      return newNode;
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]) as T;
  };
}

export default function GoogleTranslateProvider() {
  useEffect(() => {
    patchDomForGoogleTranslate();

    // Define Google Translate initialization function
    (window as any).googleTranslateElementInit = function () {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            autoDisplay: false,
            includedLanguages:
              "af,sq,am,ar,hy,az,eu,be,bn,bs,bg,ca,ceb,ny,zh-CN,zh-TW,co,hr,cs,da,nl,en,eo,et,tl,fi,fr,fy,gl,ka,de,el,gu,ht,ha,haw,iw,hi,hmn,hu,is,ig,id,ga,it,ja,jw,kn,kk,km,ko,ku,ky,lo,la,lv,lt,lb,mk,mg,ms,ml,mt,mi,mr,mn,my,ne,no,ps,fa,pl,pt,pa,ro,ru,sm,gd,sr,st,sn,sd,si,sk,sl,so,es,su,sw,sv,tg,ta,te,th,tr,uk,ur,uz,vi,cy,xh,yi,yo,zu",
            layout: (window as any).google.translate.TranslateElement?.InlineLayout?.SIMPLE,
          },
          "google_translate_element"
        );
      }
    };

    // If script is already loaded
    if ((window as any).google && (window as any).google.translate) {
      (window as any).googleTranslateElementInit();
    }
  }, []);

  return (
    <>
      <div
        id="google_translate_element"
        style={{ display: "none", position: "absolute", top: -9999, left: -9999 }}
      />
      <Script
        id="google-translate-script"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="lazyOnload"
      />
    </>
  );
}
