import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Plus, Send, Users, UserPlus, UserMinus } from "lucide-react";
import { api, type ApiUser, type Conversation, type SocialPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/PostCard";
import UserAvatar from "@/components/UserAvatar";

export default function SocialPage() {
  const { user, openSignIn } = useAuth();
  const qc = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [postCategory, setPostCategory] = useState<SocialPost["category"]>("general");
  const [postUrl, setPostUrl] = useState("");
  const [groupName, setGroupName] = useState("");

  const usersQuery = useQuery({ queryKey: ["social-users"], queryFn: async () => (await api.listUsers()).users, enabled: !!user });
  const followsQuery = useQuery({ queryKey: ["user-follows"], queryFn: async () => (await api.listUserFollows()).follows, enabled: !!user });
  const communitiesQuery = useQuery({ queryKey: ["communities"], queryFn: async () => (await api.listCommunities()).communities });
  const postsQuery = useQuery({ queryKey: ["posts"], queryFn: async () => (await api.listPosts()).posts });
  const conversationsQuery = useQuery({ queryKey: ["conversations"], queryFn: async () => (await api.listConversations()).conversations, enabled: !!user });
  const messagesQuery = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: async () => selectedConversation ? (await api.listMessages(selectedConversation)).messages : [],
    enabled: !!user && !!selectedConversation,
    refetchInterval: 5000,
  });

  const followedUserIds = useMemo(() => new Set((followsQuery.data ?? []).map((f) => f.followingId)), [followsQuery.data]);

  const followUser = useMutation({
    mutationFn: (target: { id: number; following: boolean }) => target.following ? api.unfollowUser(target.id) : api.followUser(target.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-follows"] }),
  });

  const createPost = useMutation({
    mutationFn: () => api.createPost({ title: postTitle, body: postBody, category: postCategory, url: postUrl || null }),
    onSuccess: () => {
      setPostTitle("");
      setPostBody("");
      setPostUrl("");
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const createDm = useMutation({
    mutationFn: (recipientUserId: number) => api.createDm(recipientUserId),
    onSuccess: (data) => {
      setSelectedConversation(data.conversation.id);
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const createGroup = useMutation({
    mutationFn: () => api.createGroup({ name: groupName, memberIds: (usersQuery.data ?? []).slice(0, 3).map((u) => u.id) }),
    onSuccess: (data) => {
      setGroupName("");
      setSelectedConversation(data.conversation.id);
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const sendMessage = useMutation({
    mutationFn: () => selectedConversation ? api.sendMessage(selectedConversation, messageBody) : Promise.reject(new Error("Choose a conversation first")),
    onSuccess: () => {
      setMessageBody("");
      qc.invalidateQueries({ queryKey: ["messages", selectedConversation] });
    },
  });

  const requireLogin = () => {
    if (!user) {
      openSignIn("signin");
      return false;
    }
    return true;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <section className="rounded-3xl border border-border bg-card/70 p-6 md:p-8 shadow-sm">
        <div className="max-w-3xl">
          <Badge className="mb-4" variant="secondary">Explorisity Social</Badge>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Communities, posts, DMs, and group chats for students.</h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Students can follow each other, join school communities, post opportunities, promote events, and message directly.
          </p>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Create a post</CardTitle>
            <CardDescription>Share promotions, jobs, events, or general updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Post title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
            <Select value={postCategory} onValueChange={(v) => setPostCategory(v as SocialPost["category"])}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="job">Job</SelectItem>
                <SelectItem value="event">Event</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Write the details..." value={postBody} onChange={(e) => setPostBody(e.target.value)} />
            <Input placeholder="Optional link" value={postUrl} onChange={(e) => setPostUrl(e.target.value)} />
            <Button onClick={() => requireLogin() && createPost.mutate()} disabled={createPost.isPending || !postTitle || !postBody}>
              Publish post
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> School communities</CardTitle>
            <CardDescription>Communities are tied to schools and programs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(communitiesQuery.data ?? []).slice(0, 6).map((community) => (
              <div key={community.id} className="rounded-xl border border-border p-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold">{community.name}</div>
                  <div className="text-xs text-muted-foreground">{community.schoolType} · {community.schoolId}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => requireLogin() && api.joinCommunity(community.id)}>Join</Button>
              </div>
            ))}
            {!communitiesQuery.data?.length && <p className="text-sm text-muted-foreground">No communities yet. Create school communities from the backend or seed script.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Follow students or start a DM.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(usersQuery.data ?? []).map((student: ApiUser) => {
              const following = followedUserIds.has(student.id);
              return (
                <div key={student.id} className="rounded-xl border border-border p-3 flex items-center justify-between gap-3">
                  <Link href={`/profile/${student.username}`} className="flex items-center gap-3 min-w-0 rounded-xl -m-2 p-2 transition hover:bg-muted">
                    <UserAvatar user={student} size="sm" />
                    <div className="min-w-0">
                      <div className="font-bold truncate">{student.displayName}</div>
                      <div className="text-xs text-muted-foreground truncate">@{student.username}</div>
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <Button size="sm" variant={following ? "secondary" : "outline"} onClick={() => followUser.mutate({ id: student.id, following })}>
                      {following ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" onClick={() => createDm.mutate(student.id)}>DM</Button>
                  </div>
                </div>
              );
            })}
            {!user && <Button onClick={() => openSignIn("signin")}>Sign in to see students</Button>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Messaging</CardTitle>
            <CardDescription>Direct messages and group chats. This version uses polling and can be upgraded to realtime websockets later.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Group chat name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
              <Button variant="outline" onClick={() => requireLogin() && createGroup.mutate()} disabled={!groupName}>Create group</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(conversationsQuery.data ?? []).map((conversation: Conversation) => (
                <Button key={conversation.id} size="sm" variant={selectedConversation === conversation.id ? "default" : "outline"} onClick={() => setSelectedConversation(conversation.id)}>
                  {conversation.name || `DM #${conversation.id}`}
                </Button>
              ))}
            </div>
            <div className="min-h-[220px] rounded-xl border border-border bg-muted/30 p-3 space-y-2">
              {(messagesQuery.data ?? []).map((message) => (
                <div key={message.id} className={`max-w-[85%] rounded-xl p-3 text-sm ${message.senderId === user?.id ? "ml-auto bg-primary text-primary-foreground" : "bg-background border border-border"}`}>
                  {message.body}
                </div>
              ))}
              {selectedConversation && !messagesQuery.data?.length && <p className="text-sm text-muted-foreground">No messages yet.</p>}
              {!selectedConversation && <p className="text-sm text-muted-foreground">Choose or start a conversation.</p>}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Write a message..." value={messageBody} onChange={(e) => setMessageBody(e.target.value)} />
              <Button onClick={() => requireLogin() && sendMessage.mutate()} disabled={!selectedConversation || !messageBody}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student feed</CardTitle>
          <CardDescription>Promotions, jobs, events, and school updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(postsQuery.data ?? []).map((post) => (
            <PostCard key={post.id} post={post} canEdit={user?.id === post.authorId} />
          ))}
          {!postsQuery.data?.length && <p className="text-sm text-muted-foreground">No posts yet. Be the first to post.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
