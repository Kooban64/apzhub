/**
 * QEP Test Plan platform service — maps ServiceRequestContext to
 * `@apzhub/qep-test-plans` application service calls and DTOs
 * (APZQEP-ENG-060B Part 2).
 */

import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type {
  AddQepTestPlanItemInput,
  ApproveQepTestPlanInput,
  CloneQepTestPlanInput,
  CreateQepTestPlanInput,
  ListQepTestPlansQuery,
  QepRequestContext,
  QepTestPlanDto,
  QepTestPlanHistorySummaryDto,
  QepTestPlanListResult,
  QepTestPlanRevisionDto,
  RejectQepTestPlanInput,
  ReorderQepTestPlanItemsInput,
  SubmitQepTestPlanReviewInput,
  SupersedeQepTestPlanInput,
  TransferQepTestPlanOwnershipInput,
  UpdateQepTestPlanAssignmentInput,
  UpdateQepTestPlanContentInput,
  UpdateQepTestPlanItemInput,
  UpdateQepTestPlanMetadataInput,
  UpdateQepTestPlanScheduleInput,
} from "@apzhub/qep-contracts";
import {
  PlanConcurrencyError,
  PlanConflictError,
  PlanDomainError,
  PlanForbiddenError,
  PlanInvariantViolationError,
  PlanNotFoundError,
  PlanReadinessError,
  toPlanDto,
  type PlanApplicationService,
  type PlanListCommandQuery,
} from "@apzhub/qep-test-plans";
import type { ExecutionReadiness } from "@apzhub/qep-test-plans/domain";

function toPlanContext(ctx: ServiceRequestContext): QepRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    organisationId: ctx.organisationId,
    correlationId: ctx.correlationId,
    permissions: ctx.permissions,
  };
}

export function mapTestPlanDomainError(
  error: PlanDomainError,
  correlationId: string,
): PlatformServiceError {
  if (error instanceof PlanNotFoundError) {
    return new PlatformServiceError({
      category: "not_found",
      code: "NOT_FOUND",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error instanceof PlanForbiddenError) {
    return new PlatformServiceError({
      category: "authorization",
      code: "FORBIDDEN",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (error instanceof PlanConflictError || error instanceof PlanConcurrencyError) {
    return new PlatformServiceError({
      category: "conflict",
      code: "CONFLICT",
      message: error.message,
      correlationId,
      retryable: false,
    });
  }
  if (
    error instanceof PlanInvariantViolationError ||
    error instanceof PlanReadinessError
  ) {
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
  fn: (planCtx: QepRequestContext) => Promise<T>,
): Promise<T> {
  try {
    return await fn(toPlanContext(ctx));
  } catch (error) {
    if (error instanceof PlanDomainError) {
      throw mapTestPlanDomainError(error, ctx.correlationId);
    }
    throw error;
  }
}

/** Platform-facing Test Plan service with short operation names for pipeline auth. */
export type QepTestPlanPlatformService = {
  list(
    ctx: ServiceRequestContext,
    query?: ListQepTestPlansQuery,
  ): Promise<QepTestPlanListResult>;
  get(ctx: ServiceRequestContext, id: string): Promise<QepTestPlanDto | null>;
  getByNumber(
    ctx: ServiceRequestContext,
    number: string,
  ): Promise<QepTestPlanDto | null>;
  search(
    ctx: ServiceRequestContext,
    query: string,
    options?: Omit<ListQepTestPlansQuery, "query">,
  ): Promise<QepTestPlanListResult>;
  createPlan(
    ctx: ServiceRequestContext,
    input: CreateQepTestPlanInput,
  ): Promise<QepTestPlanDto>;
  updateContent(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateQepTestPlanContentInput,
  ): Promise<QepTestPlanDto>;
  updateMetadata(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateQepTestPlanMetadataInput,
  ): Promise<QepTestPlanDto>;
  transferOwnership(
    ctx: ServiceRequestContext,
    id: string,
    input: TransferQepTestPlanOwnershipInput,
  ): Promise<QepTestPlanDto>;
  updateAssignment(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateQepTestPlanAssignmentInput,
  ): Promise<QepTestPlanDto>;
  updateSchedule(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateQepTestPlanScheduleInput,
  ): Promise<QepTestPlanDto>;
  addItem(
    ctx: ServiceRequestContext,
    id: string,
    input: AddQepTestPlanItemInput,
  ): Promise<QepTestPlanDto>;
  updateItem(
    ctx: ServiceRequestContext,
    id: string,
    itemId: string,
    input: UpdateQepTestPlanItemInput,
  ): Promise<QepTestPlanDto>;
  removeItem(
    ctx: ServiceRequestContext,
    id: string,
    itemId: string,
    input: { readonly expectedRevision: number },
  ): Promise<QepTestPlanDto>;
  reorderItems(
    ctx: ServiceRequestContext,
    id: string,
    input: ReorderQepTestPlanItemsInput,
  ): Promise<QepTestPlanDto>;
  submitForReview(
    ctx: ServiceRequestContext,
    id: string,
    input: SubmitQepTestPlanReviewInput,
  ): Promise<QepTestPlanDto>;
  approve(
    ctx: ServiceRequestContext,
    id: string,
    input: ApproveQepTestPlanInput,
  ): Promise<QepTestPlanDto>;
  reject(
    ctx: ServiceRequestContext,
    id: string,
    input: RejectQepTestPlanInput,
  ): Promise<QepTestPlanDto>;
  returnToDraft(
    ctx: ServiceRequestContext,
    id: string,
    input: { readonly expectedRevision: number },
  ): Promise<QepTestPlanDto>;
  markReady(
    ctx: ServiceRequestContext,
    id: string,
    input: { readonly expectedRevision: number },
  ): Promise<QepTestPlanDto>;
  startExecution(
    ctx: ServiceRequestContext,
    id: string,
    input: { readonly expectedRevision: number },
  ): Promise<QepTestPlanDto>;
  complete(
    ctx: ServiceRequestContext,
    id: string,
    input: { readonly expectedRevision: number },
  ): Promise<QepTestPlanDto>;
  archive(
    ctx: ServiceRequestContext,
    id: string,
    input: { readonly expectedRevision: number },
  ): Promise<QepTestPlanDto>;
  cancel(
    ctx: ServiceRequestContext,
    id: string,
    input: { readonly expectedRevision: number },
  ): Promise<QepTestPlanDto>;
  supersede(
    ctx: ServiceRequestContext,
    id: string,
    input: SupersedeQepTestPlanInput,
  ): Promise<{ readonly source: QepTestPlanDto; readonly successor: QepTestPlanDto }>;
  clone(
    ctx: ServiceRequestContext,
    id: string,
    input?: CloneQepTestPlanInput,
  ): Promise<QepTestPlanDto>;
  listHistory(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly QepTestPlanHistorySummaryDto[]>;
  listRevisions(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly QepTestPlanRevisionDto[]>;
  getExecutionReadiness(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<ExecutionReadiness>;
};

export function createQepTestPlanPlatformService(
  service: PlanApplicationService,
): QepTestPlanPlatformService {
  return {
    async list(ctx, query = {}) {
      const result = await invoke(ctx, (planCtx) =>
        service.list(planCtx, query as PlanListCommandQuery),
      );
      return {
        items: result.items.map((item) => toPlanDto(item, ctx.permissions)),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      } satisfies QepTestPlanListResult;
    },
    async get(ctx, id) {
      const found = await invoke(ctx, (planCtx) => service.get(planCtx, id));
      return found ? toPlanDto(found, ctx.permissions) : null;
    },
    async getByNumber(ctx, number) {
      const found = await invoke(ctx, (planCtx) =>
        service.getByNumber(planCtx, number),
      );
      return found ? toPlanDto(found, ctx.permissions) : null;
    },
    async search(ctx, query, options = {}) {
      const result = await invoke(ctx, (planCtx) =>
        service.search(planCtx, query, options as Omit<PlanListCommandQuery, "query">),
      );
      return {
        items: result.items.map((item) => toPlanDto(item, ctx.permissions)),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      } satisfies QepTestPlanListResult;
    },
    async createPlan(ctx, input) {
      const created = await invoke(ctx, (planCtx) =>
        service.createPlan(planCtx, input),
      );
      return toPlanDto(created, ctx.permissions);
    },
    async updateContent(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.updateContent(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async updateMetadata(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.updateMetadata(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async transferOwnership(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.transferOwnership(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async updateAssignment(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.updateAssignment(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async updateSchedule(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.updateSchedule(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async addItem(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.addItem(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async updateItem(ctx, id, itemId, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.updateItem(planCtx, id, itemId, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async removeItem(ctx, id, itemId, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.removeItem(planCtx, id, itemId, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async reorderItems(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.reorderItems(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async submitForReview(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.submitForReview(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async approve(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.approve(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async reject(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.reject(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async returnToDraft(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.returnToDraft(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async markReady(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.markReady(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async startExecution(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.startExecution(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async complete(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.complete(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async archive(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.archive(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async cancel(ctx, id, input) {
      const updated = await invoke(ctx, (planCtx) =>
        service.cancel(planCtx, id, input),
      );
      return toPlanDto(updated, ctx.permissions);
    },
    async supersede(ctx, id, input) {
      const result = await invoke(ctx, (planCtx) =>
        service.supersede(planCtx, id, input),
      );
      return {
        source: toPlanDto(result.source, ctx.permissions),
        successor: toPlanDto(result.successor, ctx.permissions),
      };
    },
    async clone(ctx, id, input = {}) {
      const cloned = await invoke(ctx, (planCtx) => service.clone(planCtx, id, input));
      return toPlanDto(cloned, ctx.permissions);
    },
    async listHistory(ctx, id) {
      const history = await invoke(ctx, (planCtx) => service.listHistory(planCtx, id));
      return history.map((entry) => ({
        sequence: entry.sequence,
        at: entry.at,
        actorId: entry.actorId,
        action: entry.action,
        summary: entry.summary,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        correlationId: entry.correlationId,
      }));
    },
    async listRevisions(ctx, id) {
      const revisions = await invoke(ctx, (planCtx) =>
        service.listRevisions(planCtx, id),
      );
      return revisions.map((revision) => ({
        versionLabel: revision.versionLabel,
        sealedAt: revision.sealedAt,
        sealedBy: revision.sealedBy,
        statusAtSeal: revision.statusAtSeal,
        itemFingerprint: revision.itemFingerprint,
        predecessorVersionLabel: revision.predecessorVersionLabel,
      }));
    },
    async getExecutionReadiness(ctx, id) {
      return invoke(ctx, (planCtx) => service.getExecutionReadiness(planCtx, id));
    },
  };
}
