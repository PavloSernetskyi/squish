"use client";
import { useEffect, useState } from "react";
import Vapi from '@vapi-ai/web';

const DURATIONS = [5, 10, 15, 20];

export default function VoicePanel() {
  const [sdkReady, setSdkReady] = useState(false);
  const [min, setMin] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);

  useEffect(() => {
    console.log("Setting up Vapi SDK...");
    setSdkReady(true);
  }, []);

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
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, [vapiInstance]);

  const start = async () => {
    // Check if Vapi SDK is ready before starting session
    if (!sdkReady) {
      setError("Voice SDK not ready yet");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
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
        setError("✅ Voice session started! Squish is ready to guide you.");
      });
      
      vapi.on('call-end', () => {
        console.log('Call ended');
        setIsActive(false);
        setIsSpeaking(false);
        setError("✅ Voice session ended.");
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
  };



  const stop = () => {
    console.log("Stopping voice session...");
    
    if (vapiInstance) {
      vapiInstance.stop();
      setVapiInstance(null);
    }
    
    setIsActive(false);
    setIsSpeaking(false);
    setError("✅ Voice session stopped.");
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 font-medium">Select session length</p>
        <div className="flex gap-2 flex-wrap">
          {DURATIONS.map(d => (
            <button
              key={d}
              onClick={() => setMin(d)}
              className={`px-4 py-2 rounded border ${min === d ? "bg-black text-white" : ""}`}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      {!sdkReady && (
        <div className="text-yellow-600 text-sm">
          Loading voice SDK...
        </div>
      )}
      
      {sdkReady && (
        <div className="text-green-600 text-sm">
          ✅ Vapi SDK ready! You can start a meditation session.
        </div>
      )}

      {/* Speaking indicator */}
      {isActive && (
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-gray-600">
            {isSpeaking ? 'Squish is speaking...' : 'Listening...'}
          </span>
        </div>
      )}

      {/* Conversation transcript */}
      {transcript.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
          <p className="text-sm font-medium text-gray-700 mb-2">Conversation:</p>
          {transcript.map((msg, i) => (
            <div key={i} className={`mb-2 text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block px-3 py-1 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className={`text-sm p-2 rounded ${
          error.startsWith('✅') 
            ? 'text-green-600 bg-green-50' 
            : 'text-red-600 bg-red-50'
        }`}>
          {error.startsWith('✅') ? error : `Error: ${error}`}
        </div>
      )}

      <div className="flex gap-3">
        <button 
          onClick={start} 
          disabled={!sdkReady || isLoading || isActive} 
          className="px-5 py-3 rounded bg-black text-white disabled:opacity-50"
        >
          {isLoading ? "Starting..." : isActive ? "Session Active" : "Start Voice Session"}
        </button>
        <button 
          onClick={stop} 
          disabled={!isActive}
          className="px-5 py-3 rounded border disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      <div id="vapi-ui" className="fixed bottom-4 right-4 z-50" />
    </div>
  );
}