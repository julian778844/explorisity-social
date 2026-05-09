import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db, usersTable, toPublicUser } from "@workspace/db";
import { signupSchema, loginSchema, updateProfileSchema } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { createAuthToken, getAuthenticatedUserId } from "../lib/authToken";

const router: IRouter = Router();

function saveSession(req: Express.Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function cleanLoginIdentifier(value: string): { type: "email" | "username"; value: string } {
  const trimmed = value.trim();
  if (trimmed.includes("@") && !trimmed.startsWith("@")) {
    return { type: "email", value: trimmed.toLowerCase() };
  }
  return { type: "username", value: trimmed.replace(/^@+/, "").toLowerCase() };
}

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Please check your signup details.",
      details: parsed.error.flatten(),
    });
  }

  const raw = parsed.data;
  const username = raw.username.trim().replace(/^@+/, "").toLowerCase();
  const email = raw.email?.trim().toLowerCase() || undefined;

  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(email ? or(eq(usersTable.username, username), eq(usersTable.email, email)) : eq(usersTable.username, username))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "That username or email is already taken." });
    }

    const passwordHash = await bcrypt.hash(raw.password, 12);
    const colors = ["#7c3aed", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)] ?? "#7c3aed";

    const [created] = await db
      .insert(usersTable)
      .values({
        username,
        passwordHash,
        displayName: raw.displayName?.trim() || username,
        email: email ?? null,
        phone: raw.phone?.trim() || null,
        emailOptIn: raw.emailOptIn,
        smsOptIn: raw.smsOptIn,
        scholarshipAlerts: raw.scholarshipAlerts,
        jobAlerts: raw.jobAlerts,
        schoolNewsAlerts: raw.schoolNewsAlerts,
        avatarColor,
      })
      .returning();

    if (!created) throw new Error("User insert failed");

    req.session.userId = created.id;
    await saveSession(req);

    return res.status(201).json({
      user: toPublicUser(created),
      authToken: createAuthToken(created.id),
    });
  } catch (err) {
    req.log.error({ err }, "signup failed");
    return res.status(500).json({ error: "Signup failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Enter your username/email and password." });
  }

  const identifier = cleanLoginIdentifier(parsed.data.username);

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(identifier.type === "email" ? eq(usersTable.email, identifier.value) : eq(usersTable.username, identifier.value))
      .limit(1);

    if (!user) return res.status(401).json({ error: "Invalid username/email or password." });

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid username/email or password." });

    req.session.userId = user.id;
    await saveSession(req);

    return res.json({
      user: toPublicUser(user),
      authToken: createAuthToken(user.id),
    });
  } catch (err) {
    req.log.error({ err }, "login failed");
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("explorisity.sid", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.json({ ok: true });
  });
});

router.get("/me", async (req, res) => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) return res.json({ user: null });

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    if (!user) {
      req.session.destroy(() => {});
      return res.json({ user: null });
    }

    req.session.userId = user.id;
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    req.log.error({ err }, "current user lookup failed");
    return res.status(500).json({ error: "Could not load current user." });
  }
});

router.patch("/me", requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid profile details." });

  try {
    const [updated] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, req.session.userId!)).returning();
    if (!updated) return res.status(404).json({ error: "User not found" });
    return res.json({ user: toPublicUser(updated) });
  } catch (err) {
    req.log.error({ err }, "update profile failed");
    return res.status(500).json({ error: "Update failed" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { emailOrUsername } = req.body || {};

  if (!emailOrUsername || typeof emailOrUsername !== "string") {
    return res.status(400).json({ error: "Enter your email or username." });
  }

  // Production note: connect email/SMS delivery here with Resend, SendGrid, or Twilio.
  // Always return success so people cannot discover whether an account exists.
  return res.json({ ok: true, message: "If an account exists, reset instructions were sent." });
});

export default router;
