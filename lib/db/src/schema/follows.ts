import { pgTable, serial, integer, varchar, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const SCHOOL_TYPES = ["undergrad", "law", "mba", "med", "trade"] as const;
export type SchoolType = (typeof SCHOOL_TYPES)[number];

export const followsTable = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    schoolType: varchar("school_type", { length: 16 }).notNull().$type<SchoolType>(),
    schoolId: varchar("school_id", { length: 80 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("follows_user_school_uidx").on(t.userId, t.schoolType, t.schoolId),
    index("follows_user_idx").on(t.userId),
  ],
);

export type Follow = typeof followsTable.$inferSelect;
