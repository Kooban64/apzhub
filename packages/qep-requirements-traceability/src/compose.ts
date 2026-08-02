import type { QualityArtefactPorts } from "./application/ports";
import {
  createRequirementApplicationService,
  type RequirementApplicationService,
  type RequirementEventPublisher,
} from "./application/requirement-service";
import {
  createInMemoryRequirementRepository,
  type RequirementRepository,
} from "./application/repository";

export type EnterpriseRequirementsTraceability = {
  readonly service: RequirementApplicationService;
  readonly repository: RequirementRepository;
};

export function createEnterpriseRequirementsTraceability(
  options: {
    readonly repository?: RequirementRepository;
    readonly ports?: QualityArtefactPorts;
    readonly publisher?: RequirementEventPublisher;
    readonly runInTransaction?: <T>(fn: () => Promise<T>) => Promise<T>;
  } = {},
): EnterpriseRequirementsTraceability {
  const repository = options.repository ?? createInMemoryRequirementRepository();
  const service = createRequirementApplicationService({
    repository,
    ...(options.ports ? { ports: options.ports } : {}),
    ...(options.publisher ? { publisher: options.publisher } : {}),
    ...(options.runInTransaction ? { runInTransaction: options.runInTransaction } : {}),
  });
  return { service, repository };
}
