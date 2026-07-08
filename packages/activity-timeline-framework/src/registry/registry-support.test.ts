import { describe, expect, it } from "vitest";

import {
  freezeActivityDescriptor,
  freezeActivityDescriptors,
} from "./freeze-activity-descriptor";
import { TIMELINE_SCOPE_PERSONAL } from "../types/timeline-scope";
import type { ActivityDescriptor } from "../types/activity-descriptor";

const sample: ActivityDescriptor = {
  activityTypeId: "platform.test",
  version: "1.0.0",
  category: "system",
  sourceEventPattern: "platform.test",
  timelineScopes: [TIMELINE_SCOPE_PERSONAL],
  templateRef: "activity.test",
  tags: ["test"],
};

describe("freezeActivityDescriptor", () => {
  it("deep-freezes descriptor and nested arrays", () => {
    const frozen = freezeActivityDescriptor(sample);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.timelineScopes)).toBe(true);
    expect(Object.isFrozen(frozen.tags)).toBe(true);
  });

  it("freezeActivityDescriptors returns frozen array", () => {
    const frozen = freezeActivityDescriptors([sample]);

    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen[0])).toBe(true);
  });
});
