/**
 * API Service - Handles all backend API calls
 */

const API_BASE_URL = "http://localhost:4000";

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

  return response.json();
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

