/**
 * Platform reporting engine entry (APZREPORT-001).
 * Product adapters (e.g. TCMS) supply catalogues and persistence ports.
 */
export {
  createPlatformReportingService,
  bindTemplateToDocument,
  validateTemplateBinding,
  renderOutput,
  sha256Hex,
  ReportingDomainError,
  REPORTING_CORE_VERSION,
  type PlatformReportingEngineDeps,
  type BuiltinTemplateCatalogue,
  type ReportTemplateRepositoryPort,
  type ReportMetadataRepositoryPort,
} from "@apzhub/reporting-core";
