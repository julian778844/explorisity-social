import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Inbox, MessageCircle, Search, Send, Shield, X } from "lucide-react";
import { api, type DirectMessageConversation, type DirectMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import FeedSkeleton from "@/components/FeedSkeleton";

function formatTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function Avatar({
  src,
  name,
  color,
  size = "md",
}: {
  src?: string | null;
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-9 w-9" : "h-10 w-10";

  if (src) {
    return <img src={src} alt={name} className={`${sizeClass} rounded-2xl object-cover`} />;
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-2xl text-sm font-black text-white`}
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function ConversationRow({
  conversation,
  selected,
  onClick,
}: {
  conversation: DirectMessageConversation;
  selected: boolean;
  onClick: () => void;
}) {
  const other = conversation.otherUser;

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
        selected ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted"
      }`}
    >
      <Avatar
        src={other?.avatarUrl}
        name={other?.displayName ?? "User"}
        color={other?.avatarColor ?? "#7c3aed"}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-black">{other?.displayName ?? "Explorisity user"}</p>
          <span className="shrink-0 text-[11px] font-bold text-muted-foreground">
            {formatTime(conversation.lastMessageAt ?? conversation.updatedAt)}
          </span>
        </div>

        <p className="truncate text-xs font-semibold text-muted-foreground">
          @{other?.username ?? "user"}
        </p>

        <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
          {conversation.lastMessage ?? "No messages yet."}
        </p>

        <div className="mt-1 flex flex-wrap gap-1">
          {conversation.isRequest && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
              Message request
            </span>
          )}

          {conversation.unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
              {conversation.unreadCount} unread
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ChatBubble({
  message,
  isMine,
}: {
  message: DirectMessage;
  isMine: boolean;
}) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ${
          isMine
            ? "rounded-br-lg bg-primary text-primary-foreground"
            : "rounded-bl-lg border border-border bg-card"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm font-medium leading-6">{message.body}</p>
        <p className={`mt-1 text-[10px] font-bold ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const { user, isPending, openSignIn } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const conversationParam = params.get("conversation");

  const qc = useQueryClient();
  const listRef = useRef<HTMLDivElement | null>(null);

  const [tab, setTab] = useState<"inbox" | "requests">("inbox");
  const [query, setQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(
    conversationParam ? Number(conversationParam) : null,
  );
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationParam) {
      const id = Number(conversationParam);
      if (Number.isInteger(id)) setSelectedConversationId(id);
    }
  }, [conversationParam]);

  const summaryQuery = useQuery({
    queryKey: ["message-summary"],
    queryFn: api.getMessageSummary,
    enabled: !!user,
    refetchInterval: 12_000,
  });

  const conversationsQuery = useQuery({
    queryKey: ["message-conversations", tab, query],
    queryFn: async () => (await api.listMessageConversations(tab, query)).conversations,
    enabled: !!user,
    refetchInterval: 12_000,
  });

  const selectedConversation = useMemo(() => {
    return (conversationsQuery.data ?? []).find((item) => item.id === selectedConversationId) ?? null;
  }, [conversationsQuery.data, selectedConversationId]);

  const messagesQuery = useQuery({
    queryKey: ["direct-messages", selectedConversationId],
    queryFn: async () => {
      const result = await api.listDirectMessages(selectedConversationId!);
      return result;
    },
    enabled: !!user && !!selectedConversationId,
    refetchInterval: 8_000,
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messagesQuery.data?.messages?.length, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      api.markConversationRead(selectedConversationId).catch(() => {});
      qc.invalidateQueries({ queryKey: ["message-summary"] });
      qc.invalidateQueries({ queryKey: ["message-conversations"] });
    }
  }, [selectedConversationId, qc]);

  const sendMutation = useMutation({
    mutationFn: async () => api.sendDirectMessage(selectedConversationId!, draft.trim()),
    onMutate: () => setError(null),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["direct-messages", selectedConversationId] });
      qc.invalidateQueries({ queryKey: ["message-conversations"] });
      qc.invalidateQueries({ queryKey: ["message-summary"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: number) => api.acceptMessageRequest(requestId),
    onSuccess: () => {
      setTab("inbox");
      qc.invalidateQueries({ queryKey: ["message-conversations"] });
      qc.invalidateQueries({ queryKey: ["message-summary"] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (requestId: number) => api.declineMessageRequest(requestId),
    onSuccess: () => {
      setSelectedConversationId(null);
      qc.invalidateQueries({ queryKey: ["message-conversations"] });
      qc.invalidateQueries({ queryKey: ["message-summary"] });
    },
  });

  if (isPending) {
    return (
      <div className="mx-auto min-h-screen max-w-5xl px-4 py-10">
        <FeedSkeleton count={3} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto min-h-screen max-w-md px-4 py-20">
        <div className="glass-card rounded-3xl border border-border p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <MessageCircle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black">Sign in to view messages</h1>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            Create your profile or sign in to send direct messages.
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

  const conversations = conversationsQuery.data ?? [];
  const messages = messagesQuery.data?.messages ?? [];
  const activeConversation = messagesQuery.data?.conversation ?? selectedConversation;
  const other = activeConversation?.otherUser ?? null;

  function openConversation(id: number) {
    setSelectedConversationId(id);
    navigate(`/messages?conversation=${id}`);
  }

  function send() {
    if (!selectedConversationId) return;
    if (!draft.trim()) return;
    sendMutation.mutate();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col px-4 py-6">
      <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">Explorisity inbox</p>
          <h1 className="text-3xl font-black">Messages</h1>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2 text-sm font-black">
          <Inbox className="h-4 w-4 text-primary" />
          {summaryQuery.data?.unreadTotal ?? 0} unread
        </div>
      </section>

      <div className="grid min-h-[70dvh] overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-[360px_1fr]">
        <aside className={`${selectedConversationId ? "hidden lg:flex" : "flex"} flex-col border-r border-border`}>
          <div className="border-b border-border p-4">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
              <button
                onClick={() => setTab("inbox")}
                className={`rounded-xl py-2 text-sm font-black ${tab === "inbox" ? "bg-card shadow" : "text-muted-foreground"}`}
              >
                Inbox
              </button>
              <button
                onClick={() => setTab("requests")}
                className={`rounded-xl py-2 text-sm font-black ${tab === "requests" ? "bg-card shadow" : "text-muted-foreground"}`}
              >
                Requests
                {(summaryQuery.data?.pendingRequestCount ?? 0) > 0 && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                    {summaryQuery.data?.pendingRequestCount}
                  </span>
                )}
              </button>
            </div>

            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-bold outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {conversationsQuery.isLoading && <FeedSkeleton count={3} />}

            {!conversationsQuery.isLoading && conversations.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border p-6 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                <h2 className="mt-3 font-black">No messages yet.</h2>
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  Start a conversation by visiting someone’s profile and clicking Message.
                </p>
              </div>
            )}

            {conversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                selected={conversation.id === selectedConversationId}
                onClick={() => openConversation(conversation.id)}
              />
            ))}
          </div>
        </aside>

        <section className={`${selectedConversationId ? "flex" : "hidden lg:flex"} min-h-[70dvh] flex-col`}>
          {!activeConversation && (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-black">Select a conversation</h2>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  Choose a conversation from your inbox or message requests.
                </p>
              </div>
            </div>
          )}

          {activeConversation && (
            <>
              <header className="flex items-center justify-between gap-3 border-b border-border p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedConversationId(null);
                      navigate("/messages");
                    }}
                    className="rounded-xl p-2 hover:bg-muted lg:hidden"
                    aria-label="Back to messages"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <Avatar
                    src={other?.avatarUrl}
                    name={other?.displayName ?? "User"}
                    color={other?.avatarColor ?? "#7c3aed"}
                    size="lg"
                  />

                  <div className="min-w-0">
                    <Link
                      href={other?.username ? `/profile/${other.username}` : "/messages"}
                      className="truncate text-base font-black hover:underline"
                    >
                      {other?.displayName ?? "Explorisity user"}
                    </Link>
                    <p className="truncate text-xs font-semibold text-muted-foreground">
                      @{other?.username ?? "user"}
                    </p>
                  </div>
                </div>

                {activeConversation.isRequest && activeConversation.requestId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptMutation.mutate(activeConversation.requestId!)}
                      className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-black text-primary-foreground"
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => declineMutation.mutate(activeConversation.requestId!)}
                      className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-black hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </button>
                  </div>
                )}
              </header>

              {activeConversation.isRequest && (
                <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
                  <Shield className="mr-1 inline h-4 w-4" />
                  This is a message request. Accept it to move the chat into your inbox.
                </div>
              )}

              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
                {messagesQuery.isLoading && <FeedSkeleton count={2} />}

                {!messagesQuery.isLoading && messages.length === 0 && (
                  <div className="flex min-h-full items-center justify-center text-center">
                    <div>
                      <h2 className="text-xl font-black">No messages yet.</h2>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        Send the first message below.
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <ChatBubble key={message.id} message={message} isMine={message.senderId === user.id} />
                ))}
              </div>

              {error && (
                <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700">
                  {error}
                </div>
              )}

              <footer className="border-t border-border bg-card p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message..."
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium outline-none focus:border-primary"
                  />

                  <button
                    onClick={send}
                    disabled={!draft.trim() || sendMutation.isPending}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-black text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
