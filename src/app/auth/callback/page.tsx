"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = supabaseBrowser();

  useEffect(() => {
    // Do not redirect "out of in-app browser" here. That ran before OAuth completed,
    // re-triggered the same URL, and caused infinite loops / about:blank on mobile.
    // PKCE exchange must run on this page while the ?code= is still present.

    const handleAuthCallback = async () => {
      try {
        const error =
          searchParams.get("error") ||
          new URLSearchParams(window.location.hash.substring(1)).get("error");
        const errorDescription =
          searchParams.get("error_description") ||
          new URLSearchParams(window.location.hash.substring(1)).get(
            "error_description",
          );
        const errorCode =
          searchParams.get("error_code") ||
          new URLSearchParams(window.location.hash.substring(1)).get(
            "error_code",
          );

        if (error) {
          let userMessage = errorDescription || error;
          if (errorCode === "otp_expired") {
            userMessage = "The sign-in link has expired. Please try again.";
          } else if (error === "access_denied") {
            userMessage =
              "Access was denied. You can close this and try signing in again.";
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
          console.log("Auth successful, user:", sessionData.session.user.email);
          router.push("/?auth=success");
        } else if (sessionError) {
          console.error("Session error:", sessionError);
          router.push(`/?error=${encodeURIComponent(sessionError.message)}`);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const { data: retrySession } = await supabase.auth.getSession();

          if (retrySession.session) {
            console.log(
              "Auth successful (retry), user:",
              retrySession.session.user.email,
            );
            router.push("/?auth=success");
          } else {
            router.push(
              "/?error=Sign-in did not complete. Please try signing in with Google again.",
            );
          }
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
