/**
 * Process-local Enterprise Test Suite Management runtime (APZQEP-140-A).
 * In-memory SoR for LIMITED_AVAILABILITY; postgres adapter is a follow-on.
 */

import {
  createEnterpriseTestSuiteManagement,
  type EnterpriseTestSuiteManagement,
} from "@apzhub/qep-suites";

const globalForSuites = globalThis as typeof globalThis & {
  __apzqepSuiteRuntime?: EnterpriseTestSuiteManagement;
};

export function getSuiteRuntime(): EnterpriseTestSuiteManagement {
  if (!globalForSuites.__apzqepSuiteRuntime) {
    globalForSuites.__apzqepSuiteRuntime = createEnterpriseTestSuiteManagement();
  }
  return globalForSuites.__apzqepSuiteRuntime;
}
