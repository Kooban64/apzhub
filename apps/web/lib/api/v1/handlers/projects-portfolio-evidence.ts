/**
 * Loads operational evidence for Strategic Objective progress (W005).
 */

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import {
  createProjectsDeliveryService,
  createProjectsOperationalService,
  getMemoryProjectsDeliveryStore,
  getMemoryProjectsOperationalStore,
  setProjectsDeliveryStoreForTests,
  setProjectsOperationalStoreForTests,
  type ObjectiveEvidenceBundle,
} from "@apzhub/platform-services";

function delivery() {
  try {
    return createProjectsDeliveryService();
  } catch {
    setProjectsDeliveryStoreForTests(getMemoryProjectsDeliveryStore());
    return createProjectsDeliveryService(getMemoryProjectsDeliveryStore());
  }
}

function ops() {
  try {
    return createProjectsOperationalService();
  } catch {
    setProjectsOperationalStoreForTests(getMemoryProjectsOperationalStore());
    return createProjectsOperationalService(getMemoryProjectsOperationalStore());
  }
}

export async function loadPortfolioObjectiveEvidence(
  ctx: ServiceRequestContext,
  projectIds: readonly string[],
): Promise<ObjectiveEvidenceBundle> {
  if (projectIds.length === 0) {
    return { milestones: [], commitments: [] };
  }
  const d = delivery();
  const o = ops();
  const milestoneLists = await Promise.all(
    projectIds.map((projectId) => d.listMilestones(ctx, projectId)),
  );
  const commitmentLists = await Promise.all(
    projectIds.map((projectId) => o.listCommitments(ctx, projectId)),
  );
  return {
    milestones: milestoneLists.flat().map((m) => ({
      status: m.status,
      progressPercent: m.progressPercent,
    })),
    commitments: commitmentLists.flat().map((c) => ({
      status: c.status,
    })),
  };
}
