/**
 * Organisation Admin Provisioning — tenant entitlement readiness.
 * Never exposes provider brand names or adapter diagnostics.
 */

import { listPlatformTenants } from "@apzhub/platform-identity/server";

import { getCommerceProvisionStatus } from "@/lib/commercial/commerce-provision-status";
import { listOrgProductSubscriptionsDurable } from "@/lib/commercial/product-access-durable";
import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";
import { orgAdminProductLabel } from "@/lib/organisation-admin/product-labels";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type OrganisationAdminProvisioningPayload = {
  readonly generatedAt: string;
  readonly tenant: {
    readonly tenantId: string;
    readonly name: string;
    readonly status: string;
  };
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
    readonly rows: readonly never[];
  };
  readonly history: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly note: string;
  readonly rolesAccessHref: string;
};

function ok(value: string, message?: string): TenantListField<string> {
  return { availability: "ok", value, message };
}

export async function buildOrganisationAdminProvisioning(
  tenantId: string,
): Promise<OrganisationAdminProvisioningPayload | null> {
  const tenants = await listPlatformTenants().catch(() => []);
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) return null;

  const commerce = getCommerceProvisionStatus(tenantId);
  const subs = await listOrgProductSubscriptionsDurable(tenantId).catch(() => []);

  const identityStrip =
    commerce.steps.find((s) => s.id === "organisation")?.status === "complete" &&
    commerce.steps.find((s) => s.id === "admin")?.status === "complete"
      ? ok("Ready", "Organisation + administrator steps complete")
      : ok("Partial", "Organisation identity provisioning incomplete");

  const productsStrip =
    subs.length === 0
      ? {
          availability: "empty" as const,
          value: "None",
          message: "No product subscriptions for this organisation",
        }
      : ok(`${subs.length} subscribed`, "Durable org product subscriptions present");

  // Intentionally omit provider strip — tenant admin must not see adapter health.
  return {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      status: tenant.status,
    },
    overall: ok(
      commerce.overall === "ready"
        ? "Ready"
        : commerce.overall === "partial"
          ? "Partial"
          : "Pending",
      "Entitlement readiness for this organisation only",
    ),
    strips: [
      { label: "Identity", status: identityStrip },
      { label: "Products", status: productsStrip },
      {
        label: "Access delivery",
        status: {
          availability: "not_configured",
          message:
            "Product access delivery queue is not configured for Organisation Admin",
        },
      },
    ],
    steps: commerce.steps.map((s) => ({
      id: s.id,
      label: s.label,
      status: s.status,
    })),
    subscribedProducts: subs.map((s) => ({
      productKey: s.productKey,
      label: orgAdminProductLabel(s.productKey),
      status: s.status,
    })),
    queue: {
      availability: "not_configured",
      message:
        "In-progress / failed product access jobs are not configured as a tenant feed yet. When present, issues will describe the APZ product only — never the underlying provider.",
      rows: [],
    },
    history: {
      availability: "not_configured",
      message: "Provisioning history is not configured for Organisation Admin yet",
    },
    note: "Organisation Admin sees product access delivery for this organisation only. Platform Admin retains provider diagnostics.",
    rolesAccessHref: `${ORGANISATION_ADMIN_BASE}/roles-access`,
  };
}
