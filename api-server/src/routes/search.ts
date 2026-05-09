import { Router, type IRouter } from "express";
import { ilike, or, desc } from "drizzle-orm";
import { db, usersTable, toPublicUser, postsTable } from "@workspace/db";

const router: IRouter = Router();

const opportunities = [
  { id: "internships", title: "Internships", subtitle: "Student internships, early career roles, and application tips", href: "/social?category=job", meta: "Opportunities" },
  { id: "scholarships", title: "Scholarships", subtitle: "Scholarship posts, funding leads, and financial aid discussions", href: "/social?category=promotion", meta: "Funding" },
  { id: "research", title: "Research opportunities", subtitle: "Labs, assistant roles, and faculty-backed projects", href: "/social?category=job", meta: "Experience" },
  { id: "events", title: "Campus events", subtitle: "Admissions events, open houses, and student meetups", href: "/social?category=event", meta: "Events" },
];

router.get("/", async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) return res.json({ results: [] });
  const pattern = `%${q}%`;

  const users = await db
    .select()
    .from(usersTable)
    .where(or(ilike(usersTable.username, pattern), ilike(usersTable.displayName, pattern), ilike(usersTable.bio, pattern)))
    .limit(8);

  const posts = await db
    .select()
    .from(postsTable)
    .where(or(ilike(postsTable.title, pattern), ilike(postsTable.body, pattern), ilike(postsTable.category, pattern)))
    .orderBy(desc(postsTable.createdAt))
    .limit(6);

  const lower = q.toLowerCase();
  const matchedOpportunities = opportunities.filter((item) =>
    [item.title, item.subtitle, item.meta].some((value) => value.toLowerCase().includes(lower)),
  );

  res.json({
    results: [
      ...users.map((u) => {
        const user = toPublicUser(u);
        return { id: `user-${user.id}`, type: "user", title: user.displayName, subtitle: `@${user.username}${user.bio ? ` · ${user.bio}` : ""}`, href: `/profile/${user.id}`, meta: "Student profile" };
      }),
      ...posts.map((p) => ({ id: `post-${p.id}`, type: "opportunity", title: p.title, subtitle: p.body.slice(0, 140), href: `/social?post=${p.id}`, meta: p.category })),
      ...matchedOpportunities.map((item) => ({ ...item, type: "opportunity" })),
    ],
  });
});

export default router;
