import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function NotificationBell() {
  const { user } = useAuth();

  const summaryQuery = useQuery({
    queryKey: ["notification-summary"],
    queryFn: api.getNotificationSummary,
    enabled: !!user,
    refetchInterval: 15_000,
  });

  if (!user) return null;

  const unread = summaryQuery.data?.unreadCount ?? 0;

  return (
    <Link
      href="/notifications"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card transition hover:bg-muted"
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />

      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
