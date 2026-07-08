import type { CommandPaletteItem } from "@apzhub/ui";

import type { KnowledgeOverlayGroup } from "../knowledge-overlay/types";

/** Maps grouped knowledge documents to palette rows — does not read Action Registry. */
export function mapKnowledgeGroupsToPaletteItems(
  groups: readonly KnowledgeOverlayGroup[],
): readonly CommandPaletteItem[] {
  return Object.freeze(
    groups.flatMap((group) =>
      group.items.map((item) =>
        Object.freeze({
          id: item.documentId,
          label: item.title,
          description: item.description ?? item.providerLabel,
          group: group.heading,
          icon: item.icon,
        }),
      ),
    ),
  );
}

export function countKnowledgePaletteItems(
  groups: readonly KnowledgeOverlayGroup[],
): number {
  return groups.reduce((total, group) => total + group.items.length, 0);
}
