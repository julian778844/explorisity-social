import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pin, Search, Sparkles, UserMinus, UserPlus, X } from "lucide-react";
import { api, type FollowerProfileItem } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Mode = "followers" | "following";

function MiniAvatar({ user }: { user: FollowerProfileItem }) {
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.displayName} className="h-11 w-11 rounded-2xl object-cover" />;
  }
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black text-white" style={{ backgroundColor: user.avatarColor }}>
      {user.displayName.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function FollowerToolsModal({
  open,
  onClose,
  profileUserId,
  profileUsername,
  initialMode,
  isOwnProfile,
}: {
  open: boolean;
  onClose: () => void;
  profileUserId: number;
  profileUsername: string;
  initialMode: Mode;
  isOwnProfile: boolean;
}) {
  const { user, openSignIn } = useAuth();
  const qc = useQueryClient();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [query, setQuery] = useState("");
  const [showFollowers, setShowFollowers] = useState(true);
  const [showFollowing, setShowFollowing] = useState(true);
  const [pinned, setPinned] = useState<number[]>([]);

  if (!open) return null;

  const listQuery = useQuery({
    queryKey: ["follow-list", profileUserId, mode],
    queryFn: async () =>
      mode === "followers"
        ? api.getFollowers(profileUserId)
        : api.getFollowing(profileUserId),
    enabled: open,
    refetchInterval: 15_000,
  });

  const suggestionsQuery = useQuery({
    queryKey: ["follow-suggestions"],
    queryFn: async () => (await api.getFollowSuggestions()).suggestions,
    enabled: open && !!user,
  });

  const followMutation = useMutation({
    mutationFn: async (targetId: number) => {
      if (!user) {
        openSignIn("signin");
        return;
      }
      return api.followUser(targetId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-list"] });
      qc.invalidateQueries({ queryKey: ["follow-suggestions"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["public-profile", profileUsername] });
    },
  });

  const removeFollowerMutation = useMutation({
    mutationFn: (targetId: number) => api.removeFollower(targetId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-list"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["public-profile", profileUsername] });
    },
  });

  const privacyMutation = useMutation({
    mutationFn: () => api.updateFollowPrivacy({ showFollowers, showFollowing }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["public-profile", profileUsername] });
    },
  });

  const pinMutation = useMutation({
    mutationFn: (next: number[]) => api.updatePinnedFollowers(next),
    onSuccess: (_, next) => setPinned(next),
  });

  const users = listQuery.data?.users ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((item) =>
      item.username.toLowerCase().includes(q) ||
      item.displayName.toLowerCase().includes(q) ||
      (item.bio ?? "").toLowerCase().includes(q),
    );
  }, [query, users]);

  function togglePin(id: number) {
    const next = pinned.includes(id)
      ? pinned.filter((existing) => existing !== id)
      : [id, ...pinned].slice(0, 6);

    pinMutation.mutate(next);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">@{profileUsername}</p>
            <h2 className="text-2xl font-black">Follower tools</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-muted" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border p-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
            <button onClick={() => setMode("followers")} className={`rounded-xl py-2 text-sm font-black ${mode === "followers" ? "bg-card shadow" : "text-muted-foreground"}`}>
              Followers
            </button>
            <button onClick={() => setMode("following")} className={`rounded-xl py-2 text-sm font-black ${mode === "following" ? "bg-card shadow" : "text-muted-foreground"}`}>
              Following
            </button>
          </div>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${mode}...`}
              className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-primary"
            />
          </div>

          {isOwnProfile && (
            <div className="mt-3 rounded-2xl border border-border bg-background p-3">
              <p className="mb-2 text-xs font-black uppercase tracking-wide text-muted-foreground">Privacy controls</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-bold">
                  Show followers
                  <input type="checkbox" checked={showFollowers} onChange={(e) => setShowFollowers(e.target.checked)} />
                </label>
                <label className="flex items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2 text-xs font-bold">
                  Show following
                  <input type="checkbox" checked={showFollowing} onChange={(e) => setShowFollowing(e.target.checked)} />
                </label>
              </div>
              <button onClick={() => privacyMutation.mutate()} className="mt-2 rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground">
                Save privacy
              </button>
            </div>
          )}
        </div>

        <div className="max-h-[46vh] space-y-3 overflow-y-auto p-4">
          {listQuery.isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          )}

          {!listQuery.isLoading && listQuery.data && !listQuery.data.canView && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <h3 className="font-black">This list is private.</h3>
              <p className="mt-1 text-sm text-muted-foreground">The user chose to hide this section.</p>
            </div>
          )}

          {!listQuery.isLoading && listQuery.data?.canView && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <h3 className="font-black">No users found.</h3>
              <p className="mt-1 text-sm text-muted-foreground">Try another search.</p>
            </div>
          )}

          {filtered.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3">
              <Link href={`/profile/${item.username}`} className="flex min-w-0 items-center gap-3">
                <MiniAvatar user={item} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-black">{item.displayName}</p>
                    {item.isMutual && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-700">Mutual</span>}
                    {item.isNewFollower && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black text-green-700">New</span>}
                  </div>
                  <p className="truncate text-xs font-semibold text-muted-foreground">@{item.username} · {item.followerCount} followers</p>
                </div>
              </Link>

              <div className="flex shrink-0 items-center gap-2">
                {isOwnProfile && mode === "followers" && (
                  <button onClick={() => togglePin(item.id)} className="rounded-xl border border-border p-2 hover:bg-muted" title="Pin follower">
                    <Pin className={`h-4 w-4 ${pinned.includes(item.id) ? "fill-current text-primary" : ""}`} />
                  </button>
                )}

                {item.canFollowBack && (
                  <button onClick={() => followMutation.mutate(item.id)} className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground">
                    <UserPlus className="h-3.5 w-3.5" />
                    Follow back
                  </button>
                )}

                {!item.followingByMe && !item.canFollowBack && user?.id !== item.id && (
                  <button onClick={() => followMutation.mutate(item.id)} className="rounded-xl border border-border px-3 py-2 text-xs font-black hover:bg-muted">
                    Follow
                  </button>
                )}

                {isOwnProfile && mode === "followers" && (
                  <button onClick={() => removeFollowerMutation.mutate(item.id)} className="rounded-xl border border-border p-2 text-destructive hover:bg-muted" title="Remove follower">
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {user && (
          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black">Suggested for you</h3>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {(suggestionsQuery.data ?? []).slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-background p-3">
                  <Link href={`/profile/${item.username}`} className="flex min-w-0 items-center gap-2">
                    <MiniAvatar user={item} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black">{item.displayName}</p>
                      <p className="truncate text-[11px] font-semibold text-muted-foreground">{item.reason}</p>
                    </div>
                  </Link>
                  <button onClick={() => followMutation.mutate(item.id)} className="rounded-xl bg-primary px-2.5 py-1.5 text-[11px] font-black text-primary-foreground">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
