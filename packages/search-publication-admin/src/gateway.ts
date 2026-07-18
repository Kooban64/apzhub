/**
 * Publication Administration Gateway — authz boundary before service (APZSEARCH-017).
 * Presentation must not call the orchestrator directly.
 */

import type { SearchPublicationAdminService } from "./service";
import type { PublicationAdminActor } from "./types";

export type SearchPublicationAdminGateway = SearchPublicationAdminService;

export function createSearchPublicationAdminGateway(
  service: SearchPublicationAdminService,
): SearchPublicationAdminGateway {
  // Service already enforces deny-by-default permissions per call.
  // Gateway exists as the mandatory architectural boundary for HTTP/Workbench.
  return {
    listPublications: (actor, query) => service.listPublications(actor, query),
    getPublication: (actor, id) => service.getPublication(actor, id),
    getQueueSummary: (actor) => service.getQueueSummary(actor),
    getProductSummaries: (actor) => service.getProductSummaries(actor),
    getDiagnostics: (actor) => service.getDiagnostics(actor),
    retryPublication: (actor, id) => service.retryPublication(actor, id),
    retryPublications: (actor, ids) => service.retryPublications(actor, ids),
    retryFailedBatch: (actor, limit) => service.retryFailedBatch(actor, limit),
    clearCompletedRetries: (actor) => service.clearCompletedRetries(actor),
    acknowledgeDeadLetter: (actor, id, reason) =>
      service.acknowledgeDeadLetter(actor, id, reason),
    archiveDeadLetter: (actor, id, reason) =>
      service.archiveDeadLetter(actor, id, reason),
    retryDeadLetter: (actor, id) => service.retryDeadLetter(actor, id),
    drainBatch: (actor) => service.drainBatch(actor),
    listAudit: (actor, limit) => service.listAudit(actor, limit),
  };
}

export type { PublicationAdminActor };
