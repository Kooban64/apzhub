/** Activity taxonomy categories — AT-001 / registry validation. */
export const ACTIVITY_CATEGORIES = [
  "user",
  "team",
  "workspace",
  "system",
  "security",
  "integration",
  "capability",
] as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export const CANONICAL_ACTIVITY_CATEGORIES: readonly ActivityCategory[] =
  ACTIVITY_CATEGORIES;
