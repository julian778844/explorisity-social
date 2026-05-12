import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Heart, MessageCircle, UserPlus } from "lucide-react";
import { api, type AppNotification } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function formatTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function NotificationIcon({ type }: { type: string }) {
  if (type.includes("follow")) return <UserPlus className="h-5 w-5" />;
  if (type.includes("message")) return <MessageCircle className="h-5 w-5" />;
  if (type.includes("like")) return <Heart className="h-5 w-5" />;
  return <Bell className="h-5 w-5" />;
}

function ActorAvatar({ notification }: { notification: AppNotification }) {
  const actor = notification.actor;

  if (actor?.avatarUrl) {
    return (
      <img
        src={actor.avatarUrl}
        alt={actor.displayName}
        className="h-11 w-11 rounded-2xl object-cover"
      />
    );
  }

  if (actor) {
    return (
      <div
        className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black text-white"
        style={{ backgroundColor: actor.avatarColor }}
      >
        {actor.displayName.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
      <Bell className="h-5 w-5" />
    </div>
  );
}

export default function NotificationsPage() {
  const { user, isPending, openSignIn } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.listNotifications()).notifications,
    enabled: !!user,
    refetchInterval: 15_000,
  });

  const markReadMutation = useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notification-summary"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notification-summary"] });
    },
  });

  if (isPending) {
    return (
      <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 text-center text-sm font-bold text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto min-h-screen max-w-md px-4 py-20">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Bell className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black">Sign in to view notifications</h1>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Notifications show follows, likes, comments, messages, and requests.
          </p>
          <button
            onClick={() => openSignIn("signin")}
            className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const notifications = notificationsQuery.data ?? [];

  function openNotification(notification: AppNotification) {
    markReadMutation.mutate(notification.id);

    if (notification.href) {
      navigate(notification.href);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <section className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
            Activity center
          </p>
          <h1 className="text-3xl font-black">Notifications</h1>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Follows, likes, comments, messages, requests, and student activity.
          </p>
        </div>

        {notifications.some((n) => !n.readAt) && (
          <button
            onClick={() => markAllMutation.mutate()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-black hover:bg-muted"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </section>

      {notificationsQuery.isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      )}

      {!notificationsQuery.isLoading && notifications.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-black">No notifications yet.</h2>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            When people follow, like, comment, or message you, it will show here.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            onClick={() => openNotification(notification)}
            className={`flex w-full items-start gap-3 rounded-3xl border p-4 text-left transition hover:bg-muted ${
              notification.readAt
                ? "border-border bg-card"
                : "border-primary/30 bg-primary/5"
            }`}
          >
            <ActorAvatar notification={notification} />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-black">{notification.title}</p>
                {!notification.readAt && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
                    New
                  </span>
                )}
              </div>

              {notification.body && (
                <p className="mt-1 line-clamp-2 text-sm font-medium text-muted-foreground">
                  {notification.body}
                </p>
              )}

              <p className="mt-2 text-xs font-bold text-muted-foreground">
                {formatTime(notification.createdAt)}
              </p>
            </div>

            <div className="rounded-2xl bg-muted p-2 text-muted-foreground">
              <NotificationIcon type={notification.type} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
