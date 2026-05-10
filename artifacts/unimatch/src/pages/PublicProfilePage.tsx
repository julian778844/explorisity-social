import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User } from "lucide-react";
import { api } from "@/lib/api";

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params.username?.replace(/^@+/, "") ?? "";

  const userQuery = useQuery({
    queryKey: ["public-profile", username],
    queryFn: async () => {
      const results = await api.search(username);
      return results.users.find((u) => u.username.toLowerCase() === username.toLowerCase()) ?? null;
    },
    enabled: !!username,
  });

  if (userQuery.isLoading) {
    return <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 text-center text-muted-foreground">Loading profile...</div>;
  }

  const profile = userQuery.data;

  if (!profile) {
    return (
      <div className="mx-auto min-h-screen max-w-3xl px-4 py-10">
        <Link href="/search" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to search
        </Link>
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          <User className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h1 className="text-2xl font-black">User not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This profile may not exist yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <Link href="/search" className="mb-5 inline-flex items-center gap-2 text-sm font-black text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={profile.displayName} className="h-24 w-24 rounded-3xl object-cover shadow-xl" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl text-4xl font-black text-white shadow-xl" style={{ backgroundColor: profile.avatarColor }}>
              {profile.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-black">{profile.displayName}</h1>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{profile.bio}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
