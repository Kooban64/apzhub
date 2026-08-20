import { describe, expect, it } from "vitest";

import { resolveSelectedApplicationId } from "./qep-application-selection";

describe("resolveSelectedApplicationId", () => {
  it("selects the only accessible application automatically", () => {
    expect(
      resolveSelectedApplicationId({
        applications: [{ id: "qapp-1" }],
        currentId: null,
        storedId: null,
      }),
    ).toBe("qapp-1");
  });

  it("restores the last valid stored application when several exist", () => {
    expect(
      resolveSelectedApplicationId({
        applications: [{ id: "qapp-1" }, { id: "qapp-2" }],
        currentId: null,
        storedId: "qapp-2",
      }),
    ).toBe("qapp-2");
  });

  it("requires explicit selection when several exist and none is stored", () => {
    expect(
      resolveSelectedApplicationId({
        applications: [{ id: "qapp-1" }, { id: "qapp-2" }],
        currentId: null,
        storedId: "stale",
      }),
    ).toBeNull();
  });

  it("keeps the stored application while the portfolio is still empty", () => {
    expect(
      resolveSelectedApplicationId({
        applications: [],
        currentId: "qapp-1",
        storedId: "qapp-1",
      }),
    ).toBe("qapp-1");
  });
});
