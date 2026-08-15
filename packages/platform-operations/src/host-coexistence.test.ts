import { describe, expect, it } from "vitest";

import {
  APZHUB_RESERVED_HOST_PORTS,
  FORBIDDEN_LEGACY_HOST_PORTS,
  auditHostCoexistence,
  extractComposeHostPorts,
  listApzhubReservedPorts,
  validateHostCoexistenceAuditEvidence,
} from "./host-coexistence";

const SAMPLE_COMPOSE = `
services:
  postgres:
    ports:
      - "54334:5432"
  redis:
    ports:
      - "6380:6379"
  caddy:
    ports:
      - "3080:80"
      - "3443:443"
`;

describe("host coexistence (R12-OPS-03)", () => {
  it("reserves APZHUB ports that do not collide with legacy 54333/8080", () => {
    const reserved = listApzhubReservedPorts();
    expect(reserved).toContain(54334);
    expect(reserved).toContain(6380);
    expect(reserved).toContain(17700);
    expect(reserved).toContain(19085);
    expect(reserved).toContain(19678);
    expect(reserved).not.toContain(54333);
    expect(reserved).not.toContain(18085);
    expect(reserved).not.toContain(15678);
    expect(FORBIDDEN_LEGACY_HOST_PORTS).toContain(54333);
    expect(FORBIDDEN_LEGACY_HOST_PORTS).toContain(8080);
    expect(FORBIDDEN_LEGACY_HOST_PORTS).toContain(18085);
    expect(APZHUB_RESERVED_HOST_PORTS.every((p) => p.owner === "apzhub")).toBe(true);
  });

  it("extracts compose host ports", () => {
    expect(extractComposeHostPorts(SAMPLE_COMPOSE)).toEqual([3080, 3443, 6380, 54334]);
  });

  it("passes audit for compliant compose + artefacts", () => {
    const evidence = auditHostCoexistence({
      composeYaml: SAMPLE_COMPOSE,
      artefactsPresent: {
        environmentDoc: true,
        capacityPlanningDoc: true,
        coexistenceControlsDoc: true,
        composeFile: true,
        evidenceDirectory: true,
      },
      environment: "test",
      executedAt: "2026-07-20T09:30:00.000Z",
    });
    expect(evidence.verdict).toBe("PASS");
    expect(evidence.backlogItemId).toBe("R12-OPS-03");
    expect(validateHostCoexistenceAuditEvidence(evidence).ok).toBe(true);
  });

  it("fails when compose binds a forbidden legacy port", () => {
    const evidence = auditHostCoexistence({
      composeYaml: `
services:
  postgres:
    ports:
      - "54333:5432"
      - "54334:5432"
      - "6380:6379"
      - "3080:80"
      - "3443:443"
`,
      artefactsPresent: {
        environmentDoc: true,
        capacityPlanningDoc: true,
        coexistenceControlsDoc: true,
        composeFile: true,
        evidenceDirectory: true,
      },
    });
    expect(evidence.verdict).toBe("FAIL");
    expect(evidence.findings.some((f) => f.id === "compose.forbidden.54333")).toBe(
      true,
    );
  });

  it("fails when live conflicts are reported", () => {
    const evidence = auditHostCoexistence({
      composeYaml: SAMPLE_COMPOSE,
      artefactsPresent: {
        environmentDoc: true,
        capacityPlanningDoc: true,
        coexistenceControlsDoc: true,
        composeFile: true,
        evidenceDirectory: true,
      },
      liveConflicts: [{ port: 54334, occupant: "other-container" }],
    });
    expect(evidence.verdict).toBe("FAIL");
  });

  it("rejects invalid evidence", () => {
    expect(validateHostCoexistenceAuditEvidence({ schemaVersion: "x" }).ok).toBe(false);
  });
});
