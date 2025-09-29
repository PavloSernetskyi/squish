"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import Vapi from '@vapi-ai/web';
import { supabaseBrowser } from "@/lib/supabase-client";

const DURATIONS = [5, 10, 15, 20];

export default function VoicePanel() {
  const [min, setMin] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<{total_sessions: number, total_meditation_time_sec: number, last_session_at: string} | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when transcript updates
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);


  // Cleanup effect
  useEffect(() => {
    return () => {
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, [vapiInstance]);


  const loadUserStats = useCallback(async () => {
    try {
      const { data: { session } } = await supabaseBrowser().auth.getSession();
      if (session?.access_token) {
        const response = await fetch('/api/user/stats', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        if (response.ok) {
          const stats = await response.json();
          setUserStats(stats);
        }
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }, []);

  // Load user stats on component mount
  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  const startSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabaseBrowser().auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          duration_min: min,
          session_type: 'voice_meditation'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const data = await response.json();
      setCurrentSessionId(data.session_id);
      console.log('Session started:', data.session_id);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, []);

  const completeSession = useCallback(async () => {
    if (!currentSessionId) return;

    try {
      const { data: { session } } = await supabaseBrowser().auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          session_id: currentSessionId,
          rating: 5, // Default rating, could be made user-configurable
          notes: `Voice meditation session completed. Duration: ${min} minutes.`
        })
      });

      if (response.ok) {
        console.log('Session completed successfully');
        setCurrentSessionId(null);
        // Reload user stats
        loadUserStats();
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  }, [currentSessionId, loadUserStats]);

  const start = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setTranscript([]); // Clear transcript on new session

    try {
      // Start database session tracking
      await startSession();

      console.log("Setting up Vapi voice session...");
      const res = await fetch("/api/vapi/token");
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`API error: ${res.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const { apiKey, assistantId, type } = await res.json();
      console.log("Vapi session ready:", { assistantId, type });

      // Initialize Vapi with the public API key
      const vapi = new Vapi(apiKey);
      
      // Set up event listeners
      vapi.on('call-start', () => {
        console.log('Call started');
        setIsActive(true);
        // Don't show any message for call start - the speaking indicator will show
      });
      
      vapi.on('call-end', () => {
        console.log('Call ended');
        setIsActive(false);
        setIsSpeaking(false);
        // Complete the database session
        completeSession();
      });
      
      vapi.on('speech-start', () => {
        console.log('Squish started speaking');
        setIsSpeaking(true);
      });
      
      vapi.on('speech-end', () => {
        console.log('Squish stopped speaking');
        setIsSpeaking(false);
      });
      
      vapi.on('message', (message) => {
        if (message.type === 'transcript') {
          console.log(`${message.role}: ${message.transcript}`);
          setTranscript(prev => [...prev, {
            role: message.role,
            text: message.transcript
          }]);
        }
      });
      
      vapi.on('error', (error) => {
        console.error('Vapi error:', error);
        setError(`Voice error: ${error.message || 'Unknown error'}`);
        setIsActive(false);
        setIsSpeaking(false);
        // Complete the database session even on error
        completeSession();
      });
      
      // Start the call
      console.log("Starting Vapi call with assistantId:", assistantId);
      await vapi.start(assistantId);
      
      setVapiInstance(vapi);
      console.log("Vapi call initiated successfully");
      
    } catch (err) {
      console.error("Error starting voice session:", err);
      setError(err instanceof Error ? err.message : "Failed to start voice session");
    } finally {
      setIsLoading(false);
    }
  }, [startSession, completeSession]);

  // Listen for Inkeep actions
  useEffect(() => {
    const handleInkeepStartSession = (event: CustomEvent) => {
      console.log('Inkeep triggered start session:', event.detail);
      const duration = event.detail?.duration || 10;
      setMin(duration);
      // Auto-start the session after a short delay
      setTimeout(() => {
        start();
      }, 500);
    };

    const handleInkeepSetDuration = (event: CustomEvent) => {
      console.log('Inkeep triggered set duration:', event.detail);
      const minutes = event.detail?.minutes || 10;
      setMin(minutes);
    };

    window.addEventListener('inkeep-start-session', handleInkeepStartSession as EventListener);
    window.addEventListener('inkeep-set-duration', handleInkeepSetDuration as EventListener);

    return () => {
      window.removeEventListener('inkeep-start-session', handleInkeepStartSession as EventListener);
      window.removeEventListener('inkeep-set-duration', handleInkeepSetDuration as EventListener);
    };
  }, [start]);



  const stop = () => {
    console.log("Stopping voice session...");
    
    if (vapiInstance) {
      vapiInstance.stop();
      setVapiInstance(null);
    }
    
    // Complete the database session
    completeSession();
    
    setIsActive(false);
    setIsSpeaking(false);
    setError(null); // Clear any error messages
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Meditation Session</h3>
        <p className="text-gray-600 text-sm">Choose your preferred duration and begin your journey</p>
      </div>
      
      <div>
        <p className="mb-3 font-medium text-gray-700">Select session length</p>
        <div className="grid grid-cols-2 gap-3">
          {DURATIONS.map(d => (
            <button
              key={d}
              onClick={() => setMin(d)}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                min === d 
                  ? "bg-yellow-400 text-gray-900 shadow-lg" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* User Stats */}
      {userStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Your Progress</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total Sessions:</span>
              <span className="font-semibold ml-2">{userStats.total_sessions}</span>
            </div>
            <div>
              <span className="text-blue-700">Total Time:</span>
              <span className="font-semibold ml-2">
                {Math.floor(userStats.total_meditation_time_sec / 60)} min
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Speaking indicator */}
      {isActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className={`w-4 h-4 rounded-full ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-blue-700 font-medium">
              {isSpeaking ? 'Squish is speaking...' : 'Listening...'}
            </span>
          </div>
        </div>
      )}

      {/* Conversation transcript */}
      {transcript.length > 0 && (
        <div ref={transcriptRef} className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 mb-3">Conversation:</p>
          <div className="space-y-2">
            {transcript.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className={`inline-block px-4 py-2 rounded-lg max-w-xs text-sm ${
                  msg.role === 'user' 
                    ? 'bg-yellow-400 text-gray-900' 
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className={`text-sm p-3 rounded-lg ${
          error.startsWith('✅') 
            ? 'text-green-700 bg-green-50 border border-green-200' 
            : 'text-red-700 bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <span>{error.startsWith('✅') ? '✅' : '⚠️'}</span>
            <span>{error.startsWith('✅') ? error : `Error: ${error}`}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={start} 
          disabled={isLoading || isActive} 
          className="px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-yellow-400 hover:bg-yellow-500 text-gray-900 shadow-lg hover:shadow-xl"
        >
          {isLoading ? "Starting..." : isActive ? "Session Active" : "Start Voice Session"}
        </button>
        <button 
          onClick={stop} 
          disabled={!isActive}
          className="px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          Stop
        </button>
      </div>

      <div id="vapi-ui" className="fixed bottom-4 right-4 z-50" />
    </div>
  );
}