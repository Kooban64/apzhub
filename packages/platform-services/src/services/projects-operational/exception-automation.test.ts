import { describe, expect, it } from "vitest";

import { detectAutomatedExceptions } from "./exception-automation";

describe("exception automation", () => {
  it("raises date_exception for slipped milestone", () => {
    const drafts = detectAutomatedExceptions({
      milestones: [
        {
          id: "ms1",
          projectId: "p1",
          name: "Go-live",
          status: "slipped",
          confidence: "low",
          sortKey: 0,
          dependencyIds: [],
          progressPercent: 40,
          achievementEvidence: [],
          varianceDays: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      waiting: [],
      commitments: [],
      dependencies: [],
      checkpoints: [],
      exceptions: [],
      waitingBreachEscalationDays: 3,
      milestoneDateToleranceDays: 7,
    });
    expect(drafts.some((d) => d.type === "date_exception")).toBe(true);
    expect(drafts[0]?.recommendedAction).toBeTruthy();
  });

  it("is idempotent when exception already open", () => {
    const drafts = detectAutomatedExceptions({
      milestones: [
        {
          id: "ms1",
          projectId: "p1",
          name: "Go-live",
          status: "slipped",
          confidence: "low",
          sortKey: 0,
          dependencyIds: [],
          progressPercent: 40,
          achievementEvidence: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      waiting: [],
      commitments: [],
      dependencies: [],
      checkpoints: [],
      exceptions: [
        {
          id: "ex1",
          projectId: "p1",
          type: "date_exception",
          severity: "major",
          status: "open",
          subjectRef: { type: "milestone", id: "ms1" },
          detectedAt: new Date().toISOString(),
          reason: "existing",
          impactSummary: "existing",
          escalationState: "notified",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      waitingBreachEscalationDays: 3,
      milestoneDateToleranceDays: 7,
    });
    expect(drafts.filter((d) => d.subjectRef.id === "ms1")).toHaveLength(0);
  });
});
