/**
 * API Service - Handles all backend API calls
 */

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Helper to get WebSocket URL (convert http/https to ws/wss)
export function getWebSocketURL(apiUrl: string): string {
  if (apiUrl.startsWith("https://")) {
    return apiUrl.replace("https://", "wss://");
  } else if (apiUrl.startsWith("http://")) {
    return apiUrl.replace("http://", "ws://");
  }
  return apiUrl;
}

export interface DeepgramURLResponse {
  url: string;
  token?: string;
}

export interface ProcessTextRequest {
  text: string;
}

export interface ProcessTextResponse {
  sentiment: number; // -1 to 1
  keywords: string[];
}

/**
 * Get Deepgram WebSocket URL from backend
 */
export async function getDeepgramURL(): Promise<DeepgramURLResponse> {
  const response = await fetch(`${API_BASE_URL}/api/get-deepgram-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Failed to get Deepgram URL: ${response.statusText}`);
  }

  const data = await response.json();
  
  // If backend returns a relative URL, convert it to absolute using API_BASE_URL
  // Also ensure WebSocket protocol matches the API protocol
  if (data.url && !data.url.startsWith("ws://") && !data.url.startsWith("wss://")) {
    // Backend returned a relative URL, convert to WebSocket URL
    data.url = getWebSocketURL(API_BASE_URL) + data.url.replace(/^\/+/, "/");
  } else if (data.url && data.url.startsWith("ws://") && API_BASE_URL.startsWith("https://")) {
    // If API is HTTPS but WebSocket is WS, upgrade to WSS
    data.url = data.url.replace("ws://", "wss://");
  }
  
  return data;
}

/**
 * Process text to extract sentiment and keywords
 */
export async function processText(text: string): Promise<ProcessTextResponse> {
  const response = await fetch(`${API_BASE_URL}/process_text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `Failed to process text: ${response.statusText}`);
  }

  return response.json();
}

