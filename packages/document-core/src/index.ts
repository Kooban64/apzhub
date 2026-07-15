/** @apzhub/document-core — APZDOCS-001 / APZDOCS-002 */

export const DOCUMENT_CORE_VERSION = "0.3.0" as const;

export * from "./storage/storage-provider";
export * from "./ports/types";
export * from "./ports/version-ports";
export * from "./lifecycle/transitions";
export * from "./classification/validate";
export * from "./service/create-document-platform-service";
export * from "./integrity/integrity-service";
export * from "./config/storage-config";
export * from "./coordinator/storage-coordinator";
export * from "./factories/platform-foundation";
