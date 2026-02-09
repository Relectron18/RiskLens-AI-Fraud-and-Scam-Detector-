import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Zap,
  Activity,
  Wallet,
  History,
  ShieldEllipsis
} from "lucide-react";

/* ---------------- GLOBAL STYLES ---------------- */

const GlobalStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;400;600&display=swap');

      body {
        margin: 0;
        font-family: 'Inter', sans-serif;
        background-color: #060c1a;
        background-image: url('/image 1.png');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        background-repeat: no-repeat;
        color: #f0f4f8;
      }

      h1, h2, h3 {
        font-family: 'Orbitron', sans-serif;
      }

      .glow-card {
        box-shadow: 0 0 25px rgba(56,189,248,0.12);
      }

      .glow-danger {
        box-shadow: 0 0 35px rgba(239,68,68,0.35);
      }
    `
    }}
  />
);

/* ---------------- NETWORK STATS ---------------- */

const RiskStats = () => (
  <div className="grid grid-cols-2 gap-4">
    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 glow-card">
      <Activity size={16} className="text-cyan-400 mb-2" />
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
        Scan Volume
      </div>
      <div className="text-xl font-bold">1.2M</div>
    </div>

    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 glow-card">
      <ShieldCheck size={16} className="text-emerald-400 mb-2" />
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
        Threats Blocked
      </div>
      <div className="text-xl font-bold">84.2k</div>
    </div>
  </div>
);

/* ---------------- ANALYZER ---------------- */

const AnalyzerForm = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [inputs, setInputs] = useState({
    wallet: "0x" + Math.random().toString(16).slice(2, 10),
    token: "GamblingToken",
    amount: "50000",
    network: "North Korea"
  });

  const analyze = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(inputs.amount),
          location: inputs.network,
          merchant_type: inputs.token
        })
      });

      const data = await res.json();

      setResult({
        level: data.risk_level,
        score: Math.round(data.risk_score * 100),
        reasons: data.reasons || [data.explanation],
        confidence: Math.round((data.confidence || 1) * 100)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 glow-card">
      {/* INPUTS */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <input
          value={inputs.wallet}
          onChange={(e) => setInputs({ ...inputs, wallet: e.target.value })}
          placeholder="Wallet Address"
          className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3"
        />
        <input
          value={inputs.token}
          onChange={(e) => setInputs({ ...inputs, token: e.target.value })}
          placeholder="Token / Merchant"
          className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3"
        />
        <input
          type="number"
          value={inputs.amount}
          onChange={(e) => setInputs({ ...inputs, amount: e.target.value })}
          placeholder="Transaction Amount"
          className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3"
        />
        <input
          value={inputs.network}
          onChange={(e) => setInputs({ ...inputs, network: e.target.value })}
          placeholder="Network / Location"
          className="bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3"
        />
      </div>

      <button
        onClick={analyze}
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-xl font-bold"
      >
        {loading ? "Analyzing..." : "Analyze Transaction Risk"}
      </button>

      {result && (
        <div
          className={`mt-8 p-6 rounded-2xl bg-slate-950/70 border border-slate-800 ${
            result.level === "Fraud" ? "glow-danger" : "glow-card"
          }`}
        >
          <div className="flex justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldEllipsis
              size={18}
              className={
              result.level === "Fraud"
              ? "text-red-500"
              : result.level === "Suspicious"
              ? "text-yellow-400"
              : "text-emerald-400"
              }
              />
              {result.level === "Fraud"
              ? "HIGH RISK DETECTED"
              : result.level === "Suspicious"
              ? "POTENTIAL RISK IDENTIFIED"
              : "TRANSACTION APPEARS SAFE"}
            </h3>
            <div className="text-3xl font-black">{result.score}/100</div>
          </div>

          <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full ${
                result.level === "Fraud"
                  ? "bg-red-500"
                  : result.level === "Suspicious"
                  ? "bg-yellow-400"
                  : "bg-emerald-400"
              }`}
              style={{ width: `${result.score}%` }}
            />
          </div>

          <ul className="text-sm text-slate-300 space-y-1">
            {result.reasons.slice(0, 4).map((r: string, i: number) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>

          <div className="mt-3 text-xs text-slate-500">
            Confidence: {result.confidence}%
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- MAIN APP ---------------- */

const App = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8001/ws/stream");

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      setTransactions((p) =>
        [
          {
            id: Math.random().toString(16).slice(2, 8),
            asset: d.merchant,
            amount: `$${d.amount}`,
            risk: d.risk,
            time: d.time
          },
          ...p
        ].slice(0, 8)
      );
    };

    return () => ws.close();
  }, []);

  return (
    <>
      <GlobalStyles />
      <main className="container mx-auto px-4 pt-16 pb-24">
        <div className="text-center mb-16">
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full 
                  bg-cyan-500/10 border border-cyan-500/20 
                  text-cyan-400 text-[10px] font-bold tracking-widest mb-6">
    <ShieldCheck size={14} />
    AI-POWERED REAL-TIME ANALYSIS
  </div>

  <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight 
                 bg-clip-text text-transparent 
                 bg-gradient-to-r from-cyan-400 via-slate-100 to-purple-400 uppercase">
    RiskLens <span className="text-white">Fraud & Scam</span> Detector
  </h1>

  <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
    Advanced risk analysis for digital assets and financial transactions.
    Identify threats before they execute.
  </p>
</div>

        <div className="grid lg:grid-cols-12 gap-10">
  {/* LEFT COLUMN */}
  <div className="lg:col-span-4 space-y-8">
    
    {/* Network Health */}
    <div>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Activity className="text-cyan-400" size={18} />
        Network Health
      </h2>
      <RiskStats />
    </div>

    {/* Quick Insights */}
    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 glow-card">
      <h3 className="font-bold flex items-center gap-2 mb-3">
        <Zap className="text-purple-400" size={18} />
        Quick Insights
      </h3>
      <ul className="text-sm text-slate-400 space-y-2">
        <li>• ML Model v2.5.0 connected</li>
        <li>• Real-time monitoring active</li>
        <li>• Hybrid ML + rule intelligence</li>
      </ul>
    </div>

  </div>

          <div className="lg:col-span-8 space-y-12">
            <AnalyzerForm />

            <section>
              <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <History /> Live Threat Stream
                </h2>
                <span>{isConnected ? "🟢 Live Feed Active" : "🔴 Offline"}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full">
                  <thead className="bg-slate-800/40">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Asset</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Risk</th>
                      <th className="px-4 py-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-t border-slate-800">
                        <td className="px-4 py-2 text-slate-400">{t.id}</td>
                        <td className="px-4 py-2">{t.asset}</td>
                        <td className="px-4 py-2">{t.amount}</td>
                        <td className="px-4 py-2 font-bold">{t.risk}</td>
                        <td className="px-4 py-2 text-right text-slate-400">
                          {t.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default App;