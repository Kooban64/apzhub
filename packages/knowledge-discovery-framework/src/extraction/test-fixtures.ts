import type { KnowledgeCapabilityRecord } from "../extraction/types";

export function knowledgeCapabilityRecord(
  overrides: Partial<KnowledgeCapabilityRecord> & Pick<KnowledgeCapabilityRecord, "id">,
): KnowledgeCapabilityRecord {
  return {
    kind: "module",
    lifecycleState: "active",
    manifest: {},
    version: "1.0.0",
    ...overrides,
  };
}

export const KNOWLEDGE_MANIFEST_FIXTURE = {
  withSource: {
    knowledge: {
      sources: [
        {
          id: "example.module.search",
          label: "Example Search",
          kind: "registry-projection",
          tier: "T0",
          priority: 50,
          provides: ["custom"],
        },
      ],
    },
  },
  duplicateAcrossCapabilities: [
    {
      id: "capability-a",
      manifest: {
        knowledge: {
          sources: [
            {
              id: "shared.source.id",
              label: "Shared",
              kind: "registry-projection",
              tier: "T0",
              priority: 10,
              provides: ["custom"],
            },
          ],
        },
      },
    },
    {
      id: "capability-b",
      manifest: {
        knowledge: {
          sources: [
            {
              id: "shared.source.id",
              label: "Shared Other",
              kind: "registry-projection",
              tier: "T0",
              priority: 20,
              provides: ["custom"],
            },
          ],
        },
      },
    },
  ],
  invalidId: {
    knowledge: {
      sources: [
        {
          id: "Invalid_ID",
          label: "Bad",
          kind: "registry-projection",
          tier: "T0",
          priority: 10,
          provides: ["custom"],
        },
      ],
    },
  },
} as const;
