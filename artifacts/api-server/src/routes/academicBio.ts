import { Router } from "express";

const router = Router();

router.get("/me", async (_req, res) => {
  res.json({
    gpa: null,
    sat: null,
    act: null,
    mcat: null,
    lsat: null,
    gmat: null,
    intendedMajor: null,
    careerGoal: null,
    country: null,
    demographicBackground: null,
    isPublic: true
  });
});

router.patch("/me", async (req, res) => {
  res.json({
    success: true,
    academicBio: req.body
  });
});

export default router;
