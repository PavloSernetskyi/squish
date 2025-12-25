"use client";
import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";
import { checkAndRedirectFromInAppBrowser, isInAppBrowser, detectPlatform } from "@/lib/browser-utils";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = supabaseBrowser();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // CRITICAL: Check for in-app browser FIRST, before any auth logic
    if (isInAppBrowser()) {
      console.log('In-app browser detected on auth callback, redirecting to external browser...');
      setIsRedirecting(true);
      const currentUrl = window.location.href;
      checkAndRedirectFromInAppBrowser(currentUrl);
      return;
    }

    const handleAuthCallback = async () => {
      try {
        // Check for OAuth errors first
        const error = searchParams.get('error') || new URLSearchParams(window.location.hash.substring(1)).get('error');
        const errorDescription = searchParams.get('error_description') || new URLSearchParams(window.location.hash.substring(1)).get('error_description');
        const errorCode = searchParams.get('error_code') || new URLSearchParams(window.location.hash.substring(1)).get('error_code');
        
        if (error) {
          let userMessage = errorDescription || error;
          if (errorCode === 'otp_expired') {
            userMessage = 'The magic link has expired. Please request a new one.';
          } else if (error === 'access_denied') {
            userMessage = 'Access denied. The magic link may be invalid or expired. Please try again.';
          }
          router.push(`/?error=${encodeURIComponent(userMessage)}`);
          return;
        }

        // Supabase SSR automatically handles PKCE code exchange via hash fragments
        // Wait a moment for it to process, then check for session
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check for session (Supabase should have processed the code automatically)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          console.log('Auth successful, user:', sessionData.session.user.email);
          router.push('/?auth=success');
        } else if (sessionError) {
          console.error('Session error:', sessionError);
          // If session fails, it might be in-app browser issue
          router.push(`/?error=${encodeURIComponent('Authentication failed. Please open this link in Safari (iOS) or Chrome (Android) for the best experience.')}`);
        } else {
          // Wait a bit more and try again (sometimes Supabase needs a moment)
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: retrySession } = await supabase.auth.getSession();
          
          if (retrySession.session) {
            console.log('Auth successful (retry), user:', retrySession.session.user.email);
            router.push('/?auth=success');
          } else {
            router.push(`/?error=${encodeURIComponent('Authentication failed. Please open this link in Safari (iOS) or Chrome (Android).')}`);
          }
        }
      } catch (err) {
        console.error('Auth callback exception:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        router.push(`/?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth, searchParams]);

  // Show redirect message if in-app browser detected
  if (isRedirecting) {
    const platform = detectPlatform();
    const isIOS = platform === 'ios';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto flex items-center justify-center">
            <span className="text-3xl">🌐</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Opening in Browser</h2>
            <p className="text-gray-600">
              {isIOS 
                ? 'For authentication to work, please open this link in Safari. Tap the share button (square with arrow) and select "Safari".'
                : 'For authentication to work, please open this link in Chrome. Tap the menu (three dots) and select "Open in Chrome".'}
            </p>
          </div>
          <div className="pt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
          </div>
          {isIOS && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-700 font-semibold mb-2">How to open in Safari:</p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Tap the share button (square with arrow) at the bottom</li>
                <li>Scroll and select &quot;Safari&quot; from the options</li>
                <li>Or look for &quot;Open in Safari&quot; at the top of the screen</li>
              </ol>
            </div>
          )}
          {!isIOS && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-700 font-semibold mb-2">How to open in Chrome:</p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Tap the menu (three dots) in the top right</li>
                <li>Select &quot;Open in Chrome&quot; or &quot;Open in browser&quot;</li>
                <li>If not available, copy the link and paste it in Chrome</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
