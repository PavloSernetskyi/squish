"use client";
import { supabaseBrowser } from "@/lib/supabase-client";
import { useState, useEffect } from "react";
import VoicePanel from "./VoicePanel";

export default function AuthButtons() {
  const sb = supabaseBrowser();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [cooldownIsEstimated, setCooldownIsEstimated] = useState(false);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await sb.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = sb.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [sb.auth]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const parseRetryAfterSeconds = (retryAfter: string | null) => {
    if (!retryAfter) {
      return null;
    }

    const asNumber = Number.parseInt(retryAfter, 10);
    if (!Number.isNaN(asNumber) && asNumber > 0) {
      return asNumber;
    }

    const retryDateMs = Date.parse(retryAfter);
    if (Number.isNaN(retryDateMs)) {
      return null;
    }

    const secondsUntilRetry = Math.ceil((retryDateMs - Date.now()) / 1000);
    return secondsUntilRetry > 0 ? secondsUntilRetry : null;
  };

  const getRateLimitWaitSeconds = (response: Response) => {
    const retryAfter = parseRetryAfterSeconds(response.headers.get("Retry-After"));
    if (retryAfter) {
      return { seconds: retryAfter, estimated: false };
    }

    // Some providers expose reset time via these headers.
    const resetCandidates = [
      response.headers.get("x-ratelimit-reset"),
      response.headers.get("ratelimit-reset"),
    ];

    for (const value of resetCandidates) {
      if (!value) continue;

      const asNumber = Number.parseInt(value, 10);
      if (!Number.isNaN(asNumber) && asNumber > 0) {
        // Accept either absolute unix timestamp or relative seconds.
        const isLikelyUnixSeconds = asNumber > 1_000_000_000;
        const seconds = isLikelyUnixSeconds
          ? Math.ceil(asNumber - Date.now() / 1000)
          : asNumber;

        if (seconds > 0) {
          return { seconds, estimated: false };
        }
      }
    }

    // Fallback estimate for built-in email caps when provider does not expose reset timing.
    return { seconds: 30 * 60, estimated: true };
  };

  const signInWithOtp = async () => {
    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (cooldownSeconds > 0) {
      if (cooldownIsEstimated) {
        alert("Please wait 30-60 minutes before requesting another link.");
      } else {
        alert(`Please wait ${cooldownSeconds}s before requesting another link.`);
      }
      return;
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      alert("Supabase configuration is missing.");
      return;
    }

    setIsSendingLink(true);

    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          create_user: true,
          email_redirect_to: `${window.location.origin}/auth/callback`,
        }),
      });

      if (!response.ok) {
        const retryAfterHeader = response.headers.get("Retry-After");
        const retryAfterSeconds = parseRetryAfterSeconds(retryAfterHeader);
        const errorBody = await response.json().catch(() => null);
        const errorMessage =
          errorBody?.msg ||
          errorBody?.message ||
          "Failed to send magic link.";

        if (response.status === 429) {
          const waitDetails = retryAfterSeconds
            ? { seconds: retryAfterSeconds, estimated: false }
            : getRateLimitWaitSeconds(response);
          const waitSeconds = waitDetails.seconds;
          setCooldownIsEstimated(waitDetails.estimated);
          setCooldownSeconds(waitSeconds);
          alert(
            waitDetails.estimated
              ? "Too many requests. Please wait 30-60 minutes and try again."
              : `Too many requests. Please wait ${waitSeconds}s and try again.`
          );
          return;
        }

        alert(errorMessage);
        return;
      }

      setCooldownSeconds(20);
      setCooldownIsEstimated(false);
      alert("Check your email for the magic link! Click it to return to Squish.");
      return;
    } catch {
      alert("Network error while sending magic link. Please try again.");
      return;
    } finally {
      setIsSendingLink(false);
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
        <p className="text-gray-600 mb-6">Enter your email to get started with voice meditation</p>
      </div>
      
      <div className="space-y-4">
        <input 
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500" 
          placeholder="you@example.com" 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          type="email"
        />
        <button 
          onClick={signInWithOtp} 
          disabled={isSendingLink || cooldownSeconds > 0 || !email.trim()}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-200 disabled:text-gray-500 disabled:cursor-not-allowed text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl disabled:shadow-none"
        >
          {isSendingLink
            ? "Sending..."
            : cooldownSeconds > 0
              ? (cooldownIsEstimated ? "Wait 30-60 min" : `Wait ${cooldownSeconds}s`)
              : "Send Magic Link"}
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-xs text-gray-500">
          We&apos;ll send you a secure link to access your meditation sessions
        </p>
      </div>
    </div>
  );
}