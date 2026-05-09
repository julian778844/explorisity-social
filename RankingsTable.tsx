import { useMemo, useState, type MouseEvent } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown, Heart, Search } from "lucide-react";
import { useFollows, type SchoolType } from "@/lib/follows";
import SchoolLogo from "@/components/SchoolLogo";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  numeric?: boolean;
  format?: (row: T) => React.ReactNode;
  sortValue?: (row: T) => number | string;
  className?: string;
};

type Row = { id: string; name: string; loc: string; color: string; rank: number };

type Props<T extends Row> = {
  rows: T[];
  columns: Column<T>[];
  defaultSortKey?: string;
  searchKeys?: (keyof T)[];
  filters?: { label: string; key: string; options: { value: string; label: string }[]; getValue: (row: T) => string }[];
  defaultFilters?: Record<string, string>;
  schoolType: SchoolType;
  rowHref?: (row: T) => string;
};

export default function RankingsTable<T extends Row>(
  { rows, columns, defaultSortKey, searchKeys = ["name" as keyof T], filters = [], defaultFilters = {}, schoolType, rowHref }: Props<T>
) {
  const { isFollowing, toggle } = useFollows();
  const [sortKey, setSortKey] = useState<string>(defaultSortKey ?? "rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(defaultFilters);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "rank" ? "asc" : "desc");
    }
  };

  const filteredSorted = useMemo(() => {
    let r = rows;
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((row) => searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)) || row.loc.toLowerCase().includes(q));
    }
    for (const f of filters) {
      const v = filterValues[f.key];
      if (v && v !== "all") r = r.filter((row) => f.getValue(row) === v);
    }
    const col = columns.find((c) => String(c.key) === sortKey);
    const getVal = (row: T) => {
      if (col?.sortValue) return col.sortValue(row);
      const v = (row as unknown as Record<string, unknown>)[sortKey];
      return typeof v === "number" ? v : String(v ?? "");
    };
    return [...r].sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [rows, query, sortKey, sortDir, filters, filterValues, columns, searchKeys]);

  const hrefFor = (row: T) =>
    rowHref ? rowHref(row) : schoolType === "undergrad" ? `/university/${row.id}` : `/school/${schoolType}/${row.id}`;

  const stopFollowProp = (e: MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or location…"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-card border border-border focus:border-primary focus:outline-none text-sm"
          />
        </div>
        {filters.map((f) => (
          <select
            key={f.key}
            value={filterValues[f.key] ?? "all"}
            onChange={(e) => setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
            className="px-3 py-2.5 rounded-xl bg-card border border-border focus:border-primary focus:outline-none text-sm min-w-[160px]"
          >
            <option value="all">All {f.label}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ))}
      </div>

      <div className="text-xs text-muted-foreground mb-3">{filteredSorted.length} programs · Click any row for the full profile</div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground w-12"></th>
              <th className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">Program</th>
              {columns.map((c) => {
                const k = String(c.key);
                const active = sortKey === k;
                return (
                  <th
                    key={k}
                    className={`px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors ${c.numeric ? "text-right" : "text-left"} ${c.className ?? ""}`}
                    onClick={() => handleSort(k)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      {active ? (sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                    </span>
                  </th>
                );
              })}
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredSorted.map((row, i) => {
              const followed = isFollowing(schoolType, row.id);
              const href = hrefFor(row);
              return (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.01, 0.4) }}
                  className="border-b border-border/40 hover:bg-muted/30 transition-colors group cursor-pointer focus-within:bg-muted/50 outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  tabIndex={0}
                  role="link"
                  aria-label={`Open ${row.name} profile`}
                  onClick={() => { window.location.assign(href); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      window.location.assign(href);
                    }
                  }}
                  onMouseDown={(e) => {
                    // middle-click → open in new tab
                    if (e.button === 1) {
                      e.preventDefault();
                      window.open(href, "_blank", "noopener");
                    }
                  }}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    <Link href={href} onClick={(e) => e.stopPropagation()} className="hover:underline">#{row.rank}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={href} onClick={(e) => e.stopPropagation()} className="flex items-center gap-3 min-w-[260px] group/name">
                      <SchoolLogo id={row.id} name={row.name} color={row.color} size={36} rounded="lg" />
                      <div className="min-w-0">
                        <div className="font-bold truncate group-hover/name:text-primary transition-colors">{row.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{row.loc}</div>
                      </div>
                    </Link>
                  </td>
                  {columns.map((c) => {
                    const content = c.format ? c.format(row) : (row as unknown as Record<string, unknown>)[String(c.key)];
                    return (
                      <td key={String(c.key)} className={`px-4 py-3 ${c.numeric ? "text-right font-mono" : ""} ${c.className ?? ""}`}>
                        {content as React.ReactNode}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { stopFollowProp(e); toggle(schoolType, row.id); }}
                      className={`p-2 rounded-lg transition-all ${followed ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
                      aria-label={followed ? "Unfollow" : "Follow"}
                      data-testid={`follow-${row.id}`}
                    >
                      <Heart className={`w-4 h-4 ${followed ? "fill-current" : ""}`} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
            {filteredSorted.length === 0 && (
              <tr>
                <td colSpan={columns.length + 3} className="text-center py-12 text-muted-foreground">
                  No programs match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
