/**
 * APZQEP QX-PR-04 — Durable Dashboard layout / saved-view SoR.
 * PostgreSQL is the production Source of Record for Wave 4 user layouts.
 * Payload shapes are owned by @apzhub/platform-dashboard (stored as jsonb).
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const qepDashboardLayout = pgTable(
  "qep_dashboard_layout",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    userId: text("user_id").notNull(),
    dashboardId: text("dashboard_id").notNull(),
    layoutJson: jsonb("layout_json").$type<Record<string, unknown>>().notNull(),
    revision: integer("revision").notNull().default(1),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_dashboard_layout_tenant_idx").on(t.tenantId),
    tenantUserIdx: index("qep_dashboard_layout_tenant_user_idx").on(
      t.tenantId,
      t.userId,
    ),
    tenantDashboardIdx: index("qep_dashboard_layout_tenant_dashboard_idx").on(
      t.tenantId,
      t.dashboardId,
    ),
    tenantUpdatedIdx: index("qep_dashboard_layout_tenant_updated_idx").on(
      t.tenantId,
      t.updatedAt,
    ),
  }),
);

export const qepDashboardSavedView = pgTable(
  "qep_dashboard_saved_view",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    userId: text("user_id").notNull(),
    dashboardId: text("dashboard_id").notNull(),
    pinned: boolean("pinned").notNull().default(false),
    favourite: boolean("favourite").notNull().default(false),
    viewJson: jsonb("view_json").$type<Record<string, unknown>>().notNull(),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_dashboard_saved_view_tenant_idx").on(t.tenantId),
    tenantUserIdx: index("qep_dashboard_saved_view_tenant_user_idx").on(
      t.tenantId,
      t.userId,
    ),
    tenantPinnedIdx: index("qep_dashboard_saved_view_tenant_pinned_idx").on(
      t.tenantId,
      t.userId,
      t.pinned,
    ),
    tenantUpdatedIdx: index("qep_dashboard_saved_view_tenant_updated_idx").on(
      t.tenantId,
      t.updatedAt,
    ),
  }),
);

export const qepDashboardSchema = {
  qepDashboardLayout,
  qepDashboardSavedView,
};
