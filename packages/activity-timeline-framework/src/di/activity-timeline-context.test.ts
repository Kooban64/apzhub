import { describe, expect, it } from "vitest";

import { createActivityTimelineContext } from "./activity-timeline-context";
import { createDefaultTimelineRegistryWithPlatformCatalogue } from "../timeline";

describe("createActivityTimelineContext", () => {
  it("wires default activity service with empty store", () => {
    const context = createActivityTimelineContext();

    expect(context.service.getDiagnostics().status).toBe("empty");
    expect(context.service.getDiagnostics().totalActivityCount).toBe(0);
  });

  it("uses platform catalogue factory", () => {
    const timelineRegistry = createDefaultTimelineRegistryWithPlatformCatalogue();

    expect(timelineRegistry.list()).toHaveLength(4);
    expect(timelineRegistry.getRegistryMetadata().platformCatalogueVersion).toBe(
      "1.0.0",
    );
  });
});
