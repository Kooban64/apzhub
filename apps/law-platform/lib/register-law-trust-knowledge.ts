import type { KnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

/** Trust Accounting help source registrations (LAW-015-09). */
export function registerLawTrustKnowledge(registry: KnowledgeRegistry): void {
  const sources = [
    {
      id: "legal.help.trust.dashboard",
      label: "Trust Dashboard Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 90,
      status: "active" as const,
      permission: "legal.trust.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-trust",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.trust.transactions",
      label: "Trust Transactions Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 91,
      status: "active" as const,
      permission: "legal.trust.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-trust",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.trust.reconciliation",
      label: "Trust Reconciliation Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 92,
      status: "active" as const,
      permission: "legal.trust.reconcile",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-trust",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.trust.reports",
      label: "Trust Reports Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 93,
      status: "active" as const,
      permission: "legal.trust.report",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-trust",
      origin: "manifest" as const,
    },
  ];

  for (const source of sources) {
    if (!registry.hasSource(source.id)) {
      registry.registerSource(source);
    }
  }
}
