/**
 * R12-QA-01 — Portfolio Playwright / Docker re-cert path.
 * Process/CI hygiene only — no product redesign, no architecture change.
 */

export type PortfolioRecertMode = "path" | "docker" | "playwright" | "full";

export type PortfolioRecertVerdict = "PASS" | "FAIL" | "BLOCKED";

export interface PortfolioRecertFinding {
  readonly id: string;
  readonly severity: "pass" | "fail" | "warn";
  readonly message: string;
}

export interface PortfolioRecertArtefactsPresent {
  readonly composeFile: boolean;
  readonly playwrightConfig: boolean;
  readonly ciWorkflow: boolean;
  readonly ciRunsPlaywright: boolean;
  readonly runbook: boolean;
  readonly evidenceDirectory: boolean;
  readonly packageScript: boolean;
}

export interface PortfolioRecertDockerResult {
  readonly composeConfigOk: boolean;
  readonly servicesHealthy: boolean;
  readonly serviceNames: readonly string[];
  readonly notes: readonly string[];
}

export interface PortfolioRecertPlaywrightResult {
  readonly executed: boolean;
  readonly exitCode: number | null;
  readonly skipped: boolean;
  readonly skipReason?: string;
  readonly suite: "full" | "none";
  readonly notes: readonly string[];
}

export interface PortfolioRecertEvidence {
  readonly schemaVersion: "1.0.0";
  readonly programmeId: "APZHUB-ENG-0005";
  readonly backlogItemId: "R12-QA-01";
  readonly knownLimitationId: "PL12-KL-06";
  readonly executedAt: string;
  readonly environment: string;
  readonly mode: PortfolioRecertMode;
  readonly findings: readonly PortfolioRecertFinding[];
  readonly verdict: PortfolioRecertVerdict;
  readonly artefacts: PortfolioRecertArtefactsPresent;
  readonly docker: PortfolioRecertDockerResult | null;
  readonly playwright: PortfolioRecertPlaywrightResult | null;
  readonly portfolioProducts: readonly string[];
  readonly notes: readonly string[];
  readonly artefactPaths: readonly string[];
}

export const PORTFOLIO_RECERT_REQUIRED_ARTEFACTS = [
  "infrastructure/docker/docker-compose.dev.yml",
  "testing/playwright/playwright.config.ts",
  ".github/workflows/ci.yml",
  "docs/operations/PORTFOLIO-PLAYWRIGHT-DOCKER-RECERT.md",
  "docs/operations/evidence/portfolio-recert/README.md",
] as const;

/** Commercial + platform surfaces covered by the portfolio Playwright bar. */
export const PORTFOLIO_RECERT_PRODUCT_SURFACE = [
  "APZHUB Platform shell (SPR)",
  "APZ Projects",
  "APZ Time",
  "APZ Support",
  "APZ Documents",
  "APZ TCMS",
  "APZ Analytics",
  "APZ Workflow",
  "APZ Law (main suite + optional law config)",
  "Platform Search / Identity / Metrics / Observe / Admin / Notifications",
] as const;

export interface AuditPortfolioRecertInput {
  readonly mode: PortfolioRecertMode;
  readonly artefacts: PortfolioRecertArtefactsPresent;
  readonly docker?: PortfolioRecertDockerResult | null;
  readonly playwright?: PortfolioRecertPlaywrightResult | null;
  readonly environment?: string;
  readonly executedAt?: string;
}

export function auditPortfolioRecert(
  input: AuditPortfolioRecertInput,
): PortfolioRecertEvidence {
  const findings: PortfolioRecertFinding[] = [];
  const notes: string[] = [
    "R12-QA-01 closes PL12-KL-06 hygiene residual (path executed with evidence).",
    "Ordinary CI continues to run pnpm test:e2e on PR/main.",
    "Docker Compose rebuild/health is the half CI service containers do not cover.",
  ];

  const artefactChecks: [keyof PortfolioRecertArtefactsPresent, string][] = [
    ["composeFile", "Docker Compose dev file present"],
    ["playwrightConfig", "Playwright config present"],
    ["ciWorkflow", "CI workflow present"],
    ["ciRunsPlaywright", "CI invokes pnpm test:e2e"],
    ["runbook", "Portfolio re-cert runbook present"],
    ["evidenceDirectory", "Evidence directory README present"],
    ["packageScript", "pnpm ops:portfolio-recert script present"],
  ];

  for (const [key, label] of artefactChecks) {
    const ok = input.artefacts[key];
    findings.push({
      id: `artefact.${key}`,
      severity: ok ? "pass" : "fail",
      message: ok ? label : `Missing: ${label}`,
    });
  }

  const needsDocker = input.mode === "docker" || input.mode === "full";
  const needsPlaywright = input.mode === "playwright" || input.mode === "full";

  let docker = input.docker ?? null;
  if (needsDocker) {
    if (!docker) {
      findings.push({
        id: "docker.missing",
        severity: "fail",
        message: "Docker stage required for this mode but no docker result provided",
      });
    } else {
      findings.push({
        id: "docker.composeConfig",
        severity: docker.composeConfigOk ? "pass" : "fail",
        message: docker.composeConfigOk
          ? "docker compose config validates"
          : "docker compose config failed",
      });
      findings.push({
        id: "docker.health",
        severity: docker.servicesHealthy ? "pass" : "fail",
        message: docker.servicesHealthy
          ? `APZHUB compose services healthy (${docker.serviceNames.join(", ") || "none"})`
          : "APZHUB compose services not healthy",
      });
      for (const note of docker.notes) {
        notes.push(note);
      }
    }
  } else {
    docker = null;
    findings.push({
      id: "docker.skipped",
      severity: "pass",
      message: `Docker stage skipped (mode=${input.mode})`,
    });
  }

  let playwright = input.playwright ?? null;
  if (needsPlaywright) {
    if (!playwright) {
      findings.push({
        id: "playwright.missing",
        severity: "fail",
        message:
          "Playwright stage required for this mode but no playwright result provided",
      });
    } else if (playwright.skipped) {
      findings.push({
        id: "playwright.skipped",
        severity: "fail",
        message: `Playwright skipped: ${playwright.skipReason ?? "unspecified"}`,
      });
    } else {
      findings.push({
        id: "playwright.suite",
        severity: playwright.exitCode === 0 ? "pass" : "fail",
        message:
          playwright.exitCode === 0
            ? "Playwright portfolio suite exited 0"
            : `Playwright portfolio suite exited ${String(playwright.exitCode)}`,
      });
      for (const note of playwright.notes) {
        notes.push(note);
      }
    }
  } else {
    playwright = null;
    findings.push({
      id: "playwright.skipped",
      severity: "pass",
      message: `Playwright stage skipped (mode=${input.mode}); CI path still documented`,
    });
  }

  const hasFail = findings.some((f) => f.severity === "fail");
  const blocked =
    hasFail &&
    findings.some(
      (f) =>
        f.id === "playwright.skipped" &&
        f.severity === "fail" &&
        (input.playwright?.skipReason ?? "").includes("environment"),
    );

  const verdict: PortfolioRecertVerdict = !hasFail
    ? "PASS"
    : blocked
      ? "BLOCKED"
      : "FAIL";

  return {
    schemaVersion: "1.0.0",
    programmeId: "APZHUB-ENG-0005",
    backlogItemId: "R12-QA-01",
    knownLimitationId: "PL12-KL-06",
    executedAt: input.executedAt ?? new Date().toISOString(),
    environment: input.environment ?? "dev",
    mode: input.mode,
    findings,
    verdict,
    artefacts: input.artefacts,
    docker,
    playwright,
    portfolioProducts: [...PORTFOLIO_RECERT_PRODUCT_SURFACE],
    notes,
    artefactPaths: [...PORTFOLIO_RECERT_REQUIRED_ARTEFACTS],
  };
}

export function validatePortfolioRecertEvidence(evidence: PortfolioRecertEvidence): {
  readonly ok: boolean;
  readonly errors: readonly string[];
} {
  const errors: string[] = [];
  if (evidence.schemaVersion !== "1.0.0") {
    errors.push("schemaVersion must be 1.0.0");
  }
  if (evidence.programmeId !== "APZHUB-ENG-0005") {
    errors.push("programmeId must be APZHUB-ENG-0005");
  }
  if (evidence.backlogItemId !== "R12-QA-01") {
    errors.push("backlogItemId must be R12-QA-01");
  }
  if (evidence.knownLimitationId !== "PL12-KL-06") {
    errors.push("knownLimitationId must be PL12-KL-06");
  }
  if (!evidence.executedAt) {
    errors.push("executedAt required");
  }
  if (!Array.isArray(evidence.findings) || evidence.findings.length === 0) {
    errors.push("findings required");
  }
  if (!["PASS", "FAIL", "BLOCKED"].includes(evidence.verdict)) {
    errors.push("verdict invalid");
  }
  return { ok: errors.length === 0, errors };
}
