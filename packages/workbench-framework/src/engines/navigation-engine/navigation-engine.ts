import type { WorkbenchEngine } from "../../interfaces/dependencies";
import type { WorkbenchPermissionAdapter } from "../../interfaces/permission-adapter";
import type { WorkbenchRequest } from "../../interfaces/requests";
import {
  workbenchRequestError,
  workbenchRequestFail,
  workbenchRequestOk,
  type WorkbenchRequestResult,
} from "../../interfaces/requests";
import type {
  NavigationContribution,
  NavigationDiagnostics,
  NavigationGroup,
  NavigationItem,
  NavigationState,
} from "../../interfaces/types";
import {
  buildNavigationModel,
  type NavigationModel,
} from "../../navigation/platform-navigation-model";
import {
  buildNavigationGroups,
  buildNavigationTree,
  compareNavigationOrder,
  findDuplicateNavigationIds,
  findOrphanNavigationParents,
  resolveDefaultWorkspace,
} from "./navigation-model";

export interface NavigationEngineOptions {
  permissionAdapter: WorkbenchPermissionAdapter;
  contributions?: readonly NavigationContribution[];
}

export class NavigationEngine implements WorkbenchEngine {
  readonly id = "navigation" as const;

  private readonly permissionAdapter: WorkbenchPermissionAdapter;

  private contributions: NavigationContribution[] = [];

  private revealedIds = new Set<string>();

  private activeWorkspaceId = "";

  private items: NavigationItem[] = [];

  private groups: NavigationGroup[] = [];

  private tree: NavigationItem[] = [];

  private diagnostics: NavigationDiagnostics = emptyDiagnostics();

  constructor(options: NavigationEngineOptions) {
    this.permissionAdapter = options.permissionAdapter;
    if (options.contributions) {
      this.loadContributions(options.contributions);
    }
  }

  loadContributions(contributions: readonly NavigationContribution[]): void {
    this.contributions = [...contributions];
    this.rebuildModel();
  }

  getState(): NavigationState {
    return {
      activeWorkspaceId: this.activeWorkspaceId,
      items: this.items,
      groups: this.groups,
      tree: this.tree,
    };
  }

  getStateSlice(): NavigationState {
    return this.getState();
  }

  getDiagnostics(): NavigationDiagnostics {
    return this.diagnostics;
  }

  getNavigationModel(): NavigationModel {
    return buildNavigationModel(this.getState(), this.diagnostics);
  }

  getActivityBarItems(): readonly NavigationItem[] {
    return this.items.filter((item) => item.level === "activity-bar" && item.visible);
  }

  getSidebarItems(workspace = this.activeWorkspaceId): readonly NavigationItem[] {
    return this.items.filter(
      (item) =>
        item.level === "sidebar" && item.workspace === workspace && item.visible,
    );
  }

  getGroupsForLevel(level: NavigationItem["level"]): readonly NavigationGroup[] {
    return this.groups.filter((group) => group.level === level);
  }

  setActiveWorkspace(workspaceId: string): WorkbenchRequestResult {
    const hasWorkspace = this.items.some(
      (item) =>
        item.visible && item.level === "activity-bar" && item.workspace === workspaceId,
    );

    if (!hasWorkspace) {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          `Workspace "${workspaceId}" is not available in navigation model`,
          this.id,
        ),
      );
    }

    this.activeWorkspaceId = workspaceId;
    return workbenchRequestOk();
  }

  handleRequest(request: WorkbenchRequest): WorkbenchRequestResult {
    if (request.type === "revealNavigationItem") {
      return this.revealNavigationItem(request.navId);
    }

    return workbenchRequestFail(
      workbenchRequestError(
        "INVALID_REQUEST",
        `Navigation Engine cannot handle request type "${request.type}"`,
        this.id,
      ),
    );
  }

  private revealNavigationItem(navId: string): WorkbenchRequestResult {
    const contribution = this.contributions.find((item) => item.id === navId);
    if (!contribution) {
      return workbenchRequestFail(
        workbenchRequestError(
          "INVALID_REQUEST",
          `Navigation item "${navId}" was not found`,
          this.id,
        ),
      );
    }

    if (!this.permissionAdapter.can(contribution.permission)) {
      return workbenchRequestFail(
        workbenchRequestError(
          "FORBIDDEN",
          `Navigation item "${navId}" is not permitted`,
          this.id,
        ),
      );
    }

    this.revealedIds.add(navId);
    this.rebuildModel();
    return workbenchRequestOk();
  }

  private rebuildModel(): void {
    const duplicateIds = findDuplicateNavigationIds(this.contributions);
    const orphanParents = findOrphanNavigationParents(this.contributions);
    const deduped = dedupeContributions(this.contributions, duplicateIds);

    let permissionFilteredCount = 0;
    let hiddenCount = 0;

    const visibleContributions = deduped.filter((contribution) => {
      if (!this.permissionAdapter.can(contribution.permission)) {
        permissionFilteredCount += 1;
        return false;
      }
      if (contribution.hidden && !this.revealedIds.has(contribution.id)) {
        hiddenCount += 1;
        return false;
      }
      return true;
    });

    this.items = visibleContributions
      .map((contribution) => toNavigationItem(contribution, this.revealedIds))
      .sort(compareNavigationOrder);

    this.groups = buildNavigationGroups(this.items);
    this.tree = buildNavigationTree(this.items);
    this.activeWorkspaceId = resolveActiveWorkspace(this.activeWorkspaceId, this.items);
    this.diagnostics = {
      contributionCount: this.contributions.length,
      visibleCount: this.items.length,
      hiddenCount,
      permissionFilteredCount,
      duplicateIds,
      orphanParents,
      activeWorkspaceId: this.activeWorkspaceId,
      groupCount: this.groups.length,
    };
  }
}

export function createNavigationEngine(
  options: NavigationEngineOptions,
): NavigationEngine {
  return new NavigationEngine(options);
}

function dedupeContributions(
  contributions: readonly NavigationContribution[],
  duplicateIds: readonly string[],
): NavigationContribution[] {
  if (duplicateIds.length === 0) {
    return [...contributions];
  }

  const duplicateSet = new Set(duplicateIds);
  const seen = new Set<string>();
  const unique: NavigationContribution[] = [];

  for (const contribution of contributions) {
    if (duplicateSet.has(contribution.id) && seen.has(contribution.id)) {
      continue;
    }
    seen.add(contribution.id);
    unique.push(contribution);
  }

  return unique;
}

function toNavigationItem(
  contribution: NavigationContribution,
  revealedIds: ReadonlySet<string>,
): NavigationItem {
  return {
    ...contribution,
    visible: true,
    revealed: revealedIds.has(contribution.id),
    children: [],
  };
}

function resolveActiveWorkspace(
  currentWorkspaceId: string,
  items: readonly NavigationItem[],
): string {
  if (
    currentWorkspaceId &&
    items.some(
      (item) =>
        item.level === "activity-bar" &&
        item.workspace === currentWorkspaceId &&
        item.visible,
    )
  ) {
    return currentWorkspaceId;
  }

  return resolveDefaultWorkspace(items);
}

function emptyDiagnostics(): NavigationDiagnostics {
  return {
    contributionCount: 0,
    visibleCount: 0,
    hiddenCount: 0,
    permissionFilteredCount: 0,
    duplicateIds: [],
    orphanParents: [],
    activeWorkspaceId: "",
    groupCount: 0,
  };
}
