import { Stethoscope } from "lucide-react";
import { medSchools, type MedSchool } from "@/data/medSchools";
import RankingsTable, { type Column } from "@/components/RankingsTable";

const fmtMoney = (n: number) => `$${(n / 1000).toFixed(0)}k`;

const columns: Column<MedSchool>[] = [
  { key: "medianMCAT", label: "MCAT", numeric: true, format: (r) => <span className="text-[hsl(var(--accent))] font-bold">{r.medianMCAT}</span> },
  { key: "medianGPA", label: "GPA", numeric: true, format: (r) => r.medianGPA.toFixed(2) },
  { key: "acceptRate", label: "Accept", numeric: true, format: (r) => `${r.acceptRate}%` },
  { key: "tuition", label: "Tuition", numeric: true, format: (r) => r.tuition === 0 ? <span className="text-emerald-600 font-bold">Free</span> : fmtMoney(r.tuition) },
  { key: "matchRate", label: "Match", numeric: true, format: (r) => `${r.matchRate}%` },
  { key: "primaryCarePct", label: "Primary Care", numeric: true, format: (r) => `${r.primaryCarePct}%` },
  { key: "researchFunding", label: "NIH $M", numeric: true, format: (r) => <span className="text-[hsl(165_38%_30%)] font-bold">${r.researchFunding}M</span> },
  { key: "focus", label: "Focus", format: (r) => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.focus === "Research" ? "bg-[hsl(var(--accent)/0.12)] text-primary" : r.focus === "Primary Care" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{r.focus}</span>
  ) },
  { key: "inStateRequired", label: "In-State", format: (r) => r.inStateRequired ? <span className="text-xs text-amber-700">Preferred</span> : <span className="text-xs text-muted-foreground">No pref</span>, sortValue: (r) => r.inStateRequired ? 1 : 0 },
];

export default function MedRankingsPage() {
  return (
    <div className="min-h-screen px-4 py-10 max-w-[1400px] mx-auto">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
          <Stethoscope className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-1">Medical School Rankings</h1>
          <p className="text-muted-foreground max-w-2xl">
            {medSchools.length}+ US MD programs ranked by MCAT, NIH research funding, match rate, and primary care output. Click any column to sort.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Programs", value: medSchools.length },
          { label: "Free Tuition", value: medSchools.filter((m) => m.tuition === 0).length },
          { label: "Median MCAT", value: Math.round(medSchools.reduce((a, m) => a + m.medianMCAT, 0) / medSchools.length) },
          { label: "Total NIH $", value: `$${(medSchools.reduce((a, m) => a + m.researchFunding, 0) / 1000).toFixed(1)}B` },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl border border-border bg-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-black">{s.value}</div>
          </div>
        ))}
      </div>

      <RankingsTable
        rows={medSchools}
        columns={columns}
        defaultSortKey="rank"
        searchKeys={["name", "school"]}
        schoolType="med"
        filters={[
          {
            label: "Focus",
            key: "focus",
            options: [
              { value: "Research", label: "Research-Heavy" },
              { value: "Primary Care", label: "Primary Care" },
              { value: "Balanced", label: "Balanced" },
            ],
            getValue: (r) => r.focus,
          },
          {
            label: "Tiers",
            key: "tier",
            options: [
              { value: "1", label: "Tier 1 (Top 25)" },
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
