import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const enabled = query.trim().length >= 2;
  const { data, isFetching } = useQuery({
    queryKey: ["global-search", query],
    queryFn: () => api.search(query.trim()),
    enabled,
  });

  return (
    <div className="relative w-full">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search schools, students, communities..."
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none focus:border-primary"
      />

      {enabled && (
        <div className="absolute left-0 right-0 top-12 z-50 rounded-2xl border border-border bg-card p-3 shadow-xl">
          {isFetching && <div className="p-3 text-sm text-muted-foreground">Searching...</div>}

          {!isFetching && data && (
            <div className="space-y-3">
              <ResultGroup title="Schools">
                {data.schools.map((school) => (
                  <Link key={`${school.type}-${school.id}`} href={`/school/${school.id}`} className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-muted">
                    {school.name}
                  </Link>
                ))}
              </ResultGroup>

              <ResultGroup title="Students">
                {data.users.map((user) => (
                  <Link key={user.id} href={`/profile/${user.username}`} className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-muted">
                    {user.displayName} <span className="font-medium text-muted-foreground">@{user.username}</span>
                  </Link>
                ))}
              </ResultGroup>

              <ResultGroup title="Communities">
                {data.communities.map((community) => (
                  <Link key={community.id} href="/social" className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-muted">
                    {community.name}
                  </Link>
                ))}
              </ResultGroup>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</div>
      <div>{children}</div>
    </div>
  );
}
