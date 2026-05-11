import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, UserCheck } from "lucide-react";
import { api, type PostAuthor } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function FollowHoverCard({
  author,
  children,
}: {
  author?: PostAuthor | null;
  children: React.ReactNode;
}) {
  const { user, openSignIn } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!author) return;
      if (!user) {
        openSignIn("signin");
        return;
      }
      return api.followUser(author.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["public-profile"] });
      qc.invalidateQueries({ queryKey: ["social-users"] });
      qc.invalidateQueries({ queryKey: ["user-follows"] });
    },
  });

  if (!author) return <>{children}</>;

  const isMe = user?.id === author.id;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            className="glass-card absolute left-0 top-full z-50 mt-3 w-72 rounded-3xl border border-border p-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              {author.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.displayName} className="h-14 w-14 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white" style={{ backgroundColor: author.avatarColor }}>
                  {author.displayName.slice(0, 1).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <Link href={`/profile/${author.username}`} className="block truncate font-black hover:underline">
                  {author.displayName}
                </Link>
                <p className="truncate text-sm font-semibold text-muted-foreground">@{author.username}</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Link
                href={`/profile/${author.username}`}
                className="flex-1 rounded-xl border border-border px-3 py-2 text-center text-sm font-black hover:bg-muted"
              >
                View Profile
              </Link>

              {!isMe && (
                <button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-black text-primary-foreground disabled:opacity-60"
                >
                  {followMutation.isSuccess ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  Follow
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
