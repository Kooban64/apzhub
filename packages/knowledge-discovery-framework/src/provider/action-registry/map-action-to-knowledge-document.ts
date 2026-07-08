import type { ActionDescriptor } from "@apzhub/command-framework";

import type { KnowledgeDocument } from "../../types/knowledge-document";

export const PLATFORM_ACTIONS_SOURCE_ID = "platform.actions" as const;

export interface MapActionToKnowledgeDocumentOptions {
  readonly sourceId?: string;
}

/** Map a single Action Framework descriptor to a KnowledgeDocument — references only. */
export function mapActionDescriptorToKnowledgeDocument(
  action: ActionDescriptor,
  options: MapActionToKnowledgeDocumentOptions = {},
): KnowledgeDocument {
  const sourceId = options.sourceId ?? PLATFORM_ACTIONS_SOURCE_ID;

  return Object.freeze({
    documentId: `${sourceId}:${action.id}`,
    sourceId,
    kind: "command",
    title: action.label,
    description: action.description,
    keywords: buildActionKeywords(action),
    category: action.group,
    icon: action.icon,
    permission: action.permission,
    actionRef: Object.freeze({
      actionId: action.id,
    }),
    metadata: Object.freeze(buildActionMetadata(action)),
  });
}

export function mapActionRegistryDtoToKnowledgeDocuments(
  actions: readonly ActionDescriptor[],
  options: MapActionToKnowledgeDocumentOptions = {},
): readonly KnowledgeDocument[] {
  return Object.freeze(
    [...actions]
      .sort(compareActionsForKnowledgeProjection)
      .map((action) => mapActionDescriptorToKnowledgeDocument(action, options)),
  );
}

function compareActionsForKnowledgeProjection(
  left: ActionDescriptor,
  right: ActionDescriptor,
): number {
  const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

  return leftOrder - rightOrder || left.id.localeCompare(right.id);
}

function buildActionKeywords(action: ActionDescriptor): readonly string[] {
  const keywords = new Set<string>([action.id]);

  if (action.shortcut) {
    keywords.add(action.shortcut);
  }
  if (action.group) {
    keywords.add(action.group);
  }
  if (action.description) {
    keywords.add(action.description);
  }

  return Object.freeze([...keywords]);
}

function buildActionMetadata(
  action: ActionDescriptor,
): Readonly<Record<string, unknown>> {
  const metadata: Record<string, unknown> = {
    actionId: action.id,
    label: action.label,
    handler: action.handler,
    handlerKind: action.handlerKind,
    source: action.source,
  };

  if (action.shortcut !== undefined) {
    metadata.shortcut = action.shortcut;
  }
  if (action.group !== undefined) {
    metadata.group = action.group;
  }
  if (action.palette !== undefined) {
    metadata.palette = action.palette;
  }
  if (action.order !== undefined) {
    metadata.order = action.order;
  }
  if (action.disabled !== undefined) {
    metadata.disabled = action.disabled;
  }
  if (action.capabilityId !== undefined) {
    metadata.capabilityId = action.capabilityId;
  }
  if (action.version !== undefined) {
    metadata.version = action.version;
  }
  if (action.contextWhen?.surfaces !== undefined) {
    metadata.surfaces = action.contextWhen.surfaces;
  }
  if (action.contextWhen?.selectionKinds !== undefined) {
    metadata.selectionKinds = action.contextWhen.selectionKinds;
  }
  if (action.contextWhen?.contextTypes !== undefined) {
    metadata.contextTypes = action.contextWhen.contextTypes;
  }

  return metadata;
}
