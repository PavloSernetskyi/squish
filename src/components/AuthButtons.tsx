"use client";
import { supabaseBrowser } from "@/lib/supabase-client";
import { useState, useEffect } from "react";
import VoicePanel from "./VoicePanel";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function AuthButtons() {
  const sb = supabaseBrowser();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await sb.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [sb.auth]);

  const signInWithGoogle = async () => {
    setIsSigningIn(true);
    try {
      const { data, error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (process.env.NODE_ENV === "development") {
        console.log("[auth] signInWithOAuth", {
          error: error?.message,
          status: error?.status,
          hasUrl: Boolean(data?.url),
        });
      }

      if (error) {
        alert(error.message || "Could not start Google sign-in.");
        return;
      }

      if (data.url) {
        window.location.assign(data.url);
        return;
      }

      alert("Could not start Google sign-in. Please try again.");
    } catch {
      alert("Network error while signing in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    const { error } = await sb.auth.signOut({ scope: "local" });
    if (error) {
      alert(`Sign out failed: ${error.message}`);
      return;
    }

    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <p className="text-green-600 font-semibold">Welcome back!</p>
            <p className="text-gray-600 text-sm">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>

        <div className="border-t pt-6">
          <VoicePanel />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-6">
          Sign in with Google to get started with voice meditation
        </p>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
        >
          <GoogleIcon className="w-5 h-5 shrink-0" />
          {isSigningIn ? "Redirecting…" : "Continue with Google"}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          We use your Google account only to identify you securely
        </p>
      </div>
    </div>
  );
}
