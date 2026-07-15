export const REPORTING_CORE_VERSION = "0.1.0";

export { sha256Hex } from "./checksum";

export {
  bindTemplateToDocument,
  validateTemplateBinding,
  type BindTemplateArgs,
} from "./template-engine";

export {
  renderOutput,
  renderHtmlDocument,
  renderMarkdownDocument,
  renderJsonDocument,
  renderCsvDocument,
  renderPdfDocument,
  renderDocxDocument,
} from "./output";

export {
  createPlatformReportingService,
  type PlatformReportingEngineDeps,
} from "./platform-reporting-service";

export {
  ReportingDomainError,
  requireFound,
  type BuiltinTemplateCatalogue,
  type ReportTemplateRepositoryPort,
  type ReportMetadataRepositoryPort,
  type ReportTemplateCreateInput,
  type ReportMetadataCreateInput,
} from "./ports/types";
