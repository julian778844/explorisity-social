import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import followsRouter from "./follows";
import socialRouter from "./social";
import searchRouter from "./search";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/follows", followsRouter);
router.use("/social", socialRouter);
router.use("/search", searchRouter);

export default router;
