import { describe, expect, it } from "vitest";

import { BUSINESS_JOURNEY_CATALOGUE, getBusinessJourney } from "./business-journeys";

const FORBIDDEN = [
  "trigger",
  "webhook",
  "provider",
  "engine",
  "execution",
  "node",
  "schedule",
  "run ",
] as const;

describe("business journey catalogue", () => {
  it("includes required business journeys", () => {
    const names = BUSINESS_JOURNEY_CATALOGUE.map((j) => j.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "Employee Onboarding",
        "Customer Complaint Resolution",
        "Project Approval",
        "Procurement Request",
        "Leave Approval",
        "Contract Review",
        "Quality Review",
      ]),
    );
  });

  it("passes the Workflow Test (no implementation vocabulary)", () => {
    for (const journey of BUSINESS_JOURNEY_CATALOGUE) {
      const blob =
        `${journey.name} ${journey.summary} ${journey.outcomes.join(" ")} ${journey.typicalParticipants.join(" ")}`.toLowerCase();
      for (const word of FORBIDDEN) {
        expect(blob).not.toContain(word);
      }
    }
  });

  it("resolves journey by id", () => {
    expect(getBusinessJourney("project-approval")?.name).toBe("Project Approval");
    expect(getBusinessJourney("missing")).toBeUndefined();
  });
});
