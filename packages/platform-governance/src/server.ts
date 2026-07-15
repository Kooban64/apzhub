import type {
  FeatureFlagEvaluationContext,
  SessionGovernanceSnapshot,
} from "./governance-types";
import { getGovernanceServiceForSession } from "./governance-runtime";
import { getSharedGovernanceService } from "./index";
import type { PlatformGovernanceService } from "./platform-governance-service";

export * from "./index";
export { createPostgresGovernanceService, getGovernanceServiceForSession } from "./governance-runtime";

export {
  handleGetCapabilities,
  handleGetFeatureFlags,
  handleGetGovernance,
  handleGetGovernanceDiagnostics,
  handleGetProvisioning,
  handlePatchFeatureFlag,
  handlePatchGovernance,
  handlePostProvisioning,
} from "./api-handlers";

export interface ResolveSessionGovernanceInput {
  readonly userId?: string;
  readonly tenantId?: string;
  readonly productKey?: string;
  readonly moduleId?: string;
  readonly provisionIfEmpty?: boolean;
}

export async function resolveSessionGovernance(
  input: ResolveSessionGovernanceInput,
): Promise<SessionGovernanceSnapshot> {
  const service = await getGovernanceServiceForSession();
  const snapshot = await service.governance.resolveSessionSnapshot({
    tenantId: input.tenantId,
    productKey: input.productKey,
    userId: input.userId,
  });

  const featureFlags = await service.featureFlags.evaluateAll({
    tenantId: input.tenantId,
    productKey: input.productKey,
    moduleId: input.moduleId,
    userId: input.userId,
  });

  if (
    input.provisionIfEmpty !== false &&
    input.tenantId &&
    snapshot.enabledProducts.length === 0
  ) {
    const { provisionDefaultGovernanceForTenant } = await import("./governance-seed");
    await provisionDefaultGovernanceForTenant({
      tenantId: input.tenantId,
      productKeys: input.productKey ? [input.productKey] : undefined,
    });
    const refreshed = await service.governance.resolveSessionSnapshot({
      tenantId: input.tenantId,
      productKey: input.productKey,
      userId: input.userId,
    });
    return { ...refreshed, featureFlags };
  }

  return { ...snapshot, featureFlags };
}

export async function evaluateSessionFeatureFlag(
  input: ResolveSessionGovernanceInput & { readonly flagKey: string },
  service: PlatformGovernanceService = getSharedGovernanceService(),
) {
  return service.featureFlags.evaluateFlag(input.flagKey, {
    tenantId: input.tenantId,
    productKey: input.productKey,
    moduleId: input.moduleId,
    userId: input.userId,
  });
}

export type { FeatureFlagEvaluationContext, SessionGovernanceSnapshot };
