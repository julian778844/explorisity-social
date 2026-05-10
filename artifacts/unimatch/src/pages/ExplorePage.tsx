import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CalendarDays, Megaphone, MessageCircle, Plus } from "lucide-react";
import { api, type SocialPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const categoryIcon: Record<SocialPost["category"], typeof MessageCircle> = {
  promotion: Megaphone,
  job: Briefcase,
  event: CalendarDays,
  general: MessageCircle,
};

export default function ExplorePage() {
  const { user, openSignIn } = useAuth();
  const params = new URLSearchParams(useSearch());
  const filter = params.get("filter");

  const postsQuery = useQuery({
    queryKey: ["posts"],
    queryFn: async () => (await api.listPosts()).posts,
  });

  const posts = (postsQuery.data ?? []).filter((post) =>
    filter === "opportunities"
      ? ["job", "event", "promotion"].includes(post.category)
      : true,
  );

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <section className="mb-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-primary">
          Explore
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
          Real student posts and opportunities.
        </h1>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Scroll through posts shared by real Explorisity users. No bots. No fake filler.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/explore" className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-black hover:bg-muted">
            All posts
          </Link>
          <Link href="/explore?filter=opportunities" className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-black hover:bg-muted">
            Opportunities
          </Link>
          {user ? (
            <Link href="/social" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground">
              <Plus className="h-4 w-4" />
              Create post
            </Link>
          ) : (
            <button onClick={() => openSignIn("signin")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground">
              Sign in to post
            </button>
          )}
        </div>
      </section>

      {postsQuery.isLoading && (
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm font-bold text-muted-foreground">
          Loading posts...
        </div>
      )}

      {!postsQuery.isLoading && posts.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <MessageCircle className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-black">No posts yet.</h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Be the first to share something.
          </p>
          <div className="mt-5">
            {user ? (
              <Link href="/social" className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">
                Create the first post
              </Link>
            ) : (
              <button onClick={() => openSignIn("signup")} className="rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">
                Sign in to post
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => {
          const Icon = categoryIcon[post.category];
          return (
            <article key={post.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-black uppercase text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {post.category}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-xl font-black">{post.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{post.body}</p>

              {post.url && (
                <a href={post.url} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-xl border border-border px-4 py-2 text-sm font-black text-primary hover:bg-muted">
                  Open link
                </a>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
