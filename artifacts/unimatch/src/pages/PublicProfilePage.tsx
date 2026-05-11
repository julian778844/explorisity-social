import { Link, useParams } from "wouter";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserCheck, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import PostCard from "@/components/PostCard";
import FollowerToolsModal from "@/components/FollowerToolsModal";
import UserAvatar from "@/components/UserAvatar";
import SocialLinks from "@/components/SocialLinks";

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username?.replace(/^@+/, "") ?? "";
  const { user, openSignIn } = useAuth();
  const qc = useQueryClient();
  const [followerModal, setFollowerModal] = useState<"followers" | "following" | null>(null);

  const profileQuery = useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => api.getUserProfile(username),
    enabled: !!username,
    refetchInterval: 12_000,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const profile = profileQuery.data;
      if (!user) {
        openSignIn("signin");
        return;
      }
      if (!profile || profile.user.id === user.id) return;
      return profile.isFollowing ? api.unfollowUser(profile.user.id) : api.followUser(profile.user.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["public-profile", username] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["social-users"] });
      qc.invalidateQueries({ queryKey: ["user-follows"] });
    },
  });

  if (profileQuery.isLoading) {
    return <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 text-center text-muted-foreground">Loading profile...</div>;
  }

  const profile = profileQuery.data;

  if (!profile) {
    return (
      <div className="mx-auto min-h-screen max-w-3xl px-4 py-10">
        <Link href="/search" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-black">User not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This profile may not exist yet.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.user.id;

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-10">
      <Link href="/search" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      <section className="mb-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex flex-wrap items-center gap-5">
            <UserAvatar user={profile.user} size="xl" className="shadow-xl" />
            <div>
              <h1 className="text-3xl font-black">{profile.user.displayName}</h1>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">@{profile.user.username}</p>
              {profile.user.bio ? (
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{profile.user.bio}</p>
              ) : (
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">No bio yet.</p>
              )}
              <SocialLinks user={profile.user} size="md" className="mt-4" />

              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => setFollowerModal("followers")} className="rounded-2xl bg-background px-4 py-3 text-left transition hover:bg-muted">
                  <p className="text-xl font-black">{profile.followerCount}</p>
                  <p className="text-xs font-bold text-muted-foreground">Followers</p>
                </button>
                <button onClick={() => setFollowerModal("following")} className="rounded-2xl bg-background px-4 py-3 text-left transition hover:bg-muted">
                  <p className="text-xl font-black">{profile.followingCount}</p>
                  <p className="text-xs font-bold text-muted-foreground">Following</p>
                </button>
                <div className="rounded-2xl bg-background px-4 py-3">
                  <p className="text-xl font-black">{profile.posts.length}</p>
                  <p className="text-xs font-bold text-muted-foreground">Posts</p>
                </div>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <button
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black disabled:opacity-60 ${
                profile.isFollowing
                  ? "border border-primary/30 bg-primary/10 text-primary"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {profile.isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {profile.isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black">Posts</h2>

        {profile.posts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <h3 className="text-xl font-black">No posts yet.</h3>
            <p className="mt-2 text-sm font-medium text-muted-foreground">This user has not posted anything yet.</p>
          </div>
        )}

        {profile.posts.map((post) => (
          <PostCard key={post.id} post={post} canEdit={isOwnProfile} />
        ))}
      </section>

      {followerModal && (
        <FollowerToolsModal
          open
          onClose={() => setFollowerModal(null)}
          profileUserId={profile.user.id}
          profileUsername={profile.user.username}
          initialMode={followerModal}
          isOwnProfile={isOwnProfile}
        />
      )}
    </div>
  );
}
