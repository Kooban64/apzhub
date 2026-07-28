/**
 * @apzhub/observe-core — Platform Observability domain core (APZOBSERVE-001).
 */

export { OBSERVE_CORE_VERSION } from "./version";
export * from "./ports/repository-ports";
export * from "./lifecycle/transitions";
export * from "./validation/validate-observe";
export * from "./validation/validate-alert-rule";
export * from "./evaluation/fingerprint";
export * from "./evaluation/evaluate-predicate";
export * from "./evaluation/create-alert-evaluation-domain";
export * from "./factories/create-observe-foundation";
export * from "./service/create-platform-observe-service";
