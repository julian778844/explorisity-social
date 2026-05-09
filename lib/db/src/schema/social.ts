import { pgTable, serial, integer, text, varchar, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const POST_CATEGORIES = ["promotion", "job", "event", "general"] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export const userFollowsTable = pgTable(
  "user_follows",
  {
    id: serial("id").primaryKey(),
    followerId: integer("follower_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    followingId: integer("following_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("user_follows_uidx").on(t.followerId, t.followingId),
    index("user_follows_follower_idx").on(t.followerId),
    index("user_follows_following_idx").on(t.followingId),
  ],
);

export const communitiesTable = pgTable(
  "communities",
  {
    id: serial("id").primaryKey(),
    schoolType: varchar("school_type", { length: 16 }).notNull(),
    schoolId: varchar("school_id", { length: 80 }).notNull(),
    name: varchar("name", { length: 140 }).notNull(),
    description: text("description"),
    createdById: integer("created_by_id").references(() => usersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("communities_school_uidx").on(t.schoolType, t.schoolId), index("communities_school_idx").on(t.schoolType, t.schoolId)],
);

export const communityMembersTable = pgTable(
  "community_members",
  {
    id: serial("id").primaryKey(),
    communityId: integer("community_id").notNull().references(() => communitiesTable.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 24 }).notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("community_members_uidx").on(t.communityId, t.userId), index("community_members_user_idx").on(t.userId)],
);

export const postsTable = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    authorId: integer("author_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    communityId: integer("community_id").references(() => communitiesTable.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 24 }).notNull().$type<PostCategory>().default("general"),
    title: varchar("title", { length: 160 }).notNull(),
    body: text("body").notNull(),
    url: varchar("url", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("posts_community_idx").on(t.communityId), index("posts_author_idx").on(t.authorId), index("posts_category_idx").on(t.category)],
);

export const conversationsTable = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 16 }).notNull().default("dm"),
    name: varchar("name", { length: 140 }),
    communityId: integer("community_id").references(() => communitiesTable.id, { onDelete: "cascade" }),
    createdById: integer("created_by_id").references(() => usersTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("conversations_community_idx").on(t.communityId)],
);

export const conversationMembersTable = pgTable(
  "conversation_members",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("conversation_members_uidx").on(t.conversationId, t.userId), index("conversation_members_user_idx").on(t.userId)],
);

export const messagesTable = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
    senderId: integer("sender_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId), index("messages_sender_idx").on(t.senderId)],
);
