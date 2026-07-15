import type {
  ServiceRequestContext,
  TestingReportingService,
} from "@apzhub/platform-service-contracts";
import type {
  GenerateReportInput,
  PreviewReportInput,
  RegisterTemplateInput,
  RenderReportInput,
  ReportType,
  ValidateReportInput,
} from "@apzhub/testing-contracts";
import type { TestingDomainServices } from "@apzhub/testing-services";

import { assertTestingContext } from "./assert-testing-context";
import { withTestingErrorMapping } from "./map-testing-error";

async function runTestingOperation<T>(
  ctx: ServiceRequestContext,
  fn: () => Promise<T>,
): Promise<T> {
  assertTestingContext(ctx);
  return withTestingErrorMapping(fn, ctx.correlationId);
}

export class TestingReportingServiceImpl implements TestingReportingService {
  constructor(private readonly domain: TestingDomainServices) {}

  listReportPlaceholders(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, async () => {
      const templates = await this.domain.reporting.reporting.listTemplates(ctx);
      return templates.map((template) => ({
        id: template.id,
        title: template.title,
        reason: "available" as const,
        reportType: template.reportType as ReportType,
      }));
    });
  }

  listAvailableReports(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.reporting.reporting.listAvailableReports(ctx),
    );
  }

  listTemplates(ctx: ServiceRequestContext, reportType?: ReportType) {
    return runTestingOperation(ctx, () =>
      this.domain.reporting.reporting.listTemplates(ctx, reportType),
    );
  }

  getTemplate(ctx: ServiceRequestContext, templateId: string) {
    return runTestingOperation(ctx, () =>
      this.domain.reporting.reporting.getTemplate(ctx, templateId),
    );
  }

  registerTemplate(ctx: ServiceRequestContext, input: RegisterTemplateInput) {
    return runTestingOperation(ctx, () =>
      this.domain.reporting.reporting.registerTemplate(ctx, input),
    );
  }

  validateReport(ctx: ServiceRequestContext, input: ValidateReportInput) {
    return runTestingOperation(ctx, () =>
      this.domain.reporting.reporting.validateReport(ctx, input),
    );
  }

  previewReport(ctx: ServiceRequestContext, input: PreviewReportInput) {
    return runTestingOperation(ctx, () =>
      this.domain.reporting.reporting.previewReport(ctx, input),
    );
  }

  generateReport(ctx: ServiceRequestContext, input: GenerateReportInput) {
    return runTestingOperation(ctx, () =>
      this.domain.reporting.reporting.generateReport(ctx, input),
    );
  }

  renderReport(ctx: ServiceRequestContext, input: RenderReportInput) {
    return runTestingOperation(ctx, () =>
      this.domain.reporting.reporting.renderReport(ctx, input),
    );
  }

  archiveReportMetadata(ctx: ServiceRequestContext, metadataId: string) {
    return runTestingOperation(ctx, () =>
      this.domain.reporting.reporting.archiveReportMetadata(ctx, metadataId),
    );
  }

  listReportMetadata(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.reporting.reporting.listReportMetadata(ctx),
    );
  }

  getReportMetadata(ctx: ServiceRequestContext, metadataId: string) {
    return runTestingOperation(ctx, () =>
      this.domain.reporting.reporting.getReportMetadata(ctx, metadataId),
    );
  }
}
