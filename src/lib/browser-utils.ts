/**
 * Browser detection and redirect utilities for handling in-app browser issues
 * with authentication flows on mobile devices.
 */

/**
 * Detects if the user is currently in an in-app browser
 * (Instagram, Facebook, LinkedIn, TikTok, etc.)
 * 
 * @returns {boolean} True if user is in an in-app browser
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';

  // Check for common in-app browser patterns
  const inAppPatterns = [
    /FBAN|FBAV/i,           // Facebook app
    /Instagram/i,            // Instagram
    /GSA/i,                  // Google Search App
    /Twitter/i,              // Twitter/X
    /Snapchat/i,            // Snapchat
    /LinkedIn/i,            // LinkedIn
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
  const isStandalone = (window.navigator as any).standalone === false;
  const isSFSafariViewController = /Safari/.test(ua) && !/Version\/\d+/.test(ua) && isIOS;

  // Android WebView detection
  const isAndroidWebView = /wv/.test(ua) && /Android/.test(ua);

  return matchesInAppPattern || isStandalone || isSFSafariViewController || isAndroidWebView;
}

/**
 * Detects the user's platform (iOS or Android)
 * 
 * @returns {'ios' | 'android' | 'other'} The platform type
 */
export function detectPlatform(): 'ios' | 'android' | 'other' {
  if (typeof window === 'undefined') return 'other';

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';

  if (/iPad|iPhone|iPod/.test(ua)) {
    return 'ios';
  }

  if (/Android/.test(ua)) {
    return 'android';
  }

  return 'other';
}

/**
 * Redirects the user to an external browser (Safari on iOS, Chrome on Android)
 * 
 * @param {string} url - The URL to open in the external browser
 * @returns {void}
 */
export function redirectToExternalBrowser(url?: string): void {
  if (typeof window === 'undefined') return;

  const targetUrl = url || window.location.href;
  const platform = detectPlatform();

  if (platform === 'ios') {
    // iOS: Multiple strategies to open in Safari
    // Strategy 1: Try window.open first (works in some in-app browsers)
    try {
      const opened = window.open(targetUrl, '_blank', 'noopener,noreferrer');
      if (opened) {
        // Give it a moment, then check if it was blocked
        setTimeout(() => {
          try {
            if (opened.closed) {
              // Window was closed or blocked, try next strategy
              tryStrategy2();
            }
          } catch (e) {
            // Cross-origin error means it opened, which is good
            console.log('Redirected to external browser');
          }
        }, 100);
        return;
      }
    } catch (e) {
      console.log('window.open failed, trying alternative method');
    }

    // Strategy 2: Direct location change (will prompt user to open in Safari)
    function tryStrategy2() {
      // Create a temporary link and click it
      const link = document.createElement('a');
      link.href = targetUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Fallback: direct location change
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 200);
    }

    tryStrategy2();
  } else if (platform === 'android') {
    // Android: Try to open in Chrome using intent:// URL scheme
    try {
      // Extract the domain and path from the URL
      const urlObj = new URL(targetUrl);
      const host = urlObj.host;
      const path = urlObj.pathname + urlObj.search + urlObj.hash;
      
      // Create Chrome intent URL
      const chromeIntent = `intent://${host}${path}#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end`;
      
      // Try to open with Chrome intent
      window.location.href = chromeIntent;
      
      // Fallback: if intent fails, try regular redirect after a delay
      setTimeout(() => {
        // Check if we're still on the same page (intent might have failed)
        if (window.location.href.includes('intent://')) {
          window.location.href = targetUrl;
        }
      }, 1000);
    } catch (e) {
      // If intent URL creation fails, just redirect normally
      console.error('Failed to create Chrome intent URL:', e);
      window.location.href = targetUrl;
    }
  } else {
    // Desktop or other: just redirect normally
    window.location.href = targetUrl;
  }
}

/**
 * Checks if user is in an in-app browser and redirects to external browser if needed
 * This should be called early in the authentication flow
 * 
 * @param {string} url - Optional URL to redirect to (defaults to current URL)
 * @returns {boolean} True if redirect was triggered, false otherwise
 */
export function checkAndRedirectFromInAppBrowser(url?: string): boolean {
  if (isInAppBrowser()) {
    console.log('In-app browser detected, redirecting to external browser...');
    redirectToExternalBrowser(url);
    return true;
  }
  return false;
}

/**
 * Gets a user-friendly message about opening in external browser
 * 
 * @returns {string} Message to display to the user
 */
export function getExternalBrowserMessage(): string {
  const platform = detectPlatform();
  
  if (platform === 'ios') {
    return 'For the best experience, please open this link in Safari. Tap the share button and select "Open in Safari".';
  } else if (platform === 'android') {
    return 'For the best experience, please open this link in Chrome. Tap the menu and select "Open in Chrome".';
  }
  
  return 'For the best experience, please open this link in your default browser.';
}

