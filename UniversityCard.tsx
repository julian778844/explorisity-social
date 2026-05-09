import { Link } from "wouter";
import { Building2, MapPin, TrendingUp, Users } from "lucide-react";
import { University } from "@/data/universities";
import { Badge } from "@/components/ui/badge";

export default function UniversityCard({ university, rank }: { university: University; rank?: number }) {
  return (
    <Link 
      href={`/university/${university.id}`}
      className="group flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-border/60 bg-card hover:bg-muted/60 transition-all"
    >
      {rank && (
        <div className="hidden sm:flex flex-col items-center justify-center min-w-[60px]">
          <span className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Rank</span>
          <span className="text-4xl font-bold" style={{ color: university.color }}>#{rank}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: university.color }} />
            <h3 className="text-2xl font-bold group-hover:text-foreground transition-colors">{university.name}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {university.location}</span>
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {university.type}</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {university.enrollment.toLocaleString()}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground/80 line-clamp-2">
          {university.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {university.topMajors.slice(0, 3).map(m => (
            <Badge key={m} variant="outline" className="border-border text-xs">
              {m}
            </Badge>
          ))}
          {university.topMajors.length > 3 && (
            <Badge variant="outline" className="border-border text-xs text-muted-foreground">
              +{university.topMajors.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      <div className="sm:w-[200px] flex flex-col justify-center gap-4 sm:border-l border-border sm:pl-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Acceptance</div>
            <div className="font-mono text-lg font-bold">{university.acceptanceRate}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Value Score</div>
            <div className="font-mono text-lg font-bold text-emerald-500">{university.valueScore}/100</div>
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Med. Salary</span>
          <span className="font-mono font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            ${(university.careerOutcomes.medianSalary / 1000).toFixed(0)}k
          </span>
        </div>
      </div>
    </Link>
  );
}
