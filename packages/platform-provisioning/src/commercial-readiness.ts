import type { PlatformGovernanceService } from "@apzhub/platform-governance";
import {
  getCommercialReadinessHooks,
  type CommercialReadinessHookId,
  type CommercialReadinessHookStatus,
  type CommercialReadinessSnapshot,
} from "@apzhub/platform-operations";

export type EvaluateCommercialReadinessInput = {
  readonly tenantId: string;
  readonly governance: PlatformGovernanceService;
  /** When true, onboarding.admin.assigned → pass. */
  readonly hasAdmin?: boolean;
  /** When true, onboarding.connectors.configured → pass. */
  readonly connectorsConfigured?: boolean;
  /** Production verification verdict string (e.g. READY / NOT_READY). */
  readonly productionVerdict?: string;
  readonly productKeys?: readonly string[];
};

/**
 * Evaluate PRH-015 commercial readiness hooks using live governance state.
 * Marks provisioningImplemented = true (OSS-100-12+).
 */
export async function evaluateCommercialReadiness(
  input: EvaluateCommercialReadinessInput,
): Promise<CommercialReadinessSnapshot> {
  const enablements = await input.governance.governance.listEnablements();
  const tenantEnablements = enablements.filter(
    (e) => e.scopeType === "tenant" && e.scopeKey === input.tenantId && e.enabled,
  );

  const platformEnabled = tenantEnablements.some(
    (e) => e.targetType === "product" && e.targetKey === "platform",
  );
  const requiredProducts = input.productKeys ?? ["law-platform"];
  const productsEnabled = requiredProducts.every((key) =>
    tenantEnablements.some((e) => e.targetType === "product" && e.targetKey === key),
  );

  const history = await input.governance.provisioning.listProvisioningHistory({
    scopeType: "tenant",
    scopeKey: input.tenantId,
  });
  const hasCompletedActivation = history.some(
    (r) =>
      r.status === "completed" &&
      r.targetType === "product" &&
      requiredProducts.includes(r.targetKey),
  );

  const overrides: Partial<
    Record<
      CommercialReadinessHookId,
      { status: CommercialReadinessHookStatus; detail: string }
    >
  > = {
    "onboarding.tenant.active": {
      status: input.tenantId ? "pass" : "fail",
      detail: input.tenantId
        ? `Tenant ${input.tenantId} referenced for provisioning`
        : "tenantId missing",
    },
    "onboarding.admin.assigned": {
      status: input.hasAdmin ? "pass" : "warn",
      detail: input.hasAdmin
        ? "Admin binding reported by caller"
        : "Admin binding not supplied (identity SoR frozen — caller observation)",
    },
    "onboarding.governance.baseline": {
      status: platformEnabled ? "pass" : "fail",
      detail: platformEnabled
        ? "Baseline platform product enabled for tenant"
        : "Baseline platform product not enabled",
    },
    "onboarding.products.enabled": {
      status: productsEnabled ? "pass" : "fail",
      detail: productsEnabled
        ? `Products enabled: ${requiredProducts.join(", ")}`
        : `Missing product enablement: ${requiredProducts.join(", ")}`,
    },
    "onboarding.connectors.configured": {
      status: input.connectorsConfigured ? "pass" : "warn",
      detail: input.connectorsConfigured
        ? "Connector configuration references present"
        : "Connector configuration not evaluated in this programme",
    },
    "onboarding.health.ready": {
      status:
        input.productionVerdict === "READY"
          ? "pass"
          : input.productionVerdict === "NOT_READY"
            ? "fail"
            : hasCompletedActivation
              ? "pass"
              : "warn",
      detail: input.productionVerdict
        ? `Production verdict: ${input.productionVerdict}`
        : hasCompletedActivation
          ? "Provisioning activation completed for tenant"
          : "Awaiting provisioning activation or production verdict",
    },
  };

  return getCommercialReadinessHooks(overrides, {
    provisioningImplemented: true,
  });
}
