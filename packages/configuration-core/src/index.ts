/**
 * @apzhub/configuration-core — Platform Configuration domain core (APZCONFIG-001).
 */

export { CONFIGURATION_CORE_VERSION } from "./version";
export * from "./ports/repository-ports";
export * from "./lifecycle/transitions";
export * from "./hierarchy/precedence";
export * from "./validation/validate-configuration";
export * from "./versioning/versions";
export * from "./factories/create-configuration-foundation";
export * from "./service/create-platform-configuration-service";
