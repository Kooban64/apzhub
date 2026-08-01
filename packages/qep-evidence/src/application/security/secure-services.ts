/**
 * Secured Application facades — APZQEP-ENG-110E.
 * Wraps ENG-110D orchestration without modifying domain or business rules.
 */

import type { EvidenceRequestContext } from "../context";
import type { EvidenceCommandService } from "../services/evidence-command-service";
import type { EvidenceQueryService } from "../services/evidence-query-service";
import type { EvidenceAccessCheckResult } from "../dto/evidence-dto";
import { computeLifecycleAvailableActions } from "../available-actions";
import type { EvidenceEnumerationService } from "../query";
import { applyEnumerationAcl } from "./enumeration-acl";
import type { EvidenceSecurityGate } from "./security-gate";
import type { EvidenceSecurityOperation } from "./operations";
import { decisionGrantsAccess } from "./types";

function evidenceIdFrom(command: {
  readonly evidenceId?: string;
  readonly id?: string;
}): string | undefined {
  return command.evidenceId;
}

export function createSecuredEvidenceCommandService(
  inner: EvidenceCommandService,
  gate: EvidenceSecurityGate,
): EvidenceCommandService {
  return {
    async captureEvidence(ctx, command) {
      await gate.authorize(ctx, "captureEvidence");
      return inner.captureEvidence(ctx, command);
    },
    async validateEvidence(ctx, command) {
      await gate.authorize(ctx, "validateEvidence", {
        evidenceId: command.evidenceId,
      });
      return inner.validateEvidence(ctx, command);
    },
    async classifyEvidence(ctx, command) {
      await gate.authorize(ctx, "classifyEvidence", {
        evidenceId: command.evidenceId,
      });
      return inner.classifyEvidence(ctx, command);
    },
    async updateEvidenceMetadata(ctx, command) {
      await gate.authorize(ctx, "updateEvidenceMetadata", {
        evidenceId: command.evidenceId,
      });
      return inner.updateEvidenceMetadata(ctx, command);
    },
    async associateEvidence(ctx, command) {
      await gate.authorize(ctx, "associateEvidence", {
        evidenceId: command.evidenceId,
        evidenceReference: {
          evidenceId: command.evidenceId,
          capabilityLocalId: command.targetId,
        },
      });
      return inner.associateEvidence(ctx, command);
    },
    async requestReview(ctx, command) {
      await gate.authorize(ctx, "requestReview", {
        evidenceId: command.evidenceId,
      });
      return inner.requestReview(ctx, command);
    },
    async approveEvidence(ctx, command) {
      await gate.authorize(ctx, "approveEvidence", {
        evidenceId: command.evidenceId,
      });
      return inner.approveEvidence(ctx, command);
    },
    async rejectEvidence(ctx, command) {
      await gate.authorize(ctx, "rejectEvidence", {
        evidenceId: command.evidenceId,
      });
      return inner.rejectEvidence(ctx, command);
    },
    async quarantineEvidence(ctx, command) {
      await gate.authorize(ctx, "quarantineEvidence", {
        evidenceId: command.evidenceId,
      });
      return inner.quarantineEvidence(ctx, command);
    },
    async sealEvidence(ctx, command) {
      await gate.authorize(ctx, "sealEvidence", {
        evidenceId: command.evidenceId,
      });
      return inner.sealEvidence(ctx, command);
    },
    async versionEvidence(ctx, command) {
      await gate.authorize(ctx, "versionEvidence", {
        evidenceId: command.evidenceId,
      });
      return inner.versionEvidence(ctx, command);
    },
    async applyLegalHold(ctx, command) {
      await gate.authorize(ctx, "applyLegalHold", {
        evidenceId: command.evidenceId,
      });
      return inner.applyLegalHold(ctx, command);
    },
    async releaseLegalHold(ctx, command) {
      await gate.authorize(ctx, "releaseLegalHold", {
        evidenceId: command.evidenceId,
      });
      return inner.releaseLegalHold(ctx, command);
    },
    async archiveEvidence(ctx, command) {
      await gate.authorize(ctx, "archiveEvidence", {
        evidenceId: command.evidenceId,
      });
      return inner.archiveEvidence(ctx, command);
    },
    async disposeEvidence(ctx, command) {
      await gate.authorize(ctx, "disposeEvidence", {
        evidenceId: command.evidenceId,
      });
      return inner.disposeEvidence(ctx, command);
    },
    async verifyIntegrity(ctx, command) {
      await gate.authorize(ctx, "verifyIntegrity", {
        evidenceId: command.evidenceId,
      });
      return inner.verifyIntegrity(ctx, command);
    },
    async createCollection(ctx, command) {
      await gate.authorize(ctx, "createCollection");
      return inner.createCollection(ctx, command);
    },
    async addToCollection(ctx, command) {
      await gate.authorize(ctx, "addToCollection", {
        collectionId: command.collectionId,
        evidenceId: command.evidenceId,
      });
      return inner.addToCollection(ctx, command);
    },
    async removeFromCollection(ctx, command) {
      await gate.authorize(ctx, "removeFromCollection", {
        collectionId: command.collectionId,
        evidenceId: command.evidenceId,
      });
      return inner.removeFromCollection(ctx, command);
    },
    async createEvidenceSet(ctx, command) {
      await gate.authorize(ctx, "createEvidenceSet", {
        collectionId: command.collectionId,
      });
      return inner.createEvidenceSet(ctx, command);
    },
    async manageRelationship(ctx, command) {
      await gate.authorize(ctx, "manageRelationship", {
        evidenceId: command.evidenceId,
      });
      return inner.manageRelationship(ctx, command);
    },
    async grantAccess(ctx, command) {
      await gate.authorize(ctx, "grantAccess", {
        evidenceId: command.evidenceId,
      });
      return inner.grantAccess(ctx, command);
    },
    async revokeAccess(ctx, command) {
      await gate.authorize(ctx, "revokeAccess");
      return inner.revokeAccess(ctx, command);
    },
  };
}

const LIFECYCLE_TO_OPERATION: Record<string, EvidenceSecurityOperation> = {
  getEvidence: "getEvidence",
  getProvenance: "getProvenance",
  getAudit: "getAudit",
  verifyIntegrity: "verifyIntegrity",
  validateEvidence: "validateEvidence",
  updateEvidenceMetadata: "updateEvidenceMetadata",
  classifyEvidence: "classifyEvidence",
  associateEvidence: "associateEvidence",
  requestReview: "requestReview",
  approveEvidence: "approveEvidence",
  rejectEvidence: "rejectEvidence",
  quarantineEvidence: "quarantineEvidence",
  sealEvidence: "sealEvidence",
  archiveEvidence: "archiveEvidence",
  versionEvidence: "versionEvidence",
  applyLegalHold: "applyLegalHold",
  releaseLegalHold: "releaseLegalHold",
  disposeEvidence: "disposeEvidence",
};

export function createSecuredEvidenceQueryService(
  inner: EvidenceQueryService,
  gate: EvidenceSecurityGate,
  deps: {
    readonly loadEvidenceForActions: (
      ctx: EvidenceRequestContext,
      evidenceId: string,
    ) => Promise<Parameters<typeof computeLifecycleAvailableActions>[0]>;
    /**
     * APZQEP-120-S02 — authoritative permission-aware enumeration path.
     * When provided, list/search must not construct ACL filters in callers.
     */
    readonly enumeration?: EvidenceEnumerationService;
  },
): EvidenceQueryService {
  return {
    async getEvidence(ctx, query) {
      await gate.authorize(ctx, "getEvidence", { evidenceId: query.evidenceId });
      return inner.getEvidence(ctx, query);
    },
    async listEvidence(ctx, query) {
      if (deps.enumeration) {
        return deps.enumeration.list(ctx, query);
      }
      // Legacy fallback (S01 path) — prefer EvidenceEnumerationService.
      await gate.authorize(ctx, "listEvidence");
      const candidates = await inner.listEvidence(ctx, {
        ...query,
        page: undefined,
      });
      return applyEnumerationAcl(ctx, gate, candidates.items, query.page, {
        sort: query.sort,
        order: query.order,
      });
    },
    async searchEvidence(ctx, query) {
      if (deps.enumeration) {
        return deps.enumeration.search(ctx, query);
      }
      await gate.authorize(ctx, "searchEvidence");
      const candidates = await inner.searchEvidence(ctx, {
        ...query,
        page: undefined,
      });
      return applyEnumerationAcl(ctx, gate, candidates.items, query.page, {
        sort: query.sort,
        order: query.order,
      });
    },
    async downloadEvidence(ctx, query) {
      await gate.authorize(ctx, "downloadEvidence", {
        evidenceId: query.evidenceId,
      });
      return inner.downloadEvidence(ctx, query);
    },
    async getRelationships(ctx, query) {
      await gate.authorize(ctx, "getRelationships", {
        evidenceId: query.evidenceId,
      });
      return inner.getRelationships(ctx, query);
    },
    async getCollection(ctx, query) {
      await gate.authorize(ctx, "getCollection", {
        collectionId: query.collectionId,
      });
      return inner.getCollection(ctx, query);
    },
    async getEvidenceSet(ctx, query) {
      await gate.authorize(ctx, "getEvidenceSet", { setId: query.setId });
      return inner.getEvidenceSet(ctx, query);
    },
    async getAudit(ctx, query) {
      await gate.authorize(ctx, "getAudit", { evidenceId: query.evidenceId });
      return inner.getAudit(ctx, query);
    },
    async getProvenance(ctx, query) {
      await gate.authorize(ctx, "getProvenance", {
        evidenceId: query.evidenceId,
      });
      return inner.getProvenance(ctx, query);
    },
    async checkEvidenceAccess(ctx, query) {
      await gate.authorize(ctx, "checkEvidenceAccess", {
        evidenceId: query.evidenceId,
      });
      const operation: EvidenceSecurityOperation =
        query.action === "qep.evidence.download" || query.action === "download"
          ? "downloadEvidence"
          : query.action === "qep.evidence.associate" || query.action === "associate"
            ? "associateEvidence"
            : (LIFECYCLE_TO_OPERATION[query.action] ?? "getEvidence");
      const decision = await gate.evaluatePrincipal(
        ctx.tenantId,
        query.principalId,
        operation,
        query.evidenceId,
      );
      const result: EvidenceAccessCheckResult = {
        evidenceId: query.evidenceId,
        principalId: query.principalId,
        action: query.action,
        evaluation: "completed",
        outcome: decision.outcome,
        reason: decision.reason,
        matchingGrantCount: decisionGrantsAccess(decision) ? 1 : 0,
      };
      return result;
    },
    async getAvailableActions(ctx, query) {
      await gate.authorize(ctx, "getAvailableActions", {
        evidenceId: query.evidenceId,
      });
      const evidence = await deps.loadEvidenceForActions(ctx, query.evidenceId);
      const lifecycle = computeLifecycleAvailableActions(evidence);
      const allowed: string[] = [];
      for (const action of lifecycle) {
        const operation = LIFECYCLE_TO_OPERATION[action];
        if (!operation) {
          continue;
        }
        const decision = await gate.evaluate(ctx, operation, {
          evidenceId: query.evidenceId,
        });
        if (decisionGrantsAccess(decision)) {
          allowed.push(action);
        }
      }
      return allowed;
    },
    async getVersions(ctx, query) {
      await gate.authorize(ctx, "getVersions", { evidenceId: query.evidenceId });
      return inner.getVersions(ctx, query);
    },
  };
}

// silence unused helper in case tree-shaking complains in some configs
void evidenceIdFrom;
