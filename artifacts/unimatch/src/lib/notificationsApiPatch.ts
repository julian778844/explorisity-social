/*
Paste these types and methods into artifacts/unimatch/src/lib/api.ts.

Types:
*/

export type AppNotification = {
  id: number;
  userId: number;
  actorUserId: number | null;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  imageUrl: string | null;
  readAt: string | null;
  createdAt: string;
  actor: {
    id: number;
    username: string;
    displayName: string;
    avatarColor: string;
    avatarUrl: string | null;
  } | null;
};

/*
Methods to add inside export const api = { ... }:

  listNotifications: () =>
    request<{ notifications: AppNotification[] }>("/notifications"),

  getNotificationSummary: () =>
    request<{ unreadCount: number }>("/notifications/summary"),

  markNotificationRead: (id: number) =>
    request<{ ok: true }>(`/notifications/${id}/read`, { method: "POST" }),

  markAllNotificationsRead: () =>
    request<{ ok: true }>("/notifications/read-all", { method: "POST" }),

*/
