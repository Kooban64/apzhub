import { describe, expect, it } from "vitest";

import { computeObjectiveProgress } from "./compute-objective-progress";

describe("computeObjectiveProgress", () => {
  it("derives progress from milestones and commitments — not averages of unrelated scores", () => {
    const result = computeObjectiveProgress({
      milestones: [
        { status: "achieved" },
        { status: "achieved" },
        { status: "planned" },
        { status: "cancelled" },
      ],
      commitments: [
        { status: "done" },
        { status: "accepted" },
        { status: "cancelled" },
      ],
    });
    // milestones 2/3 * 0.6 + commitments 1/2 * 0.4 = 0.4 + 0.2 = 0.6 → 60
    expect(result.progress).toBe(60);
    expect(result.status).toBe("at_risk");
    expect(result.contributors.some((c) => c.code === "milestones")).toBe(true);
    expect(result.contributors.some((c) => c.code === "commitments")).toBe(true);
  });

  it("marks achieved when all evidence complete", () => {
    const result = computeObjectiveProgress({
      milestones: [{ status: "achieved" }, { status: "completed" }],
      commitments: [{ status: "done" }],
    });
    expect(result.progress).toBe(100);
    expect(result.status).toBe("achieved");
  });

  it("marks off_track when slipped milestones present", () => {
    const result = computeObjectiveProgress({
      milestones: [{ status: "slipped" }, { status: "planned" }],
      commitments: [{ status: "accepted" }],
    });
    expect(result.status).toBe("off_track");
  });

  it("returns zero progress with no evidence", () => {
    const result = computeObjectiveProgress({ milestones: [], commitments: [] });
    expect(result.progress).toBe(0);
    expect(result.contributors[0]?.code).toBe("no_evidence");
  });
});
