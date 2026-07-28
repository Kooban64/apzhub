/**
 * QEP Traceability platform service — maps ServiceRequestContext to
 * `@apzhub/qep-traceability` application service calls and Trace Link DTOs
 * (APZQEP-ENG-030A Part 2).
 */

import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type {
  CreateQepTraceLinkInput,
  ListQepTraceLinksQuery,
  QepRequestContext,
  QepTraceLinkDto,
  QepTraceLinkListResult,
  QepTraceLinkTaxonomyDto,
  SupersedeQepTraceLinkInput,
  UpdateQepTraceLinkEndpointInput,
} from "@apzhub/qep-contracts";
import {
  TraceConflictError,
  TraceDomainError,
  TraceForbiddenError,
  TraceInvariantViolation,
  TraceNotFoundError,
  TraceRevisionConflictError,
  toTraceLinkDto,
  toTraceLinkTaxonomyDto,
  type TraceLinkApplicationService,
} from "@apzhub/qep-traceability";

function toTraceContext(ctx: ServiceRequestContext): QepRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    organisationId: ctx.organisationId,
    correlationId: ctx.correlationId,
    permissions: ctx.permissions,
  };
}

export function mapTraceDomainError(
  error: TraceDomainError,
  correlationId: string,
): PlatformServiceError {
  if (error instanceof TraceNotFoundError) {
    return new PlatformServiceError({
      category: "not_found",
      code: "NOT_FOUND",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error instanceof TraceForbiddenError) {
    return new PlatformServiceError({
      category: "authorization",
      code: "FORBIDDEN",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error instanceof TraceConflictError || error instanceof TraceRevisionConflictError) {
    return new PlatformServiceError({
      category: "conflict",
      code: "CONFLICT",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error instanceof TraceInvariantViolation) {
    return new PlatformServiceError({
      category: "validation",
      code: "VALIDATION_FAILED",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  return new PlatformServiceError({
    category: "validation",
    code: "VALIDATION_FAILED",
    message: error.message,
    correlationId,
    retryable: false,
  });
}

async function invoke<T>(
  ctx: ServiceRequestContext,
  fn: (traceCtx: QepRequestContext) => Promise<T>,
): Promise<T> {
  try {
    return await fn(toTraceContext(ctx));
  } catch (error) {
    if (error instanceof TraceDomainError) {
      throw mapTraceDomainError(error, ctx.correlationId);
    }
    throw error;
  }
}

/** Platform-facing Trace Link service with short operation names for pipeline auth. */
export type QepTraceabilityPlatformService = {
  listTraceLinks(
    ctx: ServiceRequestContext,
    query?: ListQepTraceLinksQuery,
  ): Promise<QepTraceLinkListResult>;
  getTraceLink(ctx: ServiceRequestContext, id: string): Promise<QepTraceLinkDto | null>;
  createTraceLink(
    ctx: ServiceRequestContext,
    input: CreateQepTraceLinkInput,
  ): Promise<QepTraceLinkDto>;
  validateTraceLink(ctx: ServiceRequestContext, id: string): Promise<QepTraceLinkDto>;
  approveTraceLink(ctx: ServiceRequestContext, id: string): Promise<QepTraceLinkDto>;
  retireTraceLink(ctx: ServiceRequestContext, id: string): Promise<QepTraceLinkDto>;
  supersedeTraceLink(
    ctx: ServiceRequestContext,
    id: string,
    input: SupersedeQepTraceLinkInput,
  ): Promise<QepTraceLinkDto>;
  updateTraceLinkConfidence(
    ctx: ServiceRequestContext,
    id: string,
    confidence: string,
  ): Promise<QepTraceLinkDto>;
  updateTraceLinkAuthority(
    ctx: ServiceRequestContext,
    id: string,
    authority: { readonly kind: string; readonly actorId: string },
  ): Promise<QepTraceLinkDto>;
  updateTraceLinkScope(
    ctx: ServiceRequestContext,
    id: string,
    scope: { readonly kind: string; readonly referenceId?: string },
  ): Promise<QepTraceLinkDto>;
  updateTraceLinkRationale(
    ctx: ServiceRequestContext,
    id: string,
    rationale: string,
  ): Promise<QepTraceLinkDto>;
  updateTraceLinkMetadata(
    ctx: ServiceRequestContext,
    id: string,
    patch: Readonly<Record<string, string>>,
  ): Promise<QepTraceLinkDto>;
  updateTraceLinkOrigin(
    ctx: ServiceRequestContext,
    id: string,
    origin: string,
  ): Promise<QepTraceLinkDto>;
  updateTraceLinkEndpoint(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateQepTraceLinkEndpointInput,
  ): Promise<QepTraceLinkDto>;
  getTraceLinkHistory(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly { at: string; by: string; kind: string; summary: string }[]>;
  listTraceLinkTaxonomy(
    ctx: ServiceRequestContext,
  ): Promise<readonly QepTraceLinkTaxonomyDto[]>;
  listTraceLinksByEndpoint(
    ctx: ServiceRequestContext,
    kind: string,
    artefactId: string,
    direction?: "inbound" | "outbound" | "both",
  ): Promise<readonly QepTraceLinkDto[]>;
};

export function createQepTraceabilityPlatformService(
  service: TraceLinkApplicationService,
): QepTraceabilityPlatformService {
  return {
    async listTraceLinks(ctx, query = {}) {
      const result = await invoke(ctx, (traceCtx) => service.listTraceLinks(traceCtx, query));
      return {
        items: result.items.map((item) => toTraceLinkDto(item, ctx.permissions)),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      } satisfies QepTraceLinkListResult;
    },
    async getTraceLink(ctx, id) {
      const found = await invoke(ctx, (traceCtx) => service.getTraceLink(traceCtx, id));
      return found ? toTraceLinkDto(found, ctx.permissions) : null;
    },
    async createTraceLink(ctx, input) {
      const created = await invoke(ctx, (traceCtx) => service.createTraceLink(traceCtx, input));
      return toTraceLinkDto(created, ctx.permissions);
    },
    async validateTraceLink(ctx, id) {
      const updated = await invoke(ctx, (traceCtx) => service.validateTraceLink(traceCtx, id));
      return toTraceLinkDto(updated, ctx.permissions);
    },
    async approveTraceLink(ctx, id) {
      const updated = await invoke(ctx, (traceCtx) => service.approveTraceLink(traceCtx, id));
      return toTraceLinkDto(updated, ctx.permissions);
    },
    async retireTraceLink(ctx, id) {
      const updated = await invoke(ctx, (traceCtx) => service.retireTraceLink(traceCtx, id));
      return toTraceLinkDto(updated, ctx.permissions);
    },
    async supersedeTraceLink(ctx, id, input) {
      const updated = await invoke(ctx, (traceCtx) =>
        service.supersedeTraceLink(traceCtx, id, input),
      );
      return toTraceLinkDto(updated, ctx.permissions);
    },
    async updateTraceLinkConfidence(ctx, id, confidence) {
      const updated = await invoke(ctx, (traceCtx) =>
        service.updateConfidence(traceCtx, id, confidence),
      );
      return toTraceLinkDto(updated, ctx.permissions);
    },
    async updateTraceLinkAuthority(ctx, id, authority) {
      const updated = await invoke(ctx, (traceCtx) =>
        service.updateAuthority(traceCtx, id, authority),
      );
      return toTraceLinkDto(updated, ctx.permissions);
    },
    async updateTraceLinkScope(ctx, id, scope) {
      const updated = await invoke(ctx, (traceCtx) => service.updateScope(traceCtx, id, scope));
      return toTraceLinkDto(updated, ctx.permissions);
    },
    async updateTraceLinkRationale(ctx, id, rationale) {
      const updated = await invoke(ctx, (traceCtx) =>
        service.updateRationale(traceCtx, id, rationale),
      );
      return toTraceLinkDto(updated, ctx.permissions);
    },
    async updateTraceLinkMetadata(ctx, id, patch) {
      const updated = await invoke(ctx, (traceCtx) =>
        service.updateMetadata(traceCtx, id, patch),
      );
      return toTraceLinkDto(updated, ctx.permissions);
    },
    async updateTraceLinkOrigin(ctx, id, origin) {
      const updated = await invoke(ctx, (traceCtx) => service.updateOrigin(traceCtx, id, origin));
      return toTraceLinkDto(updated, ctx.permissions);
    },
    async updateTraceLinkEndpoint(ctx, id, input) {
      const updated = await invoke(ctx, (traceCtx) =>
        service.updateEndpoint(traceCtx, id, input),
      );
      return toTraceLinkDto(updated, ctx.permissions);
    },
    async getTraceLinkHistory(ctx, id) {
      return invoke(ctx, (traceCtx) => service.history(traceCtx, id));
    },
    async listTraceLinkTaxonomy(ctx) {
      const taxonomy = await invoke(ctx, (traceCtx) => service.taxonomy(traceCtx));
      return taxonomy.map(toTraceLinkTaxonomyDto);
    },
    async listTraceLinksByEndpoint(ctx, kind, artefactId, direction = "both") {
      const results = await invoke(ctx, async (traceCtx) => {
        const outbound =
          direction === "outbound" || direction === "both"
            ? (
                await service.listTraceLinks(traceCtx, {
                  sourceKind: kind,
                  sourceArtefactId: artefactId,
                })
              ).items
            : [];
        const inbound =
          direction === "inbound" || direction === "both"
            ? (
                await service.listTraceLinks(traceCtx, {
                  targetKind: kind,
                  targetArtefactId: artefactId,
                })
              ).items
            : [];
        const byId = new Map<string, (typeof outbound)[number]>();
        for (const item of [...outbound, ...inbound]) {
          byId.set(item.id, item);
        }
        return [...byId.values()];
      });
      return results.map((item) => toTraceLinkDto(item, ctx.permissions));
    },
  };
}
