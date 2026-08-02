import {
  createDefectApplicationService,
  type DefectApplicationService,
  type DefectEventPublisher,
} from "./application/defect-service";
import type { ExecutionSessionPort } from "./application/execution-port";
import {
  createInMemoryDefectRepository,
  type DefectRepository,
} from "./application/repository";

export type EnterpriseDefectManagement = {
  readonly service: DefectApplicationService;
  readonly repository: DefectRepository;
};

export function createEnterpriseDefectManagement(
  options: {
    readonly repository?: DefectRepository;
    readonly executions?: ExecutionSessionPort;
    readonly publisher?: DefectEventPublisher;
    readonly runInTransaction?: <T>(fn: () => Promise<T>) => Promise<T>;
  } = {},
): EnterpriseDefectManagement {
  const repository = options.repository ?? createInMemoryDefectRepository();
  const service = createDefectApplicationService({
    repository,
    ...(options.executions ? { executions: options.executions } : {}),
    ...(options.publisher ? { publisher: options.publisher } : {}),
    ...(options.runInTransaction ? { runInTransaction: options.runInTransaction } : {}),
  });
  return { service, repository };
}
