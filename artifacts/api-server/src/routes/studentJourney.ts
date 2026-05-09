import { Router } from "express";

const router = Router();

router.get("/me", async (_req, res) => {
  res.json([]);
});

router.post("/", async (req, res) => {
  const { type, title, description, visibility } = req.body || {};
  res.json({
    success: true,
    journeyItem: {
      id: Date.now(),
      type,
      title,
      description,
      visibility: visibility || "public",
      createdAt: new Date().toISOString()
    }
  });
});

export default router;
