import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Matchup } from "@/data/matchups";
import { universities } from "@/data/universities";
import { Badge } from "@/components/ui/badge";

export default function MatchupCard({ matchup }: { matchup: Matchup }) {
  const schoolA = universities.find(u => u.id === matchup.schoolA);
  const schoolB = universities.find(u => u.id === matchup.schoolB);

  if (!schoolA || !schoolB) return null;

  const total = matchup.votesA + matchup.votesB;
  const pctA = Math.round((matchup.votesA / total) * 100);
  const pctB = Math.round((matchup.votesB / total) * 100);

  return (
    <Link 
      href={`/compare?a=${schoolA.id}&b=${schoolB.id}`}
      className="group block relative w-full rounded-2xl border border-border bg-card p-6 transition-all hover:bg-card/80 hover:border-foreground/30 overflow-hidden"
    >
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ backgroundColor: schoolB.color }}
      />
      <div 
        className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ backgroundColor: schoolA.color }}
      />

      <div className="relative z-10 flex flex-col h-full gap-4">
        <div className="flex flex-wrap gap-2">
          {matchup.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-muted/50 hover:bg-muted text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">{matchup.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {matchup.debateContext}
          </p>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-sm font-bold">
            <span style={{ color: schoolA.color }}>{schoolA.shortName}</span>
            <span className="text-muted-foreground text-xs uppercase tracking-widest">vs</span>
            <span style={{ color: schoolB.color }}>{schoolB.shortName}</span>
          </div>

          <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden flex">
            <div className="h-full" style={{ width: `${pctA}%`, backgroundColor: schoolA.color }} />
            <div className="h-full" style={{ width: `${pctB}%`, backgroundColor: schoolB.color }} />
          </div>

          <div className="flex justify-between text-xs font-mono text-muted-foreground">
            <span>{pctA}%</span>
            <span>{(total / 1000).toFixed(1)}k votes</span>
            <span>{pctB}%</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border/60 flex items-center justify-between mt-2">
          <span className="text-sm font-medium text-foreground/70 group-hover:text-foreground transition-colors">
            View Matchup
          </span>
          <ArrowRight className="w-4 h-4 text-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
