"use client";

import { useEffect, useState } from "react";
import { detectPlatform, isInAppBrowser } from "@/lib/browser-utils";

/**
 * Shown when the site runs inside an embedded WebView (GitHub, Telegram, Instagram, etc.).
 * Google OAuth is unreliable there; we guide users to open the same URL in Safari/Chrome.
 */
export default function InAppBrowserNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isInAppBrowser());
  }, []);

  const copyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied. Open Safari or Chrome, paste the address, then sign in.");
    } catch {
      alert(`Copy this address manually:\n\n${url}`);
    }
  };

  if (!visible) {
    return null;
  }

  const platform = detectPlatform();
  const steps =
    platform === "ios"
      ? "Tap ··· or Share at the bottom, then Open in Safari."
      : platform === "android"
        ? "Tap ··· in the top bar, then Open in Chrome or your browser."
        : "Open this page in Chrome, Safari, or Edge.";

  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950 shadow-sm"
      role="status"
    >
      <p className="font-semibold text-amber-900">You’re in an in-app browser</p>
      <p className="mt-1.5 leading-relaxed text-amber-900/85">
        Apps like GitHub or Telegram open links inside a small browser.{" "}
        <span className="font-medium">Sign in with Google often fails here.</span>{" "}
        Open this site in Safari or Chrome instead.
      </p>
      <p className="mt-2 text-xs text-amber-800/90">{steps}</p>
      <button
        type="button"
        onClick={copyLink}
        className="mt-3 w-full rounded-lg bg-amber-200/80 px-3 py-2.5 text-center text-sm font-semibold text-amber-950 ring-1 ring-amber-300/70 transition hover:bg-amber-200"
      >
        Copy site link
      </button>
    </div>
  );
}
