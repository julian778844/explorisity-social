import { Router, type IRouter } from "express";
import { z } from "zod";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

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

const commentInputSchema = z.object({
  body: z.string().min(1).max(1000),
});

function isSafeImageDataUrl(value?: string | null) {
  if (!value) return true;
  return /^data:image\/(png|jpe?g|webp);base64,/i.test(value) && value.length <= MAX_IMAGE_DATA_URL_LENGTH;
}

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

async function getPosts(options: { currentUserId?: number | null; authorId?: number | null } = {}) {
  const params: any[] = [options.currentUserId ?? 0];
  const where: string[] = [];

  if (options.authorId) {
    params.push(options.authorId);
    where.push(`p.author_id = $${params.length}`);
  }

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
      LIMIT 100
    `,
    params,
  );

  return result.rows.map(serializePost);
}

router.get("/posts", async (req, res) => {
  const posts = await getPosts({ currentUserId: req.session?.userId ?? null });
  res.json({ posts });
});

router.post("/posts", requireAuth, async (req, res) => {
  const parsed = postInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid post." });
  }

  if (!isSafeImageDataUrl(parsed.data.imageUrl)) {
    return res.status(400).json({ error: "Image must be PNG, JPG, JPEG, or WEBP and under the size limit." });
  }

  const result = await pool.query(
    `
      INSERT INTO posts (author_id, community_id, category, title, body, url, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        author_id AS "authorId",
        community_id AS "communityId",
        category,
        title,
        body,
        url,
        image_url AS "imageUrl",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
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

  return res.status(201).json({ post: serializePost(result.rows[0]) });
});

/**
 * THIS ROUTE FIXES THE 404 WHEN EDITING POSTS.
 * Frontend calls: PATCH /api/social/posts/:id
 * This route protects ownership on the backend.
 */
router.patch("/posts/:id", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: "Invalid post." });
  }

  const parsed = postUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid post update." });
  }

  if (!isSafeImageDataUrl(parsed.data.imageUrl)) {
    return res.status(400).json({ error: "Image must be PNG, JPG, JPEG, or WEBP and under the size limit." });
  }

  const existing = await pool.query(
    "SELECT id, author_id FROM posts WHERE id = $1 LIMIT 1",
    [postId],
  );

  if (!existing.rows[0]) {
    return res.status(404).json({ error: "Post not found." });
  }

  if (Number(existing.rows[0].author_id) !== Number(req.session.userId)) {
    return res.status(403).json({ error: "You can only edit your own posts." });
  }

  const current = await pool.query(
    `
      SELECT category, title, body, url, image_url
      FROM posts
      WHERE id = $1
      LIMIT 1
    `,
    [postId],
  );

  const oldPost = current.rows[0];

  const updated = await pool.query(
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
      RETURNING
        id,
        author_id AS "authorId",
        community_id AS "communityId",
        category,
        title,
        body,
        url,
        image_url AS "imageUrl",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
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

  return res.json({ post: serializePost(updated.rows[0]) });
});

router.post("/posts/:id/like", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(400).json({ error: "Invalid post." });
  }

  await pool.query(
    "INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [postId, req.session.userId!],
  );

  return res.status(201).json({ ok: true });
});

router.delete("/posts/:id/like", requireAuth, async (req, res) => {
  const postId = Number(req.params.id);

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
    return res.status(400).json({ error: "Invalid post." });
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

  res.status(201).json({
    comment: {
      ...result.rows[0],
      createdAt: serializeDate(result.rows[0].createdAt),
      updatedAt: serializeDate(result.rows[0].updatedAt),
    },
  });
});

export default router;
