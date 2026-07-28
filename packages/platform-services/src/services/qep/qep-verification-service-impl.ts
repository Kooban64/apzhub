/**
 * QEP Verification platform service — maps ServiceRequestContext to
 * `@apzhub/qep-verification` application service calls and Verification DTOs
 * (APZQEP-ENG-040B Part 2).
 */

import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type {
  AssignQepVerificationInput,
  CompleteQepVerificationInput,
  CreateQepVerificationInput,
  ListQepVerificationsQuery,
  QepRequestContext,
  QepVerificationDto,
  QepVerificationListResult,
  RejectQepVerificationInput,
  SupersedeQepVerificationInput,
} from "@apzhub/qep-contracts";
import {
  VerificationConflictError,
  VerificationDomainError,
  VerificationForbiddenError,
  VerificationInvariantViolation,
  VerificationNotFoundError,
  VerificationRevisionConflictError,
  toVerificationDto,
  type VerificationApplicationService,
} from "@apzhub/qep-verification";

function toVerificationContext(ctx: ServiceRequestContext): QepRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    organisationId: ctx.organisationId,
    correlationId: ctx.correlationId,
    permissions: ctx.permissions,
  };
}

export function mapVerificationDomainError(
  error: VerificationDomainError,
  correlationId: string,
): PlatformServiceError {
  if (error instanceof VerificationNotFoundError) {
    return new PlatformServiceError({
      category: "not_found",
      code: "NOT_FOUND",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error instanceof VerificationForbiddenError) {
    return new PlatformServiceError({
      category: "authorization",
      code: "FORBIDDEN",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (
    error instanceof VerificationConflictError ||
    error instanceof VerificationRevisionConflictError
  ) {
    return new PlatformServiceError({
      category: "conflict",
      code: "CONFLICT",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error instanceof VerificationInvariantViolation) {
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
  fn: (verificationCtx: QepRequestContext) => Promise<T>,
): Promise<T> {
  try {
    return await fn(toVerificationContext(ctx));
  } catch (error) {
    if (error instanceof VerificationDomainError) {
      throw mapVerificationDomainError(error, ctx.correlationId);
    }
    throw error;
  }
}

/** Platform-facing Verification service with short operation names for pipeline auth. */
export type QepVerificationPlatformService = {
  listVerifications(
    ctx: ServiceRequestContext,
    query?: ListQepVerificationsQuery,
  ): Promise<QepVerificationListResult>;
  getVerification(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepVerificationDto | null>;
  createVerification(
    ctx: ServiceRequestContext,
    input: CreateQepVerificationInput,
  ): Promise<QepVerificationDto>;
  requestVerification(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepVerificationDto>;
  assignVerification(
    ctx: ServiceRequestContext,
    id: string,
    input: AssignQepVerificationInput,
  ): Promise<QepVerificationDto>;
  startVerification(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepVerificationDto>;
  completeVerification(
    ctx: ServiceRequestContext,
    id: string,
    input: CompleteQepVerificationInput,
  ): Promise<QepVerificationDto>;
  rejectVerification(
    ctx: ServiceRequestContext,
    id: string,
    input: RejectQepVerificationInput,
  ): Promise<QepVerificationDto>;
  expireVerification(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepVerificationDto>;
  withdrawVerification(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepVerificationDto>;
  supersedeVerification(
    ctx: ServiceRequestContext,
    id: string,
    input: SupersedeQepVerificationInput,
  ): Promise<QepVerificationDto>;
  cancelVerification(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepVerificationDto>;
  retireVerification(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<QepVerificationDto>;
  updateVerificationMetadata(
    ctx: ServiceRequestContext,
    id: string,
    patch: Readonly<Record<string, string>>,
  ): Promise<QepVerificationDto>;
  updateVerificationRationale(
    ctx: ServiceRequestContext,
    id: string,
    rationale: string,
  ): Promise<QepVerificationDto>;
  updateVerificationPriority(
    ctx: ServiceRequestContext,
    id: string,
    priority: string,
  ): Promise<QepVerificationDto>;
  getVerificationHistory(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly { at: string; by: string; kind: string; summary: string }[]>;
  listVerificationsBySubject(
    ctx: ServiceRequestContext,
    kind: string,
    artefactId: string,
  ): Promise<readonly QepVerificationDto[]>;
};

export function createQepVerificationPlatformService(
  service: VerificationApplicationService,
): QepVerificationPlatformService {
  return {
    async listVerifications(ctx, query = {}) {
      const result = await invoke(ctx, (verCtx) =>
        service.listVerifications(verCtx, query),
      );
      return {
        items: result.items.map((item) => toVerificationDto(item, ctx.permissions)),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      } satisfies QepVerificationListResult;
    },
    async getVerification(ctx, id) {
      const found = await invoke(ctx, (verCtx) => service.getVerification(verCtx, id));
      return found ? toVerificationDto(found, ctx.permissions) : null;
    },
    async createVerification(ctx, input) {
      const created = await invoke(ctx, (verCtx) =>
        service.createVerification(verCtx, input),
      );
      return toVerificationDto(created, ctx.permissions);
    },
    async requestVerification(ctx, id) {
      const updated = await invoke(ctx, (verCtx) =>
        service.requestVerification(verCtx, id),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async assignVerification(ctx, id, input) {
      const updated = await invoke(ctx, (verCtx) =>
        service.assignVerification(verCtx, id, input),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async startVerification(ctx, id) {
      const updated = await invoke(ctx, (verCtx) =>
        service.startVerification(verCtx, id),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async completeVerification(ctx, id, input) {
      const updated = await invoke(ctx, (verCtx) =>
        service.completeVerification(verCtx, id, input),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async rejectVerification(ctx, id, input) {
      const updated = await invoke(ctx, (verCtx) =>
        service.rejectVerification(verCtx, id, input),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async expireVerification(ctx, id) {
      const updated = await invoke(ctx, (verCtx) =>
        service.expireVerification(verCtx, id),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async withdrawVerification(ctx, id) {
      const updated = await invoke(ctx, (verCtx) =>
        service.withdrawVerification(verCtx, id),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async supersedeVerification(ctx, id, input) {
      const updated = await invoke(ctx, (verCtx) =>
        service.supersedeVerification(verCtx, id, input),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async cancelVerification(ctx, id) {
      const updated = await invoke(ctx, (verCtx) =>
        service.cancelVerification(verCtx, id),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async retireVerification(ctx, id) {
      const updated = await invoke(ctx, (verCtx) =>
        service.retireVerification(verCtx, id),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async updateVerificationMetadata(ctx, id, patch) {
      const updated = await invoke(ctx, (verCtx) =>
        service.updateMetadata(verCtx, id, patch),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async updateVerificationRationale(ctx, id, rationale) {
      const updated = await invoke(ctx, (verCtx) =>
        service.updateRationale(verCtx, id, rationale),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async updateVerificationPriority(ctx, id, priority) {
      const updated = await invoke(ctx, (verCtx) =>
        service.updatePriority(verCtx, id, priority),
      );
      return toVerificationDto(updated, ctx.permissions);
    },
    async getVerificationHistory(ctx, id) {
      return invoke(ctx, (verCtx) => service.listHistory(verCtx, id));
    },
    async listVerificationsBySubject(ctx, kind, artefactId) {
      const results = await invoke(ctx, (verCtx) =>
        service.listBySubject(verCtx, kind, artefactId),
      );
      return results.map((item) => toVerificationDto(item, ctx.permissions));
    },
  };
}
