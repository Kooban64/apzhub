/**
 * @apzhub/admin-core — Platform Administration domain core (APZADMIN-001).
 */

export { ADMIN_CORE_VERSION } from "./version";
export * from "./ports/repository-ports";
export * from "./lifecycle/transitions";
export * from "./validation/validate-administration";
export * from "./registration/canonical";
export * from "./capability/status";
export * from "./factories/create-administration-foundation";
export * from "./service/create-platform-administration-service";
