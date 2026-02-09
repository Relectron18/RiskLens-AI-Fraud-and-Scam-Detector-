import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: "normal" | "suspicious" | "fraud";
  score?: number;
  className?: string;
}

const config = {
  normal: { label: "Normal", bg: "bg-success/15", text: "text-success", ring: "ring-success/30" },
  suspicious: { label: "Suspicious", bg: "bg-warning/15", text: "text-warning", ring: "ring-warning/30" },
  fraud: { label: "Fraud", bg: "bg-destructive/15", text: "text-destructive", ring: "ring-destructive/30" },
};

const RiskBadge = ({ level, score, className }: RiskBadgeProps) => {
  const c = config[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1", c.bg, c.text, c.ring, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", level === "normal" ? "bg-success" : level === "suspicious" ? "bg-warning" : "bg-destructive")} />
      {c.label}
      {score !== undefined && <span className="ml-1 opacity-70">({score}%)</span>}
    </span>
  );
};

export default RiskBadge;
