import { describe, expect, it } from "vitest";

import { createPlaceholderActivityService, TIMELINE_SCOPE_PERSONAL } from "../index";

describe("PlaceholderActivityService", () => {
  it("returns empty list and empty timeline result", () => {
    const service = createPlaceholderActivityService();

    expect(service.listActivities({ timelineScope: TIMELINE_SCOPE_PERSONAL })).toEqual(
      [],
    );
    expect(service.getActivity("missing")).toBeUndefined();
    expect(service.queryTimeline({ scopeId: TIMELINE_SCOPE_PERSONAL })).toMatchObject({
      scopeId: TIMELINE_SCOPE_PERSONAL,
      items: [],
      status: "empty",
    });
    expect(service.getDiagnostics().status).toBe("scaffold");
  });
});
