export const PROVISIONING_FLOW_KINDS = [
  "tenant_enablement",
  "product_enablement",
  "product_activation",
] as const;

export type ProvisioningFlowKind = (typeof PROVISIONING_FLOW_KINDS)[number];

export const PROVISIONING_FLOW_STATUSES = [
  "pending",
  "in_progress",
  "completed",
  "failed",
] as const;

export type ProvisioningFlowStatus = (typeof PROVISIONING_FLOW_STATUSES)[number];

export const PROVISIONING_STEPS = [
  "validate",
  "enable_baseline",
  "enable_products",
  "activate_products",
  "finalize",
] as const;

export type ProvisioningStepId = (typeof PROVISIONING_STEPS)[number];

export type ProvisioningStepResult = {
  readonly step: ProvisioningStepId;
  readonly status: "completed" | "failed" | "skipped";
  readonly message: string;
  readonly at: string;
};

export type ProvisioningFlow = {
  readonly flowId: string;
  readonly kind: ProvisioningFlowKind;
  readonly tenantId: string;
  readonly productKeys: readonly string[];
  readonly status: ProvisioningFlowStatus;
  readonly currentStep: ProvisioningStepId;
  readonly steps: readonly ProvisioningStepResult[];
  readonly correlationId: string;
  readonly governanceRecordIds: readonly string[];
  readonly message?: string;
  readonly actorId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt?: string;
  readonly attemptCount: number;
};

export type StartProvisioningFlowInput = {
  readonly tenantId: string;
  readonly productKeys?: readonly string[];
  readonly correlationId?: string;
  readonly actorId?: string;
  /** When true, enqueue outbox steps for worker retry; default sync. */
  readonly async?: boolean;
};

export type ProvisioningOutboxStepPayload = {
  readonly flowId: string;
  readonly kind: ProvisioningFlowKind;
  readonly tenantId: string;
  readonly productKeys: readonly string[];
  readonly step: ProvisioningStepId;
  readonly correlationId: string;
  readonly governanceRecordIds: readonly string[];
  readonly actorId?: string;
};

export type ProvisioningHealth = {
  readonly component: "platform-provisioning";
  readonly version: string;
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly flows: {
    readonly pending: number;
    readonly inProgress: number;
    readonly completed: number;
    readonly failed: number;
  };
};

export type ProvisioningDiagnostics = {
  readonly version: string;
  readonly health: ProvisioningHealth;
  readonly recentFlows: readonly ProvisioningFlow[];
  readonly auditCount: number;
  readonly eventPublishOk: number;
  readonly eventPublishFailed: number;
};

export type ProvisioningAuditEntry = {
  readonly auditId: string;
  readonly at: string;
  readonly action: string;
  readonly flowId?: string;
  readonly detail: string;
  readonly correlationId?: string;
};
