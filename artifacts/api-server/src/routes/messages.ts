import { Router, type IRouter } from "express";
import { z } from "zod";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const dmInputSchema = z.object({
  recipientUserId: z.number().int().positive(),
});

const sendMessageSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

function toIso(value: unknown) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(String(value)).toISOString();
}

function serializeConversation(row: any) {
  return {
    id: Number(row.id),
    type: row.type ?? "dm",
    name: row.name ?? null,
    requestStatus: row.requestStatus ?? row.request_status ?? null,
    requestId: row.requestId ? Number(row.requestId) : row.request_id ? Number(row.request_id) : null,
    otherUser: row.otherUser ?? row.other_user ?? null,
    lastMessage: row.lastMessage ?? row.last_message ?? null,
    lastMessageAt: toIso(row.lastMessageAt ?? row.last_message_at),
    updatedAt: toIso(row.updatedAt ?? row.updated_at),
    unreadCount: Number(row.unreadCount ?? row.unread_count ?? 0),
    isRequest: Boolean(row.isRequest ?? row.is_request ?? false),
  };
}

function serializeMessage(row: any) {
  return {
    id: Number(row.id),
    conversationId: Number(row.conversationId ?? row.conversation_id),
    senderId: Number(row.senderId ?? row.sender_id),
    recipientUserId: row.recipientUserId ?? row.recipient_user_id ?? null,
    body: row.body,
    readAt: toIso(row.readAt ?? row.read_at),
    createdAt: toIso(row.createdAt ?? row.created_at),
    updatedAt: toIso(row.updatedAt ?? row.updated_at),
    sender: row.sender ?? null,
  };
}

async function assertConversationMember(conversationId: number, userId: number) {
  const result = await pool.query(
    `
      SELECT 1
      FROM conversation_members
      WHERE conversation_id = $1 AND user_id = $2
      LIMIT 1
    `,
    [conversationId, userId],
  );

  return Boolean(result.rows[0]);
}

async function getOtherUserId(conversationId: number, userId: number) {
  const result = await pool.query(
    `
      SELECT user_id
      FROM conversation_members
      WHERE conversation_id = $1 AND user_id <> $2
      LIMIT 1
    `,
    [conversationId, userId],
  );

  return result.rows[0]?.user_id ? Number(result.rows[0].user_id) : null;
}

async function usersMutuallyFollow(a: number, b: number) {
  const result = await pool.query(
    `
      SELECT
        EXISTS (
          SELECT 1 FROM user_follows
          WHERE follower_id = $1 AND following_id = $2
        ) AS "aFollowsB",
        EXISTS (
          SELECT 1 FROM user_follows
          WHERE follower_id = $2 AND following_id = $1
        ) AS "bFollowsA"
    `,
    [a, b],
  );

  return Boolean(result.rows[0]?.aFollowsB && result.rows[0]?.bFollowsA);
}

async function findExistingDm(userA: number, userB: number) {
  const result = await pool.query(
    `
      SELECT c.id
      FROM conversations c
      JOIN conversation_members a ON a.conversation_id = c.id AND a.user_id = $1
      JOIN conversation_members b ON b.conversation_id = c.id AND b.user_id = $2
      WHERE c.type = 'dm'
      LIMIT 1
    `,
    [userA, userB],
  );

  return result.rows[0]?.id ? Number(result.rows[0].id) : null;
}

async function getConversationById(conversationId: number, currentUserId: number) {
  const result = await pool.query(
    `
      SELECT
        c.id,
        c.type,
        c.name,
        c.updated_at AS "updatedAt",
        c.last_message_at AS "lastMessageAt",
        mr.status AS "requestStatus",
        mr.id AS "requestId",
        (
          mr.status = 'pending'
          AND mr.recipient_user_id = $1
        ) AS "isRequest",
        json_build_object(
          'id', other_user.id,
          'username', other_user.username,
          'displayName', other_user.display_name,
          'bio', other_user.bio,
          'avatarColor', other_user.avatar_color,
          'avatarUrl', other_user.avatar_url
        ) AS "otherUser",
        last_msg.body AS "lastMessage",
        (
          SELECT COUNT(*)
          FROM messages unread
          WHERE unread.conversation_id = c.id
            AND unread.recipient_user_id = $1
            AND unread.read_at IS NULL
        )::int AS "unreadCount"
      FROM conversations c
      JOIN conversation_members self_member
        ON self_member.conversation_id = c.id
       AND self_member.user_id = $1
      LEFT JOIN conversation_members other_member
        ON other_member.conversation_id = c.id
       AND other_member.user_id <> $1
      LEFT JOIN users other_user
        ON other_user.id = other_member.user_id
      LEFT JOIN message_requests mr
        ON mr.conversation_id = c.id
      LEFT JOIN messages last_msg
        ON last_msg.id = c.last_message_id
      WHERE c.id = $2
      LIMIT 1
    `,
    [currentUserId, conversationId],
  );

  return result.rows[0] ? serializeConversation(result.rows[0]) : null;
}

async function createNotification({
  userId,
  actorUserId,
  conversationId,
  type,
  preview,
}: {
  userId: number;
  actorUserId: number;
  conversationId: number;
  type: string;
  preview: string;
}) {
  await pool.query(
    `
      INSERT INTO message_notifications
        (user_id, actor_user_id, conversation_id, type, preview)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [userId, actorUserId, conversationId, type, preview.slice(0, 220)],
  );

  try {
    const actorResult = await pool.query(
      "SELECT username, display_name, avatar_url FROM users WHERE id = $1 LIMIT 1",
      [actorUserId]
    );
    const actor = actorResult.rows[0];
    const isRequest = type === "message_request";

    await pool.query(
      `
        INSERT INTO notifications
          (user_id, actor_user_id, type, title, body, href, image_url)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        userId,
        actorUserId,
        type,
        isRequest ? "New message request" : "New message",
        `${actor?.display_name ?? actor?.username ?? "Someone"}: ${preview.slice(0, 180)}`,
        `/messages?conversation=${conversationId}`,
        actor?.avatar_url ?? null,
      ]
    );
  } catch (error) {
    console.error("App notification insert failed:", error);
  }
}

router.get("/summary", requireAuth, async (req, res) => {
  const userId = req.session.userId!;

  const result = await pool.query(
    `
      SELECT
        (
          SELECT COUNT(*)
          FROM messages m
          JOIN conversations c ON c.id = m.conversation_id
          LEFT JOIN message_requests mr ON mr.conversation_id = c.id
          WHERE m.recipient_user_id = $1
            AND m.read_at IS NULL
            AND (mr.status IS NULL OR mr.status = 'accepted')
        )::int AS "unreadInboxCount",
        (
          SELECT COUNT(*)
          FROM message_requests
          WHERE recipient_user_id = $1 AND status = 'pending'
        )::int AS "pendingRequestCount"
    `,
    [userId],
  );

  const unreadInboxCount = Number(result.rows[0]?.unreadInboxCount ?? 0);
  const pendingRequestCount = Number(result.rows[0]?.pendingRequestCount ?? 0);

  res.json({
    unreadInboxCount,
    pendingRequestCount,
    unreadTotal: unreadInboxCount + pendingRequestCount,
  });
});

router.get("/conversations", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const box = String(req.query.box ?? "inbox");
  const q = String(req.query.q ?? "").trim().toLowerCase();

  const params: any[] = [userId];
  let where = `
    self_member.user_id = $1
  `;

  if (box === "requests") {
    where += `
      AND mr.status = 'pending'
      AND mr.recipient_user_id = $1
    `;
  } else {
    where += `
      AND (mr.status IS NULL OR mr.status = 'accepted')
    `;
  }

  if (q) {
    params.push(`%${q}%`);
    where += `
      AND (
        lower(other_user.username) LIKE $${params.length}
        OR lower(other_user.display_name) LIKE $${params.length}
        OR lower(COALESCE(last_msg.body, '')) LIKE $${params.length}
      )
    `;
  }

  const result = await pool.query(
    `
      SELECT
        c.id,
        c.type,
        c.name,
        c.updated_at AS "updatedAt",
        c.last_message_at AS "lastMessageAt",
        mr.status AS "requestStatus",
        mr.id AS "requestId",
        (
          mr.status = 'pending'
          AND mr.recipient_user_id = $1
        ) AS "isRequest",
        json_build_object(
          'id', other_user.id,
          'username', other_user.username,
          'displayName', other_user.display_name,
          'bio', other_user.bio,
          'avatarColor', other_user.avatar_color,
          'avatarUrl', other_user.avatar_url
        ) AS "otherUser",
        last_msg.body AS "lastMessage",
        (
          SELECT COUNT(*)
          FROM messages unread
          WHERE unread.conversation_id = c.id
            AND unread.recipient_user_id = $1
            AND unread.read_at IS NULL
        )::int AS "unreadCount"
      FROM conversations c
      JOIN conversation_members self_member
        ON self_member.conversation_id = c.id
      LEFT JOIN conversation_members other_member
        ON other_member.conversation_id = c.id
       AND other_member.user_id <> $1
      LEFT JOIN users other_user
        ON other_user.id = other_member.user_id
      LEFT JOIN message_requests mr
        ON mr.conversation_id = c.id
      LEFT JOIN messages last_msg
        ON last_msg.id = c.last_message_id
      WHERE ${where}
      ORDER BY COALESCE(c.last_message_at, c.updated_at, c.created_at) DESC
      LIMIT 100
    `,
    params,
  );

  res.json({ conversations: result.rows.map(serializeConversation) });
});

router.post("/dm", requireAuth, async (req, res) => {
  const parsed = dmInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid recipient." });
  }

  const currentUserId = req.session.userId!;
  const recipientUserId = parsed.data.recipientUserId;

  if (recipientUserId === currentUserId) {
    return res.status(400).json({ error: "You cannot message yourself." });
  }

  const userExists = await pool.query("SELECT id FROM users WHERE id = $1 LIMIT 1", [recipientUserId]);

  if (!userExists.rows[0]) {
    return res.status(404).json({ error: "User not found." });
  }

  let conversationId = await findExistingDm(currentUserId, recipientUserId);

  if (!conversationId) {
    const created = await pool.query(
      `
        INSERT INTO conversations (type, created_by_id, updated_at)
        VALUES ('dm', $1, NOW())
        RETURNING id
      `,
      [currentUserId],
    );

    conversationId = Number(created.rows[0].id);

    await pool.query(
      `
        INSERT INTO conversation_members (conversation_id, user_id)
        VALUES ($1, $2), ($1, $3)
        ON CONFLICT DO NOTHING
      `,
      [conversationId, currentUserId, recipientUserId],
    );

    const accepted = await usersMutuallyFollow(currentUserId, recipientUserId);

    await pool.query(
      `
        INSERT INTO message_requests
          (conversation_id, sender_user_id, recipient_user_id, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (conversation_id) DO NOTHING
      `,
      [conversationId, currentUserId, recipientUserId, accepted ? "accepted" : "pending"],
    );

    if (!accepted) {
      await createNotification({
        userId: recipientUserId,
        actorUserId: currentUserId,
        conversationId,
        type: "message_request",
        preview: "sent you a message request",
      });
    }
  }

  const conversation = await getConversationById(conversationId, currentUserId);
  res.status(201).json({ conversation });
});

router.get("/conversations/:id/messages", requireAuth, async (req, res) => {
  const conversationId = Number(req.params.id);
  const userId = req.session.userId!;

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: "Invalid conversation." });
  }

  const isMember = await assertConversationMember(conversationId, userId);

  if (!isMember) {
    return res.status(403).json({ error: "You do not belong to this conversation." });
  }

  const result = await pool.query(
    `
      SELECT
        m.id,
        m.conversation_id AS "conversationId",
        m.sender_id AS "senderId",
        m.recipient_user_id AS "recipientUserId",
        m.body,
        m.read_at AS "readAt",
        m.created_at AS "createdAt",
        m.updated_at AS "updatedAt",
        json_build_object(
          'id', sender.id,
          'username', sender.username,
          'displayName', sender.display_name,
          'avatarColor', sender.avatar_color,
          'avatarUrl', sender.avatar_url
        ) AS sender
      FROM messages m
      JOIN users sender ON sender.id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      LIMIT 500
    `,
    [conversationId],
  );

  await pool.query(
    `
      UPDATE messages
      SET read_at = NOW(), updated_at = NOW()
      WHERE conversation_id = $1
        AND recipient_user_id = $2
        AND read_at IS NULL
    `,
    [conversationId, userId],
  );

  const conversation = await getConversationById(conversationId, userId);

  res.json({
    conversation,
    messages: result.rows.map(serializeMessage),
  });
});

router.post("/conversations/:id/messages", requireAuth, async (req, res) => {
  const conversationId = Number(req.params.id);
  const userId = req.session.userId!;
  const parsed = sendMessageSchema.safeParse(req.body);

  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return res.status(400).json({ error: "Invalid conversation." });
  }

  if (!parsed.success) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  const isMember = await assertConversationMember(conversationId, userId);

  if (!isMember) {
    return res.status(403).json({ error: "You do not belong to this conversation." });
  }

  const recipientUserId = await getOtherUserId(conversationId, userId);

  if (!recipientUserId) {
    return res.status(400).json({ error: "No recipient found." });
  }

  const request = await pool.query(
    "SELECT id, status, sender_user_id, recipient_user_id FROM message_requests WHERE conversation_id = $1 LIMIT 1",
    [conversationId],
  );

  if (request.rows[0]?.status === "declined") {
    return res.status(403).json({ error: "This message request was declined." });
  }

  const inserted = await pool.query(
    `
      INSERT INTO messages
        (conversation_id, sender_id, recipient_user_id, body)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        conversation_id AS "conversationId",
        sender_id AS "senderId",
        recipient_user_id AS "recipientUserId",
        body,
        read_at AS "readAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [conversationId, userId, recipientUserId, parsed.data.body],
  );

  const message = inserted.rows[0];

  await pool.query(
    `
      UPDATE conversations
      SET last_message_id = $1,
          last_message_at = NOW(),
          updated_at = NOW()
      WHERE id = $2
    `,
    [message.id, conversationId],
  );

  const requestRow = request.rows[0];
  const isPendingRequest = requestRow?.status === "pending";

  await createNotification({
    userId: recipientUserId,
    actorUserId: userId,
    conversationId,
    type: isPendingRequest ? "message_request" : "direct_message",
    preview: parsed.data.body,
  });

  const sender = await pool.query(
    `
      SELECT json_build_object(
        'id', id,
        'username', username,
        'displayName', display_name,
        'avatarColor', avatar_color,
        'avatarUrl', avatar_url
      ) AS sender
      FROM users
      WHERE id = $1
    `,
    [userId],
  );

  res.status(201).json({
    message: serializeMessage({
      ...message,
      sender: sender.rows[0]?.sender ?? null,
    }),
  });
});

router.post("/conversations/:id/read", requireAuth, async (req, res) => {
  const conversationId = Number(req.params.id);
  const userId = req.session.userId!;

  const isMember = await assertConversationMember(conversationId, userId);

  if (!isMember) {
    return res.status(403).json({ error: "You do not belong to this conversation." });
  }

  await pool.query(
    `
      UPDATE messages
      SET read_at = NOW(), updated_at = NOW()
      WHERE conversation_id = $1
        AND recipient_user_id = $2
        AND read_at IS NULL
    `,
    [conversationId, userId],
  );

  res.json({ ok: true });
});

router.post("/requests/:id/accept", requireAuth, async (req, res) => {
  const requestId = Number(req.params.id);
  const userId = req.session.userId!;

  const result = await pool.query(
    `
      UPDATE message_requests
      SET status = 'accepted',
          updated_at = NOW()
      WHERE id = $1
        AND recipient_user_id = $2
        AND status = 'pending'
      RETURNING conversation_id, sender_user_id
    `,
    [requestId, userId],
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: "Message request not found." });
  }

  await createNotification({
    userId: Number(result.rows[0].sender_user_id),
    actorUserId: userId,
    conversationId: Number(result.rows[0].conversation_id),
    type: "message_request_accepted",
    preview: "accepted your message request",
  });

  res.json({ ok: true });
});

router.post("/requests/:id/decline", requireAuth, async (req, res) => {
  const requestId = Number(req.params.id);
  const userId = req.session.userId!;

  const result = await pool.query(
    `
      UPDATE message_requests
      SET status = 'declined',
          updated_at = NOW()
      WHERE id = $1
        AND recipient_user_id = $2
        AND status = 'pending'
      RETURNING id
    `,
    [requestId, userId],
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: "Message request not found." });
  }

  res.json({ ok: true });
});

export default router;
