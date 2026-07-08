import "@testing-library/jest-dom/vitest";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createDefaultActivityService } from "@apzhub/activity-timeline-framework/server";

import {
  E2E_DELEGATION_FIXTURE_ID,
  useE2eActivityTimelineTestHooks,
} from "./e2e-activity-timeline-hooks";
import { isE2eTestHooksEnabled } from "./e2e-event-notification-hooks";

describe("useE2eActivityTimelineTestHooks", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete window.__APZHUB_E2E__;
  });

  it("mounts activity helpers when E2E hooks are enabled", () => {
    vi.stubEnv("NEXT_PUBLIC_E2E_TEST_HOOKS", "true");
    expect(isE2eTestHooksEnabled()).toBe(true);

    const activityService = createDefaultActivityService();

    function HookHost() {
      useE2eActivityTimelineTestHooks({ activityService });
      return null;
    }

    render(<HookHost />);

    expect(window.__APZHUB_E2E__?.getActivityCount?.()).toBe(0);
    window.__APZHUB_E2E__?.seedActivityActionDelegationFixture?.();
    expect(window.__APZHUB_E2E__?.getActivityCount?.()).toBe(1);
    expect(window.__APZHUB_E2E__?.getActivityTitles?.()).toContain(
      "E2E delegation fixture",
    );
    expect(
      activityService.getActivity(E2E_DELEGATION_FIXTURE_ID)?.metadata.payloadSummary
        ?.actionRef,
    ).toMatchObject({
      actionId: "workbench.view.open",
    });
  });

  it("does not mount hooks when E2E hooks are disabled", () => {
    vi.stubEnv("NEXT_PUBLIC_E2E_TEST_HOOKS", "false");
    const activityService = createDefaultActivityService();

    function HookHost() {
      useE2eActivityTimelineTestHooks({ activityService });
      return null;
    }

    render(<HookHost />);

    expect(window.__APZHUB_E2E__?.getActivityCount).toBeUndefined();
  });
});
