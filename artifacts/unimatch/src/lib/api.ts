export type ApiUser = {
  id: number;
  username: string;
  displayName: string;
  bio: string | null;
  email: string | null;
  phone: string | null;
  avatarColor: string;
  avatarUrl: string | null;
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

export type AuthResponse = {
  user: ApiUser;
  authToken?: string;
};

export type SocialPlatform = "instagram" | "linkedin" | "facebook" | "twitter" | "tiktok" | "youtube";

export type Community = {
  id: number;
  schoolType: string;
  schoolId: string;
  name: string;
  description: string | null;
  createdById: number | null;
  createdAt: string;
};

export type PostAuthor = Pick<ApiUser, "id" | "username" | "displayName" | "avatarColor" | "avatarUrl">;

export type SocialPost = {
  id: number;
  authorId: number;
  communityId: number | null;
  category: "promotion" | "job" | "event" | "general";
  title: string;
  body: string;
  url: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  author?: PostAuthor | null;
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
};

export type PostComment = {
  id: number;
  postId: number;
  userId: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  author?: PostAuthor | null;
};


export type FollowerProfileItem = Pick<
  ApiUser,
  "id" | "username" | "displayName" | "bio" | "avatarColor" | "avatarUrl"
> & {
  followerCount: number;
  followingCount: number;
  isMutual: boolean;
  isNewFollower: boolean;
  followingByMe: boolean;
  canFollowBack: boolean;
};

export type FollowListResponse = {
  users: FollowerProfileItem[];
  canView: boolean;
};

export type FollowSuggestion = FollowerProfileItem & {
  reason: string;
  mutualCount: number;
};

export type UserProfileResponse = {
  user: ApiUser;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  posts: SocialPost[];
};

export type Conversation = {
  id: number;
  type: "dm" | "group" | string;
  name: string | null;
  communityId: number | null;
  createdById: number | null;
  createdAt: string;
};

export type Message = {
  id: number;
  conversationId: number;
  senderId: number;
  body: string;
  createdAt: string;
};


export type MessageUser = Pick<ApiUser, "id" | "username" | "displayName" | "bio" | "avatarColor" | "avatarUrl">;

export type DirectMessageConversation = {
  id: number;
  type: string;
  name: string | null;
  requestStatus: "pending" | "accepted" | "declined" | null;
  requestId: number | null;
  otherUser: MessageUser | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  updatedAt: string | null;
  unreadCount: number;
  isRequest: boolean;
};

export type DirectMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  recipientUserId: number | null;
  body: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  sender: PostAuthor | null;
};

export type MessageSummary = {
  unreadInboxCount: number;
  pendingRequestCount: number;
  unreadTotal: number;
};

export type UserFollow = {
  id: number;
  followingId: number;
  createdAt: string;
};

export type FollowItem = {
  id: number;
  schoolType: "undergrad" | "law" | "mba" | "med" | "trade";
  schoolId: string;
  createdAt: string;
};

const API_BASE = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/+$/, "");
const AUTH_TOKEN_KEY = "explorisity.authToken";

function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setAuthToken(token?: string | null) {
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    else localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  const token = getAuthToken();

  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "explorisity",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      if (j && typeof j.message === "string") msg = j.message;
    } catch {}
    throw new Error(msg);
  }

  return (await res.json()) as T;
}

async function authRequest(path: string, body: unknown): Promise<AuthResponse> {
  const response = await request<AuthResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  setAuthToken(response.authToken ?? null);
  return response;
}

export const api = {
  me: () => request<{ user: ApiUser | null }>("/auth/me"),

  signup: (b: { username: string; password: string; displayName?: string; email?: string; phone?: string; emailOptIn?: boolean; smsOptIn?: boolean; scholarshipAlerts?: boolean; jobAlerts?: boolean; schoolNewsAlerts?: boolean }) =>
    authRequest("/auth/signup", b),

  login: (b: { username: string; password: string }) => authRequest("/auth/login", b),

  logout: async () => {
    try {
      return await request<{ ok: true }>("/auth/logout", { method: "POST" });
    } finally {
      setAuthToken(null);
    }
  },

  requestPasswordReset: (emailOrUsername: string) =>
    request<{ ok: boolean; message?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ emailOrUsername }),
    }),

  updateProfile: (
    b: Partial<
      Pick<
        ApiUser,
        | "displayName"
        | "bio"
        | "email"
        | "phone"
        | "avatarColor"
        | "avatarUrl"
        | "instagram"
        | "linkedin"
        | "facebook"
        | "twitter"
        | "tiktok"
        | "youtube"
        | "emailOptIn"
        | "smsOptIn"
        | "scholarshipAlerts"
        | "jobAlerts"
        | "schoolNewsAlerts"
      >
    >,
  ) => request<{ user: ApiUser }>("/auth/me", { method: "PATCH", body: JSON.stringify(b) }),


getMessageSummary: () =>
  request<MessageSummary>("/messages/summary"),

listMessageConversations: (box: "inbox" | "requests" = "inbox", q = "") =>
  request<{ conversations: DirectMessageConversation[] }>(
    `/messages/conversations?box=${encodeURIComponent(box)}&q=${encodeURIComponent(q)}`
  ),

openDm: (recipientUserId: number) =>
  request<{ conversation: DirectMessageConversation }>("/messages/dm", {
    method: "POST",
    body: JSON.stringify({ recipientUserId }),
  }),

listDirectMessages: (conversationId: number) =>
  request<{ conversation: DirectMessageConversation | null; messages: DirectMessage[] }>(
    `/messages/conversations/${conversationId}/messages`
  ),

sendDirectMessage: (conversationId: number, body: string) =>
  request<{ message: DirectMessage }>(`/messages/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  }),

markConversationRead: (conversationId: number) =>
  request<{ ok: true }>(`/messages/conversations/${conversationId}/read`, { method: "POST" }),

acceptMessageRequest: (requestId: number) =>
  request<{ ok: true }>(`/messages/requests/${requestId}/accept`, { method: "POST" }),

declineMessageRequest: (requestId: number) =>
  request<{ ok: true }>(`/messages/requests/${requestId}/decline`, { method: "POST" }),

  listFollows: () => request<{ follows: FollowItem[] }>("/follows"),
  addFollow: (b: { schoolType: FollowItem["schoolType"]; schoolId: string }) =>
    request<{ ok: true }>("/follows", { method: "POST", body: JSON.stringify(b) }),
  removeFollow: (type: FollowItem["schoolType"], id: string) =>
    request<{ ok: true }>(`/follows/${type}/${encodeURIComponent(id)}`, { method: "DELETE" }),

  listUsers: () => request<{ users: ApiUser[] }>("/social/users"),
  listUserFollows: () => request<{ follows: UserFollow[] }>("/social/user-follows"),
  followUser: (id: number) => request<{ ok: true }>(`/social/users/${id}/follow`, { method: "POST" }),
  unfollowUser: (id: number) => request<{ ok: true }>(`/social/users/${id}/follow`, { method: "DELETE" }),

  getUserProfile: (username: string) =>
    request<UserProfileResponse>(`/social/users/${encodeURIComponent(username.replace(/^@+/, ""))}/profile`),


getFollowers: (userId: number) =>
  request<FollowListResponse>(`/social/users/${userId}/followers`),

getFollowing: (userId: number) =>
  request<FollowListResponse>(`/social/users/${userId}/following`),

getFollowSuggestions: () =>
  request<{ suggestions: FollowSuggestion[] }>("/social/suggestions"),

removeFollower: (userId: number) =>
  request<{ ok: true }>(`/social/users/${userId}/remove-follower`, { method: "DELETE" }),

updateFollowPrivacy: (b: { showFollowers: boolean; showFollowing: boolean }) =>
  request<{ ok: true }>("/social/me/follow-privacy", { method: "PATCH", body: JSON.stringify(b) }),

updatePinnedFollowers: (pinnedFollowerIds: number[]) =>
  request<{ ok: true; pinnedFollowerIds: number[] }>("/social/me/pinned-followers", {
    method: "PATCH",
    body: JSON.stringify({ pinnedFollowerIds }),
  }),

  listCommunities: () => request<{ communities: Community[] }>("/social/communities"),
  createCommunity: (b: { schoolType: string; schoolId: string; name: string; description?: string }) =>
    request<{ community: Community }>("/social/communities", { method: "POST", body: JSON.stringify(b) }),
  joinCommunity: (id: number) => request<{ ok: true }>(`/social/communities/${id}/join`, { method: "POST" }),

  listPosts: () => request<{ posts: SocialPost[] }>("/social/posts"),

  createPost: (b: { communityId?: number | null; category: SocialPost["category"]; title: string; body: string; url?: string | null; imageUrl?: string | null }) =>
    request<{ post: SocialPost }>("/social/posts", { method: "POST", body: JSON.stringify(b) }),

  updatePost: (id: number, b: { category?: SocialPost["category"]; title?: string; body?: string; url?: string | null; imageUrl?: string | null }) =>
    request<{ post: SocialPost }>(`/social/posts/${id}`, { method: "PATCH", body: JSON.stringify(b) }),

  likePost: (id: number) => request<{ ok: true }>(`/social/posts/${id}/like`, { method: "POST" }),
  unlikePost: (id: number) => request<{ ok: true }>(`/social/posts/${id}/like`, { method: "DELETE" }),

  listPostComments: (id: number) => request<{ comments: PostComment[] }>(`/social/posts/${id}/comments`),
  createPostComment: (id: number, body: string) =>
    request<{ comment: PostComment }>(`/social/posts/${id}/comments`, { method: "POST", body: JSON.stringify({ body }) }),

  listConversations: () => request<{ conversations: Conversation[] }>("/social/conversations"),
  createDm: (recipientUserId: number) =>
    request<{ conversation: Conversation }>("/social/conversations/dm", { method: "POST", body: JSON.stringify({ recipientUserId }) }),
  createGroup: (b: { name: string; memberIds: number[] }) =>
    request<{ conversation: Conversation }>("/social/conversations/group", { method: "POST", body: JSON.stringify(b) }),
  listMessages: (conversationId: number) => request<{ messages: Message[] }>(`/social/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: number, body: string) =>
    request<{ message: Message }>(`/social/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ body }) }),

  uploadAvatar: (avatarDataUrl: string) =>
    request<{ user: ApiUser }>("/upload/avatar", {
      method: "POST",
      body: JSON.stringify({ avatarDataUrl }),
    }),

  search: (q: string) =>
    request<{
      schools: Array<{ id: string | number; name: string; type: string; href?: string }>;
      users: ApiUser[];
      communities: Community[];
      posts: SocialPost[];
      opportunities: SocialPost[];
    }>(`/search?q=${encodeURIComponent(q)}`),
};
