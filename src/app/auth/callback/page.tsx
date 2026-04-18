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
    // Check if user is in an in-app browser and redirect to external browser
    // This must happen before any authentication logic
    if (isInAppBrowser()) {
      console.log('In-app browser detected on auth callback, redirecting to external browser...');
      setIsRedirecting(true);
      const currentUrl = window.location.href;
      
      // Attempt redirect
      checkAndRedirectFromInAppBrowser(currentUrl);
      
      // Return early - the redirect will happen
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
            userMessage = 'The sign-in link has expired. Please try again.';
          } else if (error === 'access_denied') {
            userMessage =
              'Access was denied. You can close this and try signing in again.';
          }
          router.push(`/?error=${encodeURIComponent(userMessage)}`);
          return;
        }

        const code = searchParams.get("code");
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeError) {
            const { data: existing } = await supabase.auth.getSession();
            if (!existing.session) {
              console.error("PKCE exchange failed:", exchangeError);
              router.push(
                `/?error=${encodeURIComponent(exchangeError.message)}`,
              );
              return;
            }
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        
        if (sessionData.session) {
          console.log('Auth successful, user:', sessionData.session.user.email);
          router.push('/?auth=success');
        } else if (sessionError) {
          console.error('Session error:', sessionError);
          router.push(`/?error=${encodeURIComponent(sessionError.message)}`);
        } else {
          // Wait a bit more and try again (sometimes Supabase needs a moment)
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: retrySession } = await supabase.auth.getSession();
          
          if (retrySession.session) {
            console.log('Auth successful (retry), user:', retrySession.session.user.email);
            router.push('/?auth=success');
          } else {
            router.push(
              '/?error=Sign-in did not complete. Please try signing in with Google again.',
            );
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
                ? 'For the best authentication experience, please open this link in Safari. Tap "Open in Safari" when prompted, or use the share button to open in Safari.'
                : 'For the best authentication experience, please open this link in Chrome or your default browser.'}
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
                <li>Look for the &quot;Open in Safari&quot; button at the top</li>
                <li>Or tap the share button (square with arrow)</li>
                <li>Select &quot;Safari&quot; from the options</li>
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
