import type { KnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

/** Matter Management help source registrations (LAW-003-01). */
export function registerLawMatterKnowledge(registry: KnowledgeRegistry): void {
  const sources = [
    {
      id: "legal.help.matters.list",
      label: "Matter List Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 31,
      status: "active" as const,
      permission: "legal.matter.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-matters",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.matters.create",
      label: "Create Matter Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 32,
      status: "active" as const,
      permission: "legal.matter.manage",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-matters",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.matters.detail",
      label: "Matter Detail Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 33,
      status: "active" as const,
      permission: "legal.matter.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-matters",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.matter.workspace",
      label: "Matter Workspace Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 34,
      status: "active" as const,
      permission: "legal.matter.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-matters",
      origin: "manifest" as const,
    },
  ];

  for (const source of sources) {
    if (!registry.hasSource(source.id)) {
      registry.registerSource(source);
    }
  }
}
