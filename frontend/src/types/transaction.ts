export interface Transaction {
  id: string;
  walletAddress: string;
  tokenName: string;
  amount: number;
  network: string;
  timestamp: Date;
  riskLevel: "normal" | "suspicious" | "fraud";
  riskScore: number;
  reasons: string[];
}

export interface AnalysisResult {
  riskLevel: "normal" | "suspicious" | "fraud";
  riskScore: number;
  reasons: string[];
  confidence: number;
}
