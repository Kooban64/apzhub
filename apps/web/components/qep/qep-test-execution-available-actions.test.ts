import { describe, expect, it } from "vitest";

import type { ExecutionActionDescriptor } from "@apzhub/qep-test-execution";

import {
  getExecutionActionBarDescriptors,
  hasExecutionAction,
} from "./qep-test-execution-views";

/**
 * APZQEP-ENG-100E — Workbench must never invent availableActions from status.
 * Action bar entries are filtered from server descriptors only (ADR-0083).
 */

function descriptor(
  action: string,
  overrides: Partial<ExecutionActionDescriptor> = {},
): ExecutionActionDescriptor {
  return {
    action,
    label: action,
    requiresConfirmation: false,
    reasonRequired: false,
    ...overrides,
  };
}

describe("APZQEP-ENG-100E Test Execution availableActions contract", () => {
  it("renders only lifecycle actions present in server availableActions", () => {
    const actions = getExecutionActionBarDescriptors([
      descriptor("prepareExecution"),
      descriptor("recordStepResult"),
      descriptor("associateEvidence"),
      descriptor("cancelExecution", { dangerous: true }),
    ]);
    expect(actions.map((a) => a.action)).toEqual([
      "prepareExecution",
      "cancelExecution",
    ]);
  });

  it("returns empty action bar when server provides no actions", () => {
    expect(getExecutionActionBarDescriptors([])).toEqual([]);
  });

  it("does not invent actions from status — helper only inspects descriptors", () => {
    const draftLike = [
      descriptor("prepareExecution"),
      descriptor("cancelExecution"),
    ] as const;
    expect(hasExecutionAction(draftLike, "startExecution")).toBe(false);
    expect(hasExecutionAction(draftLike, "prepareExecution")).toBe(true);
  });

  it("ignores unknown action names that have no API slug mapping", () => {
    const actions = getExecutionActionBarDescriptors([
      descriptor("inventedClientAction"),
      descriptor("acceptExecution"),
    ]);
    expect(actions.map((a) => a.action)).toEqual(["acceptExecution"]);
  });
});
