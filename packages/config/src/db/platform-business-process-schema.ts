import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

type StageJson = {
  id: string;
  name: string;
  description?: string;
  order: number;
  responsibility?: string;
  entryCondition?: string;
  exitCondition?: string;
};

type TransitionJson = {
  id: string;
  fromStageId: string;
  toStageId: string;
  name: string;
  outcome?: string;
};

export const platformBusinessJourney = pgTable(
  "platform_business_journey",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    name: text("name").notNull(),
    summary: text("summary").notNull(),
    outcomes: jsonb("outcomes").$type<string[]>().notNull().default([]),
    stages: jsonb("stages").$type<StageJson[]>().notNull().default([]),
    transitions: jsonb("transitions").$type<TransitionJson[]>().notNull().default([]),
    processOwner: text("process_owner").notNull(),
    businessSteward: text("business_steward").notNull(),
    version: integer("version").notNull().default(1),
    publicationStatus: text("publication_status").notNull(),
    reviewCycleDays: integer("review_cycle_days"),
    nextReviewAt: timestamp("next_review_at", { withTimezone: true }),
    templateKey: text("template_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("platform_business_journey_tenant_idx").on(t.tenantId)],
);

export const platformBusinessProcessTemplate = pgTable(
  "platform_business_process_template",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    summary: text("summary").notNull(),
    defaultOutcomes: jsonb("default_outcomes").$type<string[]>().notNull().default([]),
    defaultStages: jsonb("default_stages").$type<unknown[]>().notNull().default([]),
    defaultTransitions: jsonb("default_transitions")
      .$type<unknown[]>()
      .notNull()
      .default([]),
    version: integer("version").notNull().default(1),
    editable: boolean("editable").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("platform_business_process_template_tenant_key_idx").on(
      t.tenantId,
      t.key,
    ),
  ],
);

export const platformBusinessProcessInstance = pgTable(
  "platform_business_process_instance",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    journeyId: text("journey_id").notNull(),
    title: text("title").notNull(),
    currentStageId: text("current_stage_id").notNull(),
    status: text("status").notNull(),
    enteredStageAt: timestamp("entered_stage_at", { withTimezone: true }).notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_business_process_instance_journey_idx").on(t.tenantId, t.journeyId),
  ],
);

export const platformBusinessProcessAudit = pgTable(
  "platform_business_process_audit",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    journeyId: text("journey_id").notNull(),
    action: text("action").notNull(),
    fromStatus: text("from_status"),
    toStatus: text("to_status"),
    actor: text("actor").notNull(),
    notes: text("notes"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("platform_business_process_audit_journey_idx").on(t.tenantId, t.journeyId),
  ],
);

export const platformBusinessProcessSchema = {
  platformBusinessJourney,
  platformBusinessProcessTemplate,
  platformBusinessProcessInstance,
  platformBusinessProcessAudit,
};
