import {
  SHELL_REGIONS,
  type LayoutState,
  type ShellRegionId,
} from "../../interfaces/types";
import type { WorkbenchEngine } from "../../interfaces/dependencies";
import type { WorkbenchRequest } from "../../interfaces/requests";
import {
  workbenchRequestError,
  workbenchRequestFail,
  type WorkbenchRequestResult,
} from "../../interfaces/requests";

const DEFAULT_REGION_ORDER: Record<ShellRegionId, number> = {
  header: 0,
  activityBar: 1,
  sidebar: 2,
  workspace: 3,
  context: 4,
  statusBar: 5,
};

export function createDefaultLayoutState(): LayoutState {
  const regions = {} as LayoutState["regions"];
  for (const regionId of SHELL_REGIONS) {
    regions[regionId] = {
      visible: true,
      order: DEFAULT_REGION_ORDER[regionId],
    };
  }
  return { regions };
}

export interface LayoutEngineOptions {
  initialState?: LayoutState;
}

/** Layout Engine — shell region composition scaffold (Phase 1). */
export class LayoutEngine implements WorkbenchEngine {
  readonly id = "layout" as const;

  private state: LayoutState;

  constructor(options: LayoutEngineOptions = {}) {
    this.state = options.initialState ?? createDefaultLayoutState();
  }

  getState(): LayoutState {
    return this.state;
  }

  getStateSlice(): LayoutState {
    return this.getState();
  }

  handleRequest(_request: WorkbenchRequest): WorkbenchRequestResult {
    return workbenchRequestFail(
      workbenchRequestError(
        "NOT_IMPLEMENTED",
        "Layout Engine does not accept requests in Phase 1",
        this.id,
      ),
    );
  }

  /** Internal API for Workbench Manager — not exposed to capabilities. */
  setRegionVisibility(regionId: ShellRegionId, visible: boolean): void {
    this.state = {
      regions: {
        ...this.state.regions,
        [regionId]: {
          ...this.state.regions[regionId],
          visible,
        },
      },
    };
  }

  applyLayoutPreferences(
    layout:
      { regions?: Partial<Record<ShellRegionId, { visible: boolean }>> } | undefined,
  ): void {
    if (!layout?.regions) {
      return;
    }

    for (const [regionId, region] of Object.entries(layout.regions)) {
      if (region) {
        this.setRegionVisibility(regionId as ShellRegionId, region.visible);
      }
    }
  }
}

export function createLayoutEngine(options?: LayoutEngineOptions): LayoutEngine {
  return new LayoutEngine(options);
}
