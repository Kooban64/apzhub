export type {
  KnowledgeCapabilityRecord,
  KnowledgeSourceExtractionResult,
} from "./types";
export { mapKnowledgeManifestToSource } from "./map-knowledge-manifest";
export { extractKnowledgeSourcesFromCapabilities } from "./extract-knowledge-sources";
export {
  populateKnowledgeRegistryFromCapabilities,
  type ManifestKnowledgePopulationResult,
} from "./populate-knowledge-registry";
