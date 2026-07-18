/**
 * Testing workbench command catalogue and permission-gated executor.
 */

import { TestingClientError } from "./errors";
import { hasTestingPermission, type TestingPermissionSource } from "./permissions";
import * as testingApi from "./testing-api";
import {
  testingExecutiveDashboardsPath,
  testingPipelineRunPath,
  testingPipelineWorkflowsPath,
  TESTING_BASE,
} from "./routes";
import type {
  CreateCaseInput,
  CreatePlanInput,
  CreateSuiteInput,
  EvidenceSubmitInput,
  StartExecutionInput,
} from "./types";

export const TESTING_COMMANDS = [
  {
    id: "create_plan",
    label: "Create test plan",
    permission: "testing.plans.create",
  },
  {
    id: "create_suite",
    label: "Create test suite",
    permission: "testing.suites.create",
  },
  {
    id: "create_case",
    label: "Create test case",
    permission: "testing.cases.create",
  },
  {
    id: "start_execution",
    label: "Start execution",
    permission: "testing.executions.execute",
  },
  {
    id: "pause_execution",
    label: "Pause execution",
    permission: "testing.executions.execute",
  },
  {
    id: "resume_execution",
    label: "Resume execution",
    permission: "testing.executions.execute",
  },
  {
    id: "submit_evidence",
    label: "Submit evidence",
    permission: "evidence.register",
  },
  {
    id: "approve",
    label: "Approve certification",
    permission: "certification.approve",
  },
  {
    id: "reject",
    label: "Reject certification",
    permission: "certification.reject",
  },
  {
    id: "review",
    label: "Send certification to review",
    permission: "certification.review",
  },
  {
    id: "archive",
    label: "Archive certification",
    permission: "certification.records.transition",
  },
  {
    id: "pipeline_refresh",
    label: "Refresh pipeline run",
    permission: "pipeline.import",
  },
  {
    id: "pipeline_open_workflow",
    label: "Open Workflow",
    permission: "pipeline.read",
  },
  {
    id: "pipeline_open_run",
    label: "Open Run",
    permission: "pipeline.read",
  },
  {
    id: "pipeline_view_artifacts",
    label: "View Artifacts",
    permission: "pipeline.read",
  },
  {
    id: "pipeline_view_summary",
    label: "View Summary",
    permission: "pipeline.read",
  },
  {
    id: "pipeline_view_evidence",
    label: "View Evidence",
    permission: "pipeline.read",
  },
  {
    id: "pipeline_view_coverage",
    label: "View Coverage",
    permission: "pipeline.read",
  },
  {
    id: "pipeline_view_certification",
    label: "View Certification",
    permission: "pipeline.read",
  },
  {
    id: "pipeline_view_release",
    label: "View Release",
    permission: "pipeline.read",
  },
  {
    id: "ei_refresh",
    label: "Refresh Engineering Intelligence",
    permission: "engineering.view",
  },
  {
    id: "ei_compare_baselines",
    label: "Compare Baselines",
    permission: "benchmark.view",
  },
  {
    id: "ei_open_release",
    label: "Open Release",
    permission: "release.view",
  },
  {
    id: "ei_open_certification",
    label: "Open Certification",
    permission: "certification.view",
  },
  {
    id: "ei_open_coverage",
    label: "Open Coverage",
    permission: "coverage.view",
  },
  {
    id: "ei_open_evidence",
    label: "Open Evidence",
    permission: "evidence.read",
  },
  {
    id: "ei_open_pipeline",
    label: "Open Pipeline",
    permission: "pipeline.read",
  },
  {
    id: "ei_export_summary",
    label: "Export Summary",
    permission: "analytics.view",
  },
  {
    id: "dash_refresh",
    label: "Refresh Dashboards",
    permission: "engineering.view",
  },
  {
    id: "dash_compare",
    label: "Compare Dashboard Period",
    permission: "benchmark.view",
  },
  {
    id: "dash_open_release",
    label: "Open Release",
    permission: "release.view",
  },
  {
    id: "dash_open_certification",
    label: "Open Certification",
    permission: "certification.view",
  },
  {
    id: "dash_open_pipeline",
    label: "Open Pipeline",
    permission: "pipeline.read",
  },
  {
    id: "dash_open_coverage",
    label: "Open Coverage",
    permission: "coverage.view",
  },
  {
    id: "dash_open_evidence",
    label: "Open Evidence",
    permission: "evidence.read",
  },
  {
    id: "dash_open_testing",
    label: "Open Testing",
    permission: "testing.view",
  },
  {
    id: "dash_open_quality",
    label: "Open Quality",
    permission: "quality.view",
  },
] as const;

export type TestingCommandId = (typeof TESTING_COMMANDS)[number]["id"];

export type TestingCommandDefinition = (typeof TESTING_COMMANDS)[number];

export type CertificationDecisionArgs = {
  certificationId: string;
  comment?: string;
};

export type TestingCommandArgsMap = {
  create_plan: CreatePlanInput;
  create_suite: CreateSuiteInput;
  create_case: CreateCaseInput;
  start_execution: StartExecutionInput;
  pause_execution: { executionId: string };
  resume_execution: { executionId: string };
  submit_evidence: EvidenceSubmitInput;
  approve: CertificationDecisionArgs;
  reject: CertificationDecisionArgs;
  review: CertificationDecisionArgs;
  archive: { certificationId: string };
  pipeline_refresh: {
    owner: string;
    repo: string;
    runId: string | number;
    pipelineKey?: string;
    pipelineId?: string;
  };
  pipeline_open_workflow: { owner: string; repo: string };
  pipeline_open_run: { owner: string; repo: string; runId: string };
  pipeline_view_artifacts: { owner: string; repo: string; runId: string };
  pipeline_view_summary: { owner: string; repo: string; runId: string };
  pipeline_view_evidence: { runId?: string };
  pipeline_view_coverage: { runId?: string };
  pipeline_view_certification: { runId?: string };
  pipeline_view_release: { runId?: string };
  ei_refresh: Record<string, never>;
  ei_compare_baselines: Record<string, never>;
  ei_open_release: Record<string, never>;
  ei_open_certification: Record<string, never>;
  ei_open_coverage: Record<string, never>;
  ei_open_evidence: Record<string, never>;
  ei_open_pipeline: Record<string, never>;
  ei_export_summary: Record<string, never>;
  dash_refresh: Record<string, never>;
  dash_compare: Record<string, never>;
  dash_open_release: Record<string, never>;
  dash_open_certification: Record<string, never>;
  dash_open_pipeline: Record<string, never>;
  dash_open_coverage: Record<string, never>;
  dash_open_evidence: Record<string, never>;
  dash_open_testing: Record<string, never>;
  dash_open_quality: Record<string, never>;
};

const COMMAND_BY_ID = new Map<TestingCommandId, TestingCommandDefinition>(
  TESTING_COMMANDS.map((command) => [command.id, command]),
);

function requirePermission(
  command: TestingCommandDefinition,
  permissions?: TestingPermissionSource,
): void {
  if (!hasTestingPermission(permissions, command.permission)) {
    throw new TestingClientError(
      `Missing permission: ${command.permission}`,
      "FORBIDDEN",
      403,
    );
  }
}

export async function executeTestingCommand<T extends TestingCommandId>(
  commandId: T,
  args: TestingCommandArgsMap[T],
  permissions?: TestingPermissionSource,
): Promise<unknown> {
  const command = COMMAND_BY_ID.get(commandId);
  if (!command) {
    throw new TestingClientError(
      `Unknown command: ${commandId}`,
      "UNKNOWN_COMMAND",
      400,
    );
  }

  requirePermission(command, permissions);

  switch (commandId) {
    case "create_plan":
      return testingApi.createPlan(args as TestingCommandArgsMap["create_plan"]);
    case "create_suite":
      return testingApi.createSuite(args as TestingCommandArgsMap["create_suite"]);
    case "create_case":
      return testingApi.createCase(args as TestingCommandArgsMap["create_case"]);
    case "start_execution":
      return testingApi.startExecution(
        args as TestingCommandArgsMap["start_execution"],
      );
    case "pause_execution": {
      const { executionId } = args as TestingCommandArgsMap["pause_execution"];
      return testingApi.pauseExecution(executionId);
    }
    case "resume_execution": {
      const { executionId } = args as TestingCommandArgsMap["resume_execution"];
      return testingApi.resumeExecution(executionId);
    }
    case "submit_evidence":
      return testingApi.submitEvidence(
        args as TestingCommandArgsMap["submit_evidence"],
      );
    case "approve":
      return testingApi.decideCertification({
        ...(args as TestingCommandArgsMap["approve"]),
        decision: "approve",
      });
    case "reject":
      return testingApi.decideCertification({
        ...(args as TestingCommandArgsMap["reject"]),
        decision: "reject",
      });
    case "review":
      return testingApi.decideCertification({
        ...(args as TestingCommandArgsMap["review"]),
        decision: "review",
      });
    case "archive": {
      const { certificationId } = args as TestingCommandArgsMap["archive"];
      return testingApi.archiveCertification(certificationId);
    }
    case "pipeline_refresh":
      return testingApi.importPipelineFromProvider(
        args as TestingCommandArgsMap["pipeline_refresh"],
      );
    case "pipeline_open_workflow": {
      const { owner, repo } = args as TestingCommandArgsMap["pipeline_open_workflow"];
      return { href: testingPipelineWorkflowsPath(owner, repo) };
    }
    case "pipeline_open_run": {
      const { owner, repo, runId } = args as TestingCommandArgsMap["pipeline_open_run"];
      return { href: testingPipelineRunPath(owner, repo, runId) };
    }
    case "pipeline_view_artifacts":
    case "pipeline_view_summary": {
      const { owner, repo, runId } =
        args as TestingCommandArgsMap["pipeline_view_artifacts"];
      return {
        href: `${testingPipelineRunPath(owner, repo, runId)}#${commandId === "pipeline_view_artifacts" ? "artifacts" : "summary"}`,
      };
    }
    case "pipeline_view_evidence":
      return { href: `${TESTING_BASE}/evidence` };
    case "pipeline_view_coverage":
      return { href: `${TESTING_BASE}/coverage` };
    case "pipeline_view_certification":
      return { href: `${TESTING_BASE}/certification` };
    case "pipeline_view_release":
      return { href: `${TESTING_BASE}/release-readiness` };
    case "ei_refresh":
      return { href: `${TESTING_BASE}/engineering-intelligence` };
    case "ei_compare_baselines":
      return { href: `${TESTING_BASE}/engineering-intelligence#benchmarks` };
    case "ei_open_release":
      return { href: `${TESTING_BASE}/release-readiness` };
    case "ei_open_certification":
      return { href: `${TESTING_BASE}/certification` };
    case "ei_open_coverage":
      return { href: `${TESTING_BASE}/coverage` };
    case "ei_open_evidence":
      return { href: `${TESTING_BASE}/evidence` };
    case "ei_open_pipeline":
      return { href: `${TESTING_BASE}/pipelines` };
    case "ei_export_summary":
      return { href: `${TESTING_BASE}/engineering-intelligence#export` };
    case "dash_refresh":
      return { href: testingExecutiveDashboardsPath() };
    case "dash_compare":
      return { href: `${testingExecutiveDashboardsPath("historical-trends")}#compare` };
    case "dash_open_release":
      return { href: `${TESTING_BASE}/release-readiness` };
    case "dash_open_certification":
      return { href: `${TESTING_BASE}/certification` };
    case "dash_open_pipeline":
      return { href: `${TESTING_BASE}/pipelines` };
    case "dash_open_coverage":
      return { href: `${TESTING_BASE}/coverage` };
    case "dash_open_evidence":
      return { href: `${TESTING_BASE}/evidence` };
    case "dash_open_testing":
      return { href: TESTING_BASE };
    case "dash_open_quality":
      return { href: `${TESTING_BASE}/quality` };
    default: {
      const exhaustive: never = commandId;
      throw new TestingClientError(
        `Unhandled command: ${String(exhaustive)}`,
        "UNKNOWN_COMMAND",
        400,
      );
    }
  }
}

export function listAvailableTestingCommands(
  permissions?: TestingPermissionSource,
): readonly TestingCommandDefinition[] {
  return TESTING_COMMANDS.filter((command) =>
    hasTestingPermission(permissions, command.permission),
  );
}
