"use client";
import VoicePanel from "@/components/VoicePanel";
import { supabaseBrowser } from "@/lib/supabase-client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VoicePage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session?.user) {
        router.push('/');
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          router.push('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main className="p-8 max-w-2xl mx-auto space-y-6">
        <div className="text-gray-600">Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Voice Session</h2>
      <p className="text-gray-700">Choose a duration and start. Your mic will be used in the browser.</p>
      <VoicePanel />
    </main>
  );
}
