"use client";
import AuthButtons from "@/components/AuthButtons";
import InkeepWidget from "@/components/InkeepWidget";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Listen for Inkeep custom actions
    const handleStartSession = (event: CustomEvent) => {
      console.log('Inkeep triggered start session:', event.detail);
      // This will be handled by the VoicePanel component
      // We'll pass this through props or context
    };

    const handleSetDuration = (event: CustomEvent) => {
      console.log('Inkeep triggered set duration:', event.detail);
      // This will be handled by the VoicePanel component
    };

    const handleExplainMeditation = () => {
      console.log('Inkeep triggered explain meditation');
      // Show a modal or redirect to help section
    };

    window.addEventListener('inkeep-start-session', handleStartSession as EventListener);
    window.addEventListener('inkeep-set-duration', handleSetDuration as EventListener);
    window.addEventListener('inkeep-explain-meditation', handleExplainMeditation);

    return () => {
      window.removeEventListener('inkeep-start-session', handleStartSession as EventListener);
      window.removeEventListener('inkeep-set-duration', handleSetDuration as EventListener);
      window.removeEventListener('inkeep-explain-meditation', handleExplainMeditation);
    };
  }, []);

  return (
    <main className="p-8 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Squish</h1>
      <p className="text-gray-700">
        A simple AI voice meditation guide. Log in, pick a length, and begin.
      </p>
      
      <AuthButtons />
      
      {/* Inkeep AI Concierge Widget */}
      <InkeepWidget />
    </main>
  );
}
