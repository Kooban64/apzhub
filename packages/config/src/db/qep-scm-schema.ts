/**
 * APZQEP QX-PR-02 — Durable SCM SoR.
 * PostgreSQL is the production Source of Record for repository registration,
 * webhook audits, idempotency keys, and traceability links.
 * Payload shapes owned by @apzhub/platform-scm (stored as jsonb).
 */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const qepScmRepository = pgTable(
  "qep_scm_repository",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    providerId: varchar("provider_id", { length: 64 }).notNull(),
    fullName: text("full_name").notNull(),
    repositoryJson: jsonb("repository_json").$type<Record<string, unknown>>().notNull(),
    revision: integer("revision").notNull().default(1),
    registeredAt: timestamp("registered_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_scm_repository_tenant_idx").on(t.tenantId),
    tenantProviderNameUidx: uniqueIndex(
      "qep_scm_repository_tenant_provider_name_uidx",
    ).on(t.tenantId, t.providerId, t.fullName),
    tenantUpdatedIdx: index("qep_scm_repository_tenant_updated_idx").on(
      t.tenantId,
      t.updatedAt,
    ),
  }),
);

export const qepScmWebhookAudit = pgTable(
  "qep_scm_webhook_audit",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    providerId: varchar("provider_id", { length: 64 }).notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    auditJson: jsonb("audit_json").$type<Record<string, unknown>>().notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    tenantOccurredIdx: index("qep_scm_webhook_audit_tenant_occurred_idx").on(
      t.tenantId,
      t.occurredAt,
    ),
    idempotencyIdx: index("qep_scm_webhook_audit_idempotency_idx").on(t.idempotencyKey),
  }),
);

export const qepScmWebhookIdempotency = pgTable(
  "qep_scm_webhook_idempotency",
  {
    idempotencyKey: text("idempotency_key").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    seenAt: timestamp("seen_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    tenantIdx: index("qep_scm_webhook_idempotency_tenant_idx").on(t.tenantId),
  }),
);

export const qepScmTraceabilityLink = pgTable(
  "qep_scm_traceability_link",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    repositoryId: text("repository_id").notNull(),
    linkJson: jsonb("link_json").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    repositoryIdx: index("qep_scm_traceability_link_repository_idx").on(t.repositoryId),
    tenantIdx: index("qep_scm_traceability_link_tenant_idx").on(t.tenantId),
  }),
);

/** Flagship F1 — durable commit / PR / push heartbeat records. */
export const qepScmChangeEvent = pgTable(
  "qep_scm_change_event",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    repositoryId: text("repository_id"),
    providerId: varchar("provider_id", { length: 64 }).notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    externalKey: text("external_key").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    changeJson: jsonb("change_json").$type<Record<string, unknown>>().notNull(),
  },
  (t) => ({
    tenantOccurredIdx: index("qep_scm_change_event_tenant_occurred_idx").on(
      t.tenantId,
      t.occurredAt,
    ),
    repositoryOccurredIdx: index("qep_scm_change_event_repository_occurred_idx").on(
      t.repositoryId,
      t.occurredAt,
    ),
    tenantProviderKeyUidx: uniqueIndex(
      "qep_scm_change_event_tenant_provider_key_uidx",
    ).on(t.tenantId, t.providerId, t.externalKey, t.kind),
  }),
);

export const qepScmSchema = {
  qepScmRepository,
  qepScmWebhookAudit,
  qepScmWebhookIdempotency,
  qepScmTraceabilityLink,
  qepScmChangeEvent,
};
