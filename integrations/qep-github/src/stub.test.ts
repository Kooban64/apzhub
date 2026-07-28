import { describe, expect, it } from "vitest";
import { QEP_GITHUB_INTEGRATION_STATUS, QEP_GITHUB_INTEGRATION_VERSION } from "./index";

describe("@apzhub/integration-qep-github", () => {
  it("remains a stub with no connector behaviour", () => {
    expect(QEP_GITHUB_INTEGRATION_VERSION).toBe("0.0.0-stub");
    expect(QEP_GITHUB_INTEGRATION_STATUS).toBe("stub");
  });
});
