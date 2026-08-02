import { describe, expect, it } from "vitest";

import { deriveCatalogueState } from "./catalogue-state";

describe("APZQEP-120-S05 catalogue state", () => {
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
    expect(deriveCatalogueState({ status: "disposed" })).toBe("DELETED_LOGICALLY");
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
});
