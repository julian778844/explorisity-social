import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, School, MessageSquare, Briefcase } from "lucide-react";
import { api } from "@/lib/api";

type GlobalSearchProps = {
  compact?: boolean;
  onResultClick?: () => void;
};

export default function GlobalSearch({ compact = false, onResultClick }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const enabled = query.trim().length >= 2;

  const { data, isFetching } = useQuery({
    queryKey: ["global-search", query],
    queryFn: () => api.search(query.trim()),
    enabled,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      onResultClick?.();
    }
  };

  const empty =
    enabled &&
    data &&
    !data.schools.length &&
    !data.users.length &&
    !data.communities.length &&
    !data.posts.length;

  return (
    <form onSubmit={submit} className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={compact ? "Search..." : "Search users, schools, posts, opportunities..."}
          className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2.5 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          aria-label="Search Explorisity"
        />
      </div>

      {enabled && (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-xl">
          {isFetching && <div className="p-3 text-sm font-semibold text-muted-foreground">Searching...</div>}

          {!isFetching && data && (
            <div className="space-y-3">
              <ResultGroup title="Schools" icon={<School className="h-3.5 w-3.5" />}>
                {data.schools.map((school) => (
                  <Link
                    key={`${school.type}-${school.id}`}
                    href={school.href || `/university/${school.id}`}
                    onClick={onResultClick}
                    className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-muted"
                  >
                    {school.name}
                  </Link>
                ))}
              </ResultGroup>

              <ResultGroup title="Users" icon={<Users className="h-3.5 w-3.5" />}>
                {data.users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.username}`}
                    onClick={onResultClick}
                    className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-muted"
                  >
                    {user.displayName} <span className="font-medium text-muted-foreground">@{user.username}</span>
                  </Link>
                ))}
              </ResultGroup>

              <ResultGroup title="Posts" icon={<MessageSquare className="h-3.5 w-3.5" />}>
                {data.posts.slice(0, 4).map((post) => (
                  <Link
                    key={post.id}
                    href="/explore"
                    onClick={onResultClick}
                    className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-muted"
                  >
                    {post.title}
                    <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {post.category}
                    </span>
                  </Link>
                ))}
              </ResultGroup>

              <ResultGroup title="Opportunities" icon={<Briefcase className="h-3.5 w-3.5" />}>
                {data.opportunities.slice(0, 4).map((post) => (
                  <Link
                    key={post.id}
                    href="/explore?filter=opportunities"
                    onClick={onResultClick}
                    className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-muted"
                  >
                    {post.title}
                  </Link>
                ))}
              </ResultGroup>

              <ResultGroup title="Communities" icon={<Users className="h-3.5 w-3.5" />}>
                {data.communities.map((community) => (
                  <Link
                    key={community.id}
                    href="/social"
                    onClick={onResultClick}
                    className="block rounded-lg px-3 py-2 text-sm font-bold hover:bg-muted"
                  >
                    {community.name}
                  </Link>
                ))}
              </ResultGroup>

              {empty && (
                <div className="rounded-xl bg-muted/50 p-4 text-sm font-semibold text-muted-foreground">
                  No results yet. Try another school, user, post, or opportunity.
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-3 py-2 text-sm font-black text-primary-foreground"
              >
                Open full search
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}

function ResultGroup({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  if (!hasChildren) return null;

  return (
    <div>
      <div className="flex items-center gap-1.5 px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {icon}
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}
