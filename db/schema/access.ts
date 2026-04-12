import { boolean, index, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

/** Bundle membership rows; authoritative only when `access_subject_flags.bundlesFromDb` is true for that subject. */
export const accessSubjectBundleAssignments = pgTable(
  "access_subject_bundle_assignments",
  {
    subjectId: text("subject_id").notNull(),
    bundleId: text("bundle_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.subjectId, t.bundleId] }),
    index("access_subject_bundle_assignments_subject_idx").on(t.subjectId),
  ],
);

/** Per-service role override; row present with non-null `effectiveRole` forces that role id/label. Row deleted = no override. */
export const accessSubjectServiceOverrides = pgTable(
  "access_subject_service_overrides",
  {
    subjectId: text("subject_id").notNull(),
    serviceId: text("service_id").notNull(),
    effectiveRole: text("effective_role"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.subjectId, t.serviceId] }),
    index("access_subject_service_overrides_subject_idx").on(t.subjectId),
  ],
);

/**
 * Mutable subject flags. `suspended` null = inherit mock directory status.
 * `bundlesFromDb` when true: bundle list comes only from `access_subject_bundle_assignments` (may be empty).
 */
export const accessSubjectFlags = pgTable(
  "access_subject_flags",
  {
    subjectId: text("subject_id").primaryKey(),
    suspended: boolean("suspended"),
    bundlesFromDb: boolean("bundles_from_db").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("access_subject_flags_bundles_from_db_idx").on(t.bundlesFromDb)],
);
