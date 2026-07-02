import { describe, expect, it } from "vitest";

import {
  workbenchRequestFail,
  workbenchRequestOk,
  workbenchRequestError,
} from "../interfaces/requests";
import { mapActionExecutorResultToWorkbenchResult } from "./map-action-executor-result";

describe("mapActionExecutorResultToWorkbenchResult", () => {
  it("returns workbench result when execution succeeds with explicit result", () => {
    const workbenchResult = workbenchRequestOk();
    const mapped = mapActionExecutorResultToWorkbenchResult({
      ok: true,
      code: "SUCCESS",
      workbenchResult,
    });

    expect(mapped).toBe(workbenchResult);
  });

  it("returns default ok when execution succeeds without workbench result", () => {
    const mapped = mapActionExecutorResultToWorkbenchResult({
      ok: true,
      code: "SUCCESS",
    });

    expect(mapped.ok).toBe(true);
  });

  it.each([
    ["FORBIDDEN", "FORBIDDEN"],
    ["NOT_IMPLEMENTED", "NOT_IMPLEMENTED"],
    ["HANDLER_ERROR", "ENGINE_ERROR"],
    ["INVALID_ARGS", "INVALID_REQUEST"],
    ["NOT_FOUND", "INVALID_REQUEST"],
    ["UNKNOWN", "ENGINE_ERROR"],
  ] as const)("maps failure code %s to %s", (code, expected) => {
    const mapped = mapActionExecutorResultToWorkbenchResult({
      ok: false,
      code,
      message: "test failure",
    });

    expect(mapped.ok).toBe(false);
    if (!mapped.ok) {
      expect(mapped.error?.code).toBe(expected);
      expect(mapped.error?.message).toBe("test failure");
    }
  });

  it("uses default message when executor omits one", () => {
    const mapped = mapActionExecutorResultToWorkbenchResult({
      ok: false,
      code: "HANDLER_ERROR",
    });

    expect(mapped).toEqual(
      workbenchRequestFail(
        workbenchRequestError(
          "ENGINE_ERROR",
          "Action execution failed (HANDLER_ERROR)",
        ),
      ),
    );
  });
});
