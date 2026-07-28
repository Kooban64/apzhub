/**
 * QEP Test Specification platform service — maps ServiceRequestContext to
 * `@apzhub/qep-test-specifications` application service calls and DTOs
 * (APZQEP-ENG-050B Part 2).
 */

import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type {
  AddQepTestSpecificationRelationshipInput,
  ApproveQepTestSpecificationInput,
  CreateQepTestSpecificationInput,
  ListQepTestSpecificationsQuery,
  QepRequestContext,
  QepTestSpecificationDto,
  QepTestSpecificationHistorySummaryDto,
  QepTestSpecificationListResult,
  QepTestSpecificationRelationshipDto,
  RejectQepTestSpecificationInput,
  SubmitQepTestSpecificationReviewInput,
  SupersedeQepTestSpecificationInput,
  UpdateQepTestSpecificationDraftInput,
} from "@apzhub/qep-contracts";
import {
  TestSpecificationConflictError,
  TestSpecificationDomainError,
  TestSpecificationForbiddenError,
  TestSpecificationInvariantViolation,
  TestSpecificationNotFoundError,
  TestSpecificationRevisionConflictError,
  toSpecificationDto,
  type SpecificationApplicationService,
  type SpecificationListCommandQuery,
} from "@apzhub/qep-test-specifications";

function toSpecificationContext(ctx: ServiceRequestContext): QepRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    organisationId: ctx.organisationId,
    correlationId: ctx.correlationId,
    permissions: ctx.permissions,
  };
}

export function mapTestSpecificationDomainError(
  error: TestSpecificationDomainError,
  correlationId: string,
): PlatformServiceError {
  if (error instanceof TestSpecificationNotFoundError) {
    return new PlatformServiceError({
      category: "not_found",
      code: "NOT_FOUND",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error instanceof TestSpecificationForbiddenError) {
    return new PlatformServiceError({
      category: "authorization",
      code: "FORBIDDEN",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (
    error instanceof TestSpecificationConflictError ||
    error instanceof TestSpecificationRevisionConflictError
  ) {
    return new PlatformServiceError({
      category: "conflict",
      code: "CONFLICT",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error instanceof TestSpecificationInvariantViolation) {
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
  fn: (specCtx: QepRequestContext) => Promise<T>,
): Promise<T> {
  try {
    return await fn(toSpecificationContext(ctx));
  } catch (error) {
    if (error instanceof TestSpecificationDomainError) {
      throw mapTestSpecificationDomainError(error, ctx.correlationId);
    }
    throw error;
  }
}

function toRelationshipDto(
  relationship: Awaited<
    ReturnType<SpecificationApplicationService["listRelationships"]>
  >[number],
): QepTestSpecificationRelationshipDto {
  return {
    id: relationship.id,
    specificationId: relationship.specificationId,
    kind: relationship.reference.kind,
    artefactId: relationship.reference.artefactId,
    owningDomain: relationship.reference.owningDomain,
    label: relationship.reference.label,
    createdAt: relationship.createdAt,
    createdBy: relationship.createdBy,
  };
}

function toHistoryDto(
  entry: Awaited<ReturnType<SpecificationApplicationService["listHistory"]>>[number],
): QepTestSpecificationHistorySummaryDto {
  return {
    at: entry.at,
    by: entry.by,
    kind: entry.kind,
    summary: entry.summary,
  };
}

/** Platform-facing Test Specification service with short operation names for pipeline auth. */
export type QepTestSpecificationPlatformService = {
  list(
    ctx: ServiceRequestContext,
    query?: ListQepTestSpecificationsQuery,
  ): Promise<QepTestSpecificationListResult>;
  get(ctx: ServiceRequestContext, id: string): Promise<QepTestSpecificationDto | null>;
  create(
    ctx: ServiceRequestContext,
    input: CreateQepTestSpecificationInput,
  ): Promise<QepTestSpecificationDto>;
  updateDraft(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateQepTestSpecificationDraftInput,
  ): Promise<QepTestSpecificationDto>;
  submitForReview(
    ctx: ServiceRequestContext,
    id: string,
    input: SubmitQepTestSpecificationReviewInput,
  ): Promise<QepTestSpecificationDto>;
  approve(
    ctx: ServiceRequestContext,
    id: string,
    input?: ApproveQepTestSpecificationInput,
  ): Promise<QepTestSpecificationDto>;
  reject(
    ctx: ServiceRequestContext,
    id: string,
    input: RejectQepTestSpecificationInput,
  ): Promise<QepTestSpecificationDto>;
  withdraw(ctx: ServiceRequestContext, id: string): Promise<QepTestSpecificationDto>;
  supersede(
    ctx: ServiceRequestContext,
    id: string,
    input?: SupersedeQepTestSpecificationInput,
  ): Promise<{
    readonly predecessor: QepTestSpecificationDto;
    readonly successor?: QepTestSpecificationDto;
  }>;
  retire(ctx: ServiceRequestContext, id: string): Promise<QepTestSpecificationDto>;
  cancel(ctx: ServiceRequestContext, id: string): Promise<QepTestSpecificationDto>;
  addRelationship(
    ctx: ServiceRequestContext,
    id: string,
    input: AddQepTestSpecificationRelationshipInput,
  ): Promise<QepTestSpecificationDto>;
  removeRelationship(
    ctx: ServiceRequestContext,
    id: string,
    relationshipId: string,
  ): Promise<QepTestSpecificationDto>;
  listHistory(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly QepTestSpecificationHistorySummaryDto[]>;
  listVersions(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly QepTestSpecificationDto[]>;
  findLatestApproved(
    ctx: ServiceRequestContext,
    number: string,
  ): Promise<QepTestSpecificationDto | null>;
  listRelationships(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly QepTestSpecificationRelationshipDto[]>;
  search(
    ctx: ServiceRequestContext,
    query: string,
    options?: Omit<ListQepTestSpecificationsQuery, "query">,
  ): Promise<QepTestSpecificationListResult>;
};

export function createQepTestSpecificationPlatformService(
  service: SpecificationApplicationService,
): QepTestSpecificationPlatformService {
  return {
    async list(ctx, query = {}) {
      const result = await invoke(ctx, (specCtx) =>
        service.list(specCtx, query as SpecificationListCommandQuery),
      );
      return {
        items: result.items.map((item) => toSpecificationDto(item, ctx.permissions)),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      } satisfies QepTestSpecificationListResult;
    },
    async get(ctx, id) {
      const found = await invoke(ctx, (specCtx) => service.get(specCtx, id));
      return found ? toSpecificationDto(found, ctx.permissions) : null;
    },
    async create(ctx, input) {
      const created = await invoke(ctx, (specCtx) =>
        service.createSpecification(specCtx, input),
      );
      return toSpecificationDto(created, ctx.permissions);
    },
    async updateDraft(ctx, id, input) {
      const updated = await invoke(ctx, (specCtx) =>
        service.updateDraft(specCtx, id, input),
      );
      return toSpecificationDto(updated, ctx.permissions);
    },
    async submitForReview(ctx, id, input) {
      const updated = await invoke(ctx, (specCtx) =>
        service.submitForReview(specCtx, id, input),
      );
      return toSpecificationDto(updated, ctx.permissions);
    },
    async approve(ctx, id, input) {
      const updated = await invoke(ctx, (specCtx) =>
        service.approve(specCtx, id, input),
      );
      return toSpecificationDto(updated, ctx.permissions);
    },
    async reject(ctx, id, input) {
      const updated = await invoke(ctx, (specCtx) =>
        service.reject(specCtx, id, input),
      );
      return toSpecificationDto(updated, ctx.permissions);
    },
    async withdraw(ctx, id) {
      const updated = await invoke(ctx, (specCtx) => service.withdraw(specCtx, id));
      return toSpecificationDto(updated, ctx.permissions);
    },
    async supersede(ctx, id, input) {
      const result = await invoke(ctx, (specCtx) =>
        service.supersede(specCtx, id, input),
      );
      return {
        predecessor: toSpecificationDto(result.predecessor, ctx.permissions),
        successor: result.successor
          ? toSpecificationDto(result.successor, ctx.permissions)
          : undefined,
      };
    },
    async retire(ctx, id) {
      const updated = await invoke(ctx, (specCtx) => service.retire(specCtx, id));
      return toSpecificationDto(updated, ctx.permissions);
    },
    async cancel(ctx, id) {
      const updated = await invoke(ctx, (specCtx) => service.cancel(specCtx, id));
      return toSpecificationDto(updated, ctx.permissions);
    },
    async addRelationship(ctx, id, input) {
      const updated = await invoke(ctx, (specCtx) =>
        service.addRelationship(specCtx, id, input),
      );
      return toSpecificationDto(updated, ctx.permissions);
    },
    async removeRelationship(ctx, id, relationshipId) {
      const updated = await invoke(ctx, (specCtx) =>
        service.removeRelationship(specCtx, id, relationshipId),
      );
      return toSpecificationDto(updated, ctx.permissions);
    },
    async listHistory(ctx, id) {
      const history = await invoke(ctx, (specCtx) => service.listHistory(specCtx, id));
      return history.map(toHistoryDto);
    },
    async listVersions(ctx, id) {
      const versions = await invoke(ctx, (specCtx) =>
        service.listVersions(specCtx, id),
      );
      return versions.map((item) => toSpecificationDto(item, ctx.permissions));
    },
    async findLatestApproved(ctx, number) {
      const found = await invoke(ctx, (specCtx) =>
        service.findLatestApproved(specCtx, number),
      );
      return found ? toSpecificationDto(found, ctx.permissions) : null;
    },
    async listRelationships(ctx, id) {
      const relationships = await invoke(ctx, (specCtx) =>
        service.listRelationships(specCtx, id),
      );
      return relationships.map(toRelationshipDto);
    },
    async search(ctx, query, options = {}) {
      const result = await invoke(ctx, (specCtx) =>
        service.search(
          specCtx,
          query,
          options as Omit<SpecificationListCommandQuery, "query">,
        ),
      );
      return {
        items: result.items.map((item) => toSpecificationDto(item, ctx.permissions)),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      } satisfies QepTestSpecificationListResult;
    },
  };
}
