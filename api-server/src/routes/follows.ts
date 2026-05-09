import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, followsTable, SCHOOL_TYPES, type SchoolType } from "@workspace/db";
import { followInputSchema } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const rows = await db.select().from(followsTable).where(eq(followsTable.userId, req.session.userId!));
  res.json({
    follows: rows.map((r) => ({
      id: r.id,
      schoolType: r.schoolType,
      schoolId: r.schoolId,
      createdAt: r.createdAt.toISOString(),
    })),
  });
});

router.post("/", async (req, res) => {
  const parsed = followInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { schoolType, schoolId } = parsed.data;
  try {
    await db
      .insert(followsTable)
      .values({ userId: req.session.userId!, schoolType, schoolId })
      .onConflictDoNothing();
    res.status(201).json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "follow failed");
    res.status(500).json({ error: "Follow failed" });
  }
});

router.delete("/:type/:id", async (req, res) => {
  const type = req.params.type;
  if (!SCHOOL_TYPES.includes(type as SchoolType)) {
    res.status(400).json({ error: "Invalid type" });
    return;
  }
  await db
    .delete(followsTable)
    .where(
      and(
        eq(followsTable.userId, req.session.userId!),
        eq(followsTable.schoolType, type as SchoolType),
        eq(followsTable.schoolId, req.params.id),
      ),
    );
  res.json({ ok: true });
});

export default router;
