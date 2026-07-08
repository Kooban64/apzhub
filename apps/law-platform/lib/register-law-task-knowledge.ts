import type { KnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

/** Task Management help source registrations (LAW-005-01). */
export function registerLawTaskKnowledge(registry: KnowledgeRegistry): void {
  const sources = [
    {
      id: "legal.help.tasks.list",
      label: "Task List Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 61,
      status: "active" as const,
      permission: "legal.task.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-tasks",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.tasks.create",
      label: "Create Task Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 62,
      status: "active" as const,
      permission: "legal.task.manage",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-tasks",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.tasks.detail",
      label: "Task Detail Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 63,
      status: "active" as const,
      permission: "legal.task.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-tasks",
      origin: "manifest" as const,
    },
  ];

  for (const source of sources) {
    if (!registry.hasSource(source.id)) {
      registry.registerSource(source);
    }
  }
}
