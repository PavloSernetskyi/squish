"use client";
import { supabaseBrowser } from "@/lib/supabase-client";
import { useState, useEffect } from "react";
import VoicePanel from "./VoicePanel";

export default function AuthButtons() {
  const sb = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = async () => {
    const { error } = await sb.auth.signInWithOtp({ 
      email, 
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) alert(error.message);
    else alert("Check your email for the magic link!");
  };

  const signOut = async () => { 
    await sb.auth.signOut(); 
    setUser(null);
  };

  if (loading) {
    return <div className="text-gray-600">Loading...</div>;
  }

  if (user) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <p className="text-green-600">✅ Welcome back, {user.email}!</p>
          <button 
            onClick={signOut} 
            className="px-3 py-2 border rounded"
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
    <div className="space-y-4">
      <p className="text-gray-600">Please sign in to access voice sessions:</p>
      <div className="flex gap-2 items-center">
        <input 
          className="border rounded px-3 py-2" 
          placeholder="you@example.com" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
        />
        <button 
          onClick={signInWithOtp} 
          className="px-4 py-2 rounded bg-black text-white"
        >
          Send Magic Link
        </button>
      </div>
    </div>
  );
}