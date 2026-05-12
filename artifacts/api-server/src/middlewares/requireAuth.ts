import type { Request, Response, NextFunction } from "express";
import { getAuthenticatedUserId } from "../lib/authToken";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = getAuthenticatedUserId(req);

  if (!userId) {
    res.status(401).json({ error: "Please sign in to continue." });
    return;
  }

  req.session.userId = userId;
  next();
}
