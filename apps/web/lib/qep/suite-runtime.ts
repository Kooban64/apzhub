/**
 * Enterprise Test Suite Management runtime (APZQEP-140-A / APZQEP-151).
 * Production SoR: PostgreSQL. In-memory only when explicitly allowed.
 */

import { runInDatabaseTransaction } from "@apzhub/config";
import {
  createEnterpriseTestSuiteManagement,
  createSuitePersistence,
  type EnterpriseTestSuiteManagement,
} from "@apzhub/qep-suites";

import { createCoreQeOutboxPublisher } from "./persistence/core-qe-outbox";
import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";

const globalForSuites = globalThis as typeof globalThis & {
  __apzqepSuiteRuntime?: EnterpriseTestSuiteManagement;
};

export function getSuiteRuntime(): EnterpriseTestSuiteManagement {
  if (!globalForSuites.__apzqepSuiteRuntime) {
    const persistence = resolveCoreQePersistence();
    const repository = createSuitePersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    const publisher =
      persistence.mode === "postgres" && persistence.db
        ? createCoreQeOutboxPublisher({
            db: persistence.db,
            aggregateType: "qep_suite",
          })
        : undefined;
    const runInTransaction =
      persistence.mode === "postgres" && persistence.db
        ? <T>(fn: () => Promise<T>) => runInDatabaseTransaction(persistence.db!, fn)
        : undefined;
    globalForSuites.__apzqepSuiteRuntime = createEnterpriseTestSuiteManagement({
      repository,
      ...(publisher ? { publisher } : {}),
      ...(runInTransaction ? { runInTransaction } : {}),
    });
  }
  return globalForSuites.__apzqepSuiteRuntime;
}
