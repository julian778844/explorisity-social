import { Link, useParams, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle } from "lucide-react";
import PostCard from "@/components/PostCard";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const search = useSearch();
  const { user } = useAuth();
  const postId = Number(params.id);
  const validPostId = Number.isInteger(postId) && postId > 0;
  const highlightCommentId = Number(new URLSearchParams(search).get("comment") ?? 0) || null;

  const postQuery = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => (await api.getPost(postId)).post,
    enabled: validPostId,
  });

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/social"
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-black hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to social
        </Link>

        <div className="mb-5 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Post</h1>
              <p className="text-sm font-semibold text-muted-foreground">
                View the full post and comment thread.
              </p>
            </div>
          </div>
        </div>

        {postQuery.isLoading && (
          <div className="rounded-3xl border border-border bg-card p-8 text-sm font-bold text-muted-foreground">
            Loading post...
          </div>
        )}

        {(!validPostId || postQuery.error) && (
          <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center">
            <h2 className="text-xl font-black">Post unavailable</h2>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              This post may have been removed or the link is no longer valid.
            </p>
          </div>
        )}

        {postQuery.data && (
          <PostCard
            post={postQuery.data}
            canEdit={user?.id === postQuery.data.authorId}
            initialCommentsOpen
            highlightCommentId={highlightCommentId}
          />
        )}
      </div>
    </div>
  );
}
