import type { ExecutionDomainEvent } from "../domain/test-execution/events";
import type { TestExecution } from "../domain/test-execution/test-execution";
import { ExecutionConcurrencyError, ExecutionNotFoundError } from "../shared/errors";
import type { ExecutionRequestContext } from "./context";
import type {
  AuditPort,
  ClockPort,
  EventOutboxPort,
  IdPort,
  PermissionPort,
  SearchPublicationPort,
  StoredTestExecution,
  TestExecutionRepository,
} from "./ports";

export type ApplicationOrchestrationDeps = {
  readonly executions: TestExecutionRepository;
  readonly permissions: PermissionPort;
  readonly audit: AuditPort;
  readonly outbox: EventOutboxPort;
  readonly search?: SearchPublicationPort;
  readonly clock: ClockPort;
  readonly ids: IdPort;
  readonly runInTransaction?: <T>(work: () => Promise<T>) => Promise<T>;
  readonly policy?: import("../domain/test-execution/policies").DomainPolicyConfig;
};

export function runInTransaction<T>(
  deps: ApplicationOrchestrationDeps,
  work: () => Promise<T>,
): Promise<T> {
  return deps.runInTransaction ? deps.runInTransaction(work) : work();
}

export function nowIso(deps: ApplicationOrchestrationDeps): string {
  return deps.clock.now();
}

export function commandContext(
  deps: ApplicationOrchestrationDeps,
  ctx: ExecutionRequestContext,
  expectedRevision?: number,
) {
  return {
    actorId: ctx.userId,
    changedAt: nowIso(deps),
    ...(expectedRevision !== undefined ? { expectedRevision } : {}),
    ...(ctx.correlationId ? { correlationId: ctx.correlationId } : {}),
  };
}

export async function requireExecution(
  deps: ApplicationOrchestrationDeps,
  ctx: ExecutionRequestContext,
  id: string,
): Promise<StoredTestExecution> {
  const found = await deps.executions.get(ctx.tenantId, id);
  if (!found) {
    throw new ExecutionNotFoundError(`Test Execution ${id} not found`, {
      executionId: id,
      tenantId: ctx.tenantId,
    });
  }
  return found;
}

function asStored(execution: TestExecution): StoredTestExecution {
  return { ...execution, uncommittedEvents: [] };
}

export async function persistCreate(
  deps: ApplicationOrchestrationDeps,
  ctx: ExecutionRequestContext,
  execution: TestExecution,
  action: string,
): Promise<StoredTestExecution> {
  return runInTransaction(deps, async () => {
    const stored = await deps.executions.create(execution);
    await afterPersist(deps, ctx, execution, stored, action, undefined);
    return stored;
  });
}

export async function persistMutation(
  deps: ApplicationOrchestrationDeps,
  ctx: ExecutionRequestContext,
  mutated: TestExecution,
  expectedRevision: number,
  action: string,
  priorStatus?: string,
): Promise<StoredTestExecution> {
  return runInTransaction(deps, async () => {
    let stored: StoredTestExecution;
    try {
      stored = await deps.executions.save(mutated, expectedRevision);
    } catch (error) {
      if (error instanceof ExecutionConcurrencyError) {
        throw error;
      }
      throw error;
    }
    await afterPersist(deps, ctx, mutated, stored, action, priorStatus);
    return stored;
  });
}

async function afterPersist(
  deps: ApplicationOrchestrationDeps,
  ctx: ExecutionRequestContext,
  mutated: TestExecution,
  stored: StoredTestExecution,
  action: string,
  priorStatus: string | undefined,
): Promise<void> {
  const events: readonly ExecutionDomainEvent[] = mutated.uncommittedEvents;
  await deps.outbox.enqueue(events);
  await deps.audit.append({
    id: deps.ids.nextId("aud"),
    tenantId: ctx.tenantId,
    executionId: stored.id,
    action,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    ...(priorStatus ? { priorStatus } : {}),
    resultingStatus: stored.status,
    createdAt: nowIso(deps),
    details: { revision: stored.revision },
  });
  try {
    await deps.search?.publish(asStored(stored));
  } catch {
    // Search projection failures must not roll back the unit of work.
  }
}
