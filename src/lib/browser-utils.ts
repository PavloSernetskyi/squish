/**
 * Browser detection and redirect utilities for handling in-app browser issues
 * with authentication flows on mobile devices.
 */

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface WindowWithOpera extends Window {
  opera?: string;
}

export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;

  const windowWithOpera = window as WindowWithOpera;
  const ua = navigator.userAgent || navigator.vendor || windowWithOpera.opera || '';

  // Check for common in-app browser patterns
  const inAppPatterns = [
    /FBAN|FBAV/i,           // Facebook app
    /Instagram/i,            // Instagram
    /Gmail/i,                // Gmail (critical!)
    /GSA/i,                  // Google Search App
    /Twitter/i,              // Twitter/X
    /Snapchat/i,            // Snapchat
    /LinkedIn/i,            // LinkedIn (critical!)
    /Line/i,                // Line
    /OkHttp/i,              // Android in-app browser
    /Electron/i,            // Electron (desktop apps)
    /Telegram/i,            // Telegram
    /WhatsApp/i,            // WhatsApp
    /Messeng/i,             // Messenger
    /wv/i,                  // Android WebView
  ];

  // Check if any pattern matches
  const matchesInAppPattern = inAppPatterns.some(pattern => pattern.test(ua));

  // iOS specific checks
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const navigatorWithStandalone = window.navigator as NavigatorWithStandalone;
  const isStandalone = navigatorWithStandalone.standalone === false;
  const isSFSafariViewController = /Safari/.test(ua) && !/Version\/\d+/.test(ua) && isIOS;

  // Android WebView detection
  const isAndroidWebView = /wv/.test(ua) && /Android/.test(ua);

  // Additional check: if localStorage is blocked or isolated
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch {
    // If we can't use localStorage, likely in-app browser
    return true;
  }

  return matchesInAppPattern || isStandalone || isSFSafariViewController || isAndroidWebView;
}

export function detectPlatform(): 'ios' | 'android' | 'other' {
  if (typeof window === 'undefined') return 'other';

  const windowWithOpera = window as WindowWithOpera;
  const ua = navigator.userAgent || navigator.vendor || windowWithOpera.opera || '';

  if (/iPad|iPhone|iPod/.test(ua)) {
    return 'ios';
  }

  if (/Android/.test(ua)) {
    return 'android';
  }

  return 'other';
}

export function redirectToExternalBrowser(url?: string): void {
  if (typeof window === 'undefined') return;

  const targetUrl = url || window.location.href;
  const platform = detectPlatform();

  if (platform === 'ios') {
    // iOS: Try to open in Safari
    try {
      const opened = window.open(targetUrl, '_blank', 'noopener,noreferrer');
      if (opened) {
        setTimeout(() => {
          try {
            if (opened.closed) {
              tryStrategy2();
            }
          } catch {
            console.log('Redirected to external browser');
          }
        }, 100);
        return;
      }
    } catch {
      console.log('window.open failed, trying alternative method');
    }

    function tryStrategy2() {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 200);
    }

    tryStrategy2();
  } else if (platform === 'android') {
    // Android: Try to open in Chrome
    try {
      const urlObj = new URL(targetUrl);
      const host = urlObj.host;
      const path = urlObj.pathname + urlObj.search + urlObj.hash;
      
      const chromeIntent = `intent://${host}${path}#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end`;
      
      window.location.href = chromeIntent;
      
      setTimeout(() => {
        if (window.location.href.includes('intent://')) {
          window.location.href = targetUrl;
        }
      }, 1000);
    } catch (e) {
      console.error('Failed to create Chrome intent URL:', e);
      window.location.href = targetUrl;
    }
  } else {
    window.location.href = targetUrl;
  }
}

export function checkAndRedirectFromInAppBrowser(url?: string): boolean {
  if (isInAppBrowser()) {
    console.log('In-app browser detected, redirecting to external browser...');
    redirectToExternalBrowser(url);
    return true;
  }
  return false;
}

export function getBrowserWarningMessage(): string {
  const platform = detectPlatform();
  
  if (platform === 'ios') {
    return 'For authentication to work, please open this link in Safari. Tap the share button (square with arrow) and select "Safari".';
  } else if (platform === 'android') {
    return 'For authentication to work, please open this link in Chrome. Tap the menu (three dots) and select "Open in Chrome".';
  }
  
  return 'For authentication to work, please open this link in your default browser.';
}

