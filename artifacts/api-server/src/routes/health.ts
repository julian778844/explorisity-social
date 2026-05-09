import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "explorisity-api" });
});

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok", service: "explorisity-api" });
});

export default router;
