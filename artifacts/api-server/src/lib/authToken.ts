import crypto from "node:crypto";
import type { Request } from "express";

type AuthPayload = {
  userId: number;
  exp: number;
};

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required");
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function createAuthToken(userId: number): string {
  const payload: AuthPayload = {
    userId,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const encoded = base64url(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyAuthToken(token?: string | null): AuthPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const safeSignature = Buffer.from(signature);
  const safeExpected = Buffer.from(expected);

  if (safeSignature.length !== safeExpected.length) return null;
  if (!crypto.timingSafeEqual(safeSignature, safeExpected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AuthPayload;
    if (!payload.userId || !Number.isInteger(payload.userId)) return null;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getBearerToken(req: Request): string | null {
  const header = req.get("Authorization") ?? "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

export function getAuthenticatedUserId(req: Request): number | null {
  if (req.session?.userId) return req.session.userId;

  const payload = verifyAuthToken(getBearerToken(req));
  if (!payload) return null;

  req.session.userId = payload.userId;
  return payload.userId;
}
