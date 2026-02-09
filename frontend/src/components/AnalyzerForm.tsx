import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Loader2 } from "lucide-react";
import { analyzeTransaction } from "@/lib/mock-data";
import { AnalysisResult } from "@/types/transaction";
import RiskBadge from "@/components/RiskBadge";

interface Props {
  onAnalysis?: (result: AnalysisResult) => void;
}

const AnalyzerForm = ({ onAnalysis }: Props) => {
  const [wallet, setWallet] = useState("");
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await analyzeTransaction(wallet, token, amount, network);
    setResult(res);
    setLoading(false);
    onAnalysis?.(res);
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glow-border rounded-2xl bg-card/80 backdrop-blur-sm p-8 max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {[
          { label: "Wallet Address", value: wallet, set: setWallet, placeholder: "0xA1b2...eF90" },
          { label: "Token Name", value: token, set: setToken, placeholder: "ETH, USDT, BNB..." },
          { label: "Transaction Amount", value: amount, set: setAmount, placeholder: "1000.00" },
          { label: "Network", value: network, set: setNetwork, placeholder: "Ethereum, BSC, Solana..." },
        ].map((f) => (
          <div key={f.label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-sm font-semibold font-display tracking-wide min-w-[180px] text-foreground/90">
              {f.label}
            </label>
            <input
              className={inputClass}
              placeholder={f.placeholder}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              required
            />
          </div>
        ))}

        <div className="pt-2 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-accent to-primary px-10 py-3 font-display text-sm font-semibold tracking-wider text-accent-foreground transition-all hover:shadow-[0_0_30px_hsl(255_70%_60%/0.4)] disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</span>
            ) : (
              <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Analyze Transaction Risk</span>
            )}
          </button>
        </div>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6 rounded-xl border border-border bg-muted/30 p-5 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-sm tracking-wide">Analysis Result</span>
            <RiskBadge level={result.riskLevel} score={result.riskScore} />
          </div>
          <div className="text-xs text-muted-foreground">
            Confidence: {(result.confidence * 100).toFixed(0)}%
          </div>
          <div className="space-y-1">
            {result.reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {r}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalyzerForm;
