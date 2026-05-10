import { useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, MessageSquare, School, Search, Users } from "lucide-react";
import { api } from "@/lib/api";

export default function SearchPage() {
  const params = new URLSearchParams(useSearch());
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);

  const enabled = query.trim().length >= 2;
  const { data, isFetching } = useQuery({
    queryKey: ["search-page", query],
    queryFn: () => api.search(query.trim()),
    enabled,
  });

  const totalResults = useMemo(() => {
    if (!data) return 0;
    return data.schools.length + data.users.length + data.communities.length + data.posts.length;
  }, [data]);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-8">
        <div className="mb-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-primary">Search Explorisity</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Find students, schools, posts, and opportunities.</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
            Search across real users, posts, opportunities, school communities, and universities.
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, schools, jobs, events, posts..."
            className="w-full rounded-2xl border border-border bg-background py-4 pl-12 pr-4 text-base font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </section>

      <section className="mt-6 space-y-6">
        {!enabled && (
          <EmptyState
            title="Start typing to search"
            body="Try a school name, username, internship, scholarship, event, or topic."
          />
        )}

        {enabled && isFetching && (
          <EmptyState title="Searching..." body="Looking through Explorisity." />
        )}

        {enabled && data && totalResults === 0 && (
          <EmptyState
            title="No results yet"
            body="There are no matching users, posts, schools, or opportunities yet."
          />
        )}

        {data && totalResults > 0 && (
          <>
            <ResultSection title="Users" icon={<Users className="h-5 w-5" />}>
              {data.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.username}`}
                  className="rounded-2xl border border-border bg-card p-4 transition hover:bg-muted"
                >
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.displayName} className="h-12 w-12 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black text-white" style={{ backgroundColor: user.avatarColor }}>
                        {user.displayName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-black">{user.displayName}</p>
                      <p className="text-sm font-medium text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </ResultSection>

            <ResultSection title="Universities and schools" icon={<School className="h-5 w-5" />}>
              {data.schools.map((school) => (
                <Link
                  key={`${school.type}-${school.id}`}
                  href={school.href || `/university/${school.id}`}
                  className="rounded-2xl border border-border bg-card p-4 font-black transition hover:bg-muted"
                >
                  {school.name}
                </Link>
              ))}
            </ResultSection>

            <ResultSection title="Posts" icon={<MessageSquare className="h-5 w-5" />}>
              {data.posts.map((post) => (
                <Link
                  key={post.id}
                  href="/explore"
                  className="rounded-2xl border border-border bg-card p-4 transition hover:bg-muted"
                >
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase text-muted-foreground">{post.category}</span>
                  <h3 className="mt-3 font-black">{post.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
                </Link>
              ))}
            </ResultSection>

            <ResultSection title="Opportunities" icon={<Briefcase className="h-5 w-5" />}>
              {data.opportunities.map((post) => (
                <Link
                  key={post.id}
                  href="/explore?filter=opportunities"
                  className="rounded-2xl border border-border bg-card p-4 transition hover:bg-muted"
                >
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase text-primary">{post.category}</span>
                  <h3 className="mt-3 font-black">{post.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
                </Link>
              ))}
            </ResultSection>

            <ResultSection title="Communities" icon={<Users className="h-5 w-5" />}>
              {data.communities.map((community) => (
                <Link
                  key={community.id}
                  href="/social"
                  className="rounded-2xl border border-border bg-card p-4 transition hover:bg-muted"
                >
                  <p className="font-black">{community.name}</p>
                  <p className="text-sm text-muted-foreground">{community.description || "Student community"}</p>
                </Link>
              ))}
            </ResultSection>
          </>
        )}
      </section>
    </div>
  );
}

function ResultSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode[];
}) {
  if (!children.length) return null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-primary">
        {icon}
        <h2 className="text-xl font-black text-foreground">{title}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{body}</p>
    </div>
  );
}
