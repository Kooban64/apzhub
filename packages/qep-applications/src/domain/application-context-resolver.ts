import type { LegacyRefOrigin, QepApplication, QepApplicationLegacyRef } from "./types";

export type ApplicationContextLabel =
  | {
      readonly kind: "application";
      readonly applicationId: string;
      readonly name: string;
    }
  | {
      readonly kind: "unbound";
      readonly projectRef?: string;
    }
  | {
      readonly kind: "none";
    };

export type ApplicationContextResolver = {
  applicationIdFor(projectRef: string | undefined): string | null;
  projectRefsFor(applicationId: string): readonly string[];
  isAssociated(projectRef: string | undefined, applicationId: string): boolean;
  contextLabel(projectRef: string | undefined): ApplicationContextLabel;
  displayContext(projectRef: string | undefined): string;
};

const ORIGIN_RANK: Record<LegacyRefOrigin, number> = {
  application_id: 3,
  legacy_quality_project_id: 2,
  application_key: 1,
  observed: 0,
};

export function deterministicClaimsForApplication(
  app: QepApplication,
): readonly { readonly projectRef: string; readonly origin: LegacyRefOrigin }[] {
  const claims: { projectRef: string; origin: LegacyRefOrigin }[] = [
    { projectRef: app.id, origin: "application_id" },
  ];
  const legacy = app.legacyQualityProjectId?.trim();
  if (legacy && legacy !== app.id) {
    claims.push({ projectRef: legacy, origin: "legacy_quality_project_id" });
  }
  const key = app.key.trim();
  if (key && key !== app.id) {
    claims.push({ projectRef: key, origin: "application_key" });
  }
  return claims;
}

/**
 * Deterministic Application ↔ projectRef claims only.
 * Same-rank claims from different applications are left unmapped (no guessing).
 */
export function mergeDeterministicLegacyClaims(
  applications: readonly QepApplication[],
): readonly {
  readonly projectRef: string;
  readonly applicationId: string;
  readonly origin: LegacyRefOrigin;
}[] {
  const byRef = new Map<
    string,
    { applicationId: string; origin: LegacyRefOrigin } | "conflict"
  >();
  for (const app of applications) {
    for (const claim of deterministicClaimsForApplication(app)) {
      const existing = byRef.get(claim.projectRef);
      if (!existing) {
        byRef.set(claim.projectRef, {
          applicationId: app.id,
          origin: claim.origin,
        });
        continue;
      }
      if (existing === "conflict") continue;
      if (existing.applicationId === app.id) {
        if (ORIGIN_RANK[claim.origin] > ORIGIN_RANK[existing.origin]) {
          byRef.set(claim.projectRef, {
            applicationId: app.id,
            origin: claim.origin,
          });
        }
        continue;
      }
      const incomingRank = ORIGIN_RANK[claim.origin];
      const existingRank = ORIGIN_RANK[existing.origin];
      if (incomingRank > existingRank) {
        byRef.set(claim.projectRef, {
          applicationId: app.id,
          origin: claim.origin,
        });
      } else if (incomingRank === existingRank) {
        byRef.set(claim.projectRef, "conflict");
      }
    }
  }
  return [...byRef.entries()]
    .filter(
      (entry): entry is [string, { applicationId: string; origin: LegacyRefOrigin }] =>
        entry[1] !== "conflict",
    )
    .map(([projectRef, value]) => ({ projectRef, ...value }));
}

export function createApplicationContextResolver(input: {
  readonly applications: readonly { readonly id: string; readonly name: string }[];
  readonly associations: readonly {
    readonly projectRef: string;
    readonly applicationId?: string;
  }[];
}): ApplicationContextResolver {
  const nameById = new Map(input.applications.map((app) => [app.id, app.name]));
  const applicationIdByRef = new Map<string, string>();
  const refsByApplication = new Map<string, string[]>();

  for (const association of input.associations) {
    const applicationId = association.applicationId?.trim();
    const projectRef = association.projectRef.trim();
    if (!projectRef || !applicationId) continue;
    applicationIdByRef.set(projectRef, applicationId);
    const refs = refsByApplication.get(applicationId) ?? [];
    if (!refs.includes(projectRef)) refs.push(projectRef);
    refsByApplication.set(applicationId, refs);
  }

  for (const app of input.applications) {
    if (!applicationIdByRef.has(app.id)) {
      applicationIdByRef.set(app.id, app.id);
      const refs = refsByApplication.get(app.id) ?? [];
      if (!refs.includes(app.id)) refs.push(app.id);
      refsByApplication.set(app.id, refs);
    }
  }

  function contextLabel(projectRef: string | undefined): ApplicationContextLabel {
    const ref = projectRef?.trim();
    if (!ref) return { kind: "none" };
    const applicationId = applicationIdByRef.get(ref);
    if (!applicationId) return { kind: "unbound", projectRef: ref };
    const name = nameById.get(applicationId);
    if (!name) return { kind: "unbound", projectRef: ref };
    return { kind: "application", applicationId, name };
  }

  return {
    applicationIdFor(projectRef) {
      const ref = projectRef?.trim();
      if (!ref) return null;
      return applicationIdByRef.get(ref) ?? null;
    },
    projectRefsFor(applicationId) {
      return refsByApplication.get(applicationId) ?? [applicationId];
    },
    isAssociated(projectRef, applicationId) {
      const ref = projectRef?.trim();
      if (!ref) return false;
      return applicationIdByRef.get(ref) === applicationId;
    },
    contextLabel,
    displayContext(projectRef) {
      const label = contextLabel(projectRef);
      if (label.kind === "application") return label.name;
      if (label.kind === "none") return "—";
      return "Unbound";
    },
  };
}

export function associationsFromLegacyRows(
  rows: readonly QepApplicationLegacyRef[],
): readonly { readonly projectRef: string; readonly applicationId?: string }[] {
  return rows.map((row) => ({
    projectRef: row.projectRef,
    ...(row.applicationId ? { applicationId: row.applicationId } : {}),
  }));
}
