import { Router } from "express";

const router = Router();

router.get("/", async (_req, res) => {
  res.json({
    mostFollowedSchools: [],
    mostDiscussedSchools: [],
    fastestGrowingCommunities: [],
    bestNetworkingCommunities: [],
    trendingThisWeek: []
  });
});

export default router;
