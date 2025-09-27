"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    Inkeep: {
      init: (config: Record<string, unknown>) => void;
      destroy?: () => void;
    };
  }
}

export default function InkeepWidget() {
  useEffect(() => {
    // Load Inkeep script
    const script = document.createElement('script');
    script.src = 'https://cdn.inkeep.com/inkeep.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Initialize Inkeep when script loads
      if (window.Inkeep) {
        window.Inkeep.init({
          apiKey: process.env.NEXT_PUBLIC_INKEEP_API_KEY || 'demo-key',
          // Demo mode - will show placeholder widget
          organizationDisplayName: 'Squish',
          primaryBrandColor: '#000000', // Match your black theme
          chatButtonConfig: {
            enabled: true,
            position: 'bottom-right',
            text: 'Ask Squish',
            icon: '💬',
            tooltip: 'Get help with meditation'
          },
          // Custom actions for Squish
          customActions: {
            startSession: (duration: number) => {
              console.log(`Starting ${duration} minute meditation session`);
              // This will be handled by the parent component
              window.dispatchEvent(new CustomEvent('inkeep-start-session', { 
                detail: { duration } 
              }));
            },
            setDuration: (minutes: number) => {
              console.log(`Setting duration to ${minutes} minutes`);
              window.dispatchEvent(new CustomEvent('inkeep-set-duration', { 
                detail: { minutes } 
              }));
            },
            explainMeditation: () => {
              console.log('Explaining meditation');
              window.dispatchEvent(new CustomEvent('inkeep-explain-meditation'));
            }
          },
          // Training data for Squish
          knowledgeBase: {
            sources: [
              {
                type: 'faq',
                data: [
                  {
                    question: "What is Squish?",
                    answer: "Squish is your AI voice meditation guide. I'll help you start guided meditation sessions using voice AI technology. Just tell me how long you want to meditate and I'll guide you through it!"
                  },
                  {
                    question: "How do I start a meditation session?",
                    answer: "First, sign in with your email. Then select a session length (5, 10, 15, or 20 minutes) and click 'Start Voice Session'. I'll guide you through the meditation using voice AI."
                  },
                  {
                    question: "What should I expect from a voice meditation?",
                    answer: "Squish will speak to you through your browser, guiding you through breathing exercises, body scans, and mindfulness techniques. You can respond and ask questions during the session."
                  },
                  {
                    question: "Is my voice data safe?",
                    answer: "Yes! Your voice sessions are processed securely and we don't store your audio. Only the conversation transcript is saved to help improve your meditation experience."
                  },
                  {
                    question: "What are the 3 inner senses?",
                    answer: "The three inner senses are: 1) Body awareness - feeling sensations in your body, 2) Breath awareness - noticing your breathing, and 3) Mind awareness - observing your thoughts and emotions without judgment."
                  },
                  {
                    question: "How do I choose the right session length?",
                    answer: "Start with 5 minutes if you're new to meditation. 10 minutes is great for daily practice. 15-20 minutes are ideal for deeper relaxation and stress relief."
                  }
                ]
              }
            ]
          }
        });
      }
    };

    return () => {
      // Cleanup
      if (window.Inkeep) {
        window.Inkeep.destroy?.();
      }
    };
  }, []);

  // Demo fallback widget if Inkeep doesn't load
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black text-white p-4 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Ask Squish</span>
        </div>
        <p className="text-xs text-gray-300 mb-3">
          AI concierge for meditation guidance
        </p>
        <div className="space-y-2">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('inkeep-start-session', { detail: { duration: 10 } }))}
            className="w-full text-left text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded"
          >
            🧘 Start 10-minute session
          </button>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('inkeep-set-duration', { detail: { minutes: 5 } }))}
            className="w-full text-left text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded"
          >
            ⏱️ Set 5-minute duration
          </button>
          <button 
            onClick={() => alert("Squish is your AI voice meditation guide! I'll help you start guided meditation sessions using voice AI technology.")}
            className="w-full text-left text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded"
          >
            ❓ What is Squish?
          </button>
        </div>
      </div>
    </div>
  );
}
