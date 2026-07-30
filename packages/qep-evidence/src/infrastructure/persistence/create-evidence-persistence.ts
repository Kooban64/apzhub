/**
 * Evidence persistence factory for Application wiring — APZQEP-ENG-110F.
 * Uses in-memory ports only (storage technology remains undecided — ADR-0088).
 * Not a production storage selection.
 */

import {
  createEvidenceApplicationServices,
  createInMemoryAuditPort,
  createInMemoryClockPort,
  createInMemoryIdPort,
  createInMemoryStoragePort,
  createInMemoryUnitOfWork,
  type EvidenceApplicationServices,
} from "../../application";

export type EvidenceRuntimeBundle = {
  readonly application: EvidenceApplicationServices;
  readonly persistenceMode: "memory";
};

/**
 * Build secured Application services backed by in-memory ports.
 * Suitable for transport/Workbench integration until a storage wave selects technology.
 */
export function createEvidenceRuntimeForMemory(input?: {
  readonly now?: string;
}): EvidenceRuntimeBundle {
  const uow = createInMemoryUnitOfWork();
  const application = createEvidenceApplicationServices({
    uow,
    storage: createInMemoryStoragePort(),
    clock: createInMemoryClockPort(input?.now),
    ids: createInMemoryIdPort(),
    audit: createInMemoryAuditPort(),
    secure: true,
  });
  return { application, persistenceMode: "memory" };
}

export function createEvidenceRuntimeForTest(): EvidenceRuntimeBundle {
  return createEvidenceRuntimeForMemory();
}

/**
 * Production Evidence runtime — memory until Owner-authorised storage selection.
 * Explicitly named so callers do not confuse this with a silent DB fallback.
 */
export function createEvidenceRuntimeForProduction(): EvidenceRuntimeBundle {
  return createEvidenceRuntimeForMemory();
}
