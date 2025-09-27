"use client";
import { supabaseBrowser } from "@/lib/supabase-client";
import { useState, useEffect } from "react";
import VoicePanel from "./VoicePanel";

export default function AuthButtons() {
  const sb = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      console.log('Getting initial session...');
      const { data: { session } } = await sb.auth.getSession();
      console.log('Initial session:', session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = sb.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // If user just signed in, we don't need to do anything special
        // The component will automatically show the voice panel
      }
    );

    return () => subscription.unsubscribe();
  }, [sb.auth]);

  const signInWithOtp = async () => {
    const { error } = await sb.auth.signInWithOtp({ 
      email, 
      options: { 
        emailRedirectTo: window.location.origin
      }
    });
    if (error) alert(error.message);
    else alert("Check your email for the magic link! Click it to return to Squish.");
  };

  const signOut = async () => { 
    await sb.auth.signOut(); 
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
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
        >
          Send Magic Link
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