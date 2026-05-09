import { Briefcase } from "lucide-react";
import { mbaPrograms, type MbaProgram } from "@/data/mbaPrograms";
import RankingsTable, { type Column } from "@/components/RankingsTable";

const fmtMoney = (n: number) => `$${(n / 1000).toFixed(0)}k`;

const columns: Column<MbaProgram>[] = [
  { key: "medianGMAT", label: "GMAT", numeric: true, format: (r) => <span className="text-[hsl(var(--accent))] font-bold">{r.medianGMAT}</span> },
  { key: "medianGPA", label: "GPA", numeric: true, format: (r) => r.medianGPA.toFixed(2) },
  { key: "avgWorkExp", label: "Work Exp", numeric: true, format: (r) => `${r.avgWorkExp}y` },
  { key: "acceptRate", label: "Accept", numeric: true, format: (r) => `${r.acceptRate}%` },
  { key: "tuition", label: "Tuition/yr", numeric: true, format: (r) => fmtMoney(r.tuition) },
  { key: "medianSalary", label: "Base Salary", numeric: true, format: (r) => <span className="text-[hsl(165_38%_30%)] font-bold">{fmtMoney(r.medianSalary)}</span> },
  { key: "signingBonus", label: "Signing", numeric: true, format: (r) => `+${fmtMoney(r.signingBonus)}` },
  { key: "consultingPct", label: "Consulting", numeric: true, format: (r) => `${r.consultingPct}%` },
  { key: "financePct", label: "Finance", numeric: true, format: (r) => `${r.financePct}%` },
  { key: "techPct", label: "Tech", numeric: true, format: (r) => `${r.techPct}%` },
  { key: "intlPct", label: "Intl %", numeric: true, format: (r) => `${r.intlPct}%` },
];

export default function MbaRankingsPage() {
  return (
    <div className="min-h-screen px-4 py-10 max-w-[1400px] mx-auto">
      <div className="flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg flex-shrink-0">
          <Briefcase className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-1">MBA Program Rankings</h1>
          <p className="text-muted-foreground max-w-2xl">
            {mbaPrograms.length} elite MBA programs across 4 regions. US schools shown by default — switch the region filter to compare global MBA programs. Ranks follow US News (US) and Financial Times (international) ordering.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Programs", value: mbaPrograms.length },
          { label: "M7", value: mbaPrograms.filter((p) => ["stanford-gsb", "wharton-mba", "chicago-booth", "kellogg-mba", "hbs-mba", "mit-sloan-mba", "columbia-mba"].includes(p.id)).length },
          { label: "Median GMAT", value: Math.round(mbaPrograms.reduce((a, p) => a + p.medianGMAT, 0) / mbaPrograms.length) },
          { label: "Median Salary", value: fmtMoney(Math.round(mbaPrograms.reduce((a, p) => a + p.medianSalary, 0) / mbaPrograms.length)) },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl border border-border bg-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{s.label}</div>
            <div className="text-2xl font-black">{s.value}</div>
          </div>
        ))}
      </div>

      <RankingsTable
        rows={mbaPrograms}
        columns={columns}
        defaultSortKey="rank"
        searchKeys={["name", "school"]}
        schoolType="mba"
        defaultFilters={{ region: "US" }}
        filters={[
          {
            label: "Regions",
            key: "region",
            options: [
              { value: "US", label: "United States" },
              { value: "Europe", label: "Europe" },
              { value: "Asia", label: "Asia" },
              { value: "Canada", label: "Canada" },
            ],
            getValue: (r) => r.region,
          },
          {
            label: "Tiers",
            key: "tier",
            options: [
              { value: "1", label: "Tier 1 (M7+)" },
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
