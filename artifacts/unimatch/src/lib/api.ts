export type ApiUser = {
  id: number;
  username: string;
  displayName: string;
  bio: string | null;
  email: string | null;
  phone: string | null;
  avatarColor: string;
  instagram: string | null;
  linkedin: string | null;
  facebook: string | null;
  twitter: string | null;
  tiktok: string | null;
  youtube: string | null;
  emailOptIn: boolean;
  smsOptIn: boolean;
  scholarshipAlerts: boolean;
  jobAlerts: boolean;
  schoolNewsAlerts: boolean;
  createdAt: string;
};

export type SocialPlatform = "instagram" | "linkedin" | "facebook" | "twitter" | "tiktok" | "youtube";



export type Community = {
  id: number;
  schoolType: string;
  schoolId: string;
  name: string;
  description: string | null;
  createdById: number | null;
  emailOptIn: boolean;
  smsOptIn: boolean;
  scholarshipAlerts: boolean;
  jobAlerts: boolean;
  schoolNewsAlerts: boolean;
  createdAt: string;
};

export type SocialPost = {
  id: number;
  authorId: number;
  communityId: number | null;
  category: "promotion" | "job" | "event" | "general";
  title: string;
  body: string;
  url: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Conversation = {
  id: number;
  type: "dm" | "group" | string;
  name: string | null;
  communityId: number | null;
  createdById: number | null;
  emailOptIn: boolean;
  smsOptIn: boolean;
  scholarshipAlerts: boolean;
  jobAlerts: boolean;
  schoolNewsAlerts: boolean;
  createdAt: string;
};

export type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  body: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
  scholarshipAlerts: boolean;
  jobAlerts: boolean;
  schoolNewsAlerts: boolean;
  createdAt: string;
};

export type UserFollow = {
  id: number;
  followingId: number;
  emailOptIn: boolean;
  smsOptIn: boolean;
  scholarshipAlerts: boolean;
  jobAlerts: boolean;
  schoolNewsAlerts: boolean;
  createdAt: string;
};

export type FollowItem = {
  id: number;
  schoolType: "undergrad" | "law" | "mba" | "med" | "trade";
  schoolId: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
  scholarshipAlerts: boolean;
  jobAlerts: boolean;
  schoolNewsAlerts: boolean;
  createdAt: string;
};

const API_BASE = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/+$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "explorisity",
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error("Could not reach the Explorisity server. Check VITE_API_URL in Vercel and CORS_ORIGINS or FRONTEND_URL in Render.");
  }

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      if (j && typeof j.error === "string") msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export const api = {
  me: () => request<{ user: ApiUser | null }>("/auth/me"),
  signup: (b: { username: string; password: string; displayName?: string; email?: string; phone?: string; emailOptIn?: boolean; smsOptIn?: boolean; scholarshipAlerts?: boolean; jobAlerts?: boolean; schoolNewsAlerts?: boolean }) =>
    request<{ user: ApiUser }>("/auth/signup", { method: "POST", body: JSON.stringify(b) }),
  login: (b: { username: string; password: string }) =>
    request<{ user: ApiUser }>("/auth/login", { method: "POST", body: JSON.stringify(b) }),
  logout: () => request<{ ok: true }>("/auth/logout", { method: "POST" }),
  updateProfile: (
    b: Partial<
      Pick<
        ApiUser,
        | "displayName"
        | "bio"
        | "email"
        | "avatarColor"
        | "instagram"
        | "linkedin"
        | "facebook"
        | "twitter"
        | "tiktok"
        | "youtube"
      >
    >,
  ) => request<{ user: ApiUser }>("/auth/me", { method: "PATCH", body: JSON.stringify(b) }),
  listFollows: () => request<{ follows: FollowItem[] }>("/follows"),
  addFollow: (b: { schoolType: FollowItem["schoolType"]; schoolId: string }) =>
    request<{ ok: true }>("/follows", { method: "POST", body: JSON.stringify(b) }),
  removeFollow: (type: FollowItem["schoolType"], id: string) =>
    request<{ ok: true }>(`/follows/${type}/${encodeURIComponent(id)}`, { method: "DELETE" }),
  listUsers: () => request<{ users: ApiUser[] }>("/social/users"),
  listUserFollows: () => request<{ follows: UserFollow[] }>("/social/user-follows"),
  followUser: (id: number) => request<{ ok: true }>(`/social/users/${id}/follow`, { method: "POST" }),
  unfollowUser: (id: number) => request<{ ok: true }>(`/social/users/${id}/follow`, { method: "DELETE" }),
  listCommunities: () => request<{ communities: Community[] }>("/social/communities"),
  createCommunity: (b: { schoolType: string; schoolId: string; name: string; description?: string }) =>
    request<{ community: Community }>("/social/communities", { method: "POST", body: JSON.stringify(b) }),
  joinCommunity: (id: number) => request<{ ok: true }>(`/social/communities/${id}/join`, { method: "POST" }),
  listPosts: () => request<{ posts: SocialPost[] }>("/social/posts"),
  createPost: (b: { communityId?: number | null; category: SocialPost["category"]; title: string; body: string; url?: string | null }) =>
    request<{ post: SocialPost }>("/social/posts", { method: "POST", body: JSON.stringify(b) }),
  listConversations: () => request<{ conversations: Conversation[] }>("/social/conversations"),
  createDm: (recipientUserId: number) =>
    request<{ conversation: Conversation }>("/social/conversations/dm", { method: "POST", body: JSON.stringify({ recipientUserId }) }),
  createGroup: (b: { name: string; memberIds: number[] }) =>
    request<{ conversation: Conversation }>("/social/conversations/group", { method: "POST", body: JSON.stringify(b) }),
  listMessages: (conversationId: number) => request<{ messages: Message[] }>(`/social/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: number, body: string) =>
    request<{ message: Message }>(`/social/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ body }) }),

  search: (q: string) => request<{ schools: Array<{ id: string | number; name: string; type: string }>; users: ApiUser[]; communities: Community[] }>(`/search?q=${encodeURIComponent(q)}`),
};
