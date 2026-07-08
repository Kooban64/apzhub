import type { KnowledgeSource } from "../types/knowledge-source";

/** Built-in T0 registry-projection sources — references to Platform 2.0 registries only. */
export const PLATFORM_KNOWLEDGE_SOURCE_CATALOGUE = Object.freeze([
  {
    id: "platform.actions",
    label: "Actions",
    kind: "registry-projection",
    tier: "T0",
    priority: 10,
    status: "active",
    provides: ["command"],
    origin: "builtin",
    version: "1.0.0",
  },
  {
    id: "platform.navigation",
    label: "Navigation",
    kind: "registry-projection",
    tier: "T0",
    priority: 20,
    status: "active",
    provides: ["navigation", "workspace"],
    origin: "builtin",
    version: "1.0.0",
  },
  {
    id: "platform.capabilities",
    label: "Capabilities",
    kind: "registry-projection",
    tier: "T0",
    priority: 30,
    status: "active",
    provides: ["capability"],
    origin: "builtin",
    version: "1.0.0",
  },
] satisfies readonly KnowledgeSource[]);
