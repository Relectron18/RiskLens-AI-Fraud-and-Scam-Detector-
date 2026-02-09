import { Transaction } from "@/types/transaction";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX, Activity } from "lucide-react";

interface Props {
  transactions: Transaction[];
}

const StatsCards = ({ transactions }: Props) => {
  const total = transactions.length;
  const normal = transactions.filter((t) => t.riskLevel === "normal").length;
  const suspicious = transactions.filter((t) => t.riskLevel === "suspicious").length;
  const fraud = transactions.filter((t) => t.riskLevel === "fraud").length;

  const cards = [
    { label: "Total Transactions", value: total, icon: Activity, color: "text-primary" },
    { label: "Normal", value: normal, icon: ShieldCheck, color: "text-success" },
    { label: "Suspicious", value: suspicious, icon: ShieldAlert, color: "text-warning" },
    { label: "Fraud Detected", value: fraud, icon: ShieldX, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glow-border rounded-xl bg-card/80 backdrop-blur-sm p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-display tracking-wide uppercase">{c.label}</span>
            <c.icon className={`h-4 w-4 ${c.color}`} />
          </div>
          <div className={`text-3xl font-bold font-display ${c.color}`}>{c.value}</div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
