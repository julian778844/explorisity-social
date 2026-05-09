import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pinoHttp from "pino-http";
import { pool } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const PgStore = connectPgSimple(session);

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

const allowedOrigins = [
  ...(process.env.CORS_ORIGINS ?? "").split(","),
  process.env.FRONTEND_URL ?? "",
  "http://localhost:5173",
  "http://localhost:3000",
]
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET is required");
}

const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    store: new PgStore({ pool, createTableIfMissing: true, tableName: "user_sessions" }),
    name: "explorisity.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      // Cross-domain frontend/backend deployments need SameSite=None and Secure cookies.
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    },
  }),
);

// CSRF mitigation: require a non-simple custom header on all mutating requests.
// Browsers cannot send custom headers on cross-origin form submissions without
// triggering a CORS preflight.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
app.use("/api", (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  if (req.get("X-Requested-With") !== "explorisity") {
    return res.status(403).json({ error: "Missing CSRF header" });
  }
  next();
});

app.use("/api", router);

export default app;
