import type { AppDbClient } from "@/db/client";
import { replaceBundleAssignmentsForSubject, upsertServiceOverride } from "@/lib/access/repository/access-repository";
import { listCatalogServiceIds, maxRoleTokenForService } from "@/lib/dev/catalog-max-access";
import { HUB_DEMO_BUNDLE_IDS } from "@/lib/dev/hub-demo-access-profile";

/**
 * Applies demo bundle membership + per-service overrides so a portal `users.id` row
 * receives effective access across the full admin access catalog (see `catalog-max-access`).
 */
export async function applyHubDemoAccessForSubject(subjectId: string, tx?: AppDbClient): Promise<void> {
  await replaceBundleAssignmentsForSubject(subjectId, [...HUB_DEMO_BUNDLE_IDS], tx);
  for (const serviceId of listCatalogServiceIds()) {
    await upsertServiceOverride(subjectId, serviceId, maxRoleTokenForService(serviceId), tx);
  }
}
