import {
  createExecutionSessionApplicationService,
  type ExecutionSessionApplicationService,
  type SessionEventPublisher,
} from "./application/session-service";
import type { PlanHandoffPort } from "./application/plan-port";
import {
  createInMemoryExecutionSessionRepository,
  type ExecutionSessionRepository,
} from "./application/repository";

export type EnterpriseTestExecutionWorkspace = {
  readonly service: ExecutionSessionApplicationService;
  readonly repository: ExecutionSessionRepository;
};

export function createEnterpriseTestExecutionWorkspace(options: {
  readonly plans: PlanHandoffPort;
  readonly repository?: ExecutionSessionRepository;
  readonly publisher?: SessionEventPublisher;
}): EnterpriseTestExecutionWorkspace {
  const repository = options.repository ?? createInMemoryExecutionSessionRepository();
  const service = createExecutionSessionApplicationService({
    repository,
    plans: options.plans,
    ...(options.publisher ? { publisher: options.publisher } : {}),
  });
  return { service, repository };
}
