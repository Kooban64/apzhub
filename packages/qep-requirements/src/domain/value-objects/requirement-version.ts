import { QepInvariantViolation } from "../../shared/errors";

export type RequirementVersion = {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
};

export function createRequirementVersion(
  major: number,
  minor = 0,
  patch = 0,
): RequirementVersion {
  if (![major, minor, patch].every((n) => Number.isInteger(n) && n >= 0)) {
    throw new QepInvariantViolation(
      "RequirementVersion components must be non-negative integers",
    );
  }
  return { major, minor, patch };
}

export function formatRequirementVersion(version: RequirementVersion): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}
