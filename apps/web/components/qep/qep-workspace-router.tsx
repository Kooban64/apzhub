"use client";

import { usePathname } from "next/navigation";

import {
  isQepDefectsRoute,
  isQepEnterpriseReportingRoute,
  isQepEnterpriseRequirementsRoute,
  isQepEvidenceRoute,
  isQepExecutionPlansRoute,
  isQepExecutionWorkspaceRoute,
  isQepSuitesRoute,
  isQepTestExecutionRoute,
  isQepTestPlansRoute,
  isQepTestSpecificationsRoute,
  isQepTraceabilityRoute,
  isQepVerificationRoute,
  isQepAutomationRoute,
  isQepScmRoute,
  isQepQiRoute,
  isQepDashboardsRoute,
  isQepQualityFlowsRoute,
  isQepWorkspaceRoute,
} from "@/lib/qep/routes";

import { QepAutomationRouterView } from "./qep-automation-views";
import { QepDashboardsRouterView } from "./qep-dashboards-views";
import { QepQualityFlowRouterView } from "./qep-quality-flow-views";
import { QepQualityIntelligenceRouterView } from "./qep-quality-intelligence-views";
import { QepScmRouterView } from "./qep-scm-views";

import { QepDefectsRouterView } from "./qep-defects-views";
import { QepEnterpriseReportingRouterView } from "./qep-enterprise-reporting-views";
import { QepEnterpriseRequirementsRouterView } from "./qep-enterprise-requirements-views";
import { QepEvidenceRouterView } from "./qep-evidence-views";
import { QepExecutionPlansRouterView } from "./qep-execution-plans-views";
import { QepExecutionWorkspaceRouterView } from "./qep-execution-workspace-views";
import { QepRequirementsRouterView } from "./qep-requirements-views";
import { QepSuitesRouterView } from "./qep-suites-views";
import { QepTestExecutionRouterView } from "./qep-test-execution-views";
import { QepTestPlanRouterView } from "./qep-test-plan-views";
import { QepTestSpecificationRouterView } from "./qep-test-specification-views";
import { QepTraceabilityRouterView } from "./qep-traceability-views";
import { QepVerificationRouterView } from "./qep-verification-views";

/**
 * QEP workspace router — Quality Flow Workspace (flagship) + Caps A–F + ENG modules.
 */
export function QepWorkspaceRouter() {
  const pathname = usePathname() ?? "";

  if (!isQepWorkspaceRoute(pathname)) {
    return null;
  }

  if (isQepQualityFlowsRoute(pathname)) {
    return <QepQualityFlowRouterView />;
  }

  if (isQepAutomationRoute(pathname)) {
    return <QepAutomationRouterView />;
  }

  if (isQepScmRoute(pathname)) {
    return <QepScmRouterView />;
  }

  if (isQepQiRoute(pathname)) {
    return <QepQualityIntelligenceRouterView />;
  }

  if (isQepDashboardsRoute(pathname)) {
    return <QepDashboardsRouterView />;
  }

  if (isQepSuitesRoute(pathname)) {
    return <QepSuitesRouterView pathname={pathname} />;
  }

  if (isQepExecutionPlansRoute(pathname)) {
    return <QepExecutionPlansRouterView pathname={pathname} />;
  }

  if (isQepExecutionWorkspaceRoute(pathname)) {
    return <QepExecutionWorkspaceRouterView pathname={pathname} />;
  }

  if (isQepDefectsRoute(pathname)) {
    return <QepDefectsRouterView pathname={pathname} />;
  }

  if (isQepEnterpriseRequirementsRoute(pathname)) {
    return <QepEnterpriseRequirementsRouterView pathname={pathname} />;
  }

  if (isQepEnterpriseReportingRoute(pathname)) {
    return <QepEnterpriseReportingRouterView pathname={pathname} />;
  }

  if (isQepEvidenceRoute(pathname)) {
    return <QepEvidenceRouterView pathname={pathname} />;
  }

  if (isQepTestSpecificationsRoute(pathname)) {
    return <QepTestSpecificationRouterView pathname={pathname} />;
  }

  if (isQepTestExecutionRoute(pathname)) {
    return <QepTestExecutionRouterView pathname={pathname} />;
  }

  if (isQepTestPlansRoute(pathname)) {
    return <QepTestPlanRouterView pathname={pathname} />;
  }

  if (isQepVerificationRoute(pathname)) {
    return <QepVerificationRouterView pathname={pathname} />;
  }

  if (isQepTraceabilityRoute(pathname)) {
    return <QepTraceabilityRouterView pathname={pathname} />;
  }

  return <QepRequirementsRouterView pathname={pathname} />;
}
