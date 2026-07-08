import type { KnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

/** Unified Legal Search help source registrations (LAW-007-01). */
export function registerLawSearchKnowledge(registry: KnowledgeRegistry): void {
  const sources = [
    {
      id: "legal.help.search.list",
      label: "Legal Search Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 81,
      status: "active" as const,
      permission: "legal.search.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-search",
      origin: "manifest" as const,
    },
  ];

  for (const source of sources) {
    if (!registry.hasSource(source.id)) {
      registry.registerSource(source);
    }
  }
}
