
import { Router } from "express";

const router = Router();

/*
 Install:
 pnpm add cloudinary multer multer-storage-cloudinary
*/

router.post("/avatar", async (_req, res) => {
  // Placeholder route
  // Wire Cloudinary upload middleware here
  return res.json({
    success: true,
    message: "Avatar upload endpoint scaffolded"
  });
});

export default router;
