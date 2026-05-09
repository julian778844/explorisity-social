import { Router } from "express";
import { ilike, or } from "drizzle-orm";
import { db, usersTable, toPublicUser, communitiesTable } from "@workspace/db";

const router = Router();

const schools = [
  { id: "harvard", name: "Harvard University", type: "school" },
  { id: "brown", name: "Brown University", type: "school" },
  { id: "penn-state", name: "Penn State University", type: "school" },
  { id: "nyu", name: "New York University", type: "school" },
  { id: "upenn", name: "University of Pennsylvania", type: "school" },
];

router.get("/", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ schools: [], users: [], communities: [] });

  const lowered = q.toLowerCase();
  const schoolMatches = schools.filter((s) => s.name.toLowerCase().includes(lowered)).slice(0, 8);

  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(or(ilike(usersTable.username, `%${q}%`), ilike(usersTable.displayName, `%${q}%`)))
      .limit(8);

    const communities = await db
      .select()
      .from(communitiesTable)
      .where(or(ilike(communitiesTable.name, `%${q}%`), ilike(communitiesTable.description, `%${q}%`)))
      .limit(8);

    res.json({
      schools: schoolMatches,
      users: users.map(toPublicUser),
      communities: communities.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
    });
  } catch (err) {
    req.log.error({ err }, "search failed");
    res.json({ schools: schoolMatches, users: [], communities: [] });
  }
});

export default router;
