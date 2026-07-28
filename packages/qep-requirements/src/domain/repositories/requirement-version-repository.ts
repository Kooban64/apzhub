/**
 * @deprecated `RequirementVersion` is the aggregate's semver VO. Content history
 * is named `RequirementContentVersion` to prevent conflating it with `revision`.
 */
export type {
  RequirementContentVersionMetadata as RequirementVersionRecord,
  RequirementContentVersionRepository as RequirementVersionRepository,
} from "./requirement-content-version-repository";
