export { PaperlessAdapter } from "./paperless-adapter";
export type {
  PaperlessAdapterOptions,
  PaperlessDiagnosticsExtension,
} from "./paperless-adapter";
export { PaperlessClient } from "./paperless-client";
export type { PaperlessDocumentPage } from "./paperless-client";
export { createPaperlessAdapter, disposePaperlessAdapter } from "./paperless-factory";
export type {
  CreatePaperlessAdapterInput,
  CreatePaperlessAdapterResult,
} from "./paperless-factory";
export {
  normalizePaperlessConfiguration,
  validatePaperlessConfiguration,
} from "./paperless-config";
export type {
  PaperlessConfiguration,
  PaperlessConfigurationInput,
  PaperlessConfigurationValidationResult,
} from "./paperless-config";
export {
  PAPERLESS_ADAPTER_ID,
  PAPERLESS_ADAPTER_VERSION,
  PAPERLESS_INTEGRATION_ID,
} from "./version";
export {
  createMockPaperlessFetch,
  MOCK_PAPERLESS_DOCUMENT,
} from "./testing/mock-paperless-api";
