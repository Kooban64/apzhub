import { describe, expect, it, vi } from "vitest";

import { createWorkbenchRequestBus } from "./request-bus";
import type { WorkbenchActionExecutor } from "../api/workbench-action-executor";

describe("WorkbenchRequestBus action executor integration", () => {
  it("shares executor-enabled API with capability registration context", () => {
    const execute = vi.fn(() => ({
      ok: true,
      code: "SUCCESS",
      workbenchResult: { ok: true },
    }));
    const actionExecutor: WorkbenchActionExecutor = { execute };

    const bus = createWorkbenchRequestBus({ actionExecutor });
    const capabilityApi = bus.createCapabilityRegistrationContext().workbench;
    const shellApi = bus.getWorkbenchAPI();

    expect(capabilityApi).toBe(shellApi);

    capabilityApi.views.open("platform-home");

    expect(execute).toHaveBeenCalled();
    expect(capabilityApi.getDiagnostics().actionExecution.executorConfigured).toBe(
      true,
    );
  });
});
