import type { KnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

/** Time Recording help source registrations (LAW-006-01). */
export function registerLawTimeKnowledge(registry: KnowledgeRegistry): void {
  const sources = [
    {
      id: "legal.help.time.list",
      label: "Time List Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 71,
      status: "active" as const,
      permission: "legal.time.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-time",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.time.create",
      label: "Create Time Entry Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 72,
      status: "active" as const,
      permission: "legal.time.manage",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-time",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.time.detail",
      label: "Time Entry Detail Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 73,
      status: "active" as const,
      permission: "legal.time.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-time",
      origin: "manifest" as const,
    },
  ];

  for (const source of sources) {
    if (!registry.hasSource(source.id)) {
      registry.registerSource(source);
    }
  }
}
