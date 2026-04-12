import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Append-only launch telemetry: initiated, redirect, success, failure, policy rejection. */
export const launchEventOutcomes = [
  "initiated",
  "redirect_started",
  "succeeded",
  "failed",
  "rejected",
] as const;

export type LaunchEventOutcome = (typeof launchEventOutcomes)[number];

export const launchEvents = pgTable(
  "launch_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** Nullable for anonymous execution failures (e.g. missing session). */
    userId: text("user_id"),
    serviceId: text("service_id").notNull(),
    launchMethod: text("launch_method").notNull(),
    readinessAtDecision: text("readiness_at_decision"),
    outcome: text("outcome").notNull().$type<LaunchEventOutcome>(),
    /** Policy {@link LaunchReasonCode} or execution {@link LAUNCH_EXECUTION_ERROR_CODES} string. */
    reasonCode: text("reason_code"),
    userMessage: text("user_message").notNull(),
    operatorMessage: text("operator_message"),
    correlationId: text("correlation_id").notNull().default(""),
    authSessionId: text("auth_session_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("launch_events_created_at_idx").on(t.createdAt)],
);
