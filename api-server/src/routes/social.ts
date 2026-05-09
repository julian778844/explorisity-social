import { Router, type IRouter } from "express";
import { and, desc, eq, ne, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  usersTable,
  toPublicUser,
  userFollowsTable,
  communitiesTable,
  communityMembersTable,
  postsTable,
  conversationsTable,
  conversationMembersTable,
  messagesTable,
  POST_CATEGORIES,
} from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const communityInputSchema = z.object({
  schoolType: z.string().min(2).max(16),
  schoolId: z.string().min(1).max(80),
  name: z.string().min(2).max(140),
  description: z.string().max(1000).optional().nullable(),
});

const postInputSchema = z.object({
  communityId: z.number().int().positive().optional().nullable(),
  category: z.enum(POST_CATEGORIES).default("general"),
  title: z.string().min(2).max(160),
  body: z.string().min(1).max(5000),
  url: z.string().url().max(500).optional().nullable(),
});

const dmInputSchema = z.object({ recipientUserId: z.number().int().positive() });
const groupInputSchema = z.object({ name: z.string().min(2).max(140), memberIds: z.array(z.number().int().positive()).min(1).max(50) });
const messageInputSchema = z.object({ body: z.string().min(1).max(5000) });

router.get("/users", requireAuth, async (req, res) => {
  const rows = await db.select().from(usersTable).where(ne(usersTable.id, req.session.userId!)).limit(40);
  res.json({ users: rows.map(toPublicUser) });
});

router.get("/users/:id", async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const posts = await db.select().from(postsTable).where(eq(postsTable.authorId, userId)).orderBy(desc(postsTable.createdAt)).limit(50);
  res.json({
    user: toPublicUser(user),
    posts: posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })),
  });
});

router.post("/users/:id/follow", requireAuth, async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0 || targetId === req.session.userId) {
    res.status(400).json({ error: "Invalid user" });
    return;
  }
  await db.insert(userFollowsTable).values({ followerId: req.session.userId!, followingId: targetId }).onConflictDoNothing();
  res.status(201).json({ ok: true });
});

router.delete("/users/:id/follow", requireAuth, async (req, res) => {
  const targetId = Number(req.params.id);
  await db.delete(userFollowsTable).where(and(eq(userFollowsTable.followerId, req.session.userId!), eq(userFollowsTable.followingId, targetId)));
  res.json({ ok: true });
});

router.get("/user-follows", requireAuth, async (req, res) => {
  const rows = await db.select().from(userFollowsTable).where(eq(userFollowsTable.followerId, req.session.userId!));
  res.json({ follows: rows.map((r) => ({ id: r.id, followingId: r.followingId, createdAt: r.createdAt.toISOString() })) });
});

router.get("/communities", async (_req, res) => {
  const rows = await db.select().from(communitiesTable).orderBy(desc(communitiesTable.createdAt)).limit(100);
  res.json({ communities: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })) });
});

router.post("/communities", requireAuth, async (req, res) => {
  const parsed = communityInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid community input" });
    return;
  }
  const [community] = await db.insert(communitiesTable).values({ ...parsed.data, createdById: req.session.userId! }).onConflictDoNothing().returning();
  const selected = community ?? (await db.select().from(communitiesTable).where(and(eq(communitiesTable.schoolType, parsed.data.schoolType), eq(communitiesTable.schoolId, parsed.data.schoolId))).limit(1))[0];
  if (selected) {
    await db.insert(communityMembersTable).values({ communityId: selected.id, userId: req.session.userId!, role: "admin" }).onConflictDoNothing();
  }
  res.status(201).json({ community: selected ? { ...selected, createdAt: selected.createdAt.toISOString() } : null });
});

router.post("/communities/:id/join", requireAuth, async (req, res) => {
  const communityId = Number(req.params.id);
  if (!Number.isInteger(communityId) || communityId <= 0) {
    res.status(400).json({ error: "Invalid community" });
    return;
  }
  await db.insert(communityMembersTable).values({ communityId, userId: req.session.userId! }).onConflictDoNothing();
  res.status(201).json({ ok: true });
});

router.get("/posts", async (_req, res) => {
  const rows = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt)).limit(100);
  res.json({ posts: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })) });
});

router.get("/communities/:id/posts", async (req, res) => {
  const communityId = Number(req.params.id);
  const rows = await db.select().from(postsTable).where(eq(postsTable.communityId, communityId)).orderBy(desc(postsTable.createdAt)).limit(100);
  res.json({ posts: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })) });
});

router.post("/posts", requireAuth, async (req, res) => {
  const parsed = postInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid post input" });
    return;
  }
  const [post] = await db.insert(postsTable).values({ ...parsed.data, authorId: req.session.userId! }).returning();
  res.status(201).json({ post: { ...post, createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString() } });
});

router.get("/conversations", requireAuth, async (req, res) => {
  const memberships = await db.select().from(conversationMembersTable).where(eq(conversationMembersTable.userId, req.session.userId!));
  const ids = memberships.map((m) => m.conversationId);
  if (!ids.length) {
    res.json({ conversations: [] });
    return;
  }
  const rows = await db.select().from(conversationsTable).where(inArray(conversationsTable.id, ids)).orderBy(desc(conversationsTable.createdAt));
  res.json({ conversations: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })) });
});

router.post("/conversations/dm", requireAuth, async (req, res) => {
  const parsed = dmInputSchema.safeParse(req.body);
  if (!parsed.success || parsed.data.recipientUserId === req.session.userId) {
    res.status(400).json({ error: "Invalid recipient" });
    return;
  }
  const [conversation] = await db.insert(conversationsTable).values({ type: "dm", createdById: req.session.userId! }).returning();
  await db.insert(conversationMembersTable).values([
    { conversationId: conversation.id, userId: req.session.userId! },
    { conversationId: conversation.id, userId: parsed.data.recipientUserId },
  ]).onConflictDoNothing();
  res.status(201).json({ conversation: { ...conversation, createdAt: conversation.createdAt.toISOString() } });
});

router.post("/conversations/group", requireAuth, async (req, res) => {
  const parsed = groupInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid group input" });
    return;
  }
  const [conversation] = await db.insert(conversationsTable).values({ type: "group", name: parsed.data.name, createdById: req.session.userId! }).returning();
  const memberIds = Array.from(new Set([req.session.userId!, ...parsed.data.memberIds]));
  await db.insert(conversationMembersTable).values(memberIds.map((userId) => ({ conversationId: conversation.id, userId }))).onConflictDoNothing();
  res.status(201).json({ conversation: { ...conversation, createdAt: conversation.createdAt.toISOString() } });
});

router.get("/conversations/:id/messages", requireAuth, async (req, res) => {
  const conversationId = Number(req.params.id);
  const [membership] = await db.select().from(conversationMembersTable).where(and(eq(conversationMembersTable.conversationId, conversationId), eq(conversationMembersTable.userId, req.session.userId!))).limit(1);
  if (!membership) {
    res.status(403).json({ error: "Not a member of this conversation" });
    return;
  }
  const rows = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, conversationId)).orderBy(desc(messagesTable.createdAt)).limit(100);
  res.json({ messages: rows.reverse().map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })) });
});

router.post("/conversations/:id/messages", requireAuth, async (req, res) => {
  const conversationId = Number(req.params.id);
  const parsed = messageInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid message" });
    return;
  }
  const [membership] = await db.select().from(conversationMembersTable).where(and(eq(conversationMembersTable.conversationId, conversationId), eq(conversationMembersTable.userId, req.session.userId!))).limit(1);
  if (!membership) {
    res.status(403).json({ error: "Not a member of this conversation" });
    return;
  }
  const [message] = await db.insert(messagesTable).values({ conversationId, senderId: req.session.userId!, body: parsed.data.body }).returning();
  res.status(201).json({ message: { ...message, createdAt: message.createdAt.toISOString() } });
});

export default router;
