import { jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./schema";

export const platformUserPreference = pgTable(
  "platform_user_preference",
  {
    preferenceId: text("preference_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    preferenceKey: text("preference_key").notNull(),
    value: jsonb("value").$type<unknown>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_user_preference_user_category_key_uidx").on(
      table.userId,
      table.category,
      table.preferenceKey,
    ),
  ],
);

export const platformUserFavorite = pgTable(
  "platform_user_favorite",
  {
    favoriteId: text("favorite_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(),
    itemKey: text("item_key").notNull(),
    label: text("label").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_user_favorite_user_item_uidx").on(
      table.userId,
      table.itemType,
      table.itemKey,
    ),
  ],
);

export const platformUserRecentItem = pgTable(
  "platform_user_recent_item",
  {
    recentId: text("recent_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(),
    itemKey: text("item_key").notNull(),
    label: text("label").notNull(),
    accessedAt: timestamp("accessed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_user_recent_item_user_item_uidx").on(
      table.userId,
      table.itemType,
      table.itemKey,
    ),
  ],
);

export const platformUserWorkbenchLayout = pgTable("platform_user_workbench_layout", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  layout: jsonb("layout").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const platformPersonalisationSchema = {
  platformUserPreference,
  platformUserFavorite,
  platformUserRecentItem,
  platformUserWorkbenchLayout,
};
