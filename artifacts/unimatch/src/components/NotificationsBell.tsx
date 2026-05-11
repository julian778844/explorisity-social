import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { api, type NotificationItem } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatTimeWithZone } from "@/lib/postTime";
import UserAvatar from "@/components/UserAvatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

function NotificationPreview({ notification }: { notification: NotificationItem }) {
  const preview = notification.commentPreview || notification.postPreview || notification.postTitle;
  if (!preview) return null;

  return (
    <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-muted-foreground">
      {preview}
    </p>
  );
}

export default function NotificationsBell() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: api.listNotifications,
    enabled: !!user,
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (!user) return null;

  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const badge = unreadCount > 99 ? "99+" : unreadCount.toString();

  async function openNotification(notification: NotificationItem) {
    if (!notification.readAt) {
      await markRead.mutateAsync(notification.id);
    }
    navigate(notification.href);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card transition hover:bg-muted"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          data-testid="button-notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-black leading-none text-white shadow">
              {badge}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(390px,calc(100vw-1rem))] overflow-hidden rounded-2xl border-border bg-card p-0 shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-sm font-black">Notifications</h2>
            <p className="text-xs font-semibold text-muted-foreground">
              {unreadCount ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          <button
            onClick={() => markAllRead.mutate()}
            disabled={!unreadCount || markAllRead.isPending}
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-black transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all
          </button>
        </div>

        <div className="max-h-[430px] overflow-y-auto">
          {notificationsQuery.isLoading && (
            <div className="p-5 text-sm font-semibold text-muted-foreground">Loading notifications...</div>
          )}

          {!notificationsQuery.isLoading && notifications.length === 0 && (
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="font-black">No notifications yet</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
                When people follow you or interact with your posts, you&apos;ll see it here.
              </p>
            </div>
          )}

          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => openNotification(notification)}
              className="flex w-full gap-3 border-b border-border/60 p-4 text-left transition last:border-0 hover:bg-muted/60"
            >
              <UserAvatar user={notification.actor} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <p className="min-w-0 flex-1 text-sm font-black leading-5">
                    {notificationText(notification)}
                  </p>
                  {!notification.readAt && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <NotificationPreview notification={notification} />
                <p className="mt-1 text-[11px] font-bold text-muted-foreground">
                  {formatTimeWithZone(notification.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="border-t border-border p-3">
          <Link
            href="/notifications"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground"
          >
            View all notifications
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
