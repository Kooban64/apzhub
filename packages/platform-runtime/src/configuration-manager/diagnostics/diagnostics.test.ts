import { describe, expect, it } from "vitest";

import { createDefaultConfiguration } from "../defaults/defaults";
import {
  buildConfigurationDiagnostics,
  buildConfigurationSnapshot,
  collectInvalidValues,
} from "./diagnostics";
import { configurationError } from "../validation/errors";

describe("configuration diagnostics", () => {
  it("builds snapshots", () => {
    const snapshot = buildConfigurationSnapshot(
      createDefaultConfiguration("/tmp/apzhub"),
      ["defaults"],
      "2026-06-28T00:00:00.000Z",
    );

    expect(snapshot.timestamp).toBe("2026-06-28T00:00:00.000Z");
  });

  it("builds diagnostics for invalid configuration", () => {
    const diagnostics = buildConfigurationDiagnostics({
      configuration: {
        ...createDefaultConfiguration("/tmp/apzhub"),
        platformVersion: "bad",
      },
      sources: ["defaults"],
      loadedAt: "2026-06-28T00:00:00.000Z",
      snapshotTimestamp: undefined,
      unknownKeys: ["extra"],
    });

    expect(diagnostics.validationStatus).toBe("invalid");
    expect(diagnostics.unknownKeys).toContain("extra");
  });

  it("collects invalid values", () => {
    const errors = collectInvalidValues([
      configurationError("CONFIG_INVALID_VERSION", "bad version", {
        key: "platformVersion",
      }),
    ]);
    expect(errors).toHaveLength(1);
  });
});
