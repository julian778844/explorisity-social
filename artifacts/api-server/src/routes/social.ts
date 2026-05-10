import { Router, type IRouter } from "express";
import { and, desc, eq, ne, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  db,
  pool,
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

const MAX_IMAGE_DATA_URL_LENGTH = 4_500_000;

function isSafeImageDataUrl(value?: string | null) {
  if (!value) return true;
  return /^data:image\/(png|jpe?g|webp);base64,/i.test(value) && value.length <= MAX_IMAGE_DATA_URL_LENGTH;
}

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
  imageUrl: z.string().max(MAX_IMAGE_DATA_URL_LENGTH).optional().nullable(),
}).refine((data) => isSafeImageDataUrl(data.imageUrl), {
  message: "Image must be PNG, JPG, JPEG, or WEBP and under the size limit.",
  path: ["imageUrl"],
});

const postUpdateSchema = postInputSchema.partial().refine((data) => isSafeImageDataUrl(data.imageUrl), {
  message: "Image must be PNG, JPG, JPEG, or WEBP and under the size limit.",
  path: ["imageUrl"],
});

const dmInputSchema = z.object({ recipientUserId: z.number().int().positive() });
const groupInputSchema = z.object({ name: z.string().min(2).max(140), memberIds: z.array(z.number().int().positive()).min(1).max(50) });
const messageInputSchema = z.object({ body: z.string().min(1).max(5000) });
const commentInputSchema = z.object({ body: z.string().min(1).max(1000) });

function serializeDate(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date().toISOString();
}

function serializePost(row: any) {
  return {
    id: Number(row.id),
    authorId: Number(row.authorId ?? row.author_id),
    communityId: row.communityId ?? row.community_id ?? null,
    category: row.category,
    title: row.title,
    body: row.body,
    url: row.url ?? null,
    imageUrl: row.imageUrl ?? row.image_url ?? null,
    createdAt: serializeDate(row.createdAt ?? row.created_at),
    updatedAt: serializeDate(row.updatedAt ?? row.updated_at),
    author: row.author ?? null,
    likeCount: Number(row.likeCount ?? 0),
    commentCount: Number(row.commentCount ?? 0),
    likedByMe: Boolean(row.likedByMe ?? false),
  };
}

async function listPostsWithAuthors(options: { currentUserId?: number | null; authorId?: number; communityId?: number } = {}) {
  const params: any[] = [options.currentUserId ?? 0];
  const conditions: string[] = [];

  if (options.authorId) {
    params.push(options.authorId);
    conditions.push(`p.author_id = $${params.length}`);
  }

  if (options.communityId) {
    params.push(options.communityId);
    conditions.push(`p.community_id = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
      SELECT
        p.id,
        p.author_id AS "authorId",
        p.community_id AS "communityId",
        p.category,
        p.title,
        p.body,
        p.url,
        p.image_url AS "imageUrl",
        p.created_at AS "createdAt",
        p.updated_at AS "updatedAt",
        json_build_object(
          'id', u.id,
          'username', u.username,
          'displayName', u.display_name,
          'avatarColor', u.avatar_color,
          'avatarUrl', u.avatar_url
        ) AS author,
        COALESCE(l.like_count, 0)::int AS "likeCount",
        COALESCE(c.comment_count, 0)::int AS "commentCount",
        EXISTS (
          SELECT 1 FROM post_likes pl
          WHERE pl.post_id = p.id AND pl.user_id = $1
        ) AS "likedByMe"
      FROM posts p
      JOIN users u ON u.id = p.author_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS like_count
        FROM post_likes
        GROUP BY post_id
      ) l ON l.post_id = p.id
      LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count
        FROM post_comments
        GROUP BY post_id
      ) c ON c.post_id = p.id
      ${where}
      ORDER BY p.created_at DESC
      LIMIT 100
    `,
    params,
  );

  return result.rows.map(serializePost);
}

router.get("/users", requireAuth, async (req, res) => {
  const rows = await db.select().from(usersTable).where(ne(usersTable.id, req.session.userId!)).limit(40);
  res.json({ users: rows.map(toPublicUser) });
});

router.get("/users/:username/profile", async (req, res) => {
  const username = String(req.params.username || "").replace(/^@+/, "").trim();

  const userResult = await pool.query(
    `
      SELECT
        id,
        username,
        password_hash AS "passwordHash",
        display_name AS "displayName",
        bio,
        email,
        phone,
        avatar_color AS "avatarColor",
        avatar_url AS "avatarUrl",
        instagram,
        linkedin,
        facebook,
        twitter,
        tiktok,
        youtube,
        email_opt_in AS "emailOptIn",
        sms_opt_in AS "smsOptIn",
        scholarship_alerts AS "scholarshipAlerts",
        job_alerts AS "jobAlerts",
        school_news_alerts AS "schoolNewsAlerts",
        created_at AS "createdAt"
      FROM users
      WHERE lower(username) = lower($1)
      LIMIT 1
    `,
    [username],
  );

  const user = userResult.rows[0];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const counts = await pool.query(
    `
      SELECT
        (SELECT COUNT(*) FROM user_follows WHERE following_id = $1)::int AS "followerCount",
        (SELECT COUNT(*) FROM user_follows WHERE follower_id = $1)::int AS "followingCount",
        EXISTS (
          SELECT 1 FROM user_follows
          WHERE follower_id = $2 AND following_id = $1
        ) AS "isFollowing"
    `,
    [user.id, req.session?.userId ?? 0],
  );

  const posts = await listPostsWithAuthors({
    currentUserId: req.session?.userId ?? null,
    authorId: user.id,
  });

  return res.json({
    user: toPublicUser(user),
    followerCount: Number(counts.rows[0]?.followerCount ?? 0),
    followingCount: Number(counts.rows[0]?.followingCount ?? 0),
    isFollowing: Boolean(counts.rows[0]?.isFollowing ?? false),
    posts,
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

router.get("/posts", async (req, res) => {
  const posts = await listPostsWithAuthors({ currentUserId: req.session?.userId ?? null });
  res.json({ posts });
});

router.get("/communities/:id/posts", async (req, res) => {
  const communityId = Number(req.params.id);
  const posts = await listPostsWithAuthors({ currentUserId: req.session?.userId ?? null, communityId });
  res.json({ posts });
});

router.post("/posts", requireAuth, async (req, res) => {
  const parsed = postInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid post input" });
    return;
  }

  const [post] = await db.insert(postsTable).values({ ...parsed.data, authorId: req.session.userId! }).returning();
  const [hydrated] = await listPostsWithAuthors({ currentUserId: req.session.userId!, authorId: req.session.userId! });

  res.status(201).json({ post: hydrated ?? serializePost(post) });
});

router.patch("/posts/:id", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);
  const parsed = postUpdateSchema.safeParse(req.body);

  if (!Number.isInteger(postId) || postId <= 0) {
    res.status(400).json({ error: "Invalid post" });
    return;
  }

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid post input" });
    return;
  }

  const [existing] = await db.select().from(postsTable).where(eq(postsTable.id, postId)).limit(1);

  if (!existing) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (existing.authorId !== req.session.userId) {
    res.status(403).json({ error: "You can only edit your own posts." });
    return;
  }

  const [updated] = await db.update(postsTable).set({
    ...parsed.data,
    updatedAt: new Date(),
  }).where(eq(postsTable.id, postId)).returning();

  res.json({ post: serializePost(updated) });
});

router.post("/posts/:id/like", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: "Invalid post" });
  }

  await pool.query(
    "INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [postId, req.session.userId!],
  );

  res.status(201).json({ ok: true });
});

router.delete("/posts/:id/like", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);

  await pool.query(
    "DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2",
    [postId, req.session.userId!],
  );

  res.json({ ok: true });
});

router.get("/posts/:id/comments", async (req, res) => {
  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: "Invalid post" });
  }

  const result = await pool.query(
    `
      SELECT
        c.id,
        c.post_id AS "postId",
        c.user_id AS "userId",
        c.body,
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        json_build_object(
          'id', u.id,
          'username', u.username,
          'displayName', u.display_name,
          'avatarColor', u.avatar_color,
          'avatarUrl', u.avatar_url
        ) AS author
      FROM post_comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
      LIMIT 100
    `,
    [postId],
  );

  res.json({
    comments: result.rows.map((row) => ({
      ...row,
      createdAt: serializeDate(row.createdAt),
      updatedAt: serializeDate(row.updatedAt),
    })),
  });
});

router.post("/posts/:id/comments", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);
  const parsed = commentInputSchema.safeParse(req.body);

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: "Invalid post" });
  }

  if (!parsed.success) {
    return res.status(400).json({ error: "Comment cannot be empty." });
  }

  const result = await pool.query(
    `
      INSERT INTO post_comments (post_id, user_id, body)
      VALUES ($1, $2, $3)
      RETURNING id, post_id AS "postId", user_id AS "userId", body, created_at AS "createdAt", updated_at AS "updatedAt"
    `,
    [postId, req.session.userId!, parsed.data.body],
  );

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);

  res.status(201).json({
    comment: {
      ...result.rows[0],
      createdAt: serializeDate(result.rows[0].createdAt),
      updatedAt: serializeDate(result.rows[0].updatedAt),
      author: user
        ? {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarColor: user.avatarColor,
            avatarUrl: user.avatarUrl,
          }
        : null,
    },
  });
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
