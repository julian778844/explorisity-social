import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { universities } from "@/data/universities";
import { lawSchools } from "@/data/lawSchools";
import { mbaPrograms } from "@/data/mbaPrograms";
import { medSchools } from "@/data/medSchools";
import { tradeSchools } from "@/data/tradeSchools";
import { useAuth } from "@/lib/auth";
import { useFollows, type SchoolType } from "@/lib/follows";
import { api } from "@/lib/api";
import SchoolLogo from "@/components/SchoolLogo";
import SocialLinks, { SOCIAL_PLATFORMS } from "@/components/SocialLinks";
import type { SocialPlatform } from "@/lib/api";
import { Camera, Mail, Edit3, Heart, LogIn, Save, X } from "lucide-react";

const AVATAR_COLORS = ["#7C3AED", "#06B6D4", "#EC4899", "#F59E0B", "#10B981", "#EF4444", "#3B82F6", "#A855F7"];
const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024;

type ResolvedSchool = {
  type: SchoolType;
  id: string;
  name: string;
  loc: string;
  color: string;
  href: string;
  kind: string;
};

function resolveFollow(type: SchoolType, id: string): ResolvedSchool | null {
  if (type === "undergrad") {
    const u = universities.find((x) => x.id === id);
    return u ? { type, id, name: u.name, loc: u.location, color: u.color, href: `/university/${u.id}`, kind: "Undergrad" } : null;
  }
  if (type === "law") {
    const s = lawSchools.find((x) => x.id === id);
    return s ? { type, id, name: s.name, loc: s.loc, color: s.color, href: `/school/law/${s.id}`, kind: "Law" } : null;
  }
  if (type === "mba") {
    const s = mbaPrograms.find((x) => x.id === id);
    return s ? { type, id, name: s.name, loc: s.loc, color: s.color, href: `/school/mba/${s.id}`, kind: "MBA" } : null;
  }
  if (type === "med") {
    const s = medSchools.find((x) => x.id === id);
    return s ? { type, id, name: s.name, loc: s.loc, color: s.color, href: `/school/med/${s.id}`, kind: "Med" } : null;
  }
  if (type === "trade") {
    const s = tradeSchools.find((x) => x.id === id);
    return s ? { type, id, name: s.name, loc: s.loc, color: s.color, href: `/school/trade/${s.id}`, kind: "Trade" } : null;
  }
  return null;
}

function AvatarDisplay({
  src,
  name,
  color,
  size = "large",
}: {
  src?: string | null;
  name: string;
  color: string;
  size?: "small" | "large";
}) {
  const sizeClass = size === "large" ? "h-24 w-24 rounded-3xl text-4xl" : "h-11 w-11 rounded-xl text-base";

  if (src) {
    return (
      <img
        src={src}
        alt={`${name} profile picture`}
        className={`${sizeClass} flex-shrink-0 object-cover shadow-xl`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex flex-shrink-0 items-center justify-center font-black text-white shadow-xl`}
      style={{ backgroundColor: color }}
    >
      {name.charAt(0).toUpperCase() || "?"}
    </div>
  );
}

export default function ProfilePage() {
  const { user, openSignIn, isPending, signOut } = useAuth();
  const { list: follows, toggle } = useFollows();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    displayName: string;
    bio: string;
    email: string;
    avatarColor: string;
    avatarUrl: string | null;
  } & Record<SocialPlatform, string>>({
    displayName: "",
    bio: "",
    email: "",
    avatarColor: AVATAR_COLORS[0]!,
    avatarUrl: null,
    instagram: "",
    linkedin: "",
    facebook: "",
    twitter: "",
    tiktok: "",
    youtube: "",
  });

  useEffect(() => {
    if (user) {
      setDraft({
        displayName: user.displayName,
        bio: user.bio ?? "",
        email: user.email ?? "",
        avatarColor: user.avatarColor,
        avatarUrl: user.avatarUrl ?? null,
        instagram: user.instagram ?? "",
        linkedin: user.linkedin ?? "",
        facebook: user.facebook ?? "",
        twitter: user.twitter ?? "",
        tiktok: user.tiktok ?? "",
        youtube: user.youtube ?? "",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (d) => {
      qc.setQueryData(["auth", "me"], d.user);
      setEditing(false);
      setAvatarError(null);
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: api.uploadAvatar,
    onSuccess: (d) => {
      qc.setQueryData(["auth", "me"], d.user);
      setDraft((current) => ({ ...current, avatarUrl: d.user.avatarUrl }));
      setAvatarError(null);
    },
    onError: (e: Error) => setAvatarError(e.message),
  });

  const handleAvatarFile = (file?: File) => {
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
  };

  if (isPending) {
    return <div className="mx-auto min-h-screen max-w-md px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto min-h-screen max-w-md px-4 py-20">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
            <LogIn className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-3xl font-black">Sign in to Explorisity</h1>
          <p className="mb-6 text-sm text-muted-foreground">Create your student profile, save schools, and start posting.</p>
          <div className="flex gap-2">
            <button
              onClick={() => openSignIn("signin")}
              className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground transition-all hover-elevate"
              data-testid="button-open-signin"
            >
              Sign In
            </button>
            <button
              onClick={() => openSignIn("signup")}
              className="flex-1 rounded-xl bg-muted py-3 font-bold text-foreground transition-all hover-elevate"
              data-testid="button-open-signup"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const followedSchools = follows
    .map((f) => resolveFollow(f.schoolType, f.schoolId))
    .filter((s): s is ResolvedSchool => !!s);

  const displayName = editing ? draft.displayName : user.displayName;
  const avatarUrl = editing ? draft.avatarUrl : user.avatarUrl;
  const avatarColor = editing ? draft.avatarColor : user.avatarColor;

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <div className="mb-8 rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8">
        <div className="flex flex-wrap items-start gap-6">
          <div className="relative">
            <AvatarDisplay src={avatarUrl} name={displayName} color={avatarColor} />

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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => handleAvatarFile(e.target.files?.[0])}
                />
              </>
            )}
          </div>

          {editing ? (
            <div className="min-w-[260px] flex-1 space-y-3">
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-black hover:bg-muted"
                >
                  {uploadAvatarMutation.isPending ? "Uploading picture..." : "Upload profile picture"}
                </button>
                <p className="mt-1 text-xs font-medium text-muted-foreground">PNG, JPG, JPEG, or WEBP. Max 2MB. Saves to your account.</p>
                {avatarError && <p className="mt-1 text-xs font-bold text-red-600">{avatarError}</p>}
              </div>

              <input
                value={draft.displayName}
                onChange={(e) => setDraft((d) => ({ ...d, displayName: e.target.value }))}
                placeholder="Display name"
                className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-xl font-bold focus:border-primary focus:outline-none"
                data-testid="input-display-name"
              />

              <textarea
                value={draft.bio}
                onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                placeholder="Bio (e.g., Senior · CS major · UPenn '30 hopeful)"
                rows={2}
                className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm focus:border-primary focus:outline-none"
                data-testid="input-bio"
              />

              <input
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                placeholder="Email (optional)"
                type="email"
                className="w-full rounded-lg border border-border bg-muted px-4 py-2 text-sm focus:border-primary focus:outline-none"
                data-testid="input-email"
              />

              <div>
                <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Avatar Color</div>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setDraft((d) => ({ ...d, avatarColor: c }))}
                      className={`h-8 w-8 rounded-full transition-all ${draft.avatarColor === c ? "scale-110 ring-2 ring-foreground ring-offset-2" : ""}`}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Social Profiles</div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SOCIAL_PLATFORMS.map(({ key, label, Icon, brand }) => (
                    <label key={key} className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 transition-colors focus-within:border-primary">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-white" style={{ backgroundColor: brand }} aria-hidden>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <input
                        value={draft[key]}
                        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                        placeholder={label}
                        className="min-w-0 flex-1 border-0 bg-transparent text-sm focus:outline-none"
                        data-testid={`input-social-${key}`}
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-1.5 text-[11px] text-muted-foreground">Username, @handle, or full URL — all work.</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateMutation.mutate({
                      displayName: draft.displayName,
                      bio: draft.bio || null,
                      email: draft.email || null,
                      avatarColor: draft.avatarColor,
                      avatarUrl: draft.avatarUrl || null,
                      instagram: draft.instagram || null,
                      linkedin: draft.linkedin || null,
                      facebook: draft.facebook || null,
                      twitter: draft.twitter || null,
                      tiktok: draft.tiktok || null,
                      youtube: draft.youtube || null,
                    })
                  }
                  disabled={updateMutation.isPending || uploadAvatarMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50 hover-elevate"
                  data-testid="button-save-profile"
                >
                  <Save className="h-4 w-4" /> {updateMutation.isPending ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-bold text-foreground hover-elevate"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>

              {updateMutation.error && <div className="text-xs text-red-600">{(updateMutation.error as Error).message}</div>}
            </div>
          ) : (
            <div className="min-w-[260px] flex-1">
              <h1 className="mb-1 text-3xl font-black">{user.displayName}</h1>
              <div className="mb-2 text-sm text-muted-foreground">@{user.username} · joined {user.createdAt.slice(0, 10)}</div>
              {user.bio && <p className="mb-2 text-foreground">{user.bio}</p>}
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </div>
              )}
              <SocialLinks user={user} size="md" className="mt-3" />
              <div className="mt-4 flex gap-2">
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover-elevate" data-testid="button-edit-profile">
                  <Edit3 className="h-4 w-4" /> Edit Profile
                </button>
                <button
                  onClick={() => {
                    if (confirm("Sign out?")) void signOut();
                  }}
                  className="rounded-lg bg-muted px-4 py-2 text-sm font-bold text-foreground hover-elevate"
                  data-testid="button-signout"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-shrink-0 gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-primary">{follows.length}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Schools</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <Heart className="h-5 w-5 fill-current text-primary" /> Schools You Follow
          </h2>
          <span className="text-xs text-muted-foreground">{followedSchools.length}</span>
        </div>

        {followedSchools.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card py-12 text-center text-muted-foreground">
            <Heart className="mx-auto mb-3 h-8 w-8 opacity-40" />
            <p className="text-sm">Not following any schools yet</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
              <Link href="/rankings" className="text-primary hover:underline">Undergrad →</Link>
              <Link href="/law" className="text-primary hover:underline">Law →</Link>
              <Link href="/med" className="text-primary hover:underline">Med →</Link>
              <Link href="/mba" className="text-primary hover:underline">MBA →</Link>
              <Link href="/trade" className="text-primary hover:underline">Trade →</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {followedSchools.map((s, i) => (
              <motion.div
                key={`${s.type}-${s.id}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-colors hover:border-primary/40"
              >
                <Link href={s.href} className="flex min-w-0 flex-1 items-center gap-3">
                  <SchoolLogo id={s.id} name={s.name} color={s.color} size={40} rounded="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold">{s.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{s.loc}</div>
                  </div>
                </Link>
                <span className="flex-shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.kind}</span>
                <button
                  onClick={() => toggle(s.type, s.id)}
                  className="rounded-lg p-2 text-primary transition-all hover:bg-primary/10"
                  data-testid={`unfollow-${s.id}`}
                  aria-label="Unfollow"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
