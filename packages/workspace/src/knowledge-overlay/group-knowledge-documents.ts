import type { KnowledgeDocument } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeDocumentKind } from "@apzhub/knowledge-discovery-framework";

import type { KnowledgeOverlayGroup, KnowledgeOverlayItem } from "./types";

const DEFAULT_SOURCE_LABELS: Readonly<Record<string, string>> = {
  "platform.actions": "Actions",
  "platform.navigation": "Navigation",
  "platform.capabilities": "Capabilities",
};

const KIND_LABELS: Readonly<Record<KnowledgeDocumentKind, string>> = {
  command: "Commands",
  navigation: "Navigation",
  capability: "Capabilities",
  workspace: "Workspaces",
  preference: "Preferences",
  notification: "Notifications",
  activity: "Activity",
  document: "Documents",
  project: "Projects",
  person: "People",
  custom: "Other",
};

export interface GroupKnowledgeDocumentsOptions {
  readonly sourceLabels?: Readonly<Record<string, string>>;
}

export function buildSourceLabelLookup(
  sources: readonly { readonly id: string; readonly label: string }[],
): Readonly<Record<string, string>> {
  return Object.freeze(
    Object.fromEntries(sources.map((source) => [source.id, source.label])),
  );
}

/** Group ranked documents by knowledge source — preserves document order within groups. */
export function groupKnowledgeDocuments(
  documents: readonly KnowledgeDocument[],
  options: GroupKnowledgeDocumentsOptions = {},
): readonly KnowledgeOverlayGroup[] {
  const labels = { ...DEFAULT_SOURCE_LABELS, ...options.sourceLabels };
  const groupMap = new Map<string, KnowledgeOverlayGroup>();
  const groupOrder: string[] = [];

  for (const document of documents) {
    const groupId = document.sourceId;
    let group = groupMap.get(groupId);

    if (!group) {
      const heading = labels[groupId] ?? resolveKindLabel(document.kind);
      group = {
        groupId,
        heading,
        providerLabel: labels[groupId] ?? document.sourceId,
        kind: document.kind,
        items: [],
      };
      groupMap.set(groupId, group);
      groupOrder.push(groupId);
    }

    const items = [...group.items, mapDocumentToOverlayItem(document, labels[groupId])];
    groupMap.set(groupId, {
      ...group,
      items: Object.freeze(items),
    });
  }

  return Object.freeze(groupOrder.map((groupId) => groupMap.get(groupId)!));
}

function mapDocumentToOverlayItem(
  document: KnowledgeDocument,
  providerLabel: string | undefined,
): KnowledgeOverlayItem {
  return Object.freeze({
    documentId: document.documentId,
    title: document.title,
    description: document.description,
    icon: document.icon,
    providerLabel: providerLabel ?? document.sourceId,
    kind: document.kind,
    document,
  });
}

function resolveKindLabel(kind: KnowledgeDocumentKind): string {
  return KIND_LABELS[kind] ?? "Knowledge";
}

export function countOverlayDocuments(
  groups: readonly KnowledgeOverlayGroup[],
): number {
  return groups.reduce((total, group) => total + group.items.length, 0);
}
