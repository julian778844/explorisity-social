
import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  const q = String(req.query.q || "").toLowerCase();

  // Replace with real DB queries later
  const schools = [
    { id: 1, name: "Harvard University", type: "school" },
    { id: 2, name: "Brown University", type: "school" }
  ].filter((s) => s.name.toLowerCase().includes(q));

  const users = [
    { id: 1, username: "orlando", type: "user" }
  ].filter((u) => u.username.toLowerCase().includes(q));

  res.json({
    schools,
    users,
    communities: []
  });
});

export default router;
