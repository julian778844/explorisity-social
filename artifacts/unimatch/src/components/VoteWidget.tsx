import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoteWidgetProps {
  schoolAId: string;
  schoolAName: string;
  schoolAColor: string;
  schoolBId: string;
  schoolBName: string;
  schoolBColor: string;
  initialVotesA: number;
  initialVotesB: number;
}

// Pick black or white text depending on background luminance for guaranteed contrast.
function readableTextOn(hex: string): string {
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map(x => x + x).join("") : c.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#ffffff";
}

export default function VoteWidget({
  schoolAId,
  schoolAName,
  schoolAColor,
  schoolBId,
  schoolBName,
  schoolBColor,
  initialVotesA,
  initialVotesB
}: VoteWidgetProps) {
  const [voted, setVoted] = useState<string | null>(null);
  const [votesA, setVotesA] = useState(initialVotesA);
  const [votesB, setVotesB] = useState(initialVotesB);

  const total = votesA + votesB;
  const pctA = total > 0 ? Math.round((votesA / total) * 100) : 50;
  const pctB = total > 0 ? Math.round((votesB / total) * 100) : 50;

  const handleVote = (schoolId: string) => {
    if (voted) return;
    setVoted(schoolId);
    if (schoolId === schoolAId) {
      setVotesA(v => v + 1);
    } else {
      setVotesB(v => v + 1);
    }
  };

  const renderButton = (
    id: string,
    name: string,
    color: string
  ) => {
    const isWinner = voted === id;
    return (
      <Button
        onClick={() => handleVote(id)}
        disabled={!!voted}
        className="flex-1 h-16 relative overflow-hidden border border-border bg-card hover:bg-muted/60 disabled:opacity-100 transition-colors"
        style={isWinner ? { backgroundColor: color, color: readableTextOn(color), borderColor: color } : undefined}
      >
        {isWinner && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0"
            style={{ backgroundColor: color }}
          />
        )}
        <span
          className="relative z-10 flex items-center justify-center gap-2 text-lg font-semibold w-full"
          style={isWinner ? { color: readableTextOn(color) } : { color: "hsl(var(--foreground))" }}
        >
          {isWinner && <Check className="w-5 h-5" />}
          Choose {name}
        </span>
      </Button>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold tracking-tight">Who wins?</h3>
        <p className="text-muted-foreground text-sm mt-1">Cast your vote to see live community preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {renderButton(schoolAId, schoolAName, schoolAColor)}
        {renderButton(schoolBId, schoolBName, schoolBColor)}
      </div>

      {voted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm font-mono font-medium">
            <span style={{ color: schoolAColor }}>{pctA}%</span>
            <span className="text-muted-foreground text-xs">{total.toLocaleString()} votes</span>
            <span style={{ color: schoolBColor }}>{pctB}%</span>
          </div>
          <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden flex">
            <motion.div
              className="h-full"
              style={{ backgroundColor: schoolAColor }}
              initial={{ width: "50%" }}
              animate={{ width: `${pctA}%` }}
              transition={{ type: "spring", bounce: 0, duration: 1 }}
            />
            <motion.div
              className="h-full"
              style={{ backgroundColor: schoolBColor }}
              initial={{ width: "50%" }}
              animate={{ width: `${pctB}%` }}
              transition={{ type: "spring", bounce: 0, duration: 1 }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
