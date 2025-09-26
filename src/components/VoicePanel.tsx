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

      {/* Status Messages */}
      {!sdkReady && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
            <span className="text-yellow-700 text-sm">Loading voice SDK...</span>
          </div>
        </div>
      )}
      
      {sdkReady && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-green-600">✅</span>
            <span className="text-green-700 text-sm font-medium">Vapi SDK ready! You can start a meditation session.</span>
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
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
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
          disabled={!sdkReady || isLoading || isActive} 
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