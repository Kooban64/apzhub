/**
 * Platform QEP Verification Services factory (APZQEP-ENG-040B Part 2).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  createInMemoryVerificationSubjectResolver,
  createQepVerificationPersistenceForProduction,
  createQepVerificationPersistenceForTest,
  createVerificationApplicationService,
  type QepVerificationRepositories,
  type StoredVerification,
  type VerificationSubjectResolver,
} from "@apzhub/qep-verification";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createQepVerificationPlatformService,
  type QepVerificationPlatformService,
} from "./qep-verification-service-impl";

export type QepVerificationPlatformServicesBundle = {
  readonly persistence: QepVerificationRepositories;
  readonly service: QepVerificationPlatformService;
  readonly readiness: {
    readonly verificationEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
  };
  wrapWithPipeline(pipeline: RequestPipeline): QepVerificationPlatformService;
};

type CommonInput = {
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onVerificationUpserted?: (
    verification: StoredVerification,
  ) => void | Promise<void>;
  readonly subjectResolver?: VerificationSubjectResolver;
};

export type CreateQepVerificationPlatformServicesInput = CommonInput & {
  readonly persistence: QepVerificationRepositories;
  readonly persistenceMode?: "postgres" | "memory";
};

export type CreateQepVerificationPlatformServicesForProductionInput = CommonInput & {
  readonly postgresDb: DatabaseExecutor;
};

export type CreateQepVerificationPlatformServicesForTestInput = CommonInput & {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
};

export function wrapQepVerificationPlatformServiceWithPipeline(
  service: QepVerificationPlatformService,
  pipeline: RequestPipeline,
): QepVerificationPlatformService {
  return wrapServiceWithPipeline(
    service,
    pipeline,
    "qepVerification",
  ) as QepVerificationPlatformService;
}

function buildBundle(input: {
  readonly persistence: QepVerificationRepositories;
  readonly persistenceMode: "postgres" | "memory";
  readonly now?: () => string;
  readonly id?: () => string;
  readonly onVerificationUpserted?: (
    verification: StoredVerification,
  ) => void | Promise<void>;
  readonly subjectResolver?: VerificationSubjectResolver;
}): QepVerificationPlatformServicesBundle {
  // Cross-bounded-context subject existence checks (requirements, trace links,
  // test cases, evidence, certification, documents) are a documented follow-up
  // (ARCH-008 Service Connector integration); until wired, subjects resolve
  // permissively so Verification creation is not blocked on those domains
  // landing. Requirements/trace-backed resolvers can be supplied via
  // `subjectResolver` once the caller has that persistence in scope.
  const subjectResolver =
    input.subjectResolver ?? createInMemoryVerificationSubjectResolver();

  const application = createVerificationApplicationService({
    verifications: input.persistence.verifications,
    subjectResolver,
    now: input.now,
    id: input.id,
    onVerificationUpserted: input.onVerificationUpserted,
  });
  const service = createQepVerificationPlatformService(application);

  return {
    persistence: input.persistence,
    service,
    readiness: {
      verificationEnabled: true,
      persistenceMode: input.persistenceMode,
    },
    wrapWithPipeline: (pipeline) =>
      wrapQepVerificationPlatformServiceWithPipeline(service, pipeline),
  };
}

export function createQepVerificationPlatformServices(
  input: CreateQepVerificationPlatformServicesInput,
): QepVerificationPlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    now: input.now,
    id: input.id,
    onVerificationUpserted: input.onVerificationUpserted,
    subjectResolver: input.subjectResolver,
  });
}

export function createQepVerificationPlatformServicesForProduction(
  input: CreateQepVerificationPlatformServicesForProductionInput,
): QepVerificationPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createQepVerificationPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createQepVerificationPersistenceForProduction({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    now: input.now,
    id: input.id,
    onVerificationUpserted: input.onVerificationUpserted,
    subjectResolver: input.subjectResolver,
  });
}

export function createQepVerificationPlatformServicesForTest(
  input: CreateQepVerificationPlatformServicesForTestInput = {},
): QepVerificationPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createQepVerificationPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createQepVerificationPersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence,
  });
  return buildBundle({
    persistence,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
    now: input.now,
    id: input.id,
    onVerificationUpserted: input.onVerificationUpserted,
    subjectResolver: input.subjectResolver,
  });
}
