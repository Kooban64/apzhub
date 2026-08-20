/**
 * APZQEP Phase 3 — Test management additive tables.
 * Specification, Suite, and Test Plan remain the authoritative aggregates.
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

export const qepTestSpecificationStep = pgTable(
  "qep_test_specification_step",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    specificationId: text("specification_id").notNull(),
    stepOrder: integer("step_order").notNull(),
    action: text("action").notNull(),
    testDataRef: text("test_data_ref"),
    expectedResult: text("expected_result").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    orderUidx: uniqueIndex("qep_test_specification_step_order_uidx").on(
      t.tenantId,
      t.specificationId,
      t.stepOrder,
    ),
    specIdx: index("qep_test_specification_step_spec_idx").on(
      t.tenantId,
      t.specificationId,
    ),
  }),
);

export const qepSuiteItem = pgTable(
  "qep_suite_item",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    suiteId: text("suite_id").notNull(),
    specificationId: text("specification_id").notNull(),
    sequence: integer("sequence").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    membershipUidx: uniqueIndex("qep_suite_item_membership_uidx").on(
      t.suiteId,
      t.specificationId,
    ),
    tenantSuiteIdx: index("qep_suite_item_tenant_suite_idx").on(t.tenantId, t.suiteId),
  }),
);

export const qepTestPlanSuiteItem = pgTable(
  "qep_test_plan_suite_item",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    planId: text("plan_id").notNull(),
    suiteId: text("suite_id").notNull(),
    sequence: integer("sequence").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    membershipUidx: uniqueIndex("qep_test_plan_suite_item_uidx").on(
      t.planId,
      t.suiteId,
    ),
    planIdx: index("qep_test_plan_suite_item_plan_idx").on(t.tenantId, t.planId),
  }),
);

export const qepTestPlanStrategyGroup = pgTable(
  "qep_test_plan_strategy_group",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    planId: text("plan_id").notNull(),
    name: text("name").notNull(),
    verificationCapability: varchar("verification_capability", {
      length: 64,
    }).notNull(),
    executionSurface: varchar("execution_surface", { length: 32 }),
    environmentId: text("environment_id"),
    infrastructureTargetType: varchar("infrastructure_target_type", { length: 32 }),
    infrastructureTargetId: text("infrastructure_target_id"),
    automationMappingId: text("automation_mapping_id"),
    testDataRef: text("test_data_ref"),
    scheduleNote: text("schedule_note"),
    sequence: integer("sequence").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    planIdx: index("qep_test_plan_strategy_group_plan_idx").on(t.tenantId, t.planId),
  }),
);

export const qepTestCaseAutomationMapping = pgTable(
  "qep_test_case_automation_mapping",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    applicationId: text("application_id").notNull(),
    specificationId: text("specification_id").notNull(),
    verificationCapability: varchar("verification_capability", {
      length: 64,
    }).notNull(),
    providerId: text("provider_id"),
    assetRef: text("asset_ref"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
    updatedBy: text("updated_by").notNull(),
  },
  (t) => ({
    specIdx: index("qep_test_case_automation_mapping_spec_idx").on(
      t.tenantId,
      t.specificationId,
    ),
  }),
);

export const qepExecutionDefinitionSnapshot = pgTable(
  "qep_execution_definition_snapshot",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id").notNull(),
    executionKind: varchar("execution_kind", { length: 32 }).notNull(),
    specificationId: text("specification_id").notNull(),
    specificationNumber: text("specification_number").notNull(),
    definitionVersion: integer("definition_version").notNull(),
    stepsJson: jsonb("steps_json")
      .$type<
        {
          order: number;
          action: string;
          testDataRef?: string;
          expectedResult: string;
        }[]
      >()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    execIdx: index("qep_execution_definition_snapshot_exec_idx").on(
      t.tenantId,
      t.executionId,
    ),
  }),
);

export const qepExecutionScopeSnapshot = pgTable(
  "qep_execution_scope_snapshot",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id").notNull(),
    executionKind: varchar("execution_kind", { length: 32 }).notNull(),
    planId: text("plan_id"),
    suiteId: text("suite_id"),
    memberSpecificationIdsJson: jsonb("member_specification_ids_json")
      .$type<string[]>()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    execIdx: index("qep_execution_scope_snapshot_exec_idx").on(
      t.tenantId,
      t.executionId,
    ),
  }),
);

export const qepTestExecutionDefect = pgTable(
  "qep_test_execution_defect",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    testExecutionId: text("test_execution_id").notNull(),
    defectId: text("defect_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    uidx: uniqueIndex("qep_test_execution_defect_uidx").on(
      t.testExecutionId,
      t.defectId,
    ),
  }),
);

export const qepExecutionStrategySnapshot = pgTable(
  "qep_execution_strategy_snapshot",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id").notNull(),
    executionKind: varchar("execution_kind", { length: 32 }).notNull(),
    planId: text("plan_id"),
    strategyGroupId: text("strategy_group_id"),
    verificationCapability: varchar("verification_capability", { length: 64 }),
    executionSurface: varchar("execution_surface", { length: 32 }),
    environmentId: text("environment_id"),
    environmentName: text("environment_name"),
    infrastructureTargetType: varchar("infrastructure_target_type", { length: 32 }),
    infrastructureTargetId: text("infrastructure_target_id"),
    infrastructureTargetName: text("infrastructure_target_name"),
    automationMappingId: text("automation_mapping_id"),
    providerId: text("provider_id"),
    assetRef: text("asset_ref"),
    testDataRef: text("test_data_ref"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    execIdx: index("qep_execution_strategy_snapshot_exec_idx").on(
      t.tenantId,
      t.executionId,
    ),
  }),
);

export const qepTestExecutionRelation = pgTable(
  "qep_test_execution_relation",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    executionId: text("execution_id").notNull(),
    relationKind: varchar("relation_kind", { length: 16 }).notNull(),
    previousExecutionId: text("previous_execution_id").notNull(),
    triggeringDefectId: text("triggering_defect_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").notNull(),
  },
  (t) => ({
    execIdx: index("qep_test_execution_relation_exec_idx").on(
      t.tenantId,
      t.executionId,
    ),
    prevIdx: index("qep_test_execution_relation_prev_idx").on(
      t.tenantId,
      t.previousExecutionId,
    ),
  }),
);

export const qepTestExecutionAutomationLink = pgTable(
  "qep_test_execution_automation_link",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    testExecutionId: text("test_execution_id").notNull(),
    automationExecutionId: text("automation_execution_id").notNull(),
    correlationId: text("correlation_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  },
  (t) => ({
    uidx: uniqueIndex("qep_test_execution_automation_link_uidx").on(
      t.testExecutionId,
      t.automationExecutionId,
    ),
    tenantIdx: index("qep_test_execution_automation_link_tenant_idx").on(
      t.tenantId,
      t.testExecutionId,
    ),
  }),
);

export const qepTestManagementSchema = {
  qepTestSpecificationStep,
  qepSuiteItem,
  qepTestPlanSuiteItem,
  qepTestPlanStrategyGroup,
  qepTestCaseAutomationMapping,
  qepExecutionDefinitionSnapshot,
  qepExecutionScopeSnapshot,
  qepTestExecutionDefect,
  qepExecutionStrategySnapshot,
  qepTestExecutionRelation,
  qepTestExecutionAutomationLink,
};
