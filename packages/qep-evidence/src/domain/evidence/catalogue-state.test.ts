import { describe, expect, it } from "vitest";

import { deriveCatalogueState } from "./catalogue-state";

describe("APZQEP-120-S05/S06 catalogue state", () => {
  it("maps active evidence to ACTIVE", () => {
    expect(
      deriveCatalogueState({
        status: "captured",
        integrity: {
          hashAlgorithm: "sha256",
          contentHash: "a".repeat(64),
          verificationState: "verified",
          sealed: false,
        },
      }),
    ).toBe("ACTIVE");
  });

  it("maps archived / disposed / quarantined distinctly", () => {
    expect(deriveCatalogueState({ status: "archived" })).toBe("ARCHIVED");
    expect(deriveCatalogueState({ status: "disposed" })).toBe("LOGICALLY_DELETED");
    expect(deriveCatalogueState({ status: "quarantined" })).toBe("RESTRICTED");
  });

  it("maps content_missing integrity to UNAVAILABLE without deleting catalogue", () => {
    expect(
      deriveCatalogueState({
        status: "captured",
        integrity: {
          hashAlgorithm: "sha256",
          contentHash: "b".repeat(64),
          verificationState: "content_missing",
          sealed: false,
        },
      }),
    ).toBe("UNAVAILABLE");
  });

  it("prefers authoritative lifecycleGovernance state", () => {
    expect(
      deriveCatalogueState({
        status: "captured",
        lifecycleGovernance: {
          state: "ARCHIVE_ELIGIBLE",
          retentionStatus: "NOT_CONFIGURED",
          holdStatus: "NOT_HELD",
        },
      }),
    ).toBe("ARCHIVE_ELIGIBLE");
  });
});
