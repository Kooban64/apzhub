import { describe, expect, it } from "vitest";

import {
  computeDeliveryCapacity,
  computeResourceForecast,
  computeTeamHealth,
} from "./compute-team-signals";

describe("team signals (PX-03)", () => {
  it("marks empty teams as critical health", () => {
    const health = computeTeamHealth({
      teamId: "edt_1",
      memberCount: 0,
      openCommitments: 0,
      agedWaits: 0,
      openExceptions: 0,
      escalations: 0,
      slippedMilestones: 0,
      avgConfidence: 70,
      dueIn7: 0,
      dueIn14: 0,
      dueIn30: 0,
    });
    expect(health.indicative).toBe(true);
    expect(health.band).toBe("critical");
    expect(health.factors.some((f) => f.code === "assignment_pressure")).toBe(true);
  });

  it("labels capacity indicative overload", () => {
    const capacity = computeDeliveryCapacity({
      teamId: "edt_1",
      memberCount: 1,
      openCommitments: 10,
      agedWaits: 0,
      openExceptions: 0,
      escalations: 0,
      slippedMilestones: 0,
      avgConfidence: 70,
      dueIn7: 5,
      dueIn14: 8,
      dueIn30: 12,
    });
    expect(capacity.band).toBe("overloaded");
    expect(capacity.indicative).toBe(true);
  });

  it("builds 7/14/30 forecast buckets", () => {
    const forecast = computeResourceForecast({
      teamId: "edt_1",
      memberCount: 2,
      openCommitments: 2,
      agedWaits: 0,
      openExceptions: 0,
      escalations: 0,
      slippedMilestones: 0,
      avgConfidence: 70,
      dueIn7: 1,
      dueIn14: 3,
      dueIn30: 6,
    });
    expect(forecast.buckets).toHaveLength(3);
    expect(forecast.indicative).toBe(true);
  });

  it("includes W006 team health factors", () => {
    const health = computeTeamHealth({
      teamId: "edt_1",
      memberCount: 2,
      openCommitments: 8,
      agedWaits: 2,
      openExceptions: 1,
      escalations: 1,
      slippedMilestones: 1,
      avgConfidence: 40,
      dueIn7: 2,
      dueIn14: 3,
      dueIn30: 4,
    });
    const codes = health.factors.map((f) => f.code);
    expect(codes).toContain("delivery_stability");
    expect(codes).toContain("assignment_pressure");
    expect(codes).toContain("waiting_exposure");
    expect(codes).toContain("escalation_frequency");
    expect(codes).toContain("confidence_contribution");
  });
});
