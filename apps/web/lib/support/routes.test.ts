import { describe, expect, it } from "vitest";

import {
  isSupportRoute,
  parseSupportDetailId,
  resolveSupportRoute,
  resolveSupportSection,
  SUPPORT_BASE,
  supportRequestCreatePath,
  supportRequestDetailPath,
} from "./routes";

describe("support routes", () => {
  it("detects support routes", () => {
    expect(isSupportRoute(SUPPORT_BASE)).toBe(true);
    expect(isSupportRoute(`${SUPPORT_BASE}/requests`)).toBe(true);
    expect(isSupportRoute("/workspace/administration")).toBe(false);
  });

  it("resolves sections", () => {
    expect(resolveSupportSection(SUPPORT_BASE)).toBe("requests");
    expect(resolveSupportSection(`${SUPPORT_BASE}/analytics`)).toBe("analytics");
    expect(resolveSupportSection(`${SUPPORT_BASE}/search/`)).toBe("search");
    expect(resolveSupportSection(`${SUPPORT_BASE}/unknown-section`)).toBe("requests");
  });

  it("parses detail ids and create routes", () => {
    const id = "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    expect(parseSupportDetailId(`${SUPPORT_BASE}/requests/${id}`, "requests")).toBe(id);
    expect(parseSupportDetailId(`${SUPPORT_BASE}/requests/new`, "requests")).toBeNull();
    expect(parseSupportDetailId(`${SUPPORT_BASE}/groups/create`, "groups")).toBeNull();
    expect(parseSupportDetailId(`${SUPPORT_BASE}/users`, "users")).toBeNull();
    expect(resolveSupportRoute(`${SUPPORT_BASE}/requests/new`)).toEqual({
      kind: "create",
    });
    expect(resolveSupportRoute(`${SUPPORT_BASE}/requests/create`)).toEqual({
      kind: "create",
    });
    expect(resolveSupportRoute(supportRequestDetailPath(id))).toEqual({
      kind: "detail",
      supportRequestId: id,
    });
    expect(supportRequestCreatePath()).toBe(`${SUPPORT_BASE}/requests/new`);
  });

  it("resolves all supported route kinds", () => {
    expect(resolveSupportRoute(SUPPORT_BASE)).toEqual({ kind: "inbox" });
    expect(resolveSupportRoute(`${SUPPORT_BASE}/requests`)).toEqual({ kind: "inbox" });
    expect(resolveSupportRoute(`${SUPPORT_BASE}/organizations`)).toEqual({
      kind: "organizations",
    });
    expect(
      resolveSupportRoute(
        `${SUPPORT_BASE}/organizations/sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee`,
      ),
    ).toEqual({
      kind: "organization-detail",
      organizationId: "sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    });
    expect(resolveSupportRoute(`${SUPPORT_BASE}/groups`)).toEqual({ kind: "groups" });
    expect(
      resolveSupportRoute(
        `${SUPPORT_BASE}/groups/sgrp_ffffffffffffffffffffffffffffffff`,
      ),
    ).toEqual({
      kind: "group-detail",
      groupId: "sgrp_ffffffffffffffffffffffffffffffff",
    });
    expect(resolveSupportRoute(`${SUPPORT_BASE}/users`)).toEqual({ kind: "users" });
    expect(
      resolveSupportRoute(
        `${SUPPORT_BASE}/users/suser_11111111111111111111111111111111`,
      ),
    ).toEqual({
      kind: "user-detail",
      userId: "suser_11111111111111111111111111111111",
    });
    expect(resolveSupportRoute(`${SUPPORT_BASE}/search`)).toEqual({ kind: "search" });
    expect(resolveSupportRoute(`${SUPPORT_BASE}/analytics`)).toEqual({
      kind: "analytics",
    });
    expect(resolveSupportRoute(`${SUPPORT_BASE}/help`)).toEqual({ kind: "help" });
    expect(resolveSupportRoute(`${SUPPORT_BASE}/settings`)).toEqual({
      kind: "settings",
    });
    expect(resolveSupportRoute(`${SUPPORT_BASE}/not-a-real-route`)).toEqual({
      kind: "unknown",
    });
    expect(resolveSupportRoute("/workspace/other")).toEqual({ kind: "unknown" });
  });
});
