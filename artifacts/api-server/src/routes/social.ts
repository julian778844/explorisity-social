import { Router, type IRouter, type Request } from "express";
import { z } from "zod";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { getAuthenticatedUserId } from "../lib/authToken";

const router: IRouter = Router();

const MAX_IMAGE_DATA_URL_LENGTH = 4_500_000;

const postInputSchema = z.object({
  communityId: z.number().int().positive().optional().nullable(),
  category: z.enum(["promotion", "job", "event", "general"]).default("general"),
  title: z.string().min(2).max(160),
  body: z.string().min(1).max(5000),
  url: z.string().url().max(500).optional().nullable(),
  imageUrl: z.string().max(MAX_IMAGE_DATA_URL_LENGTH).optional().nullable(),
});

const postUpdateSchema = z.object({
  communityId: z.number().int().positive().optional().nullable(),
  category: z.enum(["promotion", "job", "event", "general"]).optional(),
  title: z.string().min(2).max(160).optional(),
  body: z.string().min(1).max(5000).optional(),
  url: z.string().url().max(500).optional().nullable(),
  imageUrl: z.string().max(MAX_IMAGE_DATA_URL_LENGTH).optional().nullable(),
});

const communityInputSchema = z.object({
  schoolType: z.string().min(2).max(16),
  schoolId: z.string().min(1).max(80),
  name: z.string().min(2).max(140),
  description: z.string().max(1000).optional().nullable(),
});

const dmInputSchema = z.object({ recipientUserId: z.number().int().positive() });
const groupInputSchema = z.object({ name: z.string().min(2).max(140), memberIds: z.array(z.number().int().positive()).min(1).max(50) });
const messageInputSchema = z.object({ body: z.string().min(1).max(5000) });
const commentInputSchema = z.object({
  body: z.string().min(1).max(1000),
  parentCommentId: z.number().int().positive().optional().nullable(),
});
const followPrivacySchema = z.object({ showFollowers: z.boolean(), showFollowing: z.boolean() });
const pinnedFollowersSchema = z.object({ pinnedFollowerIds: z.array(z.number().int().positive()).max(6) });
const notificationTypes = ["follow", "post_like", "post_comment", "comment_reply", "mention"] as const;
type NotificationType = (typeof notificationTypes)[number];

function currentUserId(req: Request) {
  return getAuthenticatedUserId(req);
}

function serializeDate(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return new Date(value).toISOString();
  return new Date().toISOString();
}

function userProjection(alias = "u") {
  return `
    ${alias}.id,
    ${alias}.username,
    ${alias}.display_name AS "displayName",
    ${alias}.bio,
    ${alias}.email,
    ${alias}.phone,
    ${alias}.avatar_color AS "avatarColor",
    ${alias}.avatar_url AS "avatarUrl",
    ${alias}.instagram,
    ${alias}.linkedin,
    ${alias}.facebook,
    ${alias}.twitter,
    ${alias}.tiktok,
    ${alias}.youtube,
    ${alias}.email_opt_in AS "emailOptIn",
    ${alias}.sms_opt_in AS "smsOptIn",
    ${alias}.scholarship_alerts AS "scholarshipAlerts",
    ${alias}.job_alerts AS "jobAlerts",
    ${alias}.school_news_alerts AS "schoolNewsAlerts",
    ${alias}.created_at AS "createdAt"
  `;
}

function serializeUser(row: any) {
  return {
    id: Number(row.id),
    username: row.username,
    displayName: row.displayName,
    bio: row.bio ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    avatarColor: row.avatarColor ?? "#7c3aed",
    avatarUrl: row.avatarUrl ?? null,
    instagram: row.instagram ?? null,
    linkedin: row.linkedin ?? null,
    facebook: row.facebook ?? null,
    twitter: row.twitter ?? null,
    tiktok: row.tiktok ?? null,
    youtube: row.youtube ?? null,
    emailOptIn: Boolean(row.emailOptIn ?? true),
    smsOptIn: Boolean(row.smsOptIn ?? false),
    scholarshipAlerts: Boolean(row.scholarshipAlerts ?? true),
    jobAlerts: Boolean(row.jobAlerts ?? true),
    schoolNewsAlerts: Boolean(row.schoolNewsAlerts ?? true),
    createdAt: serializeDate(row.createdAt),
  };
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

function serializeCommunity(row: any) {
  return {
    id: Number(row.id),
    schoolType: row.schoolType ?? row.school_type,
    schoolId: row.schoolId ?? row.school_id,
    name: row.name,
    description: row.description ?? null,
    createdById: row.createdById ?? row.created_by_id ?? null,
    createdAt: serializeDate(row.createdAt ?? row.created_at),
  };
}

function serializeConversation(row: any) {
  return {
    id: Number(row.id),
    type: row.type,
    name: row.name ?? null,
    communityId: row.communityId ?? row.community_id ?? null,
    createdById: row.createdById ?? row.created_by_id ?? null,
    createdAt: serializeDate(row.createdAt ?? row.created_at),
  };
}

function isSafePostImage(value?: string | null) {
  if (!value) return true;
  if (/^data:image\/(png|jpe?g|webp);base64,/i.test(value)) {
    return value.length <= MAX_IMAGE_DATA_URL_LENGTH;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && value.length <= 2000;
  } catch {
    return false;
  }
}

async function getPosts(options: { currentUserId?: number | null; authorId?: number | null; postId?: number | null; limit?: number } = {}) {
  const params: any[] = [options.currentUserId ?? 0];
  const where: string[] = [];

  if (options.authorId) {
    params.push(options.authorId);
    where.push(`p.author_id = $${params.length}`);
  }

  if (options.postId) {
    params.push(options.postId);
    where.push(`p.id = $${params.length}`);
  }

  params.push(options.limit ?? 100);
  const limitParam = `$${params.length}`;
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

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
      ${whereSql}
      ORDER BY p.created_at DESC
      LIMIT ${limitParam}
    `,
    params,
  );

  return result.rows.map(serializePost);
}

async function getUserByIdentifier(identifier: string) {
  const isId = /^\d+$/.test(identifier);
  const result = await pool.query(
    `
      SELECT ${userProjection("u")},
        COALESCE(u.show_followers, TRUE) AS "showFollowers",
        COALESCE(u.show_following, TRUE) AS "showFollowing"
      FROM users u
      WHERE ${isId ? "u.id = $1" : "LOWER(u.username) = LOWER($1)"}
      LIMIT 1
    `,
    [isId ? Number(identifier) : identifier.replace(/^@+/, "")],
  );

  return result.rows[0] ?? null;
}

async function getFollowCounts(userId: number) {
  const result = await pool.query(
    `
      SELECT
        (SELECT COUNT(*) FROM user_follows WHERE following_id = $1)::int AS "followerCount",
        (SELECT COUNT(*) FROM user_follows WHERE follower_id = $1)::int AS "followingCount"
    `,
    [userId],
  );
  return {
    followerCount: Number(result.rows[0]?.followerCount ?? 0),
    followingCount: Number(result.rows[0]?.followingCount ?? 0),
  };
}

async function isFollowing(followerId: number | null | undefined, followingId: number) {
  if (!followerId || followerId === followingId) return false;
  const result = await pool.query(
    "SELECT 1 FROM user_follows WHERE follower_id = $1 AND following_id = $2 LIMIT 1",
    [followerId, followingId],
  );
  return (result.rowCount ?? 0) > 0;
}

let notificationSchemaReady: Promise<void> | null = null;

async function ensureNotificationSchema() {
  if (!notificationSchemaReady) {
    notificationSchemaReady = pool
      .query(
        `
          ALTER TABLE post_comments
            ADD COLUMN IF NOT EXISTS parent_comment_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE;

          CREATE INDEX IF NOT EXISTS post_comments_parent_idx ON post_comments(parent_comment_id);

          CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(32) NOT NULL,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            comment_id INTEGER REFERENCES post_comments(id) ON DELETE CASCADE,
            read_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS notifications_recipient_idx ON notifications(recipient_id, created_at DESC);
          CREATE INDEX IF NOT EXISTS notifications_actor_idx ON notifications(actor_id);
          CREATE INDEX IF NOT EXISTS notifications_post_idx ON notifications(post_id);
          CREATE INDEX IF NOT EXISTS notifications_comment_idx ON notifications(comment_id);

          CREATE UNIQUE INDEX IF NOT EXISTS notifications_dedupe_uidx
            ON notifications (
              recipient_id,
              actor_id,
              type,
              COALESCE(post_id, 0),
              COALESCE(comment_id, 0)
            );
        `,
      )
      .then(() => undefined)
      .catch((error) => {
        notificationSchemaReady = null;
        throw error;
      });
  }

  return notificationSchemaReady;
}

function serializeNotification(row: any) {
  const actor = row.actor ?? null;
  const postId = row.postId ?? row.post_id ?? null;
  const commentId = row.commentId ?? row.comment_id ?? null;
  const type = row.type as NotificationType;
  const href =
    type === "follow"
      ? actor?.username
        ? `/profile/${actor.username}`
        : "/profile"
      : postId
        ? `/post/${postId}${commentId ? `?comment=${commentId}` : ""}`
        : "/social";

  return {
    id: Number(row.id),
    recipientId: Number(row.recipientId ?? row.recipient_id),
    actorId: Number(row.actorId ?? row.actor_id),
    type,
    postId: postId === null ? null : Number(postId),
    commentId: commentId === null ? null : Number(commentId),
    readAt: row.readAt ?? row.read_at ? serializeDate(row.readAt ?? row.read_at) : null,
    createdAt: serializeDate(row.createdAt ?? row.created_at),
    updatedAt: serializeDate(row.updatedAt ?? row.updated_at),
    actor,
    postTitle: row.postTitle ?? null,
    postPreview: row.postPreview ?? null,
    commentPreview: row.commentPreview ?? null,
    href,
  };
}

async function createNotification(input: {
  recipientId: number;
  actorId: number;
  type: NotificationType;
  postId?: number | null;
  commentId?: number | null;
}) {
  if (input.recipientId === input.actorId) return;

  await ensureNotificationSchema();
  await pool.query(
    `
      INSERT INTO notifications (recipient_id, actor_id, type, post_id, comment_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
    `,
    [input.recipientId, input.actorId, input.type, input.postId ?? null, input.commentId ?? null],
  );
}

async function notifyMentionedUsers(actorId: number, text: string, postId?: number | null, commentId?: number | null) {
  const usernames = Array.from(
    new Set(
      Array.from(text.matchAll(/@([a-zA-Z0-9_]{3,32})/g))
        .map((match) => match[1]?.toLowerCase())
        .filter(Boolean) as string[],
    ),
  );

  if (!usernames.length) return;

  const result = await pool.query(
    "SELECT id FROM users WHERE LOWER(username) = ANY($1::text[])",
    [usernames],
  );

  await Promise.all(
    result.rows
      .map((row) => Number(row.id))
      .filter((recipientId) => recipientId !== actorId)
      .map((recipientId) =>
        createNotification({
          recipientId,
          actorId,
          type: "mention",
          postId: postId ?? null,
          commentId: commentId ?? null,
        }),
      ),
  );
}

router.get("/notifications", requireAuth, async (req, res) => {
  await ensureNotificationSchema();

  const [items, count] = await Promise.all([
    pool.query(
      `
        SELECT
          n.id,
          n.recipient_id AS "recipientId",
          n.actor_id AS "actorId",
          n.type,
          n.post_id AS "postId",
          n.comment_id AS "commentId",
          n.read_at AS "readAt",
          n.created_at AS "createdAt",
          n.updated_at AS "updatedAt",
          json_build_object(
            'id', u.id,
            'username', u.username,
            'displayName', u.display_name,
            'avatarColor', u.avatar_color,
            'avatarUrl', u.avatar_url
          ) AS actor,
          p.title AS "postTitle",
          LEFT(p.body, 140) AS "postPreview",
          LEFT(c.body, 140) AS "commentPreview"
        FROM notifications n
        JOIN users u ON u.id = n.actor_id
        LEFT JOIN posts p ON p.id = n.post_id
        LEFT JOIN post_comments c ON c.id = n.comment_id
        WHERE n.recipient_id = $1
        ORDER BY n.created_at DESC
        LIMIT 60
      `,
      [req.session.userId!],
    ),
    pool.query(
      "SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_id = $1 AND read_at IS NULL",
      [req.session.userId!],
    ),
  ]);

  return res.json({
    notifications: items.rows.map(serializeNotification),
    unreadCount: Number(count.rows[0]?.count ?? 0),
  });
});

router.get("/notifications/unread-count", requireAuth, async (req, res) => {
  await ensureNotificationSchema();
  const result = await pool.query(
    "SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_id = $1 AND read_at IS NULL",
    [req.session.userId!],
  );

  return res.json({ unreadCount: Number(result.rows[0]?.count ?? 0) });
});

router.post("/notifications/read-all", requireAuth, async (req, res) => {
  await ensureNotificationSchema();
  await pool.query(
    "UPDATE notifications SET read_at = COALESCE(read_at, NOW()), updated_at = NOW() WHERE recipient_id = $1 AND read_at IS NULL",
    [req.session.userId!],
  );

  return res.json({ ok: true });
});

router.post("/notifications/:id/read", requireAuth, async (req, res) => {
  await ensureNotificationSchema();

  const notificationId = Number(req.params.id);
  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return res.status(400).json({ error: "Invalid notification." });
  }

  await pool.query(
    "UPDATE notifications SET read_at = COALESCE(read_at, NOW()), updated_at = NOW() WHERE id = $1 AND recipient_id = $2",
    [notificationId, req.session.userId!],
  );

  return res.json({ ok: true });
});

router.get("/users", requireAuth, async (req, res) => {
  const result = await pool.query(
    `
      SELECT ${userProjection("u")}
      FROM users u
      WHERE u.id <> $1
      ORDER BY u.created_at DESC
      LIMIT 40
    `,
    [req.session.userId!],
  );

  res.json({ users: result.rows.map(serializeUser) });
});

router.get("/users/:identifier/profile", async (req, res) => {
  const viewerId = currentUserId(req);
  const userRow = await getUserByIdentifier(req.params.identifier);

  if (!userRow) {
    return res.status(404).json({ error: "User not found." });
  }

  const profileUser = serializeUser(userRow);
  const [counts, following, posts] = await Promise.all([
    getFollowCounts(profileUser.id),
    isFollowing(viewerId, profileUser.id),
    getPosts({ currentUserId: viewerId, authorId: profileUser.id, limit: 50 }),
  ]);

  return res.json({
    user: profileUser,
    followerCount: counts.followerCount,
    followingCount: counts.followingCount,
    isFollowing: following,
    posts,
  });
});

router.post("/users/:id/follow", requireAuth, async (req, res) => {
  const targetId = Number(req.params.id);

  if (!Number.isInteger(targetId) || targetId <= 0 || targetId === req.session.userId) {
    return res.status(400).json({ error: "Invalid user." });
  }

  const target = await pool.query("SELECT 1 FROM users WHERE id = $1 LIMIT 1", [targetId]);
  if (!target.rows[0]) {
    return res.status(404).json({ error: "User not found." });
  }

  const follow = await pool.query(
    "INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [req.session.userId!, targetId],
  );

  if ((follow.rowCount ?? 0) > 0) {
    await createNotification({
      recipientId: targetId,
      actorId: req.session.userId!,
      type: "follow",
    });
  }

  return res.status(201).json({ ok: true });
});

router.delete("/users/:id/follow", requireAuth, async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0 || targetId === req.session.userId) {
    return res.status(400).json({ error: "Invalid user." });
  }

  await pool.query(
    "DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2",
    [req.session.userId!, targetId],
  );

  return res.json({ ok: true });
});

router.get("/user-follows", requireAuth, async (req, res) => {
  const result = await pool.query(
    `
      SELECT id, following_id AS "followingId", created_at AS "createdAt"
      FROM user_follows
      WHERE follower_id = $1
      ORDER BY created_at DESC
    `,
    [req.session.userId!],
  );

  res.json({
    follows: result.rows.map((row) => ({
      id: Number(row.id),
      followingId: Number(row.followingId),
      createdAt: serializeDate(row.createdAt),
    })),
  });
});

async function getFollowList(profileUserId: number, mode: "followers" | "following", viewerId?: number | null) {
  const profile = await pool.query(
    "SELECT id, username, COALESCE(show_followers, TRUE) AS \"showFollowers\", COALESCE(show_following, TRUE) AS \"showFollowing\" FROM users WHERE id = $1 LIMIT 1",
    [profileUserId],
  );

  if (!profile.rows[0]) return { users: [], canView: false };

  const isOwnProfile = viewerId === profileUserId;
  const canView = isOwnProfile || (mode === "followers" ? profile.rows[0].showFollowers : profile.rows[0].showFollowing);
  if (!canView) return { users: [], canView: false };

  const joinColumn = mode === "followers" ? "f.follower_id" : "f.following_id";
  const whereColumn = mode === "followers" ? "f.following_id" : "f.follower_id";
  const viewer = viewerId ?? 0;

  const result = await pool.query(
    `
      SELECT ${userProjection("u")},
        (SELECT COUNT(*) FROM user_follows uf WHERE uf.following_id = u.id)::int AS "followerCount",
        (SELECT COUNT(*) FROM user_follows uf WHERE uf.follower_id = u.id)::int AS "followingCount",
        EXISTS (
          SELECT 1 FROM user_follows uf
          WHERE uf.follower_id = $2 AND uf.following_id = u.id
        ) AS "followingByMe",
        EXISTS (
          SELECT 1 FROM user_follows a
          WHERE a.follower_id = $2 AND a.following_id = u.id
        )
        AND EXISTS (
          SELECT 1 FROM user_follows b
          WHERE b.follower_id = u.id AND b.following_id = $2
        ) AS "isMutual",
        (f.created_at > NOW() - INTERVAL '7 days') AS "isNewFollower"
      FROM user_follows f
      JOIN users u ON u.id = ${joinColumn}
      WHERE ${whereColumn} = $1
      ORDER BY f.created_at DESC
      LIMIT 100
    `,
    [profileUserId, viewer],
  );

  return {
    canView: true,
    users: result.rows.map((row) => ({
      ...serializeUser(row),
      followerCount: Number(row.followerCount ?? 0),
      followingCount: Number(row.followingCount ?? 0),
      isMutual: Boolean(row.isMutual),
      isNewFollower: mode === "followers" && Boolean(row.isNewFollower),
      followingByMe: Boolean(row.followingByMe),
      canFollowBack: isOwnProfile && mode === "followers" && !row.followingByMe && Number(row.id) !== viewer,
    })),
  };
}

router.get("/users/:id/followers", async (req, res) => {
  const profileUserId = Number(req.params.id);
  if (!Number.isInteger(profileUserId) || profileUserId <= 0) {
    return res.status(400).json({ error: "Invalid user." });
  }

  return res.json(await getFollowList(profileUserId, "followers", currentUserId(req)));
});

router.get("/users/:id/following", async (req, res) => {
  const profileUserId = Number(req.params.id);
  if (!Number.isInteger(profileUserId) || profileUserId <= 0) {
    return res.status(400).json({ error: "Invalid user." });
  }

  return res.json(await getFollowList(profileUserId, "following", currentUserId(req)));
});

router.get("/suggestions", requireAuth, async (req, res) => {
  const viewer = req.session.userId!;
  const result = await pool.query(
    `
      SELECT ${userProjection("u")},
        (SELECT COUNT(*) FROM user_follows uf WHERE uf.following_id = u.id)::int AS "followerCount",
        (SELECT COUNT(*) FROM user_follows uf WHERE uf.follower_id = u.id)::int AS "followingCount",
        COALESCE(mutual.mutual_count, 0)::int AS "mutualCount"
      FROM users u
      LEFT JOIN (
        SELECT uf2.following_id, COUNT(*) AS mutual_count
        FROM user_follows mine
        JOIN user_follows uf2 ON uf2.follower_id = mine.following_id
        WHERE mine.follower_id = $1 AND uf2.following_id <> $1
        GROUP BY uf2.following_id
      ) mutual ON mutual.following_id = u.id
      WHERE u.id <> $1
        AND NOT EXISTS (
          SELECT 1 FROM user_follows uf
          WHERE uf.follower_id = $1 AND uf.following_id = u.id
        )
      ORDER BY COALESCE(mutual.mutual_count, 0) DESC, "followerCount" DESC, u.created_at DESC
      LIMIT 8
    `,
    [viewer],
  );

  res.json({
    suggestions: result.rows.map((row) => ({
      ...serializeUser(row),
      followerCount: Number(row.followerCount ?? 0),
      followingCount: Number(row.followingCount ?? 0),
      isMutual: Number(row.mutualCount ?? 0) > 0,
      isNewFollower: false,
      followingByMe: false,
      canFollowBack: false,
      mutualCount: Number(row.mutualCount ?? 0),
      reason: Number(row.mutualCount ?? 0) > 0 ? `${row.mutualCount} mutual follows` : "Active student profile",
    })),
  });
});

router.delete("/users/:id/remove-follower", requireAuth, async (req, res) => {
  const targetId = Number(req.params.id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return res.status(400).json({ error: "Invalid user." });
  }

  await pool.query(
    "DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2",
    [targetId, req.session.userId!],
  );

  return res.json({ ok: true });
});

router.patch("/me/follow-privacy", requireAuth, async (req, res) => {
  const parsed = followPrivacySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid privacy settings." });
  }

  await pool.query(
    "UPDATE users SET show_followers = $2, show_following = $3 WHERE id = $1",
    [req.session.userId!, parsed.data.showFollowers, parsed.data.showFollowing],
  );

  return res.json({ ok: true });
});

router.patch("/me/pinned-followers", requireAuth, async (req, res) => {
  const parsed = pinnedFollowersSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid pinned followers." });
  }

  const pinned = Array.from(new Set(parsed.data.pinnedFollowerIds)).slice(0, 6);
  await pool.query(
    "UPDATE users SET pinned_follower_ids = $2::jsonb WHERE id = $1",
    [req.session.userId!, JSON.stringify(pinned)],
  );

  return res.json({ ok: true, pinnedFollowerIds: pinned });
});

router.get("/communities", async (_req, res) => {
  const result = await pool.query(
    `
      SELECT id, school_type AS "schoolType", school_id AS "schoolId", name, description, created_by_id AS "createdById", created_at AS "createdAt"
      FROM communities
      ORDER BY created_at DESC
      LIMIT 100
    `,
  );

  res.json({ communities: result.rows.map(serializeCommunity) });
});

router.post("/communities", requireAuth, async (req, res) => {
  const parsed = communityInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid community input." });
  }

  const result = await pool.query(
    `
      INSERT INTO communities (school_type, school_id, name, description, created_by_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (school_type, school_id) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, school_type AS "schoolType", school_id AS "schoolId", name, description, created_by_id AS "createdById", created_at AS "createdAt"
    `,
    [parsed.data.schoolType, parsed.data.schoolId, parsed.data.name, parsed.data.description ?? null, req.session.userId!],
  );

  const community = result.rows[0];
  await pool.query(
    "INSERT INTO community_members (community_id, user_id, role) VALUES ($1, $2, 'admin') ON CONFLICT DO NOTHING",
    [community.id, req.session.userId!],
  );

  return res.status(201).json({ community: serializeCommunity(community) });
});

router.post("/communities/:id/join", requireAuth, async (req, res) => {
  const communityId = Number(req.params.id);
  if (!Number.isInteger(communityId) || communityId <= 0) {
    return res.status(400).json({ error: "Invalid community." });
  }

  await pool.query(
    "INSERT INTO community_members (community_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [communityId, req.session.userId!],
  );

  return res.status(201).json({ ok: true });
});

router.get("/posts", async (req, res) => {
  const posts = await getPosts({ currentUserId: currentUserId(req) });
  res.json({ posts });
});

router.get("/communities/:id/posts", async (req, res) => {
  const communityId = Number(req.params.id);
  if (!Number.isInteger(communityId) || communityId <= 0) {
    return res.status(400).json({ error: "Invalid community." });
  }

  const result = await pool.query(
    "SELECT p.id FROM posts p WHERE p.community_id = $1 ORDER BY p.created_at DESC LIMIT 100",
    [communityId],
  );
  const ids = result.rows.map((row) => Number(row.id));
  if (!ids.length) return res.json({ posts: [] });

  const posts = await Promise.all(ids.map((id) => getPosts({ currentUserId: currentUserId(req), postId: id, limit: 1 })));
  return res.json({ posts: posts.flat() });
});

router.get("/posts/:id", async (req, res) => {
  const postId = Number(req.params.id);
  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: "Invalid post." });
  }

  const [post] = await getPosts({ currentUserId: currentUserId(req), postId, limit: 1 });
  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  return res.json({ post });
});

router.post("/posts", requireAuth, async (req, res) => {
  const parsed = postInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid post." });
  }

  if (!isSafePostImage(parsed.data.imageUrl)) {
    return res.status(400).json({ error: "Image must be a PNG, JPG, JPEG, WEBP upload or a valid http(s) image URL." });
  }

  const result = await pool.query(
    `
      INSERT INTO posts (author_id, community_id, category, title, body, url, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
    [
      req.session.userId!,
      parsed.data.communityId ?? null,
      parsed.data.category,
      parsed.data.title,
      parsed.data.body,
      parsed.data.url ?? null,
      parsed.data.imageUrl ?? null,
    ],
  );

  const [post] = await getPosts({ currentUserId: req.session.userId!, postId: Number(result.rows[0].id), limit: 1 });
  await notifyMentionedUsers(req.session.userId!, `${parsed.data.title} ${parsed.data.body}`, post.id);
  return res.status(201).json({ post });
});

router.patch("/posts/:id", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: "Invalid post." });
  }

  const parsed = postUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid post update." });
  }

  if (!isSafePostImage(parsed.data.imageUrl)) {
    return res.status(400).json({ error: "Image must be a PNG, JPG, JPEG, WEBP upload or a valid http(s) image URL." });
  }

  const current = await pool.query(
    "SELECT id, author_id, category, title, body, url, image_url FROM posts WHERE id = $1 LIMIT 1",
    [postId],
  );

  const oldPost = current.rows[0];
  if (!oldPost) {
    return res.status(404).json({ error: "Post not found." });
  }

  if (Number(oldPost.author_id) !== Number(req.session.userId)) {
    return res.status(403).json({ error: "You can only edit your own posts." });
  }

  await pool.query(
    `
      UPDATE posts
      SET
        community_id = COALESCE($2, community_id),
        category = COALESCE($3, category),
        title = COALESCE($4, title),
        body = COALESCE($5, body),
        url = $6,
        image_url = $7,
        updated_at = NOW()
      WHERE id = $1
    `,
    [
      postId,
      parsed.data.communityId ?? null,
      parsed.data.category ?? null,
      parsed.data.title ?? null,
      parsed.data.body ?? null,
      Object.prototype.hasOwnProperty.call(parsed.data, "url") ? parsed.data.url ?? null : oldPost.url ?? null,
      Object.prototype.hasOwnProperty.call(parsed.data, "imageUrl") ? parsed.data.imageUrl ?? null : oldPost.image_url ?? null,
    ],
  );

  const [post] = await getPosts({ currentUserId: req.session.userId!, postId, limit: 1 });
  await notifyMentionedUsers(req.session.userId!, `${post.title} ${post.body}`, post.id);
  return res.json({ post });
});

router.post("/posts/:id/like", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: "Invalid post." });
  }

  const owner = await pool.query("SELECT author_id FROM posts WHERE id = $1 LIMIT 1", [postId]);
  if (!owner.rows[0]) {
    return res.status(404).json({ error: "Post not found." });
  }

  const like = await pool.query(
    "INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id",
    [postId, req.session.userId!],
  );

  if ((like.rowCount ?? 0) > 0) {
    const recipientId = Number(owner.rows[0]?.author_id);
    if (recipientId) {
      await createNotification({
        recipientId,
        actorId: req.session.userId!,
        type: "post_like",
        postId,
      });
    }
  }

  return res.status(201).json({ ok: true });
});

router.delete("/posts/:id/like", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);
  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: "Invalid post." });
  }

  await pool.query(
    "DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2",
    [postId, req.session.userId!],
  );

  return res.json({ ok: true });
});

router.get("/posts/:id/comments", async (req, res) => {
  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: "Invalid post." });
  }

  await ensureNotificationSchema();

  const result = await pool.query(
    `
      SELECT
        c.id,
        c.post_id AS "postId",
        c.user_id AS "userId",
        c.parent_comment_id AS "parentCommentId",
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
    return res.status(400).json({ error: "Invalid post." });
  }

  if (!parsed.success) {
    return res.status(400).json({ error: "Comment cannot be empty." });
  }

  await ensureNotificationSchema();

  const postOwner = await pool.query("SELECT author_id FROM posts WHERE id = $1 LIMIT 1", [postId]);
  if (!postOwner.rows[0]) {
    return res.status(404).json({ error: "Post not found." });
  }

  let parentOwnerId: number | null = null;
  if (parsed.data.parentCommentId) {
    const parent = await pool.query(
      "SELECT id, user_id FROM post_comments WHERE id = $1 AND post_id = $2 LIMIT 1",
      [parsed.data.parentCommentId, postId],
    );

    if (!parent.rows[0]) {
      return res.status(400).json({ error: "Reply target not found." });
    }

    parentOwnerId = Number(parent.rows[0].user_id);
  }

  const result = await pool.query(
    `
      INSERT INTO post_comments (post_id, user_id, parent_comment_id, body)
      VALUES ($1, $2, $3, $4)
      RETURNING id, post_id AS "postId", user_id AS "userId", parent_comment_id AS "parentCommentId", body, created_at AS "createdAt", updated_at AS "updatedAt"
    `,
    [postId, req.session.userId!, parsed.data.parentCommentId ?? null, parsed.data.body],
  );

  const commentId = Number(result.rows[0].id);
  if (parentOwnerId) {
    await createNotification({
      recipientId: parentOwnerId,
      actorId: req.session.userId!,
      type: "comment_reply",
      postId,
      commentId,
    });
  } else {
    await createNotification({
      recipientId: Number(postOwner.rows[0].author_id),
      actorId: req.session.userId!,
      type: "post_comment",
      postId,
      commentId,
    });
  }

  await notifyMentionedUsers(req.session.userId!, parsed.data.body, postId, commentId);

  res.status(201).json({
    comment: {
      ...result.rows[0],
      createdAt: serializeDate(result.rows[0].createdAt),
      updatedAt: serializeDate(result.rows[0].updatedAt),
    },
  });
});

router.get("/conversations", requireAuth, async (req, res) => {
  const result = await pool.query(
    `
      SELECT c.id, c.type, c.name, c.community_id AS "communityId", c.created_by_id AS "createdById", c.created_at AS "createdAt"
      FROM conversations c
      JOIN conversation_members cm ON cm.conversation_id = c.id
      WHERE cm.user_id = $1
      ORDER BY c.created_at DESC
      LIMIT 100
    `,
    [req.session.userId!],
  );

  res.json({ conversations: result.rows.map(serializeConversation) });
});

router.post("/conversations/dm", requireAuth, async (req, res) => {
  const parsed = dmInputSchema.safeParse(req.body);
  if (!parsed.success || parsed.data.recipientUserId === req.session.userId) {
    return res.status(400).json({ error: "Invalid recipient." });
  }

  const result = await pool.query(
    "INSERT INTO conversations (type, created_by_id) VALUES ('dm', $1) RETURNING id, type, name, community_id AS \"communityId\", created_by_id AS \"createdById\", created_at AS \"createdAt\"",
    [req.session.userId!],
  );

  await pool.query(
    `
      INSERT INTO conversation_members (conversation_id, user_id)
      VALUES ($1, $2), ($1, $3)
      ON CONFLICT DO NOTHING
    `,
    [result.rows[0].id, req.session.userId!, parsed.data.recipientUserId],
  );

  return res.status(201).json({ conversation: serializeConversation(result.rows[0]) });
});

router.post("/conversations/group", requireAuth, async (req, res) => {
  const parsed = groupInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid group input." });
  }

  const result = await pool.query(
    "INSERT INTO conversations (type, name, created_by_id) VALUES ('group', $1, $2) RETURNING id, type, name, community_id AS \"communityId\", created_by_id AS \"createdById\", created_at AS \"createdAt\"",
    [parsed.data.name, req.session.userId!],
  );

  const memberIds = Array.from(new Set([req.session.userId!, ...parsed.data.memberIds]));
  await Promise.all(
    memberIds.map((memberId) =>
      pool.query(
        "INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [result.rows[0].id, memberId],
      ),
    ),
  );

  return res.status(201).json({ conversation: serializeConversation(result.rows[0]) });
});

router.get("/conversations/:id/messages", requireAuth, async (req, res) => {
  const conversationId = Number(req.params.id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: "Invalid conversation." });
  }

  const membership = await pool.query(
    "SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2 LIMIT 1",
    [conversationId, req.session.userId!],
  );

  if (!membership.rows[0]) {
    return res.status(403).json({ error: "Not a member of this conversation." });
  }

  const result = await pool.query(
    `
      SELECT id, conversation_id AS "conversationId", sender_id AS "senderId", body, created_at AS "createdAt"
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT 100
    `,
    [conversationId],
  );

  res.json({
    messages: result.rows.map((row) => ({
      id: Number(row.id),
      conversationId: Number(row.conversationId),
      senderId: Number(row.senderId),
      body: row.body,
      createdAt: serializeDate(row.createdAt),
    })),
  });
});

router.post("/conversations/:id/messages", requireAuth, async (req, res) => {
  const conversationId = Number(req.params.id);
  const parsed = messageInputSchema.safeParse(req.body);

  if (!Number.isInteger(conversationId) || conversationId <= 0 || !parsed.success) {
    return res.status(400).json({ error: "Invalid message." });
  }

  const membership = await pool.query(
    "SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2 LIMIT 1",
    [conversationId, req.session.userId!],
  );

  if (!membership.rows[0]) {
    return res.status(403).json({ error: "Not a member of this conversation." });
  }

  const result = await pool.query(
    `
      INSERT INTO messages (conversation_id, sender_id, body)
      VALUES ($1, $2, $3)
      RETURNING id, conversation_id AS "conversationId", sender_id AS "senderId", body, created_at AS "createdAt"
    `,
    [conversationId, req.session.userId!, parsed.data.body],
  );

  return res.status(201).json({
    message: {
      id: Number(result.rows[0].id),
      conversationId: Number(result.rows[0].conversationId),
      senderId: Number(result.rows[0].senderId),
      body: result.rows[0].body,
      createdAt: serializeDate(result.rows[0].createdAt),
    },
  });
});

export default router;
