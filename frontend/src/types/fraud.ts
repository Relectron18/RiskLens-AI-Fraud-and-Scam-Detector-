export interface Transaction {
    amount: number;
    location: string;
    merchant_type: string;
    time?: string;
}

export interface RiskAnalysis {
    risk_level: "Normal" | "Suspicious" | "Fraud";
    risk_score: number;
    explanation: string;
    timestamp?: string;
}

export interface StreamPayload {
    transaction: Transaction;
    analysis: RiskAnalysis;
}