/**
 * @apzhub/identity-core — Platform Identity Administration domain core (APZIDENTITY-002).
 */

export { IDENTITY_CORE_VERSION } from "./version";
export * from "./ports/repository-ports";
export * from "./lifecycle/transitions";
export * from "./validation/validate-identity";
export * from "./membership/membership";
export * from "./assignment/assignments";
export * from "./factories/create-identity-foundation";
export * from "./service/create-platform-identity-service";
