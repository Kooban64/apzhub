export {
  createDocumentPlatformServices,
  createDocumentPlatformServicesForProduction,
  createDocumentPlatformServicesForTest,
  wrapDocumentPlatformGatewayWithPipeline,
} from "./create-document-platform-services";
export type {
  CreateDocumentPlatformServicesForProductionInput,
  CreateDocumentPlatformServicesForTestInput,
  CreateDocumentPlatformServicesInput,
  DocumentPlatformServicesBundle,
} from "./create-document-platform-services";
export { createDocumentPlatformServiceImpls } from "./document-service-impls";
export type { DocumentPlatformServiceImpls } from "./document-service-impls";
export { isDocumentServiceEnabled } from "./document-env";
