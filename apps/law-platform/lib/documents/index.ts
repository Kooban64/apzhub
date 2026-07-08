export type {
  Document,
  DocumentSearchCriteria,
  DocumentStatus,
  DocumentType,
} from "./document-types";
export {
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  documentToFormValues,
  createEmptyDocumentFormValues,
  type DocumentFormValues,
  type DocumentListCriteria,
} from "./document-types";
export type { DocumentRepository } from "./document-repository";
export type { WritableDocumentRepository } from "./writable-document-repository";
export {
  InMemoryDocumentRepository,
  getSharedDocumentRepository,
  resetSharedDocumentRepository,
} from "./in-memory-document-repository";
export { SEED_DOCUMENTS } from "./seed-documents";
export { SEED_DOCUMENT_CATEGORIES, getDocumentCategoryName } from "./seed-categories";
export { SEED_FOLDERS, getFolderName, listFoldersForMatter } from "./seed-folders";
export {
  validateDocumentForm,
  parseTagsInput,
  parseCustomFieldsInput,
  parseSizeBytesInput,
  type DocumentValidationResult,
} from "./document-validation";
export {
  DOCUMENT_MODULE_BASE_ROUTE,
  documentCreateRoute,
  documentDetailRoute,
  documentEditRoute,
  documentListRoute,
  isDocumentModuleRoute,
  parseDocumentRoute,
  type DocumentRoute,
} from "./document-routes";
export {
  registerDocumentNavigationHandler,
  unregisterDocumentNavigationHandler,
  navigateToDocumentRoute,
} from "./document-navigation";
export {
  DocumentWorkflowService,
  type DocumentWorkflowResult,
} from "./document-workflow-service";
export {
  DocumentWorkflowProvider,
  useDocumentWorkflow,
  useOptionalDocumentWorkflow,
} from "./document-workflow-context";
export {
  DocumentWorkflowDiagnostics,
  getDocumentWorkflowDiagnostics,
  resetDocumentWorkflowDiagnostics,
  type DocumentWorkflowRunRecord,
} from "./document-workflow-diagnostics";
export {
  getMatterTitleForDocument,
  getDocumentCategoryLabel,
  getDocumentFolderLabel,
} from "./document-lookups";
