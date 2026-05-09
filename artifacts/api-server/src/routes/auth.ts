import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db, usersTable, toPublicUser } from "@workspace/db";
import { signupSchema, loginSchema, updateProfileSchema } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please check your signup details.", details: parsed.error.flatten() });
  }

  const { username, password, displayName, email, phone, emailOptIn, smsOptIn, scholarshipAlerts, jobAlerts, schoolNewsAlerts } = parsed.data;

  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(email ? or(eq(usersTable.username, username), eq(usersTable.email, email)) : eq(usersTable.username, username))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "That username or email is already in use." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const COLORS = ["#7c3aed", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"];
    const avatarColor = COLORS[Math.floor(Math.random() * COLORS.length)]!;

    const [created] = await db
      .insert(usersTable)
      .values({
        username,
        passwordHash,
        displayName: displayName ?? username,
        email: email ?? null,
        phone: phone ?? null,
        emailOptIn,
        smsOptIn,
        scholarshipAlerts,
        jobAlerts,
        schoolNewsAlerts,
        avatarColor,
      })
      .returning();

    if (!created) throw new Error("Insert failed");

    req.session.userId = created.id;
    return res.status(201).json({ user: toPublicUser(created) });
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

  const { username, password } = parsed.data;
  const identifier = username.trim();

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(identifier.includes("@") ? eq(usersTable.email, identifier) : eq(usersTable.username, identifier))
      .limit(1);

    if (!user) return res.status(401).json({ error: "Invalid username/email or password." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid username/email or password." });

    req.session.userId = user.id;
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    req.log.error({ err }, "login failed");
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("explorisity.sid");
    res.json({ ok: true });
  });
});

router.get("/me", async (req, res) => {
  if (!req.session?.userId) return res.json({ user: null });
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user) {
    req.session.destroy(() => {});
    return res.json({ user: null });
  }
  return res.json({ user: toPublicUser(user) });
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

export default router;
