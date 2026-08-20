/** APZQEP Phase 5 permission families — extend existing QEP catalogue. No nine-role catalogue. */

export const QEP_EXPERIENCE_PERMISSIONS = [
  "qep.exploratory.read",
  "qep.exploratory.manage",
  "qep.exploratory.perform",
  "qep.experience.read",
  "qep.experience.manage",
  "qep.experience.perform",
] as const;

export type QepExperiencePermission = (typeof QEP_EXPERIENCE_PERMISSIONS)[number];
