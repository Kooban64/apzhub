/**
 * @apzhub/identity-persistence — Platform Identity Administration persistence (APZIDENTITY-001).
 */

export { IDENTITY_PERSISTENCE_VERSION } from "./version";
export * from "./in-memory/repositories";
export * from "./postgres/repositories";
export * from "./factories";
