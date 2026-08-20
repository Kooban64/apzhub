import { describe, expect, it } from "vitest";

import { isQualityCommandCentreActivity } from "./qep-command-centre-activity";

describe("isQualityCommandCentreActivity", () => {
  it("omits infrastructure and provider-bridge noise", () => {
    expect(
      isQualityCommandCentreActivity({
        action: "bridge.security_assurance.read",
        detail: "unavailable:none",
      }),
    ).toBe(false);
    expect(
      isQualityCommandCentreActivity({
        action: "qep.security_assurance.read",
        detail: "unavailable:none",
      }),
    ).toBe(false);
  });

  it("keeps quality-domain events", () => {
    expect(
      isQualityCommandCentreActivity({
        action: "defect.updated",
        detail: "DEF-901",
      }),
    ).toBe(true);
    expect(
      isQualityCommandCentreActivity({
        action: "execution.completed",
        detail: "TE-001",
      }),
    ).toBe(true);
  });
});
