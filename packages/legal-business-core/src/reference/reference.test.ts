import { describe, expect, it } from "vitest";

import { ReferenceNumberGenerator } from "./reference-generator";
import { MockReferenceSequenceProvider } from "./sequence-provider";

describe("ReferenceNumberGenerator", () => {
  it("generates canonical reference numbers with mock sequences", () => {
    const provider = new MockReferenceSequenceProvider();
    const generator = new ReferenceNumberGenerator({
      sequenceProvider: provider,
      sequenceWidth: 6,
    });

    expect(generator.nextMatterReference(2026)).toBe("MAT-2026-000001");
    expect(generator.nextClientReference(2026)).toBe("CLT-2026-000001");
    expect(generator.nextInvoiceReference(2026)).toBe("INV-2026-000001");
    expect(generator.nextTrustAccountCode(2026)).toBe("TRU-2026-000001");
  });
});
