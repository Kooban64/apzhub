/** @apzhub/search-contracts — APZSEARCH-006 Platform Search contracts */

export const SEARCH_CONTRACTS_VERSION = "0.4.0" as const;

export * from "./identifiers";
export * from "./enums/catalogue";
export * from "./common/context";
export * from "./domain/search";
export * from "./domain/query-validation";
export * from "./permissions/catalogue";
export * from "./errors/catalogue";
export * from "./providers/search-provider";
export * from "./providers/search-execution-provider";
export * from "./providers/lifecycle";
export * from "./adapters/product-search-adapter";
export * from "./services/platform-search-services";
export * from "./services/search-execution-services";
export * from "./diagnostics/types";
export * from "./config/types";
export * from "./security/boundary";
export * from "./security/tenant-isolation";
