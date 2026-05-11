import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { api, type NotificationItem } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatTimeWithZone } from "@/lib/postTime";
import UserAvatar from "@/components/UserAvatar";

function notificationText(notification: NotificationItem) {
  const name = notification.actor?.displayName ?? "Someone";

  switch (notification.type) {
    case "follow":
      return `${name} followed you`;
    case "post_like":
      return `${name} liked your post`;
    case "post_comment":
      return `${name} commented on your post`;
    case "comment_reply":
      return `${name} replied to your comment`;
    case "mention":
      return `${name} mentioned you`;
    default:
      return `${name} interacted with your content`;
  }
}

function NotificationCard({
  notification,
  onOpen,
}: {
  notification: NotificationItem;
  onOpen: (notification: NotificationItem) => void;
}) {
  const preview = notification.commentPreview || notification.postPreview || notification.postTitle;

  return (
    <button
      onClick={() => onOpen(notification)}
      className={`grid w-full gap-3 rounded-3xl border p-5 text-left transition hover:bg-muted/60 sm:grid-cols-[auto_1fr_auto] ${
        notification.readAt ? "border-border bg-card" : "border-primary/30 bg-primary/5"
      }`}
    >
      <UserAvatar user={notification.actor} size="md" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-black">{notificationText(notification)}</h2>
          {!notification.readAt && <span className="h-2 w-2 rounded-full bg-primary" />}
        </div>
        {preview && (
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-muted-foreground">
            {preview}
          </p>
        )}
        <p className="mt-2 text-xs font-bold text-muted-foreground">
          {formatTimeWithZone(notification.createdAt)}
        </p>
      </div>
      <div className="self-center rounded-full border border-border px-3 py-1 text-xs font-black text-muted-foreground">
        {notification.readAt ? "Read" : "Unread"}
      </div>
    </button>
  );
}

export default function NotificationsPage() {
  const { user, openSignIn } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: api.listNotifications,
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  async function openNotification(notification: NotificationItem) {
    if (!notification.readAt) {
      await markRead.mutateAsync(notification.id);
    }
    navigate(notification.href);
  }

  if (!user) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bell className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-muted-foreground">
            Sign in to see follows, likes, comments, replies, and mentions tied to your Explorisity profile.
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

  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Notifications</h1>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">
              Follows, likes, comments, replies, and mentions connected to your account.
            </p>
          </div>
          <button
            onClick={() => markAllRead.mutate()}
            disabled={!unreadCount || markAllRead.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-black transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Unread</div>
            <div className="mt-1 text-3xl font-black text-primary">{unreadCount}</div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5">
            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Total</div>
            <div className="mt-1 text-3xl font-black">{notifications.length}</div>
          </div>
        </div>

        {notificationsQuery.isLoading && (
          <div className="rounded-3xl border border-border bg-card p-8 text-sm font-bold text-muted-foreground">
            Loading notifications...
          </div>
        )}

        {!notificationsQuery.isLoading && notifications.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bell className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black">No notifications yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-muted-foreground">
              When people follow you or interact with your posts, you&apos;ll see it here.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} onOpen={openNotification} />
          ))}
        </div>
      </div>
    </div>
  );
}
