import { describe, expect, it } from "vitest";

import type { KnowledgeDocument } from "@apzhub/knowledge-discovery-framework";

import {
  groupKnowledgeDocuments,
  countOverlayDocuments,
} from "./group-knowledge-documents";

function document(
  overrides: Partial<KnowledgeDocument> &
    Pick<KnowledgeDocument, "documentId" | "title">,
): KnowledgeDocument {
  return {
    sourceId: overrides.sourceId ?? "platform.actions",
    kind: overrides.kind ?? "command",
    ...overrides,
  };
}

describe("groupKnowledgeDocuments", () => {
  it("groups documents by source id with headings", () => {
    const groups = groupKnowledgeDocuments([
      document({
        documentId: "platform.actions:theme",
        title: "Toggle Theme",
        sourceId: "platform.actions",
        kind: "command",
        actionRef: { actionId: "platform.theme.toggle" },
      }),
      document({
        documentId: "platform.navigation:home",
        title: "Home",
        sourceId: "platform.navigation",
        kind: "navigation",
        navigation: { type: "workbench-route", target: "/home" },
      }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.heading).toBe("Actions");
    expect(groups[0]?.items[0]?.providerLabel).toBe("Actions");
    expect(groups[1]?.heading).toBe("Navigation");
    expect(countOverlayDocuments(groups)).toBe(2);
  });

  it("uses registry source labels when provided", () => {
    const groups = groupKnowledgeDocuments(
      [
        document({
          documentId: "cap.docs:readme",
          title: "Readme",
          sourceId: "cap.docs",
          kind: "document",
        }),
      ],
      { sourceLabels: { "cap.docs": "Documentation" } },
    );

    expect(groups[0]?.heading).toBe("Documentation");
  });

  it("preserves document order within a group", () => {
    const groups = groupKnowledgeDocuments([
      document({ documentId: "a:1", title: "One", sourceId: "platform.actions" }),
      document({ documentId: "a:2", title: "Two", sourceId: "platform.actions" }),
    ]);

    expect(groups[0]?.items.map((item) => item.documentId)).toEqual(["a:1", "a:2"]);
  });
});
