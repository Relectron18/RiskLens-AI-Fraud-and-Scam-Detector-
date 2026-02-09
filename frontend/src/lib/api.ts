// Disable specific eslint rules that might cause warnings
/* eslint-disable no-console */

// We define the types here to avoid import errors
export interface TransactionPayload {
  amount: number;
  location: string;
  merchant_type: string;
  time?: string;
}

export interface BackendResponse {
  risk_level: "Normal" | "Suspicious" | "Fraud";
  risk_score: number;
  explanation: string;
}

// FIX: Use 127.0.0.1 instead of localhost for better Windows compatibility
const API_URL = "http://127.0.0.1:8001";

export const analyzeTransaction = async (data: TransactionPayload): Promise<BackendResponse> => {
  try {
    console.log(`📡 Connecting to Backend at: ${API_URL}/analyze`);
    
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server Error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Backend Replied:", result);
    return result;

  } catch (error) {
    // This logs the FULL error to the browser console (F12) so you can see why it failed
    console.error("🔴 API Connection Failed. Details:", error);
    throw error;
  }
};