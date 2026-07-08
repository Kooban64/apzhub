import type { KnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

/** Document Management help source registrations (LAW-004-01). */
export function registerLawDocumentKnowledge(registry: KnowledgeRegistry): void {
  const sources = [
    {
      id: "legal.help.documents.list",
      label: "Document List Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 41,
      status: "active" as const,
      permission: "legal.document.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-documents",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.documents.create",
      label: "Upload Document Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 42,
      status: "active" as const,
      permission: "legal.document.manage",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-documents",
      origin: "manifest" as const,
    },
    {
      id: "legal.help.documents.detail",
      label: "Document Detail Help",
      kind: "registry-projection" as const,
      tier: "T1" as const,
      priority: 43,
      status: "active" as const,
      permission: "legal.document.view",
      provides: ["navigation", "document"] as const,
      version: "1.0.0",
      capabilityId: "legal-documents",
      origin: "manifest" as const,
    },
  ];

  for (const source of sources) {
    if (!registry.hasSource(source.id)) {
      registry.registerSource(source);
    }
  }
}
