import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  GenerateReportInput,
  PlatformReportingService,
  PreviewReportInput,
  RegisterTemplateInput,
  RenderReportInput,
  ReportTypeId,
  ValidateReportInput,
} from "@apzhub/reporting-contracts";
import type { TestingDomainServices } from "@apzhub/testing-services";

/**
 * Platform reporting gateway facet (APZREPORT-002).
 * Delegates to the shared reporting engine via the TCMS first-consumer adapter.
 * No new report generation logic.
 */
export class PlatformReportingServiceImpl implements PlatformReportingService {
  constructor(private readonly domain: TestingDomainServices) {}

  listAvailableReports(ctx: ServiceRequestContext) {
    return this.domain.reporting.reporting.listAvailableReports(ctx);
  }

  listTemplates(ctx: ServiceRequestContext, reportType?: ReportTypeId) {
    return this.domain.reporting.reporting.listTemplates(
      ctx,
      reportType as Parameters<
        TestingDomainServices["reporting"]["reporting"]["listTemplates"]
      >[1],
    );
  }

  getTemplate(ctx: ServiceRequestContext, templateId: string) {
    return this.domain.reporting.reporting.getTemplate(ctx, templateId);
  }

  registerTemplate(ctx: ServiceRequestContext, input: RegisterTemplateInput) {
    return this.domain.reporting.reporting.registerTemplate(ctx, input);
  }

  validateReport(ctx: ServiceRequestContext, input: ValidateReportInput) {
    return this.domain.reporting.reporting.validateReport(
      ctx,
      input as Parameters<
        TestingDomainServices["reporting"]["reporting"]["validateReport"]
      >[1],
    );
  }

  previewReport(ctx: ServiceRequestContext, input: PreviewReportInput) {
    return this.domain.reporting.reporting.previewReport(
      ctx,
      input as Parameters<
        TestingDomainServices["reporting"]["reporting"]["previewReport"]
      >[1],
    );
  }

  generateReport(ctx: ServiceRequestContext, input: GenerateReportInput) {
    return this.domain.reporting.reporting.generateReport(
      ctx,
      input as Parameters<
        TestingDomainServices["reporting"]["reporting"]["generateReport"]
      >[1],
    );
  }

  renderReport(ctx: ServiceRequestContext, input: RenderReportInput) {
    return this.domain.reporting.reporting.renderReport(ctx, input);
  }

  archiveReportMetadata(ctx: ServiceRequestContext, metadataId: string) {
    return this.domain.reporting.reporting.archiveReportMetadata(ctx, metadataId);
  }

  listReportMetadata(ctx: ServiceRequestContext) {
    return this.domain.reporting.reporting.listReportMetadata(ctx);
  }

  getReportMetadata(ctx: ServiceRequestContext, metadataId: string) {
    return this.domain.reporting.reporting.getReportMetadata(ctx, metadataId);
  }
}
