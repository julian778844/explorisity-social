import { pgTable, serial, text, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { z } from "zod";

export const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 32 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    displayName: varchar("display_name", { length: 64 }).notNull(),
    bio: text("bio"),
    email: varchar("email", { length: 254 }),
    avatarColor: varchar("avatar_color", { length: 7 }).notNull().default("#7c3aed"),
    instagram: varchar("instagram", { length: 200 }),
    linkedin: varchar("linkedin", { length: 200 }),
    facebook: varchar("facebook", { length: 200 }),
    twitter: varchar("twitter", { length: 200 }),
    tiktok: varchar("tiktok", { length: 200 }),
    youtube: varchar("youtube", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("users_username_lower_idx").on(t.username)],
);

export type User = typeof usersTable.$inferSelect;

export const publicUserSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  displayName: z.string(),
  bio: z.string().nullable(),
  email: z.string().nullable(),
  avatarColor: z.string(),
  instagram: z.string().nullable(),
  linkedin: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  tiktok: z.string().nullable(),
  youtube: z.string().nullable(),
  createdAt: z.string(),
});
export type PublicUser = z.infer<typeof publicUserSchema>;

export function toPublicUser(u: User): PublicUser {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    bio: u.bio,
    email: u.email,
    avatarColor: u.avatarColor,
    instagram: u.instagram,
    linkedin: u.linkedin,
    facebook: u.facebook,
    twitter: u.twitter,
    tiktok: u.tiktok,
    youtube: u.youtube,
    createdAt: u.createdAt.toISOString(),
  };
}
