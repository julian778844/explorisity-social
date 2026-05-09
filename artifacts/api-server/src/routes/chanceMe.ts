import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  const { gpa, testType, testScore, school } = req.body || {};
  let score = 45;
  const numericGpa = Number(gpa || 0);
  const numericTestScore = Number(testScore || 0);

  if (numericGpa >= 3.8) score += 20;
  else if (numericGpa >= 3.4) score += 10;

  if (testType === "SAT" && numericTestScore >= 1450) score += 20;
  if (testType === "ACT" && numericTestScore >= 32) score += 20;
  if (testType === "MCAT" && numericTestScore >= 515) score += 20;
  if (testType === "LSAT" && numericTestScore >= 165) score += 20;
  if (testType === "GMAT" && numericTestScore >= 700) score += 20;

  score = Math.max(5, Math.min(score, 95));
  const category = score >= 70 ? "Likely" : score >= 45 ? "Target" : "Reach";

  res.json({
    category,
    score,
    school,
    summary: `${school || "This school"} looks like a ${category.toLowerCase()} option based on the information provided.`,
    recommendedActions: [
      "Compare this school with two similar programs.",
      "Review community posts from students at this school.",
      "Save the school to your profile.",
      "Explore rankings connected to your intended major."
    ]
  });
});

export default router;
