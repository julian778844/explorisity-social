import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { universities } from "@/data/universities";
import { TrendingUp, Award, DollarSign, Microscope, Users, ArrowUpDown, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SchoolLogo from "@/components/SchoolLogo";

type SortKey =
  | "prestigeScore"
  | "valueScore"
  | "careerOutcomes.medianSalary"
  | "scores.academics"
  | "research.prestige"
  | "studentSatisfaction"
  | "acceptanceRate";

const sortOptions: { key: SortKey; label: string; icon: React.ElementType; help: string }[] = [
  { key: "prestigeScore", label: "Prestige", icon: Award, help: "Selectivity + salary + research + tier + employment" },
  { key: "valueScore", label: "Value", icon: Gem, help: "Salary-to-cost + employment + affordability" },
  { key: "careerOutcomes.medianSalary", label: "Salary", icon: DollarSign, help: "Median graduate salary" },
  { key: "scores.academics", label: "Academics", icon: TrendingUp, help: "Academic rigor index" },
  { key: "research.prestige", label: "Research", icon: Microscope, help: "Faculty research output" },
  { key: "studentSatisfaction", label: "Satisfaction", icon: Users, help: "Student satisfaction index" },
  { key: "acceptanceRate", label: "Selectivity", icon: ArrowUpDown, help: "Lower acceptance = more selective" },
];

function getValue(uni: typeof universities[0], key: SortKey): number {
  if (key === "careerOutcomes.medianSalary") return uni.careerOutcomes.medianSalary;
  if (key === "research.prestige") return uni.research.prestige;
  if (key === "scores.academics") return uni.scores.academics;
  return uni[key as keyof typeof uni] as number;
}

export default function RankingsPage() {
  const [sortKey, setSortKey] = useState<SortKey>("prestigeScore");
  // Default to US-only — international schools surface only when the user opts in
  const [filterType, setFilterType] = useState<string>("US");

  const types: { value: string; label: string }[] = [
    { value: "US", label: "US Only" },
    { value: "Private", label: "Private" },
    { value: "Public", label: "Public" },
    { value: "International", label: "International" },
    { value: "All", label: "All (incl. International)" },
  ];

  const sorted = useMemo(() => {
    return [...universities]
      .filter(u => {
        if (filterType === "All") return true;
        if (filterType === "US") return u.type !== "International";
        return u.type === filterType;
      })
      .sort((a, b) => {
        // Selectivity: lower acceptance rate ranks first
        if (sortKey === "acceptanceRate") {
          const d = a.acceptanceRate - b.acceptanceRate;
          if (d !== 0) return d;
          return b.prestigeScore - a.prestigeScore;
        }
        const diff = getValue(b, sortKey) - getValue(a, sortKey);
        if (diff !== 0) return diff;
        // Multi-level tiebreakers so ties resolve by real merit, not array order:
        // 1) lower acceptance rate, 2) higher salary, 3) higher research
        const accDiff = a.acceptanceRate - b.acceptanceRate;
        if (accDiff !== 0) return accDiff;
        const salDiff = b.careerOutcomes.medianSalary - a.careerOutcomes.medianSalary;
        if (salDiff !== 0) return salDiff;
        return b.research.prestige - a.research.prestige;
      });
  }, [sortKey, filterType]);

  const activeOption = sortOptions.find(o => o.key === sortKey)!;

  // What number to show on each row depending on the active sort
  const headerLabel = activeOption.label.toUpperCase();
  function rowMetric(uni: typeof universities[0]): string {
    switch (sortKey) {
      case "prestigeScore": return `${uni.prestigeScore}/100`;
      case "valueScore": return `${uni.valueScore}/100`;
      case "careerOutcomes.medianSalary": return `$${(uni.careerOutcomes.medianSalary / 1000).toFixed(0)}k`;
      case "scores.academics": return `${uni.scores.academics}/100`;
      case "research.prestige": return `${uni.research.prestige}/100`;
      case "studentSatisfaction": return `${uni.studentSatisfaction}/100`;
      case "acceptanceRate": return `${uni.acceptanceRate}%`;
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight mb-2">Rankings</h1>
        <p className="text-muted-foreground">
          Sort and filter {universities.length.toLocaleString()}+ universities by what matters to you.
          <span className="block text-xs mt-1 opacity-70">Composite scores from selectivity, salary, research output, employment and tuition — not editorial guesswork.</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-3">
        <div className="flex gap-2 flex-wrap">
          {sortOptions.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                title={opt.help}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  sortKey === opt.key
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          {types.map(t => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                filterType === t.value
                  ? "bg-accent/20 text-foreground border-accent/50"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-6 italic">{activeOption.help}</p>

      <div className="space-y-3">
        {sorted.map((uni, i) => (
          <motion.div
            key={uni.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i, 30) * 0.02 }}
          >
            <Link
              href={`/university/${uni.id}`}
              className="group flex items-center gap-6 p-5 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 hover:border-border transition-all"
            >
              <div className="text-3xl font-black font-mono w-14 text-center" style={{ color: uni.color }}>
                {i + 1}
              </div>

              <SchoolLogo id={uni.id} name={uni.name} color={uni.color} size={44} rounded="lg" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-lg group-hover:text-foreground transition-colors">{uni.name}</span>
                  <Badge variant="outline" className="border-border text-xs text-muted-foreground hidden sm:inline-flex">{uni.type}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">{uni.location}</div>
              </div>

              <div className="hidden lg:flex items-center gap-8 text-right flex-shrink-0">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Prestige</div>
                  <div className="font-mono font-bold">{uni.prestigeScore}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Value</div>
                  <div className="font-mono font-bold">{uni.valueScore}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Salary</div>
                  <div className="font-mono font-bold text-emerald-500">${(uni.careerOutcomes.medianSalary / 1000).toFixed(0)}k</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Accept</div>
                  <div className="font-mono font-bold">{uni.acceptanceRate}%</div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-0.5 min-w-[80px] flex-shrink-0">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{headerLabel}</div>
                <div className="font-mono font-black text-lg" style={{ color: uni.color }}>{rowMetric(uni)}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No universities match this filter.
        </div>
      )}
    </div>
  );
}
