import {
  associationsFromLegacyRows,
  createApplicationContextResolver,
  type QepApplication,
  type QepApplicationLegacyRef,
} from "@apzhub/qep-applications";
import { lookupUserDisplayNamesByIds } from "@apzhub/config";

import { getApplicationService } from "./application-runtime";
import { collectObservedLegacyProjectRefs } from "./legacy-project-scan";
import { resolveCoreQePersistenceMode } from "./persistence/resolve-core-qe-persistence";

export type PresentedQepApplication = QepApplication & {
  readonly ownerDisplayName: string;
  readonly projectRefs: readonly string[];
};

export async function reconcileApplicationLegacyContext(
  tenantId: string,
): Promise<readonly QepApplicationLegacyRef[]> {
  const service = getApplicationService();
  await service.syncDeterministicLegacyMappings(tenantId);
  if (resolveCoreQePersistenceMode() === "postgres") {
    try {
      const observed = await collectObservedLegacyProjectRefs(tenantId);
      await service.recordObservedProjectRefs(tenantId, observed);
    } catch {
      /* scan failure must not block Application reads */
    }
  }
  return service.listLegacyRefs(tenantId);
}

export function legacyAssociationReport(
  associations: readonly QepApplicationLegacyRef[],
): {
  readonly resolvedCount: number;
  readonly unresolved: readonly { readonly projectRef: string }[];
} {
  const unresolved = associations
    .filter((row) => !row.applicationId)
    .map((row) => ({ projectRef: row.projectRef }));
  return {
    resolvedCount: associations.filter((row) => Boolean(row.applicationId)).length,
    unresolved,
  };
}

export async function presentApplications(
  applications: readonly QepApplication[],
  associations: readonly QepApplicationLegacyRef[],
): Promise<readonly PresentedQepApplication[]> {
  const names = await lookupUserDisplayNamesByIds(
    applications
      .map((row) => row.ownerUserId)
      .filter((value): value is string => Boolean(value)),
  );
  const resolver = createApplicationContextResolver({
    applications,
    associations: associationsFromLegacyRows(associations),
  });
  return applications.map((application) => ({
    ...application,
    ownerDisplayName: application.ownerUserId
      ? (names.get(application.ownerUserId) ?? "Unavailable")
      : "—",
    projectRefs: resolver.projectRefsFor(application.id),
  }));
}
