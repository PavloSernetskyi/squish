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
        console.log('Handling auth callback...');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Hash:', window.location.hash);
        
        // Check both query params and hash fragment for errors
        const code = searchParams.get('code') || new URLSearchParams(window.location.hash.substring(1)).get('code');
        const error = searchParams.get('error') || new URLSearchParams(window.location.hash.substring(1)).get('error');
        const errorDescription = searchParams.get('error_description') || new URLSearchParams(window.location.hash.substring(1)).get('error_description');
        const errorCode = searchParams.get('error_code') || new URLSearchParams(window.location.hash.substring(1)).get('error_code');
        
        // Check for OAuth errors
        if (error) {
          console.error('OAuth error detected:', { error, errorCode, errorDescription });
          
          // Provide user-friendly error messages
          let userMessage = errorDescription || error;
          if (errorCode === 'otp_expired') {
            userMessage = 'The magic link has expired. Please request a new one.';
          } else if (error === 'access_denied') {
            userMessage = 'Access denied. The magic link may be invalid or expired. Please try again.';
          }
          
          router.push(`/?error=${encodeURIComponent(userMessage)}&error_code=${errorCode || ''}`);
          return;
        }

        // First, check if we already have a session (Supabase might have set it via hash fragment)
        const { data: existingSession } = await supabase.auth.getSession();
        if (existingSession.session) {
          console.log('Session already exists, user:', existingSession.session.user.email);
          router.push('/?auth=success');
          return;
        }

        // If there's a code, try to exchange it for a session
        if (code) {
          console.log('Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.warn('Code exchange error (will check session anyway):', exchangeError);
            // Don't return yet - Supabase might have set the session via hash fragment
            // Continue to check for session below
          } else if (data.session) {
            console.log('Auth successful via code exchange, user:', data.session.user.email);
            router.push('/?auth=success');
            return;
          }
        }

        // Final check: try to get session (might have been set via hash fragment or other means)
        const { data: finalSession, error: sessionError } = await supabase.auth.getSession();
        
        if (finalSession.session) {
          console.log('Auth successful (session found), user:', finalSession.session.user.email);
          router.push('/?auth=success');
        } else if (sessionError) {
          console.error('Session error:', sessionError);
          router.push(`/?error=${encodeURIComponent(sessionError.message)}`);
        } else {
          console.log('No session found and no code provided');
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
