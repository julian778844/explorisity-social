import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, GraduationCap, Search, Sparkles, UserRound } from "lucide-react";
import { api, type SearchResult } from "@/lib/api";

const iconByType: Record<SearchResult["type"], typeof UserRound> = {
  user: UserRound,
  school: GraduationCap,
  opportunity: Briefcase,
};

type Props = { className?: string; hero?: boolean };

export default function GlobalSearch({ className = "", hero = false }: Props) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const enabled = trimmed.length >= 2;

  const { data, isFetching } = useQuery({
    queryKey: ["global-search", trimmed],
    queryFn: () => api.search(trimmed),
    enabled,
    staleTime: 30_000,
  });

  const results = useMemo(() => data?.results.slice(0, 8) ?? [], [data]);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!trimmed) return;
    if (results[0]) navigate(results[0].href);
    else navigate(`/social?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={submit} className={`flex items-center gap-3 rounded-2xl border border-border bg-background/90 shadow-lg shadow-black/5 ${hero ? "p-2" : "p-1.5"}`}>
        <div className="pl-3 text-muted-foreground"><Search className="w-5 h-5" /></div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students, schools, internships, scholarships..."
          className="flex-1 bg-transparent border-0 outline-none py-3 text-sm md:text-base placeholder:text-muted-foreground"
          data-testid="input-home-global-search"
        />
        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
          Search <Sparkles className="w-4 h-4" />
        </button>
      </form>

      {enabled && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-border bg-card text-left shadow-2xl">
          {isFetching && results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">Searching Explorisity…</div>
          ) : results.length ? (
            <div className="max-h-96 overflow-y-auto p-2">
              {results.map((result) => {
                const Icon = iconByType[result.type];
                return (
                  <Link key={result.id} href={result.href} className="flex items-start gap-3 rounded-xl p-3 hover:bg-muted transition-colors">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate font-bold text-sm">{result.title}</div>
                        {result.meta && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{result.meta}</span>}
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{result.subtitle}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">No matches yet. Try a student name, school, internship, scholarship, or research.</div>
          )}
        </div>
      )}
    </div>
  );
}
