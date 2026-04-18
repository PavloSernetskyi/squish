"use client";

import { useEffect, useState } from "react";
import { detectPlatform, isInAppBrowser } from "@/lib/browser-utils";

/**
 * Shown when the site runs inside an embedded WebView (e.g. social or chat apps).
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
      ? "Tap Copy site link, then open Safari or Chrome and paste the address."
      : platform === "android"
        ? "Tap Copy site link, then open Chrome (or your browser) and paste the address."
        : "Tap Copy site link, then open this page in Chrome, Safari, or Edge.";

  return (
    <div
      className="rounded-xl border border-orange-300 bg-gradient-to-r from-amber-50 to-orange-100 px-4 py-3 text-left text-sm text-orange-950 shadow"
      role="status"
    >
      <p className="font-semibold text-orange-900">You’re in an in-app browser</p>
      <p className="mt-1.5 leading-relaxed text-orange-900/90">
        You may be viewing this page inside another app’s built-in browser—not the
        browser you use for the rest of the web.{" "}
        <span className="font-semibold text-red-700">
          Sign in with Google often doesn’t work here.
        </span>{" "}
        For the best experience, open Squish in Safari or Chrome.
      </p>
      <p className="mt-2 text-xs text-orange-800/95">{steps}</p>
      <button
        type="button"
        onClick={copyLink}
        className="mt-3 w-full rounded-lg bg-orange-200 px-3 py-2.5 text-center text-sm font-semibold text-orange-950 ring-1 ring-orange-400/60 transition hover:bg-orange-300"
      >
        Copy site link
      </button>
    </div>
  );
}
