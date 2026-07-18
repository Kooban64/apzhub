/**
 * PRH-015 — Commercial readiness monitoring hook catalogue (design foundation).
 * Observation points only — does not grant permissions or implement provisioning.
 */

export const COMMERCIAL_READINESS_HOOK_IDS = [
  "onboarding.tenant.active",
  "onboarding.admin.assigned",
  "onboarding.governance.baseline",
  "onboarding.products.enabled",
  "onboarding.connectors.configured",
  "onboarding.health.ready",
] as const;

export type CommercialReadinessHookId = (typeof COMMERCIAL_READINESS_HOOK_IDS)[number];

export type CommercialReadinessHookStatus = "unknown" | "pass" | "warn" | "fail";

export type CommercialReadinessHook = {
  readonly id: CommercialReadinessHookId;
  readonly domain: string;
  readonly description: string;
  readonly status: CommercialReadinessHookStatus;
  readonly detail?: string;
};

export type CommercialReadinessSnapshot = {
  readonly version: "prh-015";
  readonly hooks: readonly CommercialReadinessHook[];
  /** True when OSS-100-12+ Product Provisioning Flows evaluates hooks. */
  readonly provisioningImplemented: boolean;
};

const CATALOGUE: readonly Omit<CommercialReadinessHook, "status" | "detail">[] = [
  {
    id: "onboarding.tenant.active",
    domain: "tenant",
    description: "Tenant shell present and active",
  },
  {
    id: "onboarding.admin.assigned",
    domain: "identity",
    description: "At least one tenant admin bound",
  },
  {
    id: "onboarding.governance.baseline",
    domain: "governance",
    description: "Baseline platform capabilities enabled",
  },
  {
    id: "onboarding.products.enabled",
    domain: "products",
    description: "Pilot product set enabled via governance",
  },
  {
    id: "onboarding.connectors.configured",
    domain: "integration",
    description: "Required connector configuration references present",
  },
  {
    id: "onboarding.health.ready",
    domain: "ops",
    description: "Production verification not NOT_READY",
  },
];

export type GetCommercialReadinessHooksOptions = {
  readonly provisioningImplemented?: boolean;
};

/**
 * Returns the pilot monitoring hook catalogue.
 * Status defaults to `unknown` until OSS-100-12+ evaluates them.
 */
export function getCommercialReadinessHooks(
  overrides: Partial<
    Record<
      CommercialReadinessHookId,
      Pick<CommercialReadinessHook, "status" | "detail">
    >
  > = {},
  options: GetCommercialReadinessHooksOptions = {},
): CommercialReadinessSnapshot {
  const implemented = options.provisioningImplemented === true;
  const hooks = CATALOGUE.map((entry) => {
    const override = overrides[entry.id];
    return {
      ...entry,
      status: override?.status ?? ("unknown" as const),
      detail:
        override?.detail ??
        (implemented
          ? "Awaiting evaluation input"
          : "Design hook — evaluation deferred to OSS-100-12+ / PCv2-03"),
    };
  });

  return {
    version: "prh-015",
    hooks,
    provisioningImplemented: implemented,
  };
}

export function listCommercialReadinessHookIds(): readonly CommercialReadinessHookId[] {
  return COMMERCIAL_READINESS_HOOK_IDS;
}
