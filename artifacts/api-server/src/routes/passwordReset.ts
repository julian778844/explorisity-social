import { Router } from "express";

const router = Router();

router.post("/forgot-password", async (req, res) => {
  const { emailOrUsername } = req.body || {};

  if (!emailOrUsername || typeof emailOrUsername !== "string") {
    return res.status(400).json({ message: "Email or username is required." });
  }

  // Production note:
  // Add token creation + email/SMS delivery here.
  // For security, always return success so attackers cannot confirm accounts.
  return res.json({
    ok: true,
    message: "If an account exists, password reset instructions were sent.",
  });
});

export default router;
