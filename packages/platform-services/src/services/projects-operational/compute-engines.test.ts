import { describe, expect, it } from "vitest";

import {
  computeDeliveryConfidence,
  computeDeliveryHealth,
  computeForecast,
  computePulse,
} from "./compute-engines";

const emptySnap = {
  commitments: [],
  waiting: [],
  dependencies: [],
  decisions: [],
  checkpoints: [],
  exceptions: [],
  risks: [],
  milestones: [],
} as const;

describe("W004 compute engines", () => {
  it("returns Healthy / High confidence for empty operational state", () => {
    const health = computeDeliveryHealth("proj_1", emptySnap);
    const conf = computeDeliveryConfidence("proj_1", emptySnap);
    expect(health.status).toBe("Healthy");
    expect(conf.score).toBe(100);
    expect(conf.band).toBe("High");
  });

  it("applies critical risk to Health Critical and Confidence penalty", () => {
    const snap = {
      ...emptySnap,
      risks: [
        {
          id: "r1",
          projectId: "proj_1",
          title: "Vendor collapse",
          description: "x",
          probability: "critical" as const,
          impact: "critical" as const,
          mitigation: "x",
          owner: "u1",
          status: "open" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    const health = computeDeliveryHealth("proj_1", snap);
    const conf = computeDeliveryConfidence("proj_1", snap);
    expect(health.status).toBe("Critical");
    expect(conf.score).toBe(85);
    expect(conf.factors.some((f) => f.code === "critical_risks")).toBe(true);
  });

  it("limits Pulse to two sentences", () => {
    const pulse = computePulse("proj_1", emptySnap);
    expect(pulse.sentences.length).toBeLessThanOrEqual(2);
    expect(pulse.text.split(". ").length).toBeLessThanOrEqual(3);
  });

  it("forecast explains factors and window", () => {
    const forecast = computeForecast("proj_1", emptySnap, 14);
    expect(forecast.windowDays).toBe(14);
    expect(forecast.contributingFactors.length).toBeGreaterThan(0);
    expect(forecast.narrative.length).toBeGreaterThan(0);
  });
});
