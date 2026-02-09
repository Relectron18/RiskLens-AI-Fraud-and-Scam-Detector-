import { Transaction } from "@/types/transaction";
import RiskBadge from "@/components/RiskBadge";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Props {
  transactions: Transaction[];
}

const LiveTransactionTable = ({ transactions }: Props) => {
  return (
    <div className="glow-border rounded-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-display tracking-wider text-muted-foreground uppercase">
              <th className="px-5 py-4">Time</th>
              <th className="px-5 py-4">Wallet</th>
              <th className="px-5 py-4">Token</th>
              <th className="px-5 py-4">Amount</th>
              <th className="px-5 py-4">Network</th>
              <th className="px-5 py-4">Risk</th>
              <th className="px-5 py-4">Reason</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <motion.tr
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                  {format(tx.timestamp, "HH:mm:ss")}
                </td>
                <td className="px-5 py-3 font-mono text-xs">{tx.walletAddress}</td>
                <td className="px-5 py-3 font-semibold">{tx.tokenName}</td>
                <td className="px-5 py-3 font-mono">${tx.amount.toLocaleString()}</td>
                <td className="px-5 py-3 text-muted-foreground">{tx.network}</td>
                <td className="px-5 py-3"><RiskBadge level={tx.riskLevel} score={tx.riskScore} /></td>
                <td className="px-5 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{tx.reasons[0]}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiveTransactionTable;
