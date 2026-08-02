import {
  createInMemorySuiteRepository,
  type SuiteRepository,
} from "./application/repository";
import {
  createSuiteApplicationService,
  type SuiteApplicationService,
  type SuiteEventPublisher,
} from "./application/suite-service";

export type EnterpriseTestSuiteManagement = {
  readonly service: SuiteApplicationService;
  readonly repository: SuiteRepository;
};

export function createEnterpriseTestSuiteManagement(
  options: {
    readonly repository?: SuiteRepository;
    readonly publisher?: SuiteEventPublisher;
    readonly runInTransaction?: <T>(fn: () => Promise<T>) => Promise<T>;
  } = {},
): EnterpriseTestSuiteManagement {
  const repository = options.repository ?? createInMemorySuiteRepository();
  const service = createSuiteApplicationService({
    repository,
    ...(options.publisher ? { publisher: options.publisher } : {}),
    ...(options.runInTransaction ? { runInTransaction: options.runInTransaction } : {}),
  });
  return { service, repository };
}
