import {
  createLawPersistenceContext,
  runWithLawPersistenceContext,
  runWithLawPersistenceContextAsync,
  type LawPersistenceContext,
} from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";

export interface LawApiWorkflowRunnerOptions<TService> {
  readonly createService: (context: LawApiAuthenticatedContext) => TService;
  readonly toPersistenceContext?: (
    context: LawApiAuthenticatedContext,
  ) => LawPersistenceContext;
}

function defaultToPersistenceContext(
  context: LawApiAuthenticatedContext,
): LawPersistenceContext {
  return createLawPersistenceContext({
    tenantId: context.tenantId,
    actorId: context.user?.userId,
  });
}

/**
 * Factory for workflow service runners that bind tenant-scoped persistence (LAW-014-05).
 * Controllers stay thin; business logic remains in WorkflowService classes.
 */
export function createWorkflowRunner<TService>(
  options: LawApiWorkflowRunnerOptions<TService>,
) {
  const toPersistenceContext =
    options.toPersistenceContext ?? defaultToPersistenceContext;

  return {
    createService(context: LawApiAuthenticatedContext): TService {
      const lawContext = toPersistenceContext(context);
      return runWithLawPersistenceContext(lawContext, () =>
        options.createService(context),
      );
    },

    async withService<T>(
      context: LawApiAuthenticatedContext,
      operation: (service: TService) => T | Promise<T>,
    ): Promise<T> {
      const lawContext = toPersistenceContext(context);
      return runWithLawPersistenceContextAsync(lawContext, async () =>
        operation(options.createService(context)),
      );
    },
  };
}

export type LawApiWorkflowRunner<TService> = ReturnType<
  typeof createWorkflowRunner<TService>
>;
