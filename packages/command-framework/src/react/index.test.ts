import { describe, expect, it } from "vitest";

import {
  ACTION_FRAMEWORK_REACT_STATUS,
  CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
  createActionFrameworkContext,
  createCommandRegistryFromDto,
  createEmptyActionRegistryDto,
} from "./index";

describe("@apzhub/command-framework/react", () => {
  it("exports hydration react status", () => {
    expect(ACTION_FRAMEWORK_REACT_STATUS).toBe("hydration");
  });

  it("re-exports createCommandRegistryFromDto", () => {
    const result = createCommandRegistryFromDto(createEmptyActionRegistryDto());
    expect(result.ok).toBe(true);
    expect(result.diagnostics.synchronisation).toEqual(
      CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
    );
  });

  it("re-exports createActionFrameworkContext", () => {
    expect(createActionFrameworkContext().status).toBe("hydration");
  });
});
