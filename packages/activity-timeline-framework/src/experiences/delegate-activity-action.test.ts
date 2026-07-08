import { describe, expect, it, vi } from "vitest";

import { delegateActivityActionRef } from "./delegate-activity-action";

describe("delegateActivityActionRef", () => {
  it("returns false when actionRef is missing", async () => {
    const execute = vi.fn();
    await expect(delegateActivityActionRef(undefined, { execute })).resolves.toBe(
      false,
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it("delegates actionId and handlerContext to execute", async () => {
    const execute = vi.fn().mockResolvedValue({ ok: true });
    const actionRef = {
      actionId: "platform.theme.toggle",
      handlerContext: Object.freeze({ source: "activity" }),
    };

    await expect(delegateActivityActionRef(actionRef, { execute })).resolves.toBe(true);
    expect(execute).toHaveBeenCalledWith("platform.theme.toggle", {
      source: "activity",
    });
  });
});
