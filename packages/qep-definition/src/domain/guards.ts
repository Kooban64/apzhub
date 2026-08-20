import {
  CRITERION_STATUSES,
  ORIGIN_TYPES,
  STORY_PRIORITIES,
  STORY_STATUSES,
  STORY_TYPES,
  VERIFICATION_ASSET_KINDS,
  VERIFICATION_RESULTS,
  type CriterionStatus,
  type OriginType,
  type StoryPriority,
  type StoryStatus,
  type StoryType,
  type VerificationAssetKind,
  type VerificationResult,
} from "./types";

export function isStoryType(value: string): value is StoryType {
  return (STORY_TYPES as readonly string[]).includes(value);
}

export function isStoryStatus(value: string): value is StoryStatus {
  return (STORY_STATUSES as readonly string[]).includes(value);
}

export function isStoryPriority(value: string): value is StoryPriority {
  return (STORY_PRIORITIES as readonly string[]).includes(value);
}

export function isCriterionStatus(value: string): value is CriterionStatus {
  return (CRITERION_STATUSES as readonly string[]).includes(value);
}

export function isOriginType(value: string): value is OriginType {
  return (ORIGIN_TYPES as readonly string[]).includes(value);
}

export function isVerificationAssetKind(value: string): value is VerificationAssetKind {
  return (VERIFICATION_ASSET_KINDS as readonly string[]).includes(value);
}

export function isVerificationResult(value: string): value is VerificationResult {
  return (VERIFICATION_RESULTS as readonly string[]).includes(value);
}

export function assertStoryApplicationBound(applicationId: string): void {
  if (!applicationId.trim()) {
    throw new Error("story.application_required");
  }
}

export function assertCriterionApplicationBound(applicationId: string): void {
  if (!applicationId.trim()) {
    throw new Error("criterion.application_required");
  }
}

export function assertCriterionRequirementBound(requirementId: string): void {
  if (!requirementId.trim()) {
    throw new Error("criterion.requirement_required");
  }
}

export function assertSameRequirement(
  storyRequirementId: string,
  criterionRequirementId: string,
): void {
  if (storyRequirementId !== criterionRequirementId) {
    throw new Error("criterion.requirement_mismatch");
  }
}

export function assertSameApplication(left: string, right: string): void {
  if (left !== right) {
    throw new Error("definition.application_mismatch");
  }
}
