import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Edit3, LogIn, Save, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import EasyPostWidget from "@/components/EasyPostWidget";
import PostCard from "@/components/PostCard";

const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;

function AvatarDisplay({ src, name, color }: { src?: string | null; name: string; color: string }) {
  if (src) {
    return <img src={src} alt={name} className="h-28 w-28 rounded-3xl object-cover shadow-xl" />;
  }

  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-3xl text-4xl font-black text-white shadow-xl" style={{ backgroundColor: color }}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

export default function ProfilePage() {
  const { user, isPending, openSignIn } = useAuth();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editing, setEditing] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    displayName: "",
    bio: "",
    email: "",
    avatarColor: "#7c3aed",
    avatarUrl: null as string | null,
  });

  useEffect(() => {
    if (user) {
      setDraft({
        displayName: user.displayName,
        bio: user.bio ?? "",
        email: user.email ?? "",
        avatarColor: user.avatarColor,
        avatarUrl: user.avatarUrl,
      });
    }
  }, [user]);

  const profileQuery = useQuery({
    queryKey: ["profile", user?.username],
    queryFn: async () => api.getUserProfile(user!.username),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (d) => {
      qc.setQueryData(["auth", "me"], d.user);
      qc.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
      setAvatarError(null);
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: api.uploadAvatar,
    onSuccess: (d) => {
      qc.setQueryData(["auth", "me"], d.user);
      qc.invalidateQueries({ queryKey: ["profile"] });
      setDraft((current) => ({ ...current, avatarUrl: d.user.avatarUrl }));
      setAvatarError(null);
    },
    onError: (e: Error) => setAvatarError(e.message),
  });

  function handleAvatarFile(file?: File) {
    setAvatarError(null);
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setAvatarError("Use a PNG, JPG, JPEG, or WEBP image.");
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      setAvatarError("Use an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatarDataUrl = String(reader.result || "");
      setDraft((current) => ({ ...current, avatarUrl: avatarDataUrl }));
      uploadAvatarMutation.mutate(avatarDataUrl);
    };
    reader.onerror = () => setAvatarError("Could not read that image. Try another file.");
    reader.readAsDataURL(file);
  }

  if (isPending) {
    return <div className="mx-auto min-h-screen max-w-md px-4 py-20 text-center text-muted-foreground">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto min-h-screen max-w-md px-4 py-20">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
            <LogIn className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-3xl font-black">Sign in to Explorisity</h1>
          <p className="mb-6 text-sm text-muted-foreground">Create your student profile, post updates, and follow other students.</p>
          <div className="flex gap-2">
            <button onClick={() => openSignIn("signin")} className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground">Sign In</button>
            <button onClick={() => openSignIn("signup")} className="flex-1 rounded-xl bg-muted py-3 font-bold text-foreground">Create Account</button>
          </div>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;
  const posts = profile?.posts ?? [];

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <section className="mb-6 rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="relative">
            <AvatarDisplay src={draft.avatarUrl} name={draft.displayName || user.username} color={draft.avatarColor} />

            {editing && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg"
                  aria-label="Upload profile picture"
                >
                  <Camera className="h-5 w-5" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleAvatarFile(e.target.files?.[0])} />
              </>
            )}
          </div>

          <div className="min-w-[260px] flex-1">
            {editing ? (
              <div className="space-y-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-black hover:bg-muted">
                  {uploadAvatarMutation.isPending ? "Uploading picture..." : "Upload profile picture"}
                </button>
                {avatarError && <p className="text-xs font-bold text-red-600">{avatarError}</p>}

                <input value={draft.displayName} onChange={(e) => setDraft((d) => ({ ...d, displayName: e.target.value }))} placeholder="Display name" className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-xl font-black" />
                <textarea value={draft.bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} placeholder="Bio" rows={3} className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium" />
                <input value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} placeholder="Email" type="email" className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium" />

                <div className="flex gap-2">
                  <button
                    onClick={() => updateMutation.mutate({ displayName: draft.displayName, bio: draft.bio || null, email: draft.email || null, avatarColor: draft.avatarColor, avatarUrl: draft.avatarUrl })}
                    disabled={updateMutation.isPending || uploadAvatarMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button onClick={() => setEditing(false)} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-black hover:bg-muted">
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-3xl font-black">{user.displayName}</h1>
                    <p className="mt-1 text-sm font-bold text-muted-foreground">@{user.username}</p>
                    {user.bio && <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">{user.bio}</p>}
                  </div>

                  <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-black hover:bg-muted">
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <div className="rounded-2xl bg-background px-4 py-3">
                    <p className="text-xl font-black">{profile?.followerCount ?? 0}</p>
                    <p className="text-xs font-bold text-muted-foreground">Followers</p>
                  </div>
                  <div className="rounded-2xl bg-background px-4 py-3">
                    <p className="text-xl font-black">{profile?.followingCount ?? 0}</p>
                    <p className="text-xs font-bold text-muted-foreground">Following</p>
                  </div>
                  <div className="rounded-2xl bg-background px-4 py-3">
                    <p className="text-xl font-black">{posts.length}</p>
                    <p className="text-xs font-bold text-muted-foreground">Posts</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="mb-6">
        <EasyPostWidget />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Your posts</h2>
          <span className="text-sm font-bold text-muted-foreground">{posts.length} total</span>
        </div>

        {profileQuery.isLoading && <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm font-bold text-muted-foreground">Loading your posts...</div>}

        {!profileQuery.isLoading && posts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <h3 className="text-xl font-black">You have not posted anything yet.</h3>
            <p className="mt-2 text-sm font-medium text-muted-foreground">Use the post widget above to share your first update.</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} canEdit />
        ))}
      </section>
    </div>
  );
}
