import { Router } from "express";
import authRouter from "./auth";
import followsRouter from "./follows";
import searchRouter from "./search";
import socialRouter from "./social";
import uploadRouter from "./upload";
import chanceMeRouter from "./chanceMe";
import academicBioRouter from "./academicBio";
import studentJourneyRouter from "./studentJourney";
import socialRankingsRouter from "./socialRankings";
import passwordResetRouter from "./passwordReset";

const router = Router();

router.use("/auth", authRouter);
router.use("/auth", passwordResetRouter);
router.use("/follows", followsRouter);
router.use("/search", searchRouter);
router.use("/social", socialRouter);
router.use("/upload", uploadRouter);
router.use("/chance-me", chanceMeRouter);
router.use("/academic-bio", academicBioRouter);
router.use("/student-journey", studentJourneyRouter);
router.use("/social-rankings", socialRankingsRouter);

export default router;
