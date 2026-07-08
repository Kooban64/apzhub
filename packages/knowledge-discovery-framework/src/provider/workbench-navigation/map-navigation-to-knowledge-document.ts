import type {
  WorkbenchNavItemDto,
  WorkbenchRegistryDto,
  WorkbenchViewDescriptorDto,
} from "@apzhub/workbench-framework/server";

import type { KnowledgeDocument } from "../../types/knowledge-document";
import type { KnowledgeDocumentKind } from "../../types/knowledge-source";

export const PLATFORM_NAVIGATION_SOURCE_ID = "platform.navigation" as const;

const NAV_LEVEL_ORDER: Record<WorkbenchNavItemDto["level"], number> = {
  "activity-bar": 0,
  workspace: 1,
  sidebar: 2,
  context: 3,
};

export interface MapNavigationToKnowledgeDocumentOptions {
  readonly sourceId?: string;
}

export interface MapWorkbenchRegistryDtoResult {
  readonly documents: readonly KnowledgeDocument[];
  readonly skippedHiddenCount: number;
}

/** Map Workbench registry DTO navigation contributions to KnowledgeDocuments — references only. */
export function mapWorkbenchRegistryDtoToKnowledgeDocuments(
  registryDto: WorkbenchRegistryDto,
  options: MapNavigationToKnowledgeDocumentOptions = {},
): MapWorkbenchRegistryDtoResult {
  const sourceId = options.sourceId ?? PLATFORM_NAVIGATION_SOURCE_ID;
  const visibleNavItems = registryDto.navItems.filter((item) => item.hidden !== true);
  const skippedHiddenCount = registryDto.navItems.length - visibleNavItems.length;

  const navDocuments = sortNavItemsPreservingHierarchy(visibleNavItems).map((item) =>
    mapNavItemToKnowledgeDocument(item, sourceId),
  );
  const viewDocuments = [...registryDto.views]
    .sort(compareViewsForKnowledgeProjection)
    .map((view) => mapViewToKnowledgeDocument(view, sourceId));

  return {
    documents: Object.freeze([...navDocuments, ...viewDocuments]),
    skippedHiddenCount,
  };
}

export function mapNavItemToKnowledgeDocument(
  item: WorkbenchNavItemDto,
  sourceId: string = PLATFORM_NAVIGATION_SOURCE_ID,
): KnowledgeDocument {
  const route = resolveNavigationRoute(item.workspace, item.route);

  return Object.freeze({
    documentId: `${sourceId}:${item.id}`,
    sourceId,
    kind: mapNavLevelToDocumentKind(item.level),
    title: item.label,
    keywords: buildNavItemKeywords(item),
    category: item.workspace,
    icon: item.icon,
    permission: item.permission,
    navigation: Object.freeze({
      type: "workbench-route",
      target: route,
      workspaceId: item.workspace,
    }),
    metadata: Object.freeze(buildNavItemMetadata(item, route)),
  });
}

export function mapViewToKnowledgeDocument(
  view: WorkbenchViewDescriptorDto,
  sourceId: string = PLATFORM_NAVIGATION_SOURCE_ID,
): KnowledgeDocument {
  const route = resolveNavigationRoute(view.workspace, view.route);

  return Object.freeze({
    documentId: `${sourceId}:view:${view.viewId}`,
    sourceId,
    kind: "navigation",
    title: view.title,
    keywords: buildViewKeywords(view),
    category: view.workspace,
    icon: view.icon,
    permission: view.permission,
    navigation: Object.freeze({
      type: "workbench-route",
      target: route,
      workspaceId: view.workspace,
    }),
    metadata: Object.freeze(buildViewMetadata(view, route)),
  });
}

function mapNavLevelToDocumentKind(
  level: WorkbenchNavItemDto["level"],
): KnowledgeDocumentKind {
  if (level === "activity-bar" || level === "workspace") {
    return "workspace";
  }

  return "navigation";
}

function resolveNavigationRoute(workspace: string, route?: string): string {
  if (route && route.trim().length > 0) {
    return route;
  }

  return `/workspace/${workspace}`;
}

function buildNavItemKeywords(item: WorkbenchNavItemDto): readonly string[] {
  const keywords = new Set<string>([item.id, item.workspace, item.level, item.label]);

  if (item.route) {
    keywords.add(item.route);
  }
  if (item.parent) {
    keywords.add(item.parent);
  }
  if (item.capabilityId) {
    keywords.add(item.capabilityId);
  }

  return Object.freeze([...keywords]);
}

function buildViewKeywords(view: WorkbenchViewDescriptorDto): readonly string[] {
  const keywords = new Set<string>([view.viewId, view.workspace, view.title]);

  if (view.route) {
    keywords.add(view.route);
  }
  if (view.capabilityId) {
    keywords.add(view.capabilityId);
  }

  return Object.freeze([...keywords]);
}

function buildNavItemMetadata(
  item: WorkbenchNavItemDto,
  route: string,
): Readonly<Record<string, unknown>> {
  const metadata: Record<string, unknown> = {
    navItemId: item.id,
    level: item.level,
    workspace: item.workspace,
    route,
    order: item.order,
  };

  if (item.parent !== undefined) {
    metadata.parent = item.parent;
  }
  if (item.capabilityId !== undefined) {
    metadata.capabilityId = item.capabilityId;
  }
  if (item.capabilityKind !== undefined) {
    metadata.capabilityKind = item.capabilityKind;
  }
  if (item.badge !== undefined) {
    metadata.badge = item.badge;
  }

  return metadata;
}

function buildViewMetadata(
  view: WorkbenchViewDescriptorDto,
  route: string,
): Readonly<Record<string, unknown>> {
  const metadata: Record<string, unknown> = {
    viewId: view.viewId,
    workspace: view.workspace,
    route,
    default: view.default ?? false,
  };

  if (view.capabilityId !== undefined) {
    metadata.capabilityId = view.capabilityId;
  }
  if (view.capabilityKind !== undefined) {
    metadata.capabilityKind = view.capabilityKind;
  }

  return metadata;
}

function compareViewsForKnowledgeProjection(
  left: WorkbenchViewDescriptorDto,
  right: WorkbenchViewDescriptorDto,
): number {
  return (
    left.workspace.localeCompare(right.workspace) ||
    Number(right.default ?? false) - Number(left.default ?? false) ||
    left.viewId.localeCompare(right.viewId)
  );
}

function sortNavItemsPreservingHierarchy(
  items: readonly WorkbenchNavItemDto[],
): readonly WorkbenchNavItemDto[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const sorted = [...items].sort(compareNavItemsForKnowledgeProjection);
  const result: WorkbenchNavItemDto[] = [];
  const placed = new Set<string>();

  const placeItem = (item: WorkbenchNavItemDto): void => {
    if (placed.has(item.id)) {
      return;
    }

    if (item.parent) {
      const parent = byId.get(item.parent);
      if (parent && !placed.has(parent.id)) {
        placeItem(parent);
      }
    }

    result.push(item);
    placed.add(item.id);
  };

  for (const item of sorted) {
    placeItem(item);
  }

  return Object.freeze(result);
}

function compareNavItemsForKnowledgeProjection(
  left: WorkbenchNavItemDto,
  right: WorkbenchNavItemDto,
): number {
  return (
    left.workspace.localeCompare(right.workspace) ||
    NAV_LEVEL_ORDER[left.level] - NAV_LEVEL_ORDER[right.level] ||
    left.order - right.order ||
    left.id.localeCompare(right.id)
  );
}
