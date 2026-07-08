import type { KnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

/** Billing help source registrations (LAW-010-01). */
export function registerLawBillingKnowledge(registry: KnowledgeRegistry): void {
  const sources = [
    {
      id: "legal.help.billing.list",
      label: "Billing List Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 81,
      status: "active" as const,
      permission: "legal.invoice.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-billing",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.billing.create",
      label: "Create Invoice Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 82,
      status: "active" as const,
      permission: "legal.invoice.manage",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-billing",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.billing.detail",
      label: "Invoice Detail Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 83,
      status: "active" as const,
      permission: "legal.invoice.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-billing",
      origin: "manifest" as const,
    },
  ];

  for (const source of sources) {
    if (!registry.hasSource(source.id)) {
      registry.registerSource(source);
    }
  }
}
