import {
  createExecutionPlanApplicationService,
  type ExecutionPlanApplicationService,
  type PlanEventPublisher,
} from "./application/plan-service";
import {
  createInMemoryExecutionPlanRepository,
  type ExecutionPlanRepository,
} from "./application/repository";
import type { SuiteReferencePort } from "./application/suite-port";

export type EnterpriseTestExecutionPlanning = {
  readonly service: ExecutionPlanApplicationService;
  readonly repository: ExecutionPlanRepository;
};

export function createEnterpriseTestExecutionPlanning(options: {
  readonly suites: SuiteReferencePort;
  readonly repository?: ExecutionPlanRepository;
  readonly publisher?: PlanEventPublisher;
  readonly runInTransaction?: <T>(fn: () => Promise<T>) => Promise<T>;
}): EnterpriseTestExecutionPlanning {
  const repository = options.repository ?? createInMemoryExecutionPlanRepository();
  const service = createExecutionPlanApplicationService({
    repository,
    suites: options.suites,
    ...(options.publisher ? { publisher: options.publisher } : {}),
    ...(options.runInTransaction ? { runInTransaction: options.runInTransaction } : {}),
  });
  return { service, repository };
}
