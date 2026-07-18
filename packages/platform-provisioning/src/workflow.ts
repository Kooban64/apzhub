import type { PlatformGovernanceService } from "@apzhub/platform-governance";

import type {
  ProvisioningFlowKind,
  ProvisioningStepId,
  ProvisioningStepResult,
} from "./types";

export function stepsForKind(
  kind: ProvisioningFlowKind,
): readonly ProvisioningStepId[] {
  switch (kind) {
    case "tenant_enablement":
      return [
        "validate",
        "enable_baseline",
        "enable_products",
        "activate_products",
        "finalize",
      ];
    case "product_enablement":
      return ["validate", "enable_products", "finalize"];
    case "product_activation":
      return ["validate", "activate_products", "finalize"];
  }
}

export function nextStep(
  kind: ProvisioningFlowKind,
  current: ProvisioningStepId,
): ProvisioningStepId | undefined {
  const steps = stepsForKind(kind);
  const index = steps.indexOf(current);
  if (index < 0 || index >= steps.length - 1) return undefined;
  return steps[index + 1];
}

export type StepExecutionResult = {
  readonly stepResult: ProvisioningStepResult;
  readonly governanceRecordIds: readonly string[];
  readonly ok: boolean;
};

/**
 * Execute a single provisioning workflow step against governance.
 */
export async function executeProvisioningStep(input: {
  readonly governance: PlatformGovernanceService;
  readonly kind: ProvisioningFlowKind;
  readonly tenantId: string;
  readonly productKeys: readonly string[];
  readonly step: ProvisioningStepId;
  readonly existingRecordIds: readonly string[];
}): Promise<StepExecutionResult> {
  const at = new Date().toISOString();
  const recordIds = [...input.existingRecordIds];

  try {
    switch (input.step) {
      case "validate": {
        if (!input.tenantId.trim()) {
          return fail("validate", "tenantId is required", at, recordIds);
        }
        if (input.productKeys.length === 0) {
          return fail("validate", "At least one productKey is required", at, recordIds);
        }
        return ok(
          "validate",
          `Validated tenant ${input.tenantId} with ${input.productKeys.length} product(s)`,
          at,
          recordIds,
        );
      }

      case "enable_baseline": {
        await input.governance.governance.setEnablement({
          scopeType: "tenant",
          scopeKey: input.tenantId,
          targetType: "product",
          targetKey: "platform",
          enabled: true,
        });
        const record = await input.governance.provisioning.startProvisioning({
          scopeType: "tenant",
          scopeKey: input.tenantId,
          targetType: "platform",
          targetKey: "tenant",
          metadata: { step: "enable_baseline", programme: "OSS-100-12+" },
        });
        recordIds.push(record.provisioningId);
        await input.governance.provisioning.completeProvisioning(
          record.provisioningId,
          `Tenant ${input.tenantId} baseline enabled`,
        );
        return ok(
          "enable_baseline",
          `Baseline platform enablement for tenant ${input.tenantId}`,
          at,
          recordIds,
        );
      }

      case "enable_products": {
        for (const productKey of input.productKeys) {
          await input.governance.governance.setEnablement({
            scopeType: "tenant",
            scopeKey: input.tenantId,
            targetType: "product",
            targetKey: productKey,
            enabled: true,
          });
        }
        return ok(
          "enable_products",
          `Enabled products: ${input.productKeys.join(", ")}`,
          at,
          recordIds,
        );
      }

      case "activate_products": {
        for (const productKey of input.productKeys) {
          const record = await input.governance.productProvisioning.provisionProduct({
            scopeType: "tenant",
            scopeKey: input.tenantId,
            targetType: "product",
            targetKey: productKey,
            metadata: { step: "activate_products", programme: "OSS-100-12+" },
          });
          recordIds.push(record.provisioningId);
        }
        return ok(
          "activate_products",
          `Activated products: ${input.productKeys.join(", ")}`,
          at,
          recordIds,
        );
      }

      case "finalize": {
        return ok("finalize", "Provisioning flow finalized", at, recordIds);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return fail(input.step, message, at, recordIds);
  }
}

function ok(
  step: ProvisioningStepId,
  message: string,
  at: string,
  governanceRecordIds: readonly string[],
): StepExecutionResult {
  return {
    ok: true,
    governanceRecordIds,
    stepResult: { step, status: "completed", message, at },
  };
}

function fail(
  step: ProvisioningStepId,
  message: string,
  at: string,
  governanceRecordIds: readonly string[],
): StepExecutionResult {
  return {
    ok: false,
    governanceRecordIds,
    stepResult: { step, status: "failed", message, at },
  };
}

/** Whether a step failure should be treated as permanent (no outbox retry). */
export function isPermanentStepFailure(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("required") ||
    lower.includes("validation") ||
    lower.includes("invalid")
  );
}
