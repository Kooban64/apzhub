import { describe, expect, it } from "vitest";

import {
  filterItemsBySupportQueueScope,
  resolveScopedGroupIdFilter,
  resolveSupportQueueScope,
  supportQueueGrantKey,
} from "./queue-scope";

describe("resolveSupportQueueScope", () => {
  it("is unrestricted without queue grants", () => {
    expect(resolveSupportQueueScope(["support.requests.list"])).toEqual({
      mode: "unrestricted",
    });
  });

  it("is unrestricted with support.*", () => {
    expect(resolveSupportQueueScope(["support.*"])).toEqual({ mode: "unrestricted" });
  });

  it("scopes to granted queues", () => {
    expect(
      resolveSupportQueueScope([
        "support.requests.list",
        supportQueueGrantKey("g1"),
        supportQueueGrantKey("g2"),
      ]),
    ).toEqual({ mode: "scoped", groupIds: ["g1", "g2"] });
  });
});

describe("resolveScopedGroupIdFilter", () => {
  it("rejects out-of-scope group", () => {
    expect(
      resolveScopedGroupIdFilter("other", {
        mode: "scoped",
        groupIds: ["g1"],
      }),
    ).toEqual({ ok: false });
  });

  it("auto-applies single scope", () => {
    expect(
      resolveScopedGroupIdFilter(undefined, {
        mode: "scoped",
        groupIds: ["g1"],
      }),
    ).toEqual({ ok: true, groupId: "g1" });
  });
});

describe("filterItemsBySupportQueueScope", () => {
  it("filters tickets to scoped groups", () => {
    const items = [
      { id: "1", groupId: "g1" },
      { id: "2", groupId: "g2" },
      { id: "3", groupId: undefined },
    ];
    expect(
      filterItemsBySupportQueueScope(items, {
        mode: "scoped",
        groupIds: ["g1"],
      }),
    ).toEqual([{ id: "1", groupId: "g1" }]);
  });
});
