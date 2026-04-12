import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  primaryKey,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const provisioningJobs = pgTable(
  "provisioning_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    serviceId: text("service_id").notNull(),
    jobType: text("job_type").notNull(),
    desiredEffectiveRole: text("desired_effective_role"),
    status: text("status").notNull(),
    priority: integer("priority").notNull().default(0),
    idempotencyKey: text("idempotency_key").notNull(),
    triggerSource: text("trigger_source").notNull(),
    requestedBy: text("requested_by"),
    correlationId: text("correlation_id"),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    manualActionReason: text("manual_action_reason"),
    lastErrorCode: text("last_error_code"),
    lastErrorMessage: text("last_error_message"),
    retryCount: integer("retry_count").notNull().default(0),
    maxRetries: integer("max_retries").notNull().default(3),
    subjectLabel: text("subject_label").notNull(),
    payloadJson: jsonb("payload_json").$type<Record<string, unknown>>().notNull().default({}),
    verificationJson: jsonb("verification_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("provisioning_jobs_status_scheduled_idx").on(t.status, t.scheduledAt),
    index("provisioning_jobs_user_service_idx").on(t.userId, t.serviceId),
    uniqueIndex("provisioning_jobs_idempotency_active_unique")
      .on(t.idempotencyKey)
      .where(sql`${t.status} in ('queued', 'running', 'awaiting_manual')`),
  ],
);

export const provisioningJobAttempts = pgTable(
  "provisioning_job_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => provisioningJobs.id, { onDelete: "cascade" }),
    attemptNumber: integer("attempt_number").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    outcome: text("outcome").notNull().$type<"success" | "transient_failure" | "terminal_failure" | "manual_action">(),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    logContextJson: jsonb("log_context_json").$type<Record<string, unknown>>(),
  },
  (t) => [index("provisioning_job_attempts_job_idx").on(t.jobId)],
);

export const accessServiceRealizations = pgTable(
  "access_service_realizations",
  {
    userId: text("user_id").notNull(),
    serviceId: text("service_id").notNull(),
    realizationStatus: text("realization_status").notNull(),
    activeJobId: uuid("active_job_id").references(() => provisioningJobs.id, { onDelete: "set null" }),
    lastJobSummary: text("last_job_summary"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.serviceId] }),
    index("access_service_realizations_active_job_idx").on(t.activeJobId),
  ],
);

export const provisioningAuditEvents = pgTable(
  "provisioning_audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: text("type").notNull(),
    jobId: uuid("job_id").references(() => provisioningJobs.id, { onDelete: "set null" }),
    userId: text("user_id"),
    correlationId: text("correlation_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("provisioning_audit_events_job_created_idx").on(t.jobId, t.createdAt),
    index("provisioning_audit_events_type_created_idx").on(t.type, t.createdAt),
  ],
);
