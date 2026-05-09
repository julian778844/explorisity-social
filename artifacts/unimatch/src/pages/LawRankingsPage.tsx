import { Scale } from "lucide-react";
import { lawSchools, type LawSchool } from "@/data/lawSchools";
import RankingsTable, { type Column } from "@/components/RankingsTable";

const fmtMoney = (n: number) => `$${(n / 1000).toFixed(0)}k`;

const columns: Column<LawSchool>[] = [
  { key: "medianLSAT", label: "LSAT", numeric: true, format: (r) => <span className="text-[hsl(var(--accent))] font-bold">{r.medianLSAT}</span> },
  { key: "medianGPA", label: "GPA", numeric: true, format: (r) => r.medianGPA.toFixed(2) },
  { key: "acceptRate", label: "Accept", numeric: true, format: (r) => `${r.acceptRate}%` },
  { key: "tuition", label: "Tuition", numeric: true, format: (r) => fmtMoney(r.tuition) },
  { key: "barPassage", label: "Bar Pass", numeric: true, format: (r) => `${r.barPassage}%` },
  { key: "employmentPct", label: "Employed", numeric: true, format: (r) => `${r.employmentPct}%` },
  { key: "bigLawPct", label: "BigLaw", numeric: true, format: (r) => <span className="text-emerald-600 font-bold">{r.bigLawPct}%</span> },
  { key: "clerkshipPct", label: "Clerkship", numeric: true, format: (r) => `${r.clerkshipPct}%` },
  { key: "medianSalary", label: "Salary", numeric: true, format: (r) => <span className="text-[hsl(165_38%_30%)] font-bold">{fmtMoney(r.medianSalary)}</span> },
];

export default function LawRankingsPage() {
  return (
    <div className="min-h-screen px-4 py-10 max-w-[1400px] mx-auto">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg flex-shrink-0">
          <Scale className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-1">Law School Rankings</h1>
          <p className="text-muted-foreground max-w-2xl">
            {lawSchools.length}+ top US law programs ranked by selectivity, BigLaw placement, clerkship rate, and bar passage. Click any column to sort.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Programs", value: lawSchools.length },
          { label: "T14 Schools", value: lawSchools.filter((l) => l.rank <= 14).length },
          { label: "Avg Median LSAT", value: Math.round(lawSchools.reduce((a, l) => a + l.medianLSAT, 0) / lawSchools.length) },
          { label: "Avg Bar Passage", value: `${Math.round(lawSchools.reduce((a, l) => a + l.barPassage, 0) / lawSchools.length)}%` },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl border border-border bg-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-black">{s.value}</div>
          </div>
        ))}
      </div>

      <RankingsTable
        rows={lawSchools}
        columns={columns}
        defaultSortKey="rank"
        searchKeys={["name", "school"]}
        schoolType="law"
        filters={[
          {
            label: "Tiers",
            key: "tier",
            options: [
              { value: "1", label: "Tier 1 (T14)" },
              { value: "2", label: "Tier 2 (15–25)" },
              { value: "3", label: "Tier 3 (26+)" },
            ],
            getValue: (r) => String(r.tier),
          },
        ]}
      />
    </div>
  );
}
