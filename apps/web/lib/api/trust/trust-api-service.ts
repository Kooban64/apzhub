import {
  createLawPersistenceContext,
  createTrustServiceBundle,
  getSharedTrustServiceBundle,
  resetSharedTrustServiceBundle,
  type TrustServiceBundle,
} from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import { createWorkflowRunner } from "../framework";

function toTrustPersistenceContext(context: LawApiAuthenticatedContext) {
  return createLawPersistenceContext({
    tenantId: context.tenantId,
    actorId: context.user?.userId,
  });
}

const trustWorkflowRunner = createWorkflowRunner({
  createService: (context) =>
    getSharedTrustServiceBundle(toTrustPersistenceContext(context)),
});

export function createTrustServiceBundleForContext(
  context: LawApiAuthenticatedContext,
): TrustServiceBundle {
  return createTrustServiceBundle(toTrustPersistenceContext(context));
}

export async function withTrustServiceBundle<T>(
  context: LawApiAuthenticatedContext,
  operation: (bundle: TrustServiceBundle) => T | Promise<T>,
): Promise<T> {
  return trustWorkflowRunner.withService(context, operation);
}

export function resetTrustApiRepositories(): void {
  resetSharedTrustServiceBundle();
}
