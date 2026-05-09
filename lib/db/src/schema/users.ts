import { pgTable, serial, text, varchar, timestamp, index, boolean } from "drizzle-orm/pg-core";
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
    phone: varchar("phone", { length: 32 }),
    avatarColor: varchar("avatar_color", { length: 7 }).notNull().default("#7c3aed"),
    instagram: varchar("instagram", { length: 200 }),
    linkedin: varchar("linkedin", { length: 200 }),
    facebook: varchar("facebook", { length: 200 }),
    twitter: varchar("twitter", { length: 200 }),
    tiktok: varchar("tiktok", { length: 200 }),
    youtube: varchar("youtube", { length: 200 }),
    emailOptIn: boolean("email_opt_in").notNull().default(true),
    smsOptIn: boolean("sms_opt_in").notNull().default(false),
    scholarshipAlerts: boolean("scholarship_alerts").notNull().default(true),
    jobAlerts: boolean("job_alerts").notNull().default(true),
    schoolNewsAlerts: boolean("school_news_alerts").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("users_username_lower_idx").on(t.username), index("users_email_idx").on(t.email)],
);

export type User = typeof usersTable.$inferSelect;

export const publicUserSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  displayName: z.string(),
  bio: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  avatarColor: z.string(),
  instagram: z.string().nullable(),
  linkedin: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  tiktok: z.string().nullable(),
  youtube: z.string().nullable(),
  emailOptIn: z.boolean(),
  smsOptIn: z.boolean(),
  scholarshipAlerts: z.boolean(),
  jobAlerts: z.boolean(),
  schoolNewsAlerts: z.boolean(),
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
    phone: u.phone,
    avatarColor: u.avatarColor,
    instagram: u.instagram,
    linkedin: u.linkedin,
    facebook: u.facebook,
    twitter: u.twitter,
    tiktok: u.tiktok,
    youtube: u.youtube,
    emailOptIn: u.emailOptIn,
    smsOptIn: u.smsOptIn,
    scholarshipAlerts: u.scholarshipAlerts,
    jobAlerts: u.jobAlerts,
    schoolNewsAlerts: u.schoolNewsAlerts,
    createdAt: u.createdAt.toISOString(),
  };
}
