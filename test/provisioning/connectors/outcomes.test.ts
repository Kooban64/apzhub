import { describe, expect, it } from "vitest";

import { CONNECTOR_OUTCOMES, isConnectorOutcome } from "@/lib/provisioning/connectors/outcomes";
import { PROVISIONING_ATTEMPT_OUTCOMES } from "@/lib/provisioning/contracts/enums";

describe("CONNECTOR_OUTCOMES", () => {
  it("matches provisioning attempt outcome vocabulary", () => {
    expect([...CONNECTOR_OUTCOMES]).toEqual([...PROVISIONING_ATTEMPT_OUTCOMES]);
  });

  it("isConnectorOutcome narrows", () => {
    expect(isConnectorOutcome("success")).toBe(true);
    expect(isConnectorOutcome("bogus")).toBe(false);
  });
});
