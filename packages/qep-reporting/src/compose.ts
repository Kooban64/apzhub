import type { QualityFactsPort } from "./application/ports";
import {
  createReportingApplicationService,
  type ReportingApplicationService,
  type ReportingEventPublisher,
} from "./application/reporting-service";
import {
  createInMemoryReportingRepository,
  type ReportingRepository,
} from "./application/repository";

export type EnterpriseReportingAnalytics = {
  readonly service: ReportingApplicationService;
  readonly repository: ReportingRepository;
};

export function createEnterpriseReportingAnalytics(options: {
  readonly facts: QualityFactsPort;
  readonly repository?: ReportingRepository;
  readonly publisher?: ReportingEventPublisher;
}): EnterpriseReportingAnalytics {
  const repository = options.repository ?? createInMemoryReportingRepository();
  const service = createReportingApplicationService({
    repository,
    facts: options.facts,
    ...(options.publisher ? { publisher: options.publisher } : {}),
  });
  return { service, repository };
}
