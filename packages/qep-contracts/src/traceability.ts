/** QEP Traceability service contracts (APZQEP-ENG-030A Part 2, ARCH-007). */

import type { QepRequestContext } from "./requirements";

export const QEP_TRACEABILITY_PERMISSIONS = [
  "qep.traceability.trace_links.view",
  "qep.traceability.trace_links.create",
  "qep.traceability.trace_links.modify",
  "qep.traceability.trace_links.validate",
  "qep.traceability.trace_links.approve",
  "qep.traceability.trace_links.retire",
  "qep.traceability.trace_links.supersede",
  "qep.traceability.trace_links.history.view",
  "qep.traceability.taxonomy.view",
  "qep.traceability.taxonomy.administer",
] as const;

export type QepTraceabilityPermission = (typeof QEP_TRACEABILITY_PERMISSIONS)[number];

export type { QepRequestContext };

export type QepTraceEndpointDto = {
  readonly kind: string;
  readonly artefactId: string;
  readonly contentVersionId?: string;
  readonly baselineId?: string;
  readonly externalUri?: string;
  readonly owningDomain: string;
};

export type QepTraceEndpointInput = {
  readonly kind: string;
  readonly artefactId: string;
  readonly contentVersionId?: string;
  readonly baselineId?: string;
  readonly externalUri?: string;
};

export type QepTraceLinkHistorySummaryDto = {
  readonly at: string;
  readonly by: string;
  readonly kind: string;
  readonly summary: string;
};

/** Trace Link commands surfaced to the Workbench for the caller's permissions + current state. */
export const QEP_TRACE_LINK_ACTIONS = [
  "validate",
  "approve",
  "retire",
  "supersede",
  "updateConfidence",
  "updateAuthority",
  "updateScope",
  "updateRationale",
  "updateMetadata",
  "updateOrigin",
  "updateEndpoint",
] as const;
export type QepTraceLinkAction = (typeof QEP_TRACE_LINK_ACTIONS)[number];

export type QepTraceLinkDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly type: string;
  readonly lifecycleState: string;
  readonly direction: string;
  readonly source: QepTraceEndpointDto;
  readonly target: QepTraceEndpointDto;
  readonly strength: string;
  readonly confidence: string;
  readonly origin: string;
  readonly authority: { readonly kind: string; readonly actorId: string };
  readonly provenance: {
    readonly actorId: string;
    readonly correlationId: string;
    readonly sourceSystem?: string;
    readonly importBatchId?: string;
    readonly rationaleRef?: string;
  };
  readonly scope: { readonly kind: string; readonly referenceId?: string };
  readonly context: {
    readonly baselineId?: string;
    readonly contentVersionId?: string;
    readonly immutable: boolean;
  };
  readonly rationale?: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly revision: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly correlationId: string;
  readonly validatedAt?: string;
  readonly validatedBy?: string;
  readonly approvedAt?: string;
  readonly approvedBy?: string;
  readonly retiredAt?: string;
  readonly retiredBy?: string;
  readonly supersededAt?: string;
  readonly supersededBy?: string;
  readonly successorTraceId?: string;
  readonly historySummaries: readonly QepTraceLinkHistorySummaryDto[];
  readonly availableActions: readonly QepTraceLinkAction[];
};

/**
 * Computes the Trace Link commands a caller may perform for the given lifecycle
 * state, mirroring the permission + state-machine rules enforced server-side.
 * The server is authoritative; this is a rendering convenience for the
 * Workbench and must not be relied on as an authorization boundary.
 */
export function computeQepTraceLinkAvailableActions(
  lifecycleState: string,
  permissions?: readonly string[],
): readonly QepTraceLinkAction[] {
  const granted = permissions;
  const has = (permission: QepTraceabilityPermission): boolean =>
    !granted ||
    granted.length === 0 ||
    granted.includes("qep.traceability.*") ||
    granted.includes(permission);

  const actions: QepTraceLinkAction[] = [];

  if (lifecycleState === "draft" && has("qep.traceability.trace_links.validate")) {
    actions.push("validate");
  }
  if (lifecycleState === "validated" && has("qep.traceability.trace_links.approve")) {
    actions.push("approve");
  }
  if (lifecycleState === "approved") {
    if (has("qep.traceability.trace_links.retire")) {
      actions.push("retire");
    }
    if (has("qep.traceability.trace_links.supersede")) {
      actions.push("supersede");
    }
  }

  if (
    (lifecycleState === "draft" ||
      lifecycleState === "validated" ||
      lifecycleState === "approved") &&
    has("qep.traceability.trace_links.modify")
  ) {
    actions.push(
      "updateConfidence",
      "updateAuthority",
      "updateScope",
      "updateRationale",
      "updateMetadata",
      "updateOrigin",
    );
    if (lifecycleState === "draft" || lifecycleState === "validated") {
      actions.push("updateEndpoint");
    }
  }

  return actions;
}

export type CreateQepTraceLinkInput = {
  readonly type: string;
  readonly source: QepTraceEndpointInput;
  readonly target: QepTraceEndpointInput;
  readonly direction?: string;
  readonly strength?: string;
  readonly confidence?: string;
  readonly origin?: string;
  readonly authority: { readonly kind: string; readonly actorId: string };
  readonly provenance: {
    readonly actorId: string;
    readonly correlationId: string;
    readonly sourceSystem?: string;
    readonly importBatchId?: string;
    readonly rationaleRef?: string;
  };
  readonly scope?: { readonly kind: string; readonly referenceId?: string };
  readonly context?: {
    readonly baselineId?: string;
    readonly contentVersionId?: string;
    readonly immutable?: boolean;
  };
  readonly rationale?: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type UpdateQepTraceLinkEndpointInput = {
  readonly role: "source" | "target";
  readonly endpoint: QepTraceEndpointInput;
};

export type SupersedeQepTraceLinkInput = {
  readonly successorTraceId: string;
};

export type ListQepTraceLinksQuery = {
  readonly type?: string;
  readonly lifecycleState?: string;
  readonly sourceKind?: string;
  readonly sourceArtefactId?: string;
  readonly targetKind?: string;
  readonly targetArtefactId?: string;
  readonly artefactId?: string;
  readonly direction?: "inbound" | "outbound" | "both";
  readonly scopeReferenceId?: string;
  readonly limit?: number;
  readonly offset?: number;
};

export type QepTraceLinkListResult = {
  readonly items: readonly QepTraceLinkDto[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
};

export type QepTraceLinkTaxonomyDto = {
  readonly type: string;
  readonly displayName: string;
  readonly description: string;
  readonly family: string;
  readonly allowedSourceKinds: readonly string[];
  readonly allowedTargetKinds: readonly string[];
  readonly directionDefault: string;
  readonly symmetric: boolean;
  readonly governanceClass: string;
  readonly cyclePolicy: string;
  readonly rationalePolicy: string;
  readonly defaultStrength: string;
  readonly projectionOnly: boolean;
  readonly allowsSelfLink: boolean;
};
