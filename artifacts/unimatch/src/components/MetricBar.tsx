import { cn } from "@/lib/utils";

interface MetricBarProps {
  label: string;
  valueA: number;
  valueB: number;
  max: number;
  colorA?: string;
  colorB?: string;
  formatValue?: (val: number) => string;
  reverseWinner?: boolean; // If true, lower is better (e.g. tuition)
}

export default function MetricBar({
  label,
  valueA,
  valueB,
  max,
  colorA = "hsl(var(--primary))",
  colorB = "hsl(var(--accent))",
  formatValue = (v) => v.toString(),
  reverseWinner = false,
}: MetricBarProps) {
  const pctA = Math.min(100, Math.max(0, (valueA / max) * 100));
  const pctB = Math.min(100, Math.max(0, (valueB / max) * 100));

  let aWins = valueA > valueB;
  if (reverseWinner) aWins = valueA < valueB;
  const isTie = valueA === valueB;

  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border/60 last:border-0">
      <div className="text-center text-sm text-muted-foreground font-medium tracking-wider uppercase">
        {label}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 flex justify-end">
          <span className={cn("font-mono text-sm", aWins && !isTie ? "text-foreground font-bold" : "text-muted-foreground")}>
            {formatValue(valueA)}
          </span>
        </div>
        
        <div className="w-1/2 md:w-2/3 max-w-[400px] flex items-center gap-1 mx-auto">
          <div className="flex-1 flex justify-end">
            <div 
              className={cn("h-2 rounded-l-full transition-all duration-1000 ease-out", aWins && !isTie ? "opacity-100" : "opacity-60")}
              style={{ width: `${pctA}%`, backgroundColor: colorA }}
            />
          </div>
          <div className="w-[1px] h-4 bg-muted mx-1" />
          <div className="flex-1 flex justify-start">
            <div 
              className={cn("h-2 rounded-r-full transition-all duration-1000 ease-out", !aWins && !isTie ? "opacity-100" : "opacity-60")}
              style={{ width: `${pctB}%`, backgroundColor: colorB }}
            />
          </div>
        </div>

        <div className="flex-1 flex justify-start">
          <span className={cn("font-mono text-sm", !aWins && !isTie ? "text-foreground font-bold" : "text-muted-foreground")}>
            {formatValue(valueB)}
          </span>
        </div>
      </div>
    </div>
  );
}
