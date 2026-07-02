import { describe, expect, it } from "vitest";

import {
  toActionContextSnapshot,
  toActionSelectionSnapshot,
} from "./map-workbench-context-snapshots";

describe("map-workbench-context-snapshots", () => {
  it("maps selection mode snapshot", () => {
    expect(toActionSelectionSnapshot({ selectionMode: "single" })).toEqual({
      mode: "single",
    });
    expect(toActionSelectionSnapshot({})).toBeUndefined();
  });

  it("maps context types snapshot", () => {
    expect(toActionContextSnapshot({ contextTypes: ["record.item"] })).toEqual({
      contextTypes: ["record.item"],
    });
    expect(toActionContextSnapshot({})).toBeUndefined();
  });
});
