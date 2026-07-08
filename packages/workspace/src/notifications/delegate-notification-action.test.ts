import { describe, expect, it, vi } from "vitest";

import type { NotificationActionRef } from "@apzhub/event-notification-framework";

import { delegateNotificationActionRef } from "./delegate-notification-action";

describe("delegateNotificationActionRef", () => {
  it("returns false when actionRef is missing", async () => {
    const execute = vi.fn();
    await expect(delegateNotificationActionRef(undefined, { execute })).resolves.toBe(
      false,
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it("delegates actionId and handlerContext to execute", async () => {
    const actionRef: NotificationActionRef = {
      actionId: "platform.theme.toggle",
      handlerContext: { source: "notification" },
    };
    const execute = vi.fn().mockResolvedValue({ ok: true });

    await expect(delegateNotificationActionRef(actionRef, { execute })).resolves.toBe(
      true,
    );

    expect(execute).toHaveBeenCalledWith("platform.theme.toggle", {
      source: "notification",
    });
  });

  it("returns false when execute fails", async () => {
    const execute = vi.fn().mockResolvedValue({ ok: false });
    await expect(
      delegateNotificationActionRef({ actionId: "missing.action" }, { execute }),
    ).resolves.toBe(false);
  });
});
