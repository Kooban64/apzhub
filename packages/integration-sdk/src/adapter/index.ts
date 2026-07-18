export type { AdapterBase, PlaceholderAdapterBaseOptions } from "./types";
export { PlaceholderAdapterBase, createPlaceholderAdapterBase } from "./placeholder";

export type { IntegrationCapabilityId } from "./capability-types";
export {
  INTEGRATION_CAPABILITIES,
  isIntegrationCapabilityId,
  parseIntegrationCapabilities,
} from "./capability-types";

export type {
  AdapterManifest,
  AdapterConnectionDefaults,
  AdapterBootstrapConfiguration,
} from "./manifest-types";

export type {
  AdapterLifecycleResult,
  AdapterConfigurationValidationResult,
  AdapterDisposeReason,
  AdapterDisposeResult,
} from "./lifecycle-types";

export type {
  AdapterContext,
  AdapterClock,
  BuildAdapterContextInput,
} from "./adapter-context";
export { buildAdapterContext } from "./adapter-context";

export { IntegrationAdapterBase } from "./adapter-base";

export type {
  RegisteredCapabilityRecord,
  CapabilityRegistrationResult,
  CapabilityDiscoveryFilter,
  CapabilityRegistration,
} from "./capability-registration";
export {
  InMemoryCapabilityRegistration,
  createInMemoryCapabilityRegistration,
  validateAdapterManifest,
} from "./capability-registration";

export type {
  AdapterConstructor,
  AdapterFactoryOptions,
  CreateAdapterOptions,
  AdapterFactoryCreateResult,
} from "./adapter-factory";
export { AdapterFactory, createAdapterFactory } from "./adapter-factory";

export { MockAdapter, createMockAdapterManifest } from "./mock-adapter";
