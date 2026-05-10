import { Router } from "express";
import { desc, ilike, or } from "drizzle-orm";
import {
  db,
  usersTable,
  toPublicUser,
  communitiesTable,
  postsTable,
} from "@workspace/db";

const router = Router();

const schools = [
  { id: "harvard", name: "Harvard University", type: "undergrad", href: "/university/harvard" },
  { id: "brown", name: "Brown University", type: "undergrad", href: "/university/brown" },
  { id: "penn-state", name: "Penn State University", type: "undergrad", href: "/university/penn-state" },
  { id: "nyu", name: "New York University", type: "undergrad", href: "/university/nyu" },
  { id: "upenn", name: "University of Pennsylvania", type: "undergrad", href: "/university/upenn" },
  { id: "mit", name: "Massachusetts Institute of Technology", type: "undergrad", href: "/university/mit" },
  { id: "stanford", name: "Stanford University", type: "undergrad", href: "/university/stanford" },
  { id: "columbia", name: "Columbia University", type: "undergrad", href: "/university/columbia" },
];

function serializePost(post: any) {
  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const q = String(req.query.q || "").trim();

  if (!q) {
    return res.json({
      schools: [],
      users: [],
      communities: [],
      posts: [],
      opportunities: [],
    });
  }

  const lowered = q.toLowerCase();
  const schoolMatches = schools
    .filter((s) => s.name.toLowerCase().includes(lowered))
    .slice(0, 8);

  try {
    const users = await db
      .select()
      .from(usersTable)
      .where(
        or(
          ilike(usersTable.username, `%${q}%`),
          ilike(usersTable.displayName, `%${q}%`),
          ilike(usersTable.email, `%${q}%`),
        ),
      )
      .limit(8);

    const communities = await db
      .select()
      .from(communitiesTable)
      .where(
        or(
          ilike(communitiesTable.name, `%${q}%`),
          ilike(communitiesTable.description, `%${q}%`),
        ),
      )
      .limit(8);

    const posts = await db
      .select()
      .from(postsTable)
      .where(
        or(
          ilike(postsTable.title, `%${q}%`),
          ilike(postsTable.body, `%${q}%`),
          ilike(postsTable.category, `%${q}%`),
        ),
      )
      .orderBy(desc(postsTable.createdAt))
      .limit(12);

    const opportunities = posts.filter((p) =>
      ["job", "event", "promotion"].includes(p.category),
    );

    return res.json({
      schools: schoolMatches,
      users: users.map(toPublicUser),
      communities: communities.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
      posts: posts.map(serializePost),
      opportunities: opportunities.map(serializePost),
    });
  } catch (err) {
    req.log.error({ err }, "search failed");
    return res.json({
      schools: schoolMatches,
      users: [],
      communities: [],
      posts: [],
      opportunities: [],
    });
  }
});

export default router;
