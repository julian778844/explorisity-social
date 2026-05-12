import { useEffect, useState } from "react";
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
import { Mail, Edit3, Heart, LogIn, Save, X } from "lucide-react";

const AVATAR_COLORS = ["#7C3AED", "#06B6D4", "#EC4899", "#F59E0B", "#10B981", "#EF4444", "#3B82F6", "#A855F7"];

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

export default function ProfilePage() {
  const { user, openSignIn, isPending, signOut } = useAuth();
  const { list: follows, toggle } = useFollows();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{
    displayName: string; bio: string; email: string; avatarColor: string;
  } & Record<SocialPlatform, string>>({
    displayName: "", bio: "", email: "", avatarColor: AVATAR_COLORS[0]!,
    instagram: "", linkedin: "", facebook: "", twitter: "", tiktok: "", youtube: "",
  });

  useEffect(() => {
    if (user) setDraft({
      displayName: user.displayName, bio: user.bio ?? "", email: user.email ?? "", avatarColor: user.avatarColor,
      instagram: user.instagram ?? "", linkedin: user.linkedin ?? "", facebook: user.facebook ?? "",
      twitter: user.twitter ?? "", tiktok: user.tiktok ?? "", youtube: user.youtube ?? "",
    });
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (d) => {
      qc.setQueryData(["auth", "me"], d.user);
      setEditing(false);
    },
  });

  if (isPending) {
    return <div className="min-h-screen px-4 py-20 max-w-md mx-auto text-center text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen px-4 py-20 max-w-md mx-auto">
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground mb-4 shadow-lg">
            <LogIn className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black mb-2">Sign in to Explorisity</h1>
          <p className="text-muted-foreground mb-6 text-sm">Username + password — your followed schools sync across every device you sign in on.</p>
          <div className="flex gap-2">
            <button
              onClick={() => openSignIn("signin")}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover-elevate transition-all"
              data-testid="button-open-signin"
            >Sign In</button>
            <button
              onClick={() => openSignIn("signup")}
              className="flex-1 py-3 rounded-xl bg-muted text-foreground font-bold hover-elevate transition-all"
              data-testid="button-open-signup"
            >Create Account</button>
          </div>
        </div>
      </div>
    );
  }

  const followedSchools = follows
    .map((f) => resolveFollow(f.schoolType, f.schoolId))
    .filter((s): s is ResolvedSchool => !!s);

  return (
    <div className="min-h-screen px-4 py-10 max-w-5xl mx-auto">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 mb-8">
        <div className="flex items-start gap-6 flex-wrap">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-4xl font-black flex-shrink-0 shadow-xl"
            style={{ backgroundColor: editing ? draft.avatarColor : user.avatarColor }}
          >
            {(editing ? draft.displayName : user.displayName).charAt(0).toUpperCase() || "?"}
          </div>

          {editing ? (
            <div className="flex-1 min-w-[260px] space-y-3">
              <input
                value={draft.displayName}
                onChange={(e) => setDraft((d) => ({ ...d, displayName: e.target.value }))}
                placeholder="Display name"
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none font-bold text-xl"
                data-testid="input-display-name"
              />
              <textarea
                value={draft.bio}
                onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                placeholder="Bio (e.g., Senior · CS major · UPenn '30 hopeful)"
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none text-sm"
                data-testid="input-bio"
              />
              <input
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                placeholder="Email (optional)"
                type="email"
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none text-sm"
                data-testid="input-email"
              />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Avatar Color</div>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setDraft((d) => ({ ...d, avatarColor: c }))}
                      className={`w-8 h-8 rounded-full transition-all ${draft.avatarColor === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""}`}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Social Profiles</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SOCIAL_PLATFORMS.map(({ key, label, Icon, brand }) => (
                    <label key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border focus-within:border-primary transition-colors">
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: brand }}
                        aria-hidden
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <input
                        value={draft[key]}
                        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                        placeholder={label}
                        className="flex-1 bg-transparent border-0 focus:outline-none text-sm min-w-0"
                        data-testid={`input-social-${key}`}
                      />
                    </label>
                  ))}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1.5">Username, @handle, or full URL — all work.</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateMutation.mutate({
                    displayName: draft.displayName,
                    bio: draft.bio || null,
                    email: draft.email || null,
                    avatarColor: draft.avatarColor,
                    instagram: draft.instagram || null,
                    linkedin: draft.linkedin || null,
                    facebook: draft.facebook || null,
                    twitter: draft.twitter || null,
                    tiktok: draft.tiktok || null,
                    youtube: draft.youtube || null,
                  })}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover-elevate disabled:opacity-50"
                  data-testid="button-save-profile"
                >
                  <Save className="w-4 h-4" /> {updateMutation.isPending ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground font-bold text-sm hover-elevate"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
              {updateMutation.error && (
                <div className="text-xs text-red-600">{(updateMutation.error as Error).message}</div>
              )}
            </div>
          ) : (
            <div className="flex-1 min-w-[260px]">
              <h1 className="text-3xl font-black mb-1">{user.displayName}</h1>
              <div className="text-sm text-muted-foreground mb-2">@{user.username} · joined {user.createdAt.slice(0, 10)}</div>
              {user.bio && <p className="text-foreground mb-2">{user.bio}</p>}
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </div>
              )}
              <SocialLinks user={user} size="md" className="mt-3" />
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-bold text-sm hover-elevate" data-testid="button-edit-profile">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
                <button
                  onClick={() => { if (confirm("Sign out?")) void signOut(); }}
                  className="px-4 py-2 rounded-lg bg-muted text-foreground font-bold text-sm hover-elevate"
                  data-testid="button-signout"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-6 flex-shrink-0">
            <div className="text-center">
              <div className="text-3xl font-black text-primary">{follows.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Schools</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-current" /> Schools You Follow
          </h2>
          <span className="text-xs text-muted-foreground">{followedSchools.length}</span>
        </div>

        {followedSchools.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-border/60 bg-card text-muted-foreground">
            <Heart className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Not following any schools yet</p>
            <div className="flex justify-center gap-2 mt-3 text-xs flex-wrap">
              <Link href="/rankings" className="text-primary hover:underline">Undergrad →</Link>
              <Link href="/law" className="text-primary hover:underline">Law →</Link>
              <Link href="/med" className="text-primary hover:underline">Med →</Link>
              <Link href="/mba" className="text-primary hover:underline">MBA →</Link>
              <Link href="/trade" className="text-primary hover:underline">Trade →</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {followedSchools.map((s, i) => (
              <motion.div
                key={`${s.type}-${s.id}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card group hover:border-primary/40 transition-colors"
              >
                <Link href={s.href} className="flex items-center gap-3 flex-1 min-w-0">
                  <SchoolLogo id={s.id} name={s.name} color={s.color} size={40} rounded="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.loc}</div>
                  </div>
                </Link>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-bold flex-shrink-0">{s.kind}</span>
                <button
                  onClick={() => toggle(s.type, s.id)}
                  className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-all"
                  data-testid={`unfollow-${s.id}`}
                  aria-label="Unfollow"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
