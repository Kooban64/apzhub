/**
 * Platform Admin — tenant-scoped provisioning readiness.
 * Uses commerce provision status + durable subscriptions — no fake queue metrics.
 */

import { listPlatformTenants } from "@apzhub/platform-identity/server";

import { getCommerceProvisionStatus } from "@/lib/commercial/commerce-provision-status";
import { getProduct } from "@/lib/commercial/catalogue";
import { listOrgProductSubscriptionsDurable } from "@/lib/commercial/product-access-durable";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type TenantProvisioningPayload = {
  readonly generatedAt: string;
  readonly tenantId: string;
  readonly tenantName: string;
  readonly tenantStatus: string;
  readonly overall: TenantListField<string>;
  readonly strips: readonly {
    readonly label: string;
    readonly status: TenantListField<string>;
  }[];
  readonly steps: readonly {
    readonly id: string;
    readonly label: string;
    readonly status: "pending" | "complete" | "failed";
  }[];
  readonly subscribedProducts: readonly {
    readonly productKey: string;
    readonly label: string;
    readonly status: string;
  }[];
  readonly queue: {
    readonly availability: "not_configured";
    readonly message: string;
  };
};

function ok(value: string, message?: string): TenantListField<string> {
  return { availability: "ok", value, message };
}

/**
 * Tenant Provisioning tab — entitlement readiness, not invented job queue.
 */
export async function buildPlatformAdminTenantProvisioning(
  tenantId: string,
): Promise<TenantProvisioningPayload | null> {
  const tenants = await listPlatformTenants();
  const tenant = tenants.find((t) => t.tenantId === tenantId) ?? null;
  if (!tenant) return null;

  const commerce = getCommerceProvisionStatus(tenantId);
  const subs = await listOrgProductSubscriptionsDurable(tenantId);

  const identityStrip =
    commerce.steps.find((s) => s.id === "organisation")?.status === "complete" &&
    commerce.steps.find((s) => s.id === "admin")?.status === "complete"
      ? ok("Ready", "Organisation + administrator steps complete")
      : ok("Partial", "Identity / administrator provisioning incomplete");

  const productsStrip =
    subs.length === 0
      ? {
          availability: "empty" as const,
          value: "None",
          message: "No org product subscriptions",
        }
      : ok(`${subs.length} subscribed`, "Durable org product subscriptions present");

  const providersStrip = {
    availability: "not_configured" as const,
    value: "Not configured",
    message: "Provider adapter health feed is not wired for tenant detail yet",
  };

  return {
    generatedAt: new Date().toISOString(),
    tenantId: tenant.tenantId,
    tenantName: tenant.name,
    tenantStatus: tenant.status,
    overall: ok(
      commerce.overall === "ready"
        ? "Ready"
        : commerce.overall === "partial"
          ? "Partial"
          : "Pending",
      "Derived from commerce provision status (entitlement readiness)",
    ),
    strips: [
      { label: "Identity", status: identityStrip },
      { label: "Products", status: productsStrip },
      { label: "Providers", status: providersStrip },
    ],
    steps: commerce.steps.map((s) => ({
      id: s.id,
      label: s.label,
      status: s.status,
    })),
    subscribedProducts: subs.map((s) => ({
      productKey: s.productKey,
      label: getProduct(s.productKey)?.name ?? s.productKey,
      status: s.status,
    })),
    queue: {
      availability: "not_configured",
      message:
        "Provisioning job queue (pending/processing/failed) is not configured as a platform feed yet",
    },
  };
}
