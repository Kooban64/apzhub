import { describe, expect, it } from "vitest";

import type { KnowledgeDocument } from "../types/knowledge-document";
import type { KnowledgeSource } from "../types/knowledge-source";

describe("knowledge domain interfaces", () => {
  it("accepts KnowledgeSource descriptor shape", () => {
    const source: KnowledgeSource = {
      id: "platform.capabilities",
      label: "Capabilities",
      kind: "registry-projection",
      tier: "T0",
      priority: 20,
      status: "active",
      provides: ["capability"],
    };

    expect(source.provides).toContain("capability");
  });

  it("accepts KnowledgeDocument with action and navigation references", () => {
    const document: KnowledgeDocument = {
      documentId: "platform.actions:workbench.toggle-theme",
      sourceId: "platform.actions",
      kind: "command",
      title: "Toggle Theme",
      actionRef: { actionId: "workbench.toggle-theme" },
      navigation: {
        type: "workbench-route",
        target: "/settings/theme",
      },
    };

    expect(document.actionRef?.actionId).toBe("workbench.toggle-theme");
    expect(document.navigation?.target).toBe("/settings/theme");
  });
});
