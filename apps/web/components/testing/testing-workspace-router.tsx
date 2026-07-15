"use client";

import { usePathname } from "next/navigation";

import type { TestingPermissionSource } from "@/lib/testing/permissions";
import { resolveTestingRoute } from "@/lib/testing/routes";

import {
  TestingAdministrationView,
  TestingAutomationView,
  TestingCasesView,
  TestingCoverageView,
  TestingDefectsView,
  TestingEvidenceView,
  TestingPlansView,
  TestingQualityView,
  TestingReportsView,
  TestingRequirementsView,
  TestingSuitesView,
} from "./testing-catalog-views";
import { TestingCertificationView } from "./testing-certification-view";
import { TestingDashboardView } from "./testing-dashboard-view";
import { TestingEngineeringIntelligenceView } from "./testing-engineering-intelligence-view";
import { TestingExecutiveDashboardsView } from "./testing-executive-dashboards-view";
import { TestingExecutionView } from "./testing-execution-view";
import { TestingPipelinesView } from "./testing-pipelines-view";
import { TestingReleaseReadinessView } from "./testing-release-readiness-view";
import { EmptyState, PageShell } from "./testing-ui";

/** Wildcard permissions so authenticated Testing nav users can act; API remains authoritative. */
const DEFAULT_UI_PERMISSIONS: readonly string[] = [
  "testing.*",
  "certification.*",
  "evidence.*",
  "automation.*",
  "coverage.*",
  "defects.*",
  "quality.*",
  "release.*",
  "reporting.*",
  "pipeline.*",
  "engineering.*",
  "analytics.*",
  "benchmark.*",
  "trend.*",
];

export function TestingWorkspaceRouter({
  permissions = DEFAULT_UI_PERMISSIONS,
}: {
  readonly permissions?: TestingPermissionSource;
}) {
  const pathname = usePathname();
  const route = resolveTestingRoute(pathname);

  switch (route.kind) {
    case "dashboard":
      return <TestingDashboardView permissions={permissions} />;
    case "requirements":
      return <TestingRequirementsView permissions={permissions} />;
    case "plans":
      return <TestingPlansView permissions={permissions} />;
    case "plan-detail":
      return (
        <TestingPlansView planId={route.planId} permissions={permissions} />
      );
    case "suites":
      return <TestingSuitesView permissions={permissions} />;
    case "cases":
      return <TestingCasesView permissions={permissions} />;
    case "executions":
      return <TestingExecutionView permissions={permissions} />;
    case "execution-detail":
      return (
        <TestingExecutionView
          executionId={route.executionId}
          permissions={permissions}
        />
      );
    case "automation":
      return <TestingAutomationView permissions={permissions} />;
    case "evidence":
      return <TestingEvidenceView permissions={permissions} />;
    case "coverage":
      return <TestingCoverageView permissions={permissions} />;
    case "defects":
      return <TestingDefectsView permissions={permissions} />;
    case "quality":
      return <TestingQualityView permissions={permissions} />;
    case "certification":
      return <TestingCertificationView permissions={permissions} />;
    case "certification-detail":
      return (
        <TestingCertificationView
          certificationId={route.certificationId}
          permissions={permissions}
        />
      );
    case "release-readiness":
      return <TestingReleaseReadinessView permissions={permissions} />;
    case "pipelines":
      return <TestingPipelinesView permissions={permissions} mode="home" />;
    case "engineering-intelligence":
      return <TestingEngineeringIntelligenceView permissions={permissions} />;
    case "executive-dashboards":
      return (
        <TestingExecutiveDashboardsView
          permissions={permissions}
          category={route.category}
        />
      );
    case "pipeline-repository":
      return (
        <TestingPipelinesView
          permissions={permissions}
          mode="repository"
          owner={route.owner}
          repo={route.repo}
        />
      );
    case "pipeline-workflows":
      return (
        <TestingPipelinesView
          permissions={permissions}
          mode="workflows"
          owner={route.owner}
          repo={route.repo}
        />
      );
    case "pipeline-runs":
      return (
        <TestingPipelinesView
          permissions={permissions}
          mode="runs"
          owner={route.owner}
          repo={route.repo}
        />
      );
    case "pipeline-run-detail":
      return (
        <TestingPipelinesView
          permissions={permissions}
          mode="run-detail"
          owner={route.owner}
          repo={route.repo}
          runId={route.runId}
        />
      );
    case "reports":
      return <TestingReportsView permissions={permissions} />;
    case "administration":
      return <TestingAdministrationView permissions={permissions} />;
    default:
      return (
        <PageShell title="Testing">
          <EmptyState
            title="Unknown Testing route"
            description="Select a Testing sidebar item to continue."
          />
        </PageShell>
      );
  }
}
