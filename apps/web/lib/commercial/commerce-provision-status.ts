/**
 * Buyer-facing provision progress from org entitlements (UX-STREAM-001 §25–26).
 * Steps reflect actual backend state — no fake timers.
 */

import { getPackage } from "@/lib/commercial/catalogue";
import { getCommercePackageIntent } from "@/lib/commercial/commerce-package-intent";
import { listOrgProductSubscriptions } from "@/lib/commercial/product-access";
import { listOrgMembers } from "@/lib/iam/org-member-store";

export type ProvisionStepStatus = "pending" | "complete" | "failed";

export type ProvisionStep = {
  readonly id: string;
  readonly label: string;
  readonly status: ProvisionStepStatus;
};

export type CommerceProvisionStatus = {
  readonly organisationId: string;
  readonly packageId?: string;
  readonly overall: "pending" | "ready" | "partial";
  readonly steps: readonly ProvisionStep[];
  readonly productKeys: readonly string[];
};

export function getCommerceProvisionStatus(
  organisationId: string,
): CommerceProvisionStatus {
  const members = listOrgMembers({ organisationId });
  const hasAdmin = members.some(
    (m) =>
      m.status === "active" &&
      (m.personaRoleId.includes("admin") || m.personaRoleId.includes("owner")),
  );
  const hasAnyActive = members.some((m) => m.status === "active");
  const subscriptions = listOrgProductSubscriptions(organisationId);
  const productKeys = subscriptions.map((s) => s.productKey);
  const intent = getCommercePackageIntent(organisationId);
  const pkg = intent?.packageId ? getPackage(intent.packageId) : undefined;
  const expected = pkg?.productKeys ?? productKeys;

  const productSteps: ProvisionStep[] = expected.map((key) => ({
    id: `product:${key}`,
    label: `Enable ${key}`,
    status: productKeys.includes(key) ? "complete" : "pending",
  }));

  const steps: ProvisionStep[] = [
    {
      id: "organisation",
      label: "Organisation created",
      status: organisationId ? "complete" : "pending",
    },
    {
      id: "admin",
      label: "Administrator ready",
      status: hasAdmin || hasAnyActive ? "complete" : "pending",
    },
    ...productSteps,
    {
      id: "workspace",
      label: "Workspace ready",
      status:
        productKeys.length > 0 && (hasAdmin || hasAnyActive) ? "complete" : "pending",
    },
  ];

  const complete = steps.filter((s) => s.status === "complete").length;
  const overall =
    complete === steps.length ? "ready" : complete > 0 ? "partial" : "pending";

  return {
    organisationId,
    packageId: intent?.packageId,
    overall,
    steps,
    productKeys,
  };
}
