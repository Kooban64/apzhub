/**
 * QEP Test Execution persistence + port factories — APZQEP-ENG-100D.
 * Production requires PostgreSQL — no silent in-memory fallback.
 * Returns every outbound port required by
 * `createTestExecutionApplicationServices` (Application ENG-100C).
 */
import type { DatabaseExecutor } from "@apzhub/config";

import type {
  AuditPort,
  ClockPort,
  EventOutboxPort,
  EvidenceAccessPort,
  ExecutionHistoryStore,
  IdPort,
  PermissionPort,
  SearchPublicationPort,
  SourceResolutionPort,
  TestExecutionRepository,
} from "../application/ports";
import { createPermissionPort } from "./adapters/permission-port";
import {
  createSourceResolutionPort,
  createStaticSourceResolutionPort,
  type SourceResolveFn,
} from "./adapters/source-resolution-port";
import {
  createEvidenceAccessPort,
  type EvidenceAccessCheckFn,
} from "./adapters/evidence-access-port";
import { createSystemClockPort, createUuidIdPort } from "./adapters/clock-id-ports";
import { createInMemoryTestExecutionRepository } from "./in-memory/execution-repository";
import { createPostgresTestExecutionRepository } from "./postgres/execution-repository";
import { createPostgresExecutionHistoryStore } from "./postgres/execution-history-store";
import { createPostgresAuditPort } from "./postgres/audit-port";
import { createPostgresEventOutboxPort } from "./postgres/event-outbox-port";
import {
  createSearchPublicationPort,
  type SearchPublicationHook,
} from "./postgres/search-publication-port";
import {
  createInMemoryAuditPort,
  createInMemoryHistoryStore,
  createInMemoryOutboxPort,
  createNoopSearchPort,
} from "../application/testing/in-memory-ports";

export type QepTestExecutionPorts = {
  readonly executions: TestExecutionRepository;
  readonly history: ExecutionHistoryStore;
  readonly sources: SourceResolutionPort;
  readonly permissions: PermissionPort;
  readonly audit: AuditPort;
  readonly outbox: EventOutboxPort;
  readonly search: SearchPublicationPort;
  readonly evidenceAccess: EvidenceAccessPort;
  readonly clock: ClockPort;
  readonly ids: IdPort;
};

export type QepTestExecutionPortOverrides = {
  readonly resolveSource?: SourceResolveFn;
  readonly evidenceCheck?: EvidenceAccessCheckFn;
  readonly searchHook?: SearchPublicationHook;
};

export type CreateQepTestExecutionPersistenceInput = QepTestExecutionPortOverrides & {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
};

function buildPostgresPorts(
  db: DatabaseExecutor,
  overrides: QepTestExecutionPortOverrides = {},
): QepTestExecutionPorts {
  return {
    executions: createPostgresTestExecutionRepository(db),
    history: createPostgresExecutionHistoryStore(db),
    sources: createSourceResolutionPort(overrides.resolveSource),
    permissions: createPermissionPort(),
    audit: createPostgresAuditPort(db),
    outbox: createPostgresEventOutboxPort(db),
    search: createSearchPublicationPort(overrides.searchHook),
    evidenceAccess: createEvidenceAccessPort(overrides.evidenceCheck),
    clock: createSystemClockPort(),
    ids: createUuidIdPort(),
  };
}

function buildInMemoryPorts(
  overrides: QepTestExecutionPortOverrides = {},
): QepTestExecutionPorts {
  return {
    executions: createInMemoryTestExecutionRepository(),
    history: createInMemoryHistoryStore(),
    sources: overrides.resolveSource
      ? createSourceResolutionPort(overrides.resolveSource)
      : createStaticSourceResolutionPort(),
    permissions: createPermissionPort(),
    audit: createInMemoryAuditPort(),
    outbox: createInMemoryOutboxPort(),
    search: createNoopSearchPort(),
    evidenceAccess: createEvidenceAccessPort(overrides.evidenceCheck),
    clock: createSystemClockPort(),
    ids: createUuidIdPort(),
  };
}

export function createQepTestExecutionPersistence(
  input: CreateQepTestExecutionPersistenceInput,
): QepTestExecutionPorts {
  if (input.mode === "memory") {
    return buildInMemoryPorts(input);
  }
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error(
        "createQepTestExecutionPersistence({ mode: 'postgres' }) requires db — in-memory fallback is forbidden",
      );
    }
    return buildPostgresPorts(input.db, input);
  }
  throw new Error(
    `Unsupported QEP test execution persistence mode: ${String((input as { mode?: string }).mode)}`,
  );
}

export type CreateQepTestExecutionPersistenceForProductionInput =
  QepTestExecutionPortOverrides & {
    readonly db: DatabaseExecutor;
  };

export function createQepTestExecutionPersistenceForProduction(
  input: CreateQepTestExecutionPersistenceForProductionInput,
): QepTestExecutionPorts {
  if (!input?.db) {
    throw new Error(
      "createQepTestExecutionPersistenceForProduction requires explicit postgres db — in-memory fallback is forbidden",
    );
  }
  return buildPostgresPorts(input.db, input);
}

export type CreateQepTestExecutionPersistenceForTestInput =
  QepTestExecutionPortOverrides & {
    readonly postgresDb?: DatabaseExecutor;
    readonly allowInMemoryPersistence?: boolean;
  };

export function createQepTestExecutionPersistenceForTest(
  input: CreateQepTestExecutionPersistenceForTestInput = {},
): QepTestExecutionPorts {
  if (input.postgresDb) {
    return buildPostgresPorts(input.postgresDb, input);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error(
      "createQepTestExecutionPersistenceForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  return buildInMemoryPorts(input);
}
