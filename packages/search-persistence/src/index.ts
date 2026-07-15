/** @apzhub/search-persistence — APZSEARCH-002 */

export const SEARCH_PERSISTENCE_VERSION = "0.2.0" as const;

export * from "./types";
export * from "./records";
export * from "./ports";
export * from "./authorization";
export * from "./in-memory/repositories";
export * from "./postgres/repositories";
export * from "./registry/provider-registry";
export * from "./provider/stub-managed-provider";
export * from "./services/platform-services";
export * from "./factories";
