/** Testing workspace route helpers (APZTCMS-010 / APZTCMS-018 / APZTCMS-023). */

import {
  isExecutiveDashboardCategory,
  resolveExecutiveDashboardCategory,
  type ExecutiveDashboardCategory,
} from "./executive-dashboard-categories";

export const TESTING_BASE = "/workspace/testing";

export const TESTING_SECTIONS = [
  "requirements",
  "plans",
  "suites",
  "cases",
  "executions",
  "automation",
  "evidence",
  "coverage",
  "defects",
  "quality",
  "certification",
  "release-readiness",
  "pipelines",
  "engineering-intelligence",
  "executive-dashboards",
  "reports",
  "administration",
] as const;

export type TestingSection = (typeof TESTING_SECTIONS)[number];

export type TestingRouteResolution =
  | { readonly kind: "dashboard" }
  | { readonly kind: "requirements" }
  | { readonly kind: "plans" }
  | { readonly kind: "plan-detail"; readonly planId: string }
  | { readonly kind: "suites" }
  | { readonly kind: "cases" }
  | { readonly kind: "executions" }
  | { readonly kind: "execution-detail"; readonly executionId: string }
  | { readonly kind: "automation" }
  | { readonly kind: "evidence" }
  | { readonly kind: "coverage" }
  | { readonly kind: "defects" }
  | { readonly kind: "quality" }
  | { readonly kind: "certification" }
  | { readonly kind: "certification-detail"; readonly certificationId: string }
  | { readonly kind: "release-readiness" }
  | { readonly kind: "pipelines" }
  | { readonly kind: "engineering-intelligence" }
  | {
      readonly kind: "executive-dashboards";
      readonly category: ExecutiveDashboardCategory;
    }
  | {
      readonly kind: "pipeline-repository";
      readonly owner: string;
      readonly repo: string;
    }
  | {
      readonly kind: "pipeline-workflows";
      readonly owner: string;
      readonly repo: string;
    }
  | {
      readonly kind: "pipeline-runs";
      readonly owner: string;
      readonly repo: string;
    }
  | {
      readonly kind: "pipeline-run-detail";
      readonly owner: string;
      readonly repo: string;
      readonly runId: string;
    }
  | { readonly kind: "reports" }
  | { readonly kind: "administration" }
  | { readonly kind: "unknown" };

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isTestingRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === TESTING_BASE || normalized.startsWith(`${TESTING_BASE}/`);
}

export function resolveTestingSection(pathname: string): TestingSection | "dashboard" {
  const normalized = normalizePath(pathname);
  if (normalized === TESTING_BASE) return "dashboard";
  const suffix = normalized.slice(TESTING_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (TESTING_SECTIONS.includes(section as TestingSection)) {
    return section as TestingSection;
  }
  return "dashboard";
}

function parseDetailId(pathname: string, segment: string): string | null {
  const normalized = normalizePath(pathname);
  const prefix = `${TESTING_BASE}/${segment}/`;
  if (!normalized.startsWith(prefix)) return null;
  const id = normalized.slice(prefix.length).split("/")[0]?.trim();
  if (!id || id === "new" || id === "create") return null;
  return id;
}

function resolvePipelineRoute(normalized: string): TestingRouteResolution | null {
  const prefix = `${TESTING_BASE}/pipelines`;
  if (normalized === prefix) return { kind: "pipelines" };
  if (!normalized.startsWith(`${prefix}/`)) return null;

  const rest = normalized.slice(prefix.length + 1).split("/");
  if (rest[0] === "repos" && rest[1] && rest[2]) {
    const owner = decodeURIComponent(rest[1]);
    const repo = decodeURIComponent(rest[2]);
    if (rest.length === 3) return { kind: "pipeline-repository", owner, repo };
    if (rest[3] === "workflows" && rest.length === 4) {
      return { kind: "pipeline-workflows", owner, repo };
    }
    if (rest[3] === "runs" && rest.length === 4) {
      return { kind: "pipeline-runs", owner, repo };
    }
    if (rest[3] === "runs" && rest[4] && rest.length === 5) {
      return {
        kind: "pipeline-run-detail",
        owner,
        repo,
        runId: decodeURIComponent(rest[4]),
      };
    }
  }
  return { kind: "pipelines" };
}

function resolveExecutiveDashboardsRoute(
  normalized: string,
): TestingRouteResolution | null {
  const prefix = `${TESTING_BASE}/executive-dashboards`;
  if (normalized === prefix) {
    return { kind: "executive-dashboards", category: "executive" };
  }
  if (!normalized.startsWith(`${prefix}/`)) return null;
  const rest = normalized.slice(prefix.length + 1).split("/")[0] ?? "";
  if (rest && isExecutiveDashboardCategory(rest)) {
    return { kind: "executive-dashboards", category: rest };
  }
  return {
    kind: "executive-dashboards",
    category: resolveExecutiveDashboardCategory(rest),
  };
}

export function resolveTestingRoute(pathname: string): TestingRouteResolution {
  const normalized = normalizePath(pathname);
  if (!isTestingRoute(normalized)) return { kind: "unknown" };
  if (normalized === TESTING_BASE) return { kind: "dashboard" };

  const pipelineRoute = resolvePipelineRoute(normalized);
  if (pipelineRoute) return pipelineRoute;

  const executiveRoute = resolveExecutiveDashboardsRoute(normalized);
  if (executiveRoute) return executiveRoute;

  const planId = parseDetailId(normalized, "plans");
  if (planId) return { kind: "plan-detail", planId };

  const executionId = parseDetailId(normalized, "executions");
  if (executionId) return { kind: "execution-detail", executionId };

  const certificationId = parseDetailId(normalized, "certification");
  if (certificationId) return { kind: "certification-detail", certificationId };

  const section = resolveTestingSection(normalized);
  if (section === "dashboard") return { kind: "dashboard" };
  if (section === "executive-dashboards") {
    return { kind: "executive-dashboards", category: "executive" };
  }
  return { kind: section };
}

export function testingPlanPath(planId?: string): string {
  return planId ? `${TESTING_BASE}/plans/${planId}` : `${TESTING_BASE}/plans`;
}

export function testingExecutionPath(executionId?: string): string {
  return executionId
    ? `${TESTING_BASE}/executions/${executionId}`
    : `${TESTING_BASE}/executions`;
}

export function testingCertificationPath(certificationId?: string): string {
  return certificationId
    ? `${TESTING_BASE}/certification/${certificationId}`
    : `${TESTING_BASE}/certification`;
}

export function testingPipelinesPath(): string {
  return `${TESTING_BASE}/pipelines`;
}

export function testingPipelineRepoPath(owner: string, repo: string): string {
  return `${TESTING_BASE}/pipelines/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

export function testingPipelineWorkflowsPath(owner: string, repo: string): string {
  return `${testingPipelineRepoPath(owner, repo)}/workflows`;
}

export function testingPipelineRunsPath(owner: string, repo: string): string {
  return `${testingPipelineRepoPath(owner, repo)}/runs`;
}

export function testingPipelineRunPath(
  owner: string,
  repo: string,
  runId: string,
): string {
  return `${testingPipelineRunsPath(owner, repo)}/${encodeURIComponent(runId)}`;
}

export function testingEngineeringIntelligencePath(): string {
  return `${TESTING_BASE}/engineering-intelligence`;
}

export function testingExecutiveDashboardsPath(
  category?: ExecutiveDashboardCategory,
): string {
  if (!category || category === "executive") {
    return `${TESTING_BASE}/executive-dashboards`;
  }
  return `${TESTING_BASE}/executive-dashboards/${category}`;
}
