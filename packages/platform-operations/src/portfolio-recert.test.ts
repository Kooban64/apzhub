import { describe, expect, it } from "vitest";

import {
  PORTFOLIO_RECERT_PRODUCT_SURFACE,
  PORTFOLIO_RECERT_REQUIRED_ARTEFACTS,
  auditPortfolioRecert,
  validatePortfolioRecertEvidence,
} from "./portfolio-recert";

const ALL_ARTEFACTS = {
  composeFile: true,
  playwrightConfig: true,
  ciWorkflow: true,
  ciRunsPlaywright: true,
  runbook: true,
  evidenceDirectory: true,
  packageScript: true,
} as const;

describe("portfolio recert (R12-QA-01)", () => {
  it("lists required artefacts and portfolio surfaces", () => {
    expect(PORTFOLIO_RECERT_REQUIRED_ARTEFACTS).toContain(
      "testing/playwright/playwright.config.ts",
    );
    expect(PORTFOLIO_RECERT_PRODUCT_SURFACE).toContain("APZ Support");
  });

  it("passes path-only audit when artefacts exist", () => {
    const evidence = auditPortfolioRecert({
      mode: "path",
      artefacts: ALL_ARTEFACTS,
      executedAt: "2026-07-20T17:00:00.000Z",
      environment: "test",
    });
    expect(evidence.verdict).toBe("PASS");
    expect(evidence.backlogItemId).toBe("R12-QA-01");
    expect(evidence.docker).toBeNull();
    expect(evidence.playwright).toBeNull();
    expect(validatePortfolioRecertEvidence(evidence).ok).toBe(true);
  });

  it("fails path audit when CI does not run Playwright", () => {
    const evidence = auditPortfolioRecert({
      mode: "path",
      artefacts: { ...ALL_ARTEFACTS, ciRunsPlaywright: false },
    });
    expect(evidence.verdict).toBe("FAIL");
  });

  it("requires docker health for docker mode", () => {
    const fail = auditPortfolioRecert({
      mode: "docker",
      artefacts: ALL_ARTEFACTS,
      docker: {
        composeConfigOk: true,
        servicesHealthy: false,
        serviceNames: [],
        notes: [],
      },
    });
    expect(fail.verdict).toBe("FAIL");

    const pass = auditPortfolioRecert({
      mode: "docker",
      artefacts: ALL_ARTEFACTS,
      docker: {
        composeConfigOk: true,
        servicesHealthy: true,
        serviceNames: ["apzhub-postgres", "apzhub-redis"],
        notes: ["healthy"],
      },
    });
    expect(pass.verdict).toBe("PASS");
  });

  it("requires playwright exit 0 for playwright mode", () => {
    const evidence = auditPortfolioRecert({
      mode: "playwright",
      artefacts: ALL_ARTEFACTS,
      playwright: {
        executed: true,
        exitCode: 0,
        skipped: false,
        suite: "full",
        notes: ["pnpm test:e2e"],
      },
    });
    expect(evidence.verdict).toBe("PASS");
  });

  it("full mode needs docker + playwright", () => {
    const evidence = auditPortfolioRecert({
      mode: "full",
      artefacts: ALL_ARTEFACTS,
      docker: {
        composeConfigOk: true,
        servicesHealthy: true,
        serviceNames: ["apzhub-postgres"],
        notes: [],
      },
      playwright: {
        executed: true,
        exitCode: 0,
        skipped: false,
        suite: "full",
        notes: [],
      },
      executedAt: "2026-07-20T17:00:00.000Z",
    });
    expect(evidence.verdict).toBe("PASS");
    expect(validatePortfolioRecertEvidence(evidence).ok).toBe(true);
  });
});
