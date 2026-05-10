import { Link, useParams } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserPlus, UserMinus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import PostCard from "@/components/PostCard";

function Avatar({ src, name, color }: { src?: string | null; name: string; color: string }) {
  if (src) return <img src={src} alt={name} className="h-24 w-24 rounded-3xl object-cover shadow-xl" />;
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-3xl text-4xl font-black text-white shadow-xl" style={{ backgroundColor: color }}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username?.replace(/^@+/, "") ?? "";
  const { user, openSignIn } = useAuth();
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["public-profile", username],
    queryFn: () => api.getUserProfile(username),
    enabled: !!username,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const profile = profileQuery.data;
      if (!user) {
        openSignIn("signin");
        return;
      }
      if (!profile) return;
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
            <Avatar src={profile.user.avatarUrl} name={profile.user.displayName} color={profile.user.avatarColor} />
            <div>
              <h1 className="text-3xl font-black">{profile.user.displayName}</h1>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">@{profile.user.username}</p>
              {profile.user.bio && <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{profile.user.bio}</p>}

              <div className="mt-4 flex flex-wrap gap-3">
                <div className="rounded-2xl bg-background px-4 py-3">
                  <p className="text-xl font-black">{profile.followerCount}</p>
                  <p className="text-xs font-bold text-muted-foreground">Followers</p>
                </div>
                <div className="rounded-2xl bg-background px-4 py-3">
                  <p className="text-xl font-black">{profile.followingCount}</p>
                  <p className="text-xs font-bold text-muted-foreground">Following</p>
                </div>
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
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground disabled:opacity-60"
            >
              {profile.isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {profile.isFollowing ? "Unfollow" : "Follow"}
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
    </div>
  );
}
