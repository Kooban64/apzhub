import { QepInvariantViolation } from "../../shared/errors";

/** External or internal soft reference — never an SoR copy of foreign data. */
export type RequirementReference = {
  readonly system: string;
  readonly externalId: string;
  readonly label?: string;
};

export function createRequirementReference(input: {
  system: string;
  externalId: string;
  label?: string;
}): RequirementReference {
  const system = input.system.trim();
  const externalId = input.externalId.trim();
  if (!system || !externalId) {
    throw new QepInvariantViolation(
      "RequirementReference requires system and externalId",
    );
  }
  return {
    system,
    externalId,
    ...(input.label?.trim() ? { label: input.label.trim() } : {}),
  };
}
