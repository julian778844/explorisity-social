import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function toIso(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(String(value)).toISOString();
}

function serializeNotification(row: any) {
  return {
    id: Number(row.id),
    userId: Number(row.userId ?? row.user_id),
    actorUserId: row.actorUserId ?? row.actor_user_id ?? null,
    type: row.type,
    title: row.title,
    body: row.body ?? null,
    href: row.href ?? null,
    imageUrl: row.imageUrl ?? row.image_url ?? null,
    readAt: toIso(row.readAt ?? row.read_at),
    createdAt: toIso(row.createdAt ?? row.created_at),
    actor: row.actor ?? null,
  };
}

export async function createNotification({
  userId,
  actorUserId,
  type,
  title,
  body,
  href,
  imageUrl,
}: {
  userId: number;
  actorUserId?: number | null;
  type: string;
  title: string;
  body?: string | null;
  href?: string | null;
  imageUrl?: string | null;
}) {
  if (!userId) return;

  await pool.query(
    `
      INSERT INTO notifications
        (user_id, actor_user_id, type, title, body, href, image_url)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      userId,
      actorUserId ?? null,
      type,
      title,
      body ?? null,
      href ?? null,
      imageUrl ?? null,
    ],
  );
}

router.get("/", requireAuth, async (req, res) => {
  const userId = req.session.userId!;

  const result = await pool.query(
    `
      SELECT
        n.id,
        n.user_id AS "userId",
        n.actor_user_id AS "actorUserId",
        n.type,
        n.title,
        n.body,
        n.href,
        n.image_url AS "imageUrl",
        n.read_at AS "readAt",
        n.created_at AS "createdAt",
        CASE
          WHEN actor.id IS NULL THEN NULL
          ELSE json_build_object(
            'id', actor.id,
            'username', actor.username,
            'displayName', actor.display_name,
            'avatarColor', actor.avatar_color,
            'avatarUrl', actor.avatar_url
          )
        END AS actor
      FROM notifications n
      LEFT JOIN users actor ON actor.id = n.actor_user_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT 100
    `,
    [userId],
  );

  res.json({
    notifications: result.rows.map(serializeNotification),
  });
});

router.get("/summary", requireAuth, async (req, res) => {
  const userId = req.session.userId!;

  const result = await pool.query(
    `
      SELECT COUNT(*)::int AS "unreadCount"
      FROM notifications
      WHERE user_id = $1
        AND read_at IS NULL
    `,
    [userId],
  );

  res.json({
    unreadCount: Number(result.rows[0]?.unreadCount ?? 0),
  });
});

router.post("/:id/read", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const notificationId = Number(req.params.id);

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return res.status(400).json({ error: "Invalid notification." });
  }

  await pool.query(
    `
      UPDATE notifications
      SET read_at = NOW()
      WHERE id = $1
        AND user_id = $2
    `,
    [notificationId, userId],
  );

  res.json({ ok: true });
});

router.post("/read-all", requireAuth, async (req, res) => {
  const userId = req.session.userId!;

  await pool.query(
    `
      UPDATE notifications
      SET read_at = NOW()
      WHERE user_id = $1
        AND read_at IS NULL
    `,
    [userId],
  );

  res.json({ ok: true });
});

export default router;
