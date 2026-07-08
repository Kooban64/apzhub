import { describe, expect, it } from "vitest";

import {
  ACTION_REGISTRY_DTO_FIXTURE,
  actionDescriptor,
  mapActionDescriptorToKnowledgeDocument,
  mapActionRegistryDtoToKnowledgeDocuments,
  PLATFORM_ACTIONS_SOURCE_ID,
} from "./index";

describe("mapActionDescriptorToKnowledgeDocument", () => {
  it("maps action id, label, description, group, shortcut, source, and surface metadata", () => {
    const document = mapActionDescriptorToKnowledgeDocument(
      actionDescriptor({
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        description: "Switch theme",
        group: "Appearance",
        shortcut: "Ctrl+Shift+T",
        source: "builtin",
        icon: "theme",
        order: 20,
        palette: true,
        capabilityId: "platform",
        version: "0.3.0",
        contextWhen: {
          surfaces: ["header", "command-palette"],
          selectionKinds: ["single"],
        },
      }),
    );

    expect(document).toMatchObject({
      documentId: `${PLATFORM_ACTIONS_SOURCE_ID}:platform.theme.toggle`,
      sourceId: PLATFORM_ACTIONS_SOURCE_ID,
      kind: "command",
      title: "Toggle Theme",
      description: "Switch theme",
      category: "Appearance",
      icon: "theme",
      actionRef: { actionId: "platform.theme.toggle" },
    });
    expect(document.keywords).toEqual(
      expect.arrayContaining(["platform.theme.toggle", "Ctrl+Shift+T", "Appearance"]),
    );
    expect(document.metadata).toMatchObject({
      actionId: "platform.theme.toggle",
      label: "Toggle Theme",
      shortcut: "Ctrl+Shift+T",
      group: "Appearance",
      source: "builtin",
      palette: true,
      order: 20,
      surfaces: ["header", "command-palette"],
      selectionKinds: ["single"],
    });
    expect(document.navigation).toBeUndefined();
  });
});

describe("mapActionRegistryDtoToKnowledgeDocuments", () => {
  it("projects actions in deterministic order by order then id", () => {
    const documents = mapActionRegistryDtoToKnowledgeDocuments([
      actionDescriptor({ id: "z.last", label: "Last", order: 30 }),
      actionDescriptor({ id: "a.first", label: "First", order: 10 }),
      actionDescriptor({ id: "m.middle", label: "Middle", order: 20 }),
    ]);

    expect(documents.map((document) => document.actionRef?.actionId)).toEqual([
      "a.first",
      "m.middle",
      "z.last",
    ]);
  });

  it("returns empty array for empty action list", () => {
    expect(mapActionRegistryDtoToKnowledgeDocuments([])).toEqual([]);
    expect(
      mapActionRegistryDtoToKnowledgeDocuments(
        ACTION_REGISTRY_DTO_FIXTURE.empty.actions,
      ),
    ).toEqual([]);
  });
});
