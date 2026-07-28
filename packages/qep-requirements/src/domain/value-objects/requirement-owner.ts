import { QepInvariantViolation } from "../../shared/errors";

export type RequirementOwner = {
  readonly userId: string;
  readonly displayName?: string;
};

export function createRequirementOwner(input: {
  userId: string;
  displayName?: string;
}): RequirementOwner {
  const userId = input.userId.trim();
  if (!userId) {
    throw new QepInvariantViolation("RequirementOwner.userId is required");
  }
  return {
    userId,
    ...(input.displayName?.trim() ? { displayName: input.displayName.trim() } : {}),
  };
}
