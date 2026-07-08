import type { KnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

/** Calendar Management help source registrations (LAW-008-01). */
export function registerLawCalendarKnowledge(registry: KnowledgeRegistry): void {
  const sources = [
    {
      id: "legal.help.calendar.list",
      label: "Calendar List Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 51,
      status: "active" as const,
      permission: "legal.calendar.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-calendar",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.calendar.create",
      label: "Create Calendar Event Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 52,
      status: "active" as const,
      permission: "legal.calendar.manage",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-calendar",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.calendar.detail",
      label: "Calendar Event Detail Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 53,
      status: "active" as const,
      permission: "legal.calendar.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-calendar",
      origin: "manifest" as const,
    },
  ];

  for (const source of sources) {
    if (!registry.hasSource(source.id)) {
      registry.registerSource(source);
    }
  }
}
