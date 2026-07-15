export {
  SEARCH_INTEGRATION_CAPABILITIES,
  DEFAULT_DECLARED_SEARCH_CAPABILITIES,
  isSearchIntegrationCapabilityId,
  toSearchCapabilities,
  foundationSearchCapabilities,
  SearchProviderCapabilities,
} from "./constants";
export type { SearchIntegrationCapabilityId } from "./constants";

export {
  SearchCapabilityRegistration,
  createSearchCapabilityRegistration,
} from "./registration";
export type {
  SearchCapabilityRecord,
  SearchCapabilityRegistrationResult,
  SearchCapabilityDiscoveryFilter,
} from "./registration";
