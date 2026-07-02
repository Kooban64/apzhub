import { describe, expect, it } from "vitest";

import { platformSdkContracts } from "./index";

describe("platformSdkContracts", () => {
  it("rejects module registration in foundation phase", () => {
    expect(() =>
      platformSdkContracts.registerModule({
        id: "test",
        name: "Test",
        version: "0.0.0",
      }),
    ).toThrow("Module registration is not available in SPR-001");
  });
});
