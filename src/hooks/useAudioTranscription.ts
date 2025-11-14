/**
 * Custom hook for managing audio transcription via Deepgram WebSocket
 */

import { useEffect, useRef, useState } from "react";
import { getDeepgramURL, processText } from "@/services/api";
import { toast } from "sonner";

export interface TranscriptionState {
  isConnected: boolean;
  isRecording: boolean;
  connectionStatus: string;
  error: string | null;
  transcript: string[];
  sentiment: number;
  keywords: string[];
}

export interface UseAudioTranscriptionReturn {
  state: TranscriptionState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export function useAudioTranscription(): UseAudioTranscriptionReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState(0);
  const [keywords, setKeywords] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isIntentionalCloseRef = useRef(false); // Track if closure is intentional

  const cleanup = (isIntentional = false) => {
    isIntentionalCloseRef.current = isIntentional;
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("Disconnected");
    // Clear error if this is an intentional stop
    if (isIntentional) {
      setError(null);
    }
  };

  // Check microphone permission on mount
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        // Check if permission is already denied
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (permissionStatus.state === 'denied') {
          // Permission was previously denied (never allow)
          setError("Microphone permission denied. Please enable it in your browser settings.");
          setConnectionStatus("Microphone Permission Denied");
          
          // Show toast notification
          toast.error("Microphone Access Required", {
            description: "Please enable microphone access in your browser settings to use this feature.",
            duration: 5000,
          });
        }
        
        // Listen for permission changes
        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            setError(null);
            setConnectionStatus("Disconnected");
          } else if (permissionStatus.state === 'denied') {
            setError("Microphone permission denied. Please enable it in your browser settings.");
            setConnectionStatus("Microphone Permission Denied");
          }
        };
      } catch (err) {
        // Permissions API might not be supported in all browsers
        // This is okay, we'll handle it when user tries to record
        console.log("Permissions API not fully supported:", err);
      }
    };
    
    checkMicrophonePermission();
  }, []);

  const startRecording = async () => {
    if (isRecording) return; // Already recording
    
    setIsRecording(true);
    setError(null);
    setConnectionStatus("Requesting microphone…");
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      setConnectionStatus("Connecting to Deepgram…");
      
      // Get Deepgram WebSocket URL from backend
      const { url } = await getDeepgramURL();
      
      // Log URL for debugging
      console.log("Connecting to WebSocket:", url);

      setConnectionStatus("Establishing WebSocket connection…");
      
      // Create WebSocket connection
      // The backend provides a proxy URL that handles Deepgram authentication
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        setIsConnected(true);
        setConnectionStatus("Connected");

        // Find best supported audio MIME type
        const mimeTypes = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/ogg;codecs=opus",
          "audio/mp4",
        ];

        let selectedMimeType = mimeTypes[0];
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            break;
          }
        }

        console.log("Using MIME type:", selectedMimeType);

        // Start MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };

        mediaRecorder.start(250); // Send data every 250ms
        setConnectionStatus("Recording…");
      };

      ws.onmessage = async (message) => {
        try {
          const data = JSON.parse(message.data);
          console.log("Deepgram message:", data);

          // Deepgram sends different message types
          // Handle both "Results" and "TurnInfo" message types
          let text: string | undefined;
          let isFinal = false;

          if (data.type === "Results") {
            // Standard Results format (for non-turn-taking endpoints)
            text = data.channel?.alternatives?.[0]?.transcript;
            isFinal = data.is_final || false;
          } else if (data.type === "TurnInfo") {
            // TurnInfo format (for turn-taking endpoints like listen-turn-taking)
            text = data.transcript;
            // TurnInfo events: "Update" = interim, "EndOfTurn" = final
            isFinal = data.event === "EndOfTurn";
          } else {
            // Ignore other message types (Connected, Metadata, etc.)
            console.log("Ignoring message type:", data.type);
            return;
          }

          console.log("Transcript data:", { text, isFinal, hasText: !!text?.trim(), event: data.event });

          // Handle both interim and final results for live transcription
          if (text?.trim()) {
            if (isFinal) {
              // Final transcript - add to permanent transcript list
              setTranscript((prev) => {
                // Avoid duplicates
                if (prev.length > 0 && prev[prev.length - 1] === text) {
                  return prev;
                }
                return [...prev, text];
              });

              // Process text for sentiment and keywords
              try {
                const result = await processText(text);
                setSentiment(result.sentiment);
                setKeywords(result.keywords);
              } catch (err) {
                console.error("Error processing text:", err);
                setError(`Failed to process text: ${err instanceof Error ? err.message : String(err)}`);
              }
            } else {
              // Interim result - update the last item in transcript for live preview
              setTranscript((prev) => {
                const newTranscript = [...prev];
                // For TurnInfo Update events, replace the last item if it's an interim result
                // For Results interim, also update the last item
                if (newTranscript.length > 0) {
                  // Check if last item looks like an interim (no punctuation ending)
                  const lastItem = newTranscript[newTranscript.length - 1];
                  if (!lastItem.match(/[.!?]\s*$/)) {
                    // Replace interim result
                    newTranscript[newTranscript.length - 1] = text;
                  } else {
                    // Add as new interim result
                    newTranscript.push(text);
                  }
                } else {
                  // Add as new interim result
                  newTranscript.push(text);
                }
                return newTranscript;
              });
            }
          }
        } catch (err) {
          console.error("Error parsing Deepgram message:", err);
          console.error("Raw message data:", message.data);
          setError(`Failed to parse transcription: ${err instanceof Error ? err.message : String(err)}`);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        console.error("WebSocket URL:", url);
        console.error("WebSocket readyState:", ws.readyState);
        setConnectionStatus("WebSocket Error");
        setError("WebSocket connection error - Check API key and network connection");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed", event.code, event.reason);
        
        // Don't show error if this was an intentional closure (user stopped recording)
        if (isIntentionalCloseRef.current) {
          setConnectionStatus("Disconnected");
          setIsConnected(false);
          setError(null); // Clear any error
          isIntentionalCloseRef.current = false; // Reset flag
          return;
        }
        
        // Only show errors for unintentional closures
        let errorMsg = "Disconnected";
        if (event.code === 1006) {
          errorMsg = "Connection closed abnormally (check API key)";
        } else if (event.code === 1008) {
          errorMsg = "Policy violation (authentication failed)";
        } else if (event.reason) {
          errorMsg = `Closed: ${event.reason}`;
        }

        setConnectionStatus(errorMsg);
        setIsConnected(false);
        
        // Only set error for actual error codes, not normal closures
        if (event.code !== 1000 && event.code !== 1001 && event.code !== 1005) {
          setError(`Connection closed: Code ${event.code} - ${errorMsg}`);
        } else if (event.code === 1005) {
          // Code 1005 (No Status Received) can happen on intentional close
          // Only show as error if it wasn't intentional
          if (!isIntentionalCloseRef.current) {
            setError(`Connection closed: Code ${event.code} - ${errorMsg}`);
          }
        }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      // Check if it's a permission error
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          const permissionError = "Microphone permission denied. Please enable it in your browser settings.";
          setError(permissionError);
          setConnectionStatus("Microphone Permission Denied");
          
          // Show toast notification
          toast.error("Microphone Access Denied", {
            description: "Please enable microphone access in your browser settings to record audio.",
            duration: 6000,
            action: {
              label: "Learn More",
              onClick: () => {
                window.open("https://support.google.com/chrome/answer/2693767", "_blank");
              }
            }
          });
        } else {
          setError(errorMessage);
          setConnectionStatus("Connection Failed");
        }
      } else {
        setError(errorMessage);
        setConnectionStatus("Connection Failed");
      }
      
      setIsConnected(false);
      setIsRecording(false);
      cleanup();
    }
  };

  const stopRecording = () => {
    cleanup(true); // Mark as intentional closure
    setIsRecording(false);
    setError(null); // Clear any error messages
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Note: startRecording is called manually, not via useEffect

  const handleStartRecording = async () => {
    // Clear previous data
    setTranscript([]);
    setKeywords([]);
    setSentiment(0);
    setError(null);
    // Call the actual startRecording function
    await startRecording();
  };

  return {
    state: {
      isConnected,
      isRecording,
      connectionStatus,
      error,
      transcript,
      sentiment,
      keywords,
    },
    startRecording: handleStartRecording,
    stopRecording,
  };
}

