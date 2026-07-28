export const QEP_TEST_PLANS_VERSION = "1.0.0";
export const QEP_TEST_PLANS_PROGRAMME =
  "APZQEP-TEST-PLANS 1.0.0 CERTIFIED FROZEN" as const;

export * from "./domain";
export { PLAN_DOMAIN_EVENT_TYPES } from "./domain/test-plan/plan-events";
export * from "./shared";
export * from "./application";
export { QEP_TEST_PLANS_INFRASTRUCTURE_STATUS } from "./infrastructure";
export {
  createQepTestPlanPersistence,
  createQepTestPlanPersistenceForProduction,
  createQepTestPlanPersistenceForTest,
  createEmptyTestPlanStore,
  type QepTestPlanRepositories,
  type CreateQepTestPlanPersistenceInput,
  type CreateQepTestPlanPersistenceForProductionInput,
  type CreateQepTestPlanPersistenceForTestInput,
  type TestPlanInMemoryStore,
} from "./infrastructure";
