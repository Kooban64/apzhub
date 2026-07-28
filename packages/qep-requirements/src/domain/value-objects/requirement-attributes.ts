import { QepInvariantViolation } from "../../shared/errors";

export type RequirementAttributes = {
  readonly tags: readonly string[];
  readonly custom: Readonly<Record<string, string>>;
};

export function createRequirementAttributes(input?: {
  tags?: readonly string[];
  custom?: Readonly<Record<string, string>>;
}): RequirementAttributes {
  const tags = (input?.tags ?? []).map((t) => t.trim()).filter(Boolean);
  if (tags.length > 50) {
    throw new QepInvariantViolation("RequirementAttributes.tags max 50");
  }
  return {
    tags,
    custom: { ...(input?.custom ?? {}) },
  };
}
