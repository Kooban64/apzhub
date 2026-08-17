import type { PlatformTenantStatus } from "@apzhub/platform-identity";

import type { FieldAvailability } from "@/lib/platform-admin/overview-types";

export type TenantsTabId =
  "all" | "trials" | "active" | "suspended" | "provisioning_issues";

export type TenantListField<T = string | number> = {
  readonly availability: FieldAvailability;
  readonly value?: T;
  readonly message?: string;
};

export type PlatformAdminTenantRow = {
  readonly tenantId: string;
  readonly slug: string;
  readonly name: string;
  readonly status: PlatformTenantStatus;
  readonly createdAt: string;
  readonly users: TenantListField<number>;
  readonly plan: TenantListField<string>;
  readonly products: TenantListField<string>;
  readonly provisioning: TenantListField<string>;
  /** True when commercial ledger has any trial subscription for this org. */
  readonly hasTrialSubscription: boolean;
  readonly href: string;
};

export type PlatformAdminTenantsPayload = {
  readonly generatedAt: string;
  readonly createTenant: {
    readonly availability: FieldAvailability;
    readonly message: string;
  };
  readonly filters: {
    readonly status: { readonly availability: "ok" };
    readonly plan: {
      readonly availability: FieldAvailability;
      readonly message: string;
    };
    readonly products: {
      readonly availability: FieldAvailability;
      readonly message: string;
    };
  };
  readonly tabs: {
    readonly trials: {
      readonly availability: FieldAvailability;
      readonly message?: string;
    };
  };
  readonly tenants: readonly PlatformAdminTenantRow[];
  readonly meta: {
    readonly total: number;
  };
};
