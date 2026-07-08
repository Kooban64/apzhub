import { describe, expect, it } from "vitest";

import type { KnowledgeOverlayGroup } from "../knowledge-overlay/types";
import {
  countKnowledgePaletteItems,
  mapKnowledgeGroupsToPaletteItems,
} from "./map-knowledge-groups-to-palette-items";

const sampleGroups: readonly KnowledgeOverlayGroup[] = [
  {
    groupId: "platform.actions",
    heading: "Actions",
    providerLabel: "Actions",
    kind: "command",
    items: [
      {
        documentId: "platform.actions:theme",
        title: "Toggle Theme",
        description: "Switch theme",
        providerLabel: "Actions",
        kind: "command",
        document: {
          documentId: "platform.actions:theme",
          sourceId: "platform.actions",
          kind: "command",
          title: "Toggle Theme",
          actionRef: { actionId: "platform.theme.toggle" },
        },
      },
    ],
  },
];

describe("mapKnowledgeGroupsToPaletteItems", () => {
  it("maps grouped documents to palette rows with source headings", () => {
    const items = mapKnowledgeGroupsToPaletteItems(sampleGroups);

    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("platform.actions:theme");
    expect(items[0]?.group).toBe("Actions");
    expect(items[0]?.label).toBe("Toggle Theme");
    expect(countKnowledgePaletteItems(sampleGroups)).toBe(1);
  });

  it("does not use action registry ids as palette ids", () => {
    const items = mapKnowledgeGroupsToPaletteItems(sampleGroups);

    expect(items[0]?.id).not.toBe("platform.theme.toggle");
  });
});
