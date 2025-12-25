"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = supabaseBrowser();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get code and error from both query params and hash fragments
        // Mobile browsers may put them in different places
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = window.location.hash 
          ? new URLSearchParams(window.location.hash.substring(1)) 
          : new URLSearchParams();
        
        const code = searchParams.get('code') || urlParams.get('code') || hashParams.get('code');
        const error = searchParams.get('error') || urlParams.get('error') || hashParams.get('error');
        const errorDescription = searchParams.get('error_description') || urlParams.get('error_description') || hashParams.get('error_description');
        const errorCode = searchParams.get('error_code') || urlParams.get('error_code') || hashParams.get('error_code');
        
        console.log('Auth callback - Code:', code, 'Error:', error, 'Hash:', window.location.hash);
        
        // Check for errors first
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

        // If we have a code, explicitly exchange it for a session
        // This is critical for mobile browsers that may not handle hash fragments properly
        if (code) {
          console.log('Exchanging code for session...');
          const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            router.push(`/?error=${encodeURIComponent(exchangeError.message)}`);
            return;
          }
          
          if (exchangeData.session) {
            console.log('Auth successful via code exchange, user:', exchangeData.session.user.email);
            // Clean up URL before redirecting
            window.history.replaceState({}, document.title, window.location.pathname);
            router.push('/?auth=success');
            return;
          }
        }

        // Fallback: Check for existing session (for cases where code was already processed)
        // This handles desktop browsers that may have already processed the hash fragment
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          console.log('Auth successful (existing session), user:', sessionData.session.user.email);
          // Clean up URL before redirecting
          window.history.replaceState({}, document.title, window.location.pathname);
          router.push('/?auth=success');
        } else if (sessionError) {
          console.error('Session error:', sessionError);
          router.push(`/?error=${encodeURIComponent(sessionError.message)}`);
        } else {
          // No code and no session - likely a direct visit to callback page
          console.warn('No code or session found in callback');
          router.push('/?error=Please click the magic link from your email to sign in.');
        }
      } catch (err) {
        console.error('Auth callback exception:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        router.push(`/?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth, searchParams]);

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
