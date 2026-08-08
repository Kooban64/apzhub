/**
 * APZQEP QX-PR-01 — Durable Automation execution SoR.
 * PostgreSQL is the production Source of Record for Wave 1 executions.
 * Payload shape is owned by @apzhub/platform-automation (stored as jsonb).
 */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const qepAutomationExecution = pgTable(
  "qep_automation_execution",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    projectId: text("project_id"),
    providerId: varchar("provider_id", { length: 64 }).notNull(),
    correlationId: text("correlation_id").notNull(),
    requestedBy: text("requested_by").notNull(),
    state: varchar("state", { length: 32 }).notNull(),
    attempt: integer("attempt").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(1),
    executionJson: jsonb("execution_json").$type<Record<string, unknown>>().notNull(),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_automation_execution_tenant_idx").on(t.tenantId),
    tenantStateIdx: index("qep_automation_execution_tenant_state_idx").on(
      t.tenantId,
      t.state,
    ),
    tenantUpdatedIdx: index("qep_automation_execution_tenant_updated_idx").on(
      t.tenantId,
      t.updatedAt,
    ),
    correlationIdx: index("qep_automation_execution_correlation_idx").on(
      t.tenantId,
      t.correlationId,
    ),
  }),
);

export const qepAutomationSchema = {
  qepAutomationExecution,
};
