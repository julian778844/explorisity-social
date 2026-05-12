import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import followsRouter from "./follows";
import socialRouter from "./social";
import searchRouter from "./search";
import uploadRouter from "./upload";
import engagementRouter from "./engagement";
import chanceMeRouter from "./chanceMe";
import studentJourneyRouter from "./studentJourney";
import academicBioRouter from "./academicBio";
import socialRankingsRouter from "./socialRankings";
import messagesRouter from "./messages";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/follows", followsRouter);
router.use("/social", socialRouter);
router.use("/search", searchRouter);
router.use("/upload", uploadRouter);
router.use("/engagement", engagementRouter);
router.use("/chance-me", chanceMeRouter);
router.use("/student-journey", studentJourneyRouter);
router.use("/academic-bio", academicBioRouter);
router.use("/social-rankings", socialRankingsRouter);
router.use("/messages", messagesRouter);
router.use("/notifications", notificationsRouter);

export default router;
