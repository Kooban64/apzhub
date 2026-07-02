import type { WorkbenchNavigationLevel } from "../../interfaces/types";

export type {
  NavigationContribution,
  NavigationDiagnostics,
  NavigationGroup,
  NavigationItem,
} from "../../interfaces/types";

import type {
  NavigationContribution,
  NavigationGroup,
  NavigationItem,
} from "../../interfaces/types";

export function navigationGroupKey(
  level: WorkbenchNavigationLevel,
  workspace: string,
): string {
  return `${level}:${workspace}`;
}

export function compareNavigationOrder(
  left: Pick<NavigationContribution, "order" | "label" | "id">,
  right: Pick<NavigationContribution, "order" | "label" | "id">,
): number {
  if (left.order !== right.order) {
    return left.order - right.order;
  }
  return left.label.localeCompare(right.label) || left.id.localeCompare(right.id);
}

export function findDuplicateNavigationIds(
  contributions: readonly NavigationContribution[],
): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const contribution of contributions) {
    if (seen.has(contribution.id)) {
      duplicates.add(contribution.id);
    }
    seen.add(contribution.id);
  }

  return [...duplicates].sort();
}

export function findOrphanNavigationParents(
  contributions: readonly NavigationContribution[],
): string[] {
  const ids = new Set(contributions.map((contribution) => contribution.id));
  const orphans = new Set<string>();

  for (const contribution of contributions) {
    if (contribution.parent && !ids.has(contribution.parent)) {
      orphans.add(contribution.parent);
    }
  }

  return [...orphans].sort();
}

export function buildNavigationGroups(
  items: readonly NavigationItem[],
): NavigationGroup[] {
  const groups = new Map<string, NavigationGroup>();

  for (const item of items) {
    const id = navigationGroupKey(item.level, item.workspace);
    const existing = groups.get(id);
    if (existing) {
      groups.set(id, {
        ...existing,
        order: Math.min(existing.order, item.order),
        items: [...existing.items, item],
      });
      continue;
    }

    groups.set(id, {
      id,
      level: item.level,
      workspace: item.workspace,
      order: item.order,
      items: [item],
    });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: [...group.items].sort(compareNavigationOrder),
    }))
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}

export function buildNavigationTree(
  items: readonly NavigationItem[],
): NavigationItem[] {
  const byId = new Map(
    items.map((item) => [item.id, { ...item, children: [] as NavigationItem[] }]),
  );
  const roots: NavigationItem[] = [];

  for (const item of byId.values()) {
    if (item.parent && byId.has(item.parent)) {
      const parent = byId.get(item.parent)!;
      parent.children = [...parent.children, item];
      continue;
    }
    roots.push(item);
  }

  const sortTree = (nodes: NavigationItem[]): NavigationItem[] =>
    [...nodes].sort(compareNavigationOrder).map((node) => ({
      ...node,
      children: sortTree([...node.children]),
    }));

  return sortTree(roots);
}

export function resolveDefaultWorkspace(items: readonly NavigationItem[]): string {
  const activityBarItems = items
    .filter((item) => item.level === "activity-bar" && item.visible)
    .sort(compareNavigationOrder);

  return (
    activityBarItems[0]?.workspace ??
    items.find((item) => item.visible)?.workspace ??
    ""
  );
}
