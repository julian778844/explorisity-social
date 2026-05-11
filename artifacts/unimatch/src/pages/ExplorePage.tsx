import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, MessageCircle, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import EasyPostWidget from "@/components/EasyPostWidget";
import PostCard from "@/components/PostCard";
import FeedSkeleton from "@/components/FeedSkeleton";
import NewPostsPill from "@/components/NewPostsPill";

const PAGE_SIZE = 8;

export default function ExplorePage() {
  const { user, openSignIn } = useAuth();
  const params = new URLSearchParams(useSearch());
  const filter = params.get("filter");
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [latestSeenId, setLatestSeenId] = useState<number | null>(null);
  const [newPostCount, setNewPostCount] = useState(0);

  const postsQuery = useQuery({
    queryKey: ["posts"],
    queryFn: async () => (await api.listPosts()).posts,
    refetchInterval: 20_000,
  });

  const filteredPosts = useMemo(() => {
    const posts = postsQuery.data ?? [];
    return posts.filter((post) =>
      filter === "opportunities"
        ? ["job", "event", "promotion"].includes(post.category)
        : true,
    );
  }, [filter, postsQuery.data]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  useEffect(() => {
    if (!filteredPosts.length) return;
    const newestId = filteredPosts[0].id;
    if (latestSeenId === null) {
      setLatestSeenId(newestId);
      return;
    }
    if (newestId !== latestSeenId && window.scrollY > 360) {
      const index = filteredPosts.findIndex((post) => post.id === latestSeenId);
      setNewPostCount(index > 0 ? index : 1);
    } else {
      setLatestSeenId(newestId);
    }
  }, [filteredPosts, latestSeenId]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setVisibleCount((current) => Math.min(current + PAGE_SIZE, filteredPosts.length));
      }
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [filteredPosts.length]);

  function jumpToNewPosts() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setLatestSeenId(filteredPosts[0]?.id ?? null);
    setNewPostCount(0);
    postsQuery.refetch();
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <NewPostsPill show={newPostCount > 0} count={newPostCount} onClick={jumpToNewPosts} />

      <section className="glass-card mb-6 rounded-3xl border border-border p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-primary">Explore</p>
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
          <Link href="/explore?filter=opportunities" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-black hover:bg-muted">
            <Briefcase className="h-4 w-4" />
            Opportunities
          </Link>
          {user ? (
            <Link href="/profile" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground">
              <Plus className="h-4 w-4" />
              Post from profile
            </Link>
          ) : (
            <button onClick={() => openSignIn("signin")} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground">
              Sign in to post
            </button>
          )}
        </div>
      </section>

      <div className="mb-6">
        <EasyPostWidget compact />
      </div>

      {postsQuery.isLoading && <FeedSkeleton count={3} />}

      {!postsQuery.isLoading && filteredPosts.length === 0 && (
        <div className="glass-card rounded-3xl border border-dashed border-border p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <MessageCircle className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-black">No posts yet.</h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Be the first to share something.</p>
        </div>
      )}

      <div className="space-y-4">
        {visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} canEdit={user?.id === post.authorId} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-16" />

      {!postsQuery.isLoading && visiblePosts.length < filteredPosts.length && (
        <p className="pb-8 text-center text-sm font-semibold text-muted-foreground">Loading more posts...</p>
      )}
    </div>
  );
}
