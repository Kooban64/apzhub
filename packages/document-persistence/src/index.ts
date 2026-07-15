/** @apzhub/document-persistence — APZDOCS-001 / APZDOCS-002 */

export const DOCUMENT_PERSISTENCE_VERSION = "0.2.0" as const;

export * from "./in-memory/repositories";
export * from "./version/in-memory-versions";
export * from "./postgres/postgres-repositories";
export * from "./factories";
