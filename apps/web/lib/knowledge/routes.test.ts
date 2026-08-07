import { describe, expect, it } from "vitest";

import {
  isKnowledgeRoute,
  knowledgeCompanionPath,
  knowledgeDecisionKnowledgePath,
  knowledgeDiagnosticsPath,
  knowledgeHelpPath,
  knowledgeHomePath,
  knowledgeLessonsPath,
  knowledgeLibraryPath,
  knowledgeMemoryObjectPath,
  knowledgeMemoryPath,
  knowledgeMemoryTypePath,
  knowledgeQualityPath,
  knowledgeSettingsPath,
  resolveKnowledgeRoute,
} from "./routes";

describe("knowledge routes", () => {
  it("recognises the organisational memory workspace", () => {
    expect(isKnowledgeRoute("/workspace/knowledge")).toBe(true);
    expect(isKnowledgeRoute("/workspace/knowledge/companion")).toBe(true);
    expect(isKnowledgeRoute("/workspace/qep/learning")).toBe(false);
    expect(isKnowledgeRoute("/workspace/documents")).toBe(false);
  });

  it("resolves Memory Companion surfaces", () => {
    expect(resolveKnowledgeRoute("/workspace/knowledge")).toEqual({
      kind: "home",
    });
    expect(resolveKnowledgeRoute("/workspace/knowledge/memory")).toEqual({
      kind: "memory",
    });
    expect(resolveKnowledgeRoute("/workspace/knowledge/memory/lessons")).toEqual({
      kind: "memory-type",
      type: "lessons",
    });
    expect(
      resolveKnowledgeRoute("/workspace/knowledge/objects/lesson-handover-checklist"),
    ).toEqual({
      kind: "memory-detail",
      memoryId: "lesson-handover-checklist",
    });
    expect(resolveKnowledgeRoute("/workspace/knowledge/companion")).toEqual({
      kind: "companion",
    });
    expect(resolveKnowledgeRoute("/workspace/knowledge/lessons")).toEqual({
      kind: "lessons",
    });
    expect(resolveKnowledgeRoute("/workspace/knowledge/library")).toEqual({
      kind: "library",
    });
    expect(resolveKnowledgeRoute("/workspace/knowledge/decision-knowledge")).toEqual({
      kind: "decision-knowledge",
    });
    expect(resolveKnowledgeRoute("/workspace/knowledge/quality")).toEqual({
      kind: "quality",
    });
    expect(resolveKnowledgeRoute("/workspace/knowledge/settings")).toEqual({
      kind: "settings",
    });
    expect(resolveKnowledgeRoute("/workspace/knowledge/diagnostics")).toEqual({
      kind: "diagnostics",
    });
    expect(resolveKnowledgeRoute("/workspace/knowledge/help")).toEqual({
      kind: "help",
    });
  });

  it("exposes stable path helpers", () => {
    expect(knowledgeHomePath()).toBe("/workspace/knowledge");
    expect(knowledgeMemoryPath()).toBe("/workspace/knowledge/memory");
    expect(knowledgeMemoryTypePath("standards")).toBe(
      "/workspace/knowledge/memory/standards",
    );
    expect(knowledgeMemoryObjectPath("x")).toBe("/workspace/knowledge/objects/x");
    expect(knowledgeLessonsPath()).toBe("/workspace/knowledge/lessons");
    expect(knowledgeLibraryPath()).toBe("/workspace/knowledge/library");
    expect(knowledgeDecisionKnowledgePath()).toBe(
      "/workspace/knowledge/decision-knowledge",
    );
    expect(knowledgeQualityPath()).toBe("/workspace/knowledge/quality");
    expect(knowledgeCompanionPath()).toBe("/workspace/knowledge/companion");
    expect(knowledgeHelpPath()).toBe("/workspace/knowledge/help");
    expect(knowledgeSettingsPath()).toBe("/workspace/knowledge/settings");
    expect(knowledgeDiagnosticsPath()).toBe("/workspace/knowledge/diagnostics");
  });
});
