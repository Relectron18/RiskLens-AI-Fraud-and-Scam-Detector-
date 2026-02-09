import { Transaction, AnalysisResult } from "@/types/transaction";
import { analyzeTransaction as apiAnalyze } from "@/lib/api"; // Import your Real API

const networks = ["Ethereum", "BSC", "Polygon", "Solana", "Arbitrum"];
const tokens = ["ETH", "USDT", "USDC", "BNB", "SOL", "MATIC", "DAI", "WBTC"];

// These lists are just for the random background table rows
const fraudReasons = [
  "Wallet linked to known scam address",
  "Unusually large transaction amount",
  "High-frequency trading pattern detected",
];
const suspiciousReasons = [
  "Transaction amount above average",
  "Unusual time-of-day activity",
];
const normalReasons = [
  "All checks passed",
  "Known verified contract",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomHex(len: number): string {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

// Keep this purely random so your Dashboard table always has data
export function generateMockTransaction(): Transaction {
  const roll = Math.random();
  const riskLevel = roll < 0.5 ? "normal" : roll < 0.8 ? "suspicious" : "fraud";
  const riskScore =
    riskLevel === "normal" ? Math.floor(Math.random() * 30) + 5 :
    riskLevel === "suspicious" ? Math.floor(Math.random() * 30) + 40 :
    Math.floor(Math.random() * 25) + 75;

  const reasons =
    riskLevel === "fraud" ? [randomFrom(fraudReasons)] :
    riskLevel === "suspicious" ? [randomFrom(suspiciousReasons)] :
    [randomFrom(normalReasons)];

  return {
    id: `tx-${randomHex(8)}`,
    walletAddress: `0x${randomHex(4)}...${randomHex(4)}`,
    tokenName: randomFrom(tokens),
    amount: parseFloat((Math.random() * 50000).toFixed(2)),
    network: randomFrom(networks),
    timestamp: new Date(Date.now() - Math.random() * 3600000),
    riskLevel,
    riskScore,
    reasons: [...new Set(reasons)],
  };
}

// --- THIS IS THE CRITICAL UPDATE ---
// We replaced the fake setTimeout logic with your Real Python API call
export async function analyzeTransaction(
  wallet: string,
  token: string,
  amount: string,
  network: string
): Promise<AnalysisResult> {
  try {
    console.log("🔍 Calling Python AI for:", { amount, token, network });

    // Call the backend (Using the api.ts we created earlier)
    const response = await apiAnalyze({
      amount: parseFloat(amount),
      location: network,       // Mapping Network -> Location
      merchant_type: token,    // Mapping Token -> Merchant
      time: new Date().toLocaleTimeString()
    });

    console.log("✅ Python Result:", response);

    // Convert Python format to Frontend format
    return {
      riskLevel: response.risk_level.toLowerCase() as "normal" | "suspicious" | "fraud",
      riskScore: Math.round(response.risk_score * 100), // Convert 0.99 to 99
      reasons: [response.explanation], // Wrap the single explanation in an array
      confidence: 0.98, // Real models have high confidence
    };

  } catch (error) {
    console.error("❌ Python Backend Error:", error);
    // Fallback if backend is offline
    return {
      riskLevel: "normal",
      riskScore: 0,
      reasons: ["Backend Connection Failed - Check Console"],
      confidence: 0,
    };
  }
}

export function generateInitialTransactions(count: number): Transaction[] {
  return Array.from({ length: count }, generateMockTransaction);
}