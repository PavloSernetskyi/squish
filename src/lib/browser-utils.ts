/**
 * Browser detection for in-app WebViews (GitHub, Telegram, Instagram, etc.).
 * We only use this to show InAppBrowserNotice — we do not auto-redirect here,
 * because forced redirects caused infinite loops and about:blank on mobile OAuth.
 */

interface WindowWithOpera extends Window {
  opera?: string;
}

/**
 * Detects if the user is likely in an embedded / in-app browser.
 */
export function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;

  const windowWithOpera = window as WindowWithOpera;
  const ua =
    navigator.userAgent || navigator.vendor || windowWithOpera.opera || "";

  // Real mobile browsers — not embedded WebViews; do not show in-app notice.
  if (/\bCriOS\b/i.test(ua) || /\bFxiOS\b/i.test(ua) || /\bEdgiOS\b/i.test(ua)) {
    return false;
  }
  if (/Android/i.test(ua) && /Chrome\/[\d.]+/i.test(ua) && !/;\s*wv\)/i.test(ua)) {
    return false;
  }
  if (/SamsungBrowser/i.test(ua)) {
    return false;
  }
  if (
    /iPad|iPhone|iPod/i.test(ua) &&
    /\bVersion\/[\d.]+\b/i.test(ua) &&
    /Safari/i.test(ua) &&
    !/\bCriOS\b/i.test(ua)
  ) {
    return false;
  }

  const inAppPatterns = [
    /FBAN|FBAV/i,
    /Instagram/i,
    /GSA/i,
    /Twitter/i,
    /Snapchat/i,
    /LinkedIn/i,
    /Line/i,
    /OkHttp/i,
    /Electron/i,
    /Telegram/i,
    /WhatsApp/i,
    /Messeng/i,
  ];

  const matchesInAppPattern = inAppPatterns.some((pattern) => pattern.test(ua));

  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSFSafariViewController =
    /Safari/i.test(ua) &&
    !/\bVersion\/\d+/i.test(ua) &&
    isIOS &&
    !/\bCriOS\b/i.test(ua) &&
    !/\bFxiOS\b/i.test(ua);

  const isAndroidWebView = /Android/i.test(ua) && /;\s*wv\)/i.test(ua);

  return matchesInAppPattern || isSFSafariViewController || isAndroidWebView;
}

export function detectPlatform(): "ios" | "android" | "other" {
  if (typeof window === "undefined") return "other";

  const windowWithOpera = window as WindowWithOpera;
  const ua =
    navigator.userAgent || navigator.vendor || windowWithOpera.opera || "";

  if (/iPad|iPhone|iPod/.test(ua)) {
    return "ios";
  }

  if (/Android/.test(ua)) {
    return "android";
  }

  return "other";
}
