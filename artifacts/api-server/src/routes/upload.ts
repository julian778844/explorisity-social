import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, toPublicUser } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const MAX_AVATAR_DATA_URL_LENGTH = 3_000_000; // roughly 2MB file after base64 encoding
const ALLOWED_IMAGE_DATA_URL = /^data:image\/(png|jpe?g|webp);base64,/i;

router.post("/avatar", requireAuth, async (req, res) => {
  const avatarDataUrl = String(req.body?.avatarDataUrl || "");

  if (!avatarDataUrl) {
    return res.status(400).json({ error: "Choose an image to upload." });
  }

  if (!ALLOWED_IMAGE_DATA_URL.test(avatarDataUrl)) {
    return res.status(400).json({ error: "Profile picture must be PNG, JPG, JPEG, or WEBP." });
  }

  if (avatarDataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
    return res.status(400).json({ error: "Profile picture is too large. Use an image under 2MB." });
  }

  try {
    const [updated] = await db
      .update(usersTable)
      .set({ avatarUrl: avatarDataUrl })
      .where(eq(usersTable.id, req.session.userId!))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({ user: toPublicUser(updated) });
  } catch (err) {
    req.log.error({ err }, "avatar upload failed");
    return res.status(500).json({ error: "Profile picture upload failed. Please try again." });
  }
});

export default router;
