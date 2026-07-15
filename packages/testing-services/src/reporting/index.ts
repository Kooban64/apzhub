export {
  createReportingFrameworkServices,
  createReportingService,
  type ReportingFrameworkServices,
  type ReportingFrameworkServiceDeps,
} from "./factory";

export {
  BUILTIN_REPORT_TEMPLATES,
  getBuiltinTemplate,
  listBuiltinTemplates,
  defaultTemplateIdFor,
} from "./templates/builtin-templates";

export {
  bindTemplateToDocument,
  validateTemplateBinding,
  type BindTemplateArgs,
  sha256Hex,
  renderOutput,
  renderHtmlDocument,
  renderMarkdownDocument,
  renderJsonDocument,
  renderCsvDocument,
  renderPdfDocument,
  renderDocxDocument,
  ReportingDomainError,
} from "@apzhub/reporting-core";

/** @deprecated Use ReportingDomainError — alias for APZTCMS-024 test compatibility. */
export { ReportingDomainError as DomainRuleError } from "@apzhub/reporting-core";
