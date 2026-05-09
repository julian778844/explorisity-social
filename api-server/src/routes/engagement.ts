
import { Router } from "express";

const router = Router();

router.post("/posts/:id/like", async (_req, res) => {
  res.json({ success: true });
});

router.post("/posts/:id/bookmark", async (_req, res) => {
  res.json({ success: true });
});

router.post("/posts/:id/comment", async (_req, res) => {
  res.json({ success: true });
});

router.post("/posts/:id/repost", async (_req, res) => {
  res.json({ success: true });
});

router.get("/me/likes", async (_req, res) => {
  res.json([]);
});

router.get("/me/bookmarks", async (_req, res) => {
  res.json([]);
});

export default router;
