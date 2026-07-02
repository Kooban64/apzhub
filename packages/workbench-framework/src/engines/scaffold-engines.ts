import type { WorkbenchEngine } from "../interfaces/dependencies";
import type { WorkbenchRequest } from "../interfaces/requests";
import {
  workbenchRequestError,
  workbenchRequestFail,
  type WorkbenchRequestResult,
} from "../interfaces/requests";
import type { DockState, WorkbenchEngineId } from "../interfaces/types";

abstract class ScaffoldEngine<TState> implements WorkbenchEngine {
  abstract readonly id: WorkbenchEngineId;

  protected state: TState;

  constructor(initialState: TState) {
    this.state = initialState;
  }

  getStateSlice(): TState {
    return this.state;
  }

  handleRequest(_request: WorkbenchRequest): WorkbenchRequestResult {
    return workbenchRequestFail(
      workbenchRequestError(
        "NOT_IMPLEMENTED",
        `${this.id} engine behaviour is not implemented in Phase 1`,
        this.id,
      ),
    );
  }
}

export class DockEngine extends ScaffoldEngine<DockState> {
  readonly id = "dock" as const;

  constructor() {
    super({ splitRatios: {} });
  }

  getState(): DockState {
    return this.state;
  }

  applySplitRatios(splitRatios: Readonly<Record<string, number>> | undefined): void {
    if (!splitRatios) {
      return;
    }

    this.state = { splitRatios: { ...splitRatios } };
  }
}

export function createDockEngine(): DockEngine {
  return new DockEngine();
}
