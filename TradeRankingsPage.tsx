import { Wrench } from "lucide-react";
import { tradeSchools, type TradeSchool } from "@/data/tradeSchools";
import RankingsTable, { type Column } from "@/components/RankingsTable";

const fmtMoney = (n: number) => n === 0 ? "Free" : `$${(n / 1000).toFixed(0)}k`;

const columns: Column<TradeSchool>[] = [
  { key: "topProgram", label: "Flagship Program" },
  { key: "lengthMonths", label: "Length", numeric: true, format: (r) => `${r.lengthMonths} mo` },
  { key: "tuition", label: "Total Cost", numeric: true, format: (r) => <span className={r.tuition === 0 ? "text-emerald-600 font-bold" : ""}>{fmtMoney(r.tuition)}</span> },
  { key: "completionPct", label: "Completion", numeric: true, format: (r) => `${r.completionPct}%` },
  { key: "jobPlacementPct", label: "Job Placement", numeric: true, format: (r) => <span className="text-emerald-600 font-bold">{r.jobPlacementPct}%</span> },
  { key: "medianSalary", label: "Median Salary", numeric: true, format: (r) => <span className="text-[hsl(165_38%_30%)] font-bold">${(r.medianSalary / 1000).toFixed(0)}k</span> },
  { key: "type", label: "Type" },
];

export default function TradeRankingsPage() {
  return (
    <div className="min-h-screen px-4 py-10 max-w-[1400px] mx-auto">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
          <Wrench className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-1">Trade & Technical Schools</h1>
          <p className="text-muted-foreground max-w-2xl">
            {tradeSchools.length} top US trade, technical and apprenticeship programs — welding, HVAC, electrical, automotive, aviation, healthcare, more. Real placement rates and median salaries from program disclosures.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Programs", value: tradeSchools.length },
          { label: "Free / Union Apprenticeships", value: tradeSchools.filter((t) => t.tuition === 0).length },
          { label: "Avg Job Placement", value: `${Math.round(tradeSchools.reduce((a, t) => a + t.jobPlacementPct, 0) / tradeSchools.length)}%` },
          { label: "Avg Median Salary", value: `$${Math.round(tradeSchools.reduce((a, t) => a + t.medianSalary, 0) / tradeSchools.length / 1000)}k` },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl border border-border bg-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-black">{s.value}</div>
          </div>
        ))}
      </div>

      <RankingsTable
        rows={tradeSchools}
        columns={columns}
        defaultSortKey="rank"
        searchKeys={["name", "school", "topProgram"]}
        schoolType="trade"
        filters={[
          {
            label: "Types",
            key: "type",
            options: [
              { value: "Public", label: "Public / Community" },
              { value: "Private", label: "Private Trade School" },
              { value: "Non-Profit", label: "Non-Profit / Union" },
            ],
            getValue: (r) => r.type,
          },
          {
            label: "Tiers",
            key: "tier",
            options: [
              { value: "1", label: "Tier 1" },
              { value: "2", label: "Tier 2" },
              { value: "3", label: "Tier 3" },
            ],
            getValue: (r) => String(r.tier),
          },
        ]}
      />
    </div>
  );
}
