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
  isQepCertificationRoute,
  isQepQualityJourneyRoute,
  isQepEarlyCheckRoute,
  isQepPortfolioRoute,
  isQepHomeRoute,
  isQepReleaseReadinessRoute,
  isQepSearchRoute,
  isQepIntegrationsRoute,
  isQepAiWorkspaceRoute,
  isQepRequirementsRoute,
  isQepWorkspaceRoute,
} from "@/lib/qep/routes";

import { QepAutomationRouterView } from "./qep-automation-views";
import { QepCertificationRouterView } from "./qep-certification-views";
import { QepDashboardsRouterView } from "./qep-dashboards-views";
import { QepEarlyCheckRouterView } from "./qep-early-check-views";
import { QepHomeRouterView } from "./qep-home-views";
import { QepIntegrationsRouterView } from "./qep-integrations-views";
import { QepAiWorkspaceRouterView } from "./qep-ai-workspace-views";
import { QepPortfolioRouterView } from "./qep-portfolio-views";
import { QepQualityFlowRouterView } from "./qep-quality-flow-views";
import { QepQualityIntelligenceRouterView } from "./qep-quality-intelligence-views";
import { QepQualityJourneyRouterView } from "./qep-quality-journey-views";
import { QepReleaseReadinessRouterView } from "./qep-release-readiness-views";
import { QepSearchRouterView } from "./qep-search-view";
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
import { QepUnavailableModuleView } from "./qep-unavailable-module-view";
import { QepVerificationRouterView } from "./qep-verification-views";

/**
 * QEP workspace router — Home / Release Control (SPR-201) + Quality Flows + Caps A–F.
 */
export function QepWorkspaceRouter() {
  const pathname = usePathname() ?? "";

  if (!isQepWorkspaceRoute(pathname)) {
    return null;
  }

  if (isQepHomeRoute(pathname)) {
    return <QepHomeRouterView />;
  }

  if (isQepSearchRoute(pathname)) {
    return <QepSearchRouterView />;
  }

  if (isQepReleaseReadinessRoute(pathname)) {
    return <QepReleaseReadinessRouterView />;
  }

  if (isQepIntegrationsRoute(pathname)) {
    return <QepIntegrationsRouterView />;
  }

  if (isQepAiWorkspaceRoute(pathname)) {
    return <QepAiWorkspaceRouterView />;
  }

  if (isQepQualityFlowsRoute(pathname)) {
    return <QepQualityFlowRouterView />;
  }

  if (isQepQualityJourneyRoute(pathname)) {
    return <QepQualityJourneyRouterView />;
  }

  if (isQepEarlyCheckRoute(pathname)) {
    return <QepEarlyCheckRouterView />;
  }

  if (isQepPortfolioRoute(pathname)) {
    return <QepPortfolioRouterView />;
  }

  if (isQepCertificationRoute(pathname)) {
    return <QepCertificationRouterView />;
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

  if (isQepRequirementsRoute(pathname)) {
    return <QepRequirementsRouterView pathname={pathname} />;
  }

  // Q6: never fall through stub/unknown paths into Requirements.
  return <QepUnavailableModuleView pathname={pathname} />;
}
