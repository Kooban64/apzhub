import type { KnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

/** Client Management help source registrations (LAW-002-01). */
export function registerLawClientKnowledge(registry: KnowledgeRegistry): void {
  const sources = [
    {
      id: "legal.help.clients.list",
      label: "Client List Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 21,
      status: "active" as const,
      permission: "legal.client.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-clients",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.clients.create",
      label: "Create Client Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 22,
      status: "active" as const,
      permission: "legal.client.manage",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-clients",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.clients.detail",
      label: "Client Detail Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 23,
      status: "active" as const,
      permission: "legal.client.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-clients",
      origin: "manifest" as const,
    },
  ];

  for (const source of sources) {
    if (!registry.hasSource(source.id)) {
      registry.registerSource(source);
    }
  }
}
