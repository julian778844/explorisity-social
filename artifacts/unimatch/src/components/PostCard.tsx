import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Heart, MessageCircle, Pencil, Send, Share2, X } from "lucide-react";
import { api, type SocialPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatPostTime, wasPostEdited } from "@/lib/postTime";
import FollowHoverCard from "@/components/FollowHoverCard";
import UserAvatar from "@/components/UserAvatar";

function PostImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <img
      src={src}
      alt={alt}
      className="mt-4 max-h-[560px] w-full rounded-2xl border border-border object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export default function PostCard({ post, canEdit = false }: { post: SocialPost; canEdit?: boolean }) {
  const { user, openSignIn } = useAuth();
  const qc = useQueryClient();

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [draft, setDraft] = useState({
    title: post.title,
    body: post.body,
    category: post.category,
    url: post.url ?? "",
    imageUrl: post.imageUrl,
  });
  const [error, setError] = useState<string | null>(null);

  const profileHref = post.author?.username ? `/profile/${post.author.username}` : "/profile";
  const showEdit = canEdit || (user?.id === post.authorId);
  const edited = wasPostEdited(post.createdAt, post.updatedAt);

  const commentsQuery = useQuery({
    queryKey: ["post-comments", post.id],
    queryFn: async () => (await api.listPostComments(post.id)).comments,
    enabled: commentsOpen,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to like posts.");
      return post.likedByMe ? api.unlikePost(post.id) : api.likePost(post.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["public-profile"] });
    },
    onError: () => openSignIn("signin"),
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to comment.");
      return api.createPostComment(post.id, comment.trim());
    },
    onSuccess: () => {
      setComment("");
      setError(null);
      qc.invalidateQueries({ queryKey: ["post-comments", post.id] });
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["public-profile"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      api.updatePost(post.id, {
        title: draft.title.trim(),
        body: draft.body.trim(),
        category: draft.category,
        url: draft.url.trim() || null,
        imageUrl: draft.imageUrl || null,
      }),
    onSuccess: () => {
      setEditing(false);
      setError(null);
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["public-profile"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  function submitComment() {
    setError(null);

    if (!user) {
      openSignIn("signin");
      return;
    }

    if (!comment.trim()) {
      setError("Write a comment first.");
      return;
    }

    commentMutation.mutate();
  }

  async function sharePost() {
    const url = `${window.location.origin}${profileHref}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.body, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage("Profile link copied.");
        window.setTimeout(() => setShareMessage(""), 1800);
      }
    } catch {}
  }

  return (
    <motion.article layout className="glass-card rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <FollowHoverCard author={post.author}>
          <Link href={profileHref} className="flex min-w-0 items-start gap-3 rounded-2xl -m-2 p-2 transition hover:bg-muted/70">
            <UserAvatar user={post.author} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{post.author?.displayName ?? "Explorisity user"}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-muted-foreground">
                <span className="truncate">@{post.author?.username ?? "user"}</span>
                <span>{formatPostTime(post.createdAt)}</span>
                {edited && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold">
                    {formatPostTime(post.updatedAt, "Edited")}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </FollowHoverCard>

        {showEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-black transition hover:bg-muted"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <select
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as SocialPost["category"] }))}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold"
          >
            <option value="general">General</option>
            <option value="job">Job</option>
            <option value="event">Event</option>
            <option value="promotion">Promotion</option>
          </select>

          <input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-bold"
          />

          <textarea
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            rows={4}
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium"
          />

          <input
            value={draft.url}
            onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
            placeholder="Optional link"
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium"
          />

          <input
            value={draft.imageUrl ?? ""}
            onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value || null }))}
            placeholder="Image URL or uploaded image data"
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium"
          />

          {draft.imageUrl && <PostImage src={draft.imageUrl} alt="Post preview" />}

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</div>}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || !draft.title.trim() || !draft.body.trim()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground disabled:opacity-60"
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </button>
            <button onClick={() => setEditing(false)} className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-black hover:bg-muted">
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase text-primary">{post.category}</span>
          <h2 className="mt-3 text-xl font-black tracking-tight">{post.title}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-muted-foreground">{post.body}</p>

          {post.imageUrl && <PostImage src={post.imageUrl} alt={post.title} />}

          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-black text-primary transition hover:bg-muted"
            >
              Open link
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          {shareMessage && <p className="mt-3 text-xs font-bold text-primary">{shareMessage}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <motion.button
              whileTap={{ scale: 0.84 }}
              onClick={() => likeMutation.mutate()}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition hover:bg-muted ${post.likedByMe ? "text-red-600" : "text-foreground"}`}
            >
              <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-current" : ""}`} />
              Like {post.likeCount ? `(${post.likeCount})` : ""}
            </motion.button>

            <button onClick={() => setCommentsOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition hover:bg-muted">
              <MessageCircle className="h-4 w-4" />
              Comment {post.commentCount ? `(${post.commentCount})` : ""}
            </button>

            <button onClick={sharePost} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition hover:bg-muted">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>

          {commentsOpen && (
            <div className="mt-4 space-y-3 rounded-2xl border border-border bg-background/70 p-4 backdrop-blur">
              <div className="flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={user ? "Write a comment..." : "Sign in to comment"}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-muted px-3 py-2 text-sm font-medium"
                />
                <button
                  onClick={submitComment}
                  disabled={commentMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-black text-primary-foreground disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  Post
                </button>
              </div>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</div>}
              {commentsQuery.isLoading && <p className="text-sm font-semibold text-muted-foreground">Loading comments...</p>}

              {(commentsQuery.data ?? []).map((c) => (
                <div key={c.id} className="flex gap-3 rounded-xl bg-card p-3">
                  <FollowHoverCard author={c.author}>
                    <Link href={c.author?.username ? `/profile/${c.author.username}` : "/profile"} className="flex min-w-0 gap-3">
                      <UserAvatar user={c.author} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black hover:underline">@{c.author?.username ?? "user"}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm font-medium text-muted-foreground">{c.body}</p>
                      </div>
                    </Link>
                  </FollowHoverCard>
                </div>
              ))}

              {!commentsQuery.isLoading && (commentsQuery.data ?? []).length === 0 && (
                <p className="text-sm font-semibold text-muted-foreground">No comments yet. Be the first to comment.</p>
              )}
            </div>
          )}
        </>
      )}
    </motion.article>
  );
}
