import { describe, expect, it } from "vitest";

import { computeSpecificationAvailableActions } from "./available-actions";

describe("computeSpecificationAvailableActions", () => {
  it("allows updateDraft and submitForReview from draft when unrestricted", () => {
    const actions = computeSpecificationAvailableActions({
      record: { status: "draft" } as never,
    });
    expect(actions).toContain("updateDraft");
    expect(actions).toContain("submitForReview");
    expect(actions).not.toContain("approve");
  });

  it("allows approve and reject from under_review", () => {
    const actions = computeSpecificationAvailableActions({
      record: { status: "under_review" } as never,
    });
    expect(actions).toContain("approve");
    expect(actions).toContain("reject");
    expect(actions).toContain("withdraw");
    expect(actions).toContain("cancel");
  });

  it("allows supersede, retire, and withdraw from approved", () => {
    const actions = computeSpecificationAvailableActions({
      record: { status: "approved" } as never,
    });
    expect(actions).toContain("supersede");
    expect(actions).toContain("retire");
    expect(actions).toContain("withdraw");
    expect(actions).not.toContain("updateDraft");
  });

  it("returns no actions for terminal states", () => {
    expect(
      computeSpecificationAvailableActions({
        record: { status: "withdrawn" } as never,
      }),
    ).toEqual([]);
    expect(
      computeSpecificationAvailableActions({
        record: { status: "cancelled" } as never,
      }),
    ).toEqual([]);
    expect(
      computeSpecificationAvailableActions({ record: { status: "retired" } as never }),
    ).toEqual([]);
    expect(
      computeSpecificationAvailableActions({
        record: { status: "superseded" } as never,
      }),
    ).toEqual([]);
  });

  it("filters actions by explicit permission grants", () => {
    const readOnly = computeSpecificationAvailableActions(
      { record: { status: "draft" } as never },
      ["qep.specification.read"],
    );
    expect(readOnly).toEqual([]);

    const reviewOnly = computeSpecificationAvailableActions(
      { record: { status: "draft" } as never },
      ["qep.specification.review"],
    );
    expect(reviewOnly).toEqual(["submitForReview"]);

    const wildcard = computeSpecificationAvailableActions(
      { record: { status: "approved" } as never },
      ["qep.specification.*"],
    );
    expect(wildcard).toContain("retire");
    expect(wildcard).toContain("supersede");
  });
});
