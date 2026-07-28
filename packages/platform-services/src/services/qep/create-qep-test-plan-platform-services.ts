/**
 * Platform QEP Test Plan Services factory (APZQEP-ENG-060B Part 2).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  createPlanApplicationService,
  createQepTestPlanPersistenceForProduction,
  createQepTestPlanPersistenceForTest,
  type QepTestPlanRepositories,
} from "@apzhub/qep-test-plans";
import type { StoredTestPlan } from "@apzhub/qep-test-plans/domain";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createQepTestPlanPlatformService,
  type QepTestPlanPlatformService,
} from "./qep-test-plan-service-impl";

export type QepTestPlanPlatformServicesBundle = {
  readonly persistence: QepTestPlanRepositories;
  readonly service: QepTestPlanPlatformService;
  readonly readiness: {
    readonly planEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
  };
  wrapWithPipeline(pipeline: RequestPipeline): QepTestPlanPlatformService;
};

type CommonInput = {
  readonly now?: () => string;
  readonly id?: () => string;
  readonly allocateNumber?: (ctx: { readonly tenantId: string }) => Promise<string> | string;
  readonly onPlanUpserted?: (plan: StoredTestPlan) => void | Promise<void>;
};

export type CreateQepTestPlanPlatformServicesInput = CommonInput & {
  readonly persistence: QepTestPlanRepositories;
  readonly persistenceMode?: "postgres" | "memory";
};

export type CreateQepTestPlanPlatformServicesForProductionInput = CommonInput & {
  readonly postgresDb: DatabaseExecutor;
};

export type CreateQepTestPlanPlatformServicesForTestInput = CommonInput & {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
};

export function wrapQepTestPlanPlatformServiceWithPipeline(
  service: QepTestPlanPlatformService,
  pipeline: RequestPipeline,
): QepTestPlanPlatformService {
  return wrapServiceWithPipeline(service, pipeline, "qepTestPlan") as QepTestPlanPlatformService;
}

function buildBundle(input: {
  readonly persistence: QepTestPlanRepositories;
  readonly persistenceMode: "postgres" | "memory";
  readonly now?: () => string;
  readonly id?: () => string;
  readonly allocateNumber?: (ctx: { readonly tenantId: string }) => Promise<string> | string;
  readonly onPlanUpserted?: (plan: StoredTestPlan) => void | Promise<void>;
}): QepTestPlanPlatformServicesBundle {
  const application = createPlanApplicationService({
    plans: input.persistence.plans,
    now: input.now,
    id: input.id,
    allocateNumber: input.allocateNumber,
    onPlanUpserted: input.onPlanUpserted,
  });
  const service = createQepTestPlanPlatformService(application);

  return {
    persistence: input.persistence,
    service,
    readiness: {
      planEnabled: true,
      persistenceMode: input.persistenceMode,
    },
    wrapWithPipeline: (pipeline) => wrapQepTestPlanPlatformServiceWithPipeline(service, pipeline),
  };
}

export function createQepTestPlanPlatformServices(
  input: CreateQepTestPlanPlatformServicesInput,
): QepTestPlanPlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    now: input.now,
    id: input.id,
    allocateNumber: input.allocateNumber,
    onPlanUpserted: input.onPlanUpserted,
  });
}

export function createQepTestPlanPlatformServicesForProduction(
  input: CreateQepTestPlanPlatformServicesForProductionInput,
): QepTestPlanPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createQepTestPlanPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createQepTestPlanPersistenceForProduction({ db: input.postgresDb });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    now: input.now,
    id: input.id,
    allocateNumber: input.allocateNumber,
    onPlanUpserted: input.onPlanUpserted,
  });
}

export function createQepTestPlanPlatformServicesForTest(
  input: CreateQepTestPlanPlatformServicesForTestInput = {},
): QepTestPlanPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createQepTestPlanPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createQepTestPlanPersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence,
  });
  return buildBundle({
    persistence,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
    now: input.now,
    id: input.id,
    allocateNumber: input.allocateNumber,
    onPlanUpserted: input.onPlanUpserted,
  });
}
