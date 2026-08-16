"use client";

import { usePathname } from "next/navigation";

import { ProductAccessDeniedView } from "@/components/commercial/product-access-denied";
import { useSoftProductAccess } from "@/lib/commercial/use-soft-product-access";
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
  isQepPrQualityRoute,
  isQepEarlyCheckRoute,
  isQepPortfolioRoute,
  isQepHomeRoute,
  isQepMyWorkRoute,
  isQepReleaseReadinessRoute,
  isQepSearchRoute,
  isQepIntegrationsRoute,
  isQepAiWorkspaceRoute,
  isQepLearningRoute,
  isQepMcpRoute,
  isQepRequirementsRoute,
  isQepWorkspaceRoute,
} from "@/lib/qep/routes";

import { QepAutomationRouterView } from "./qep-automation-views";
import { QepCertificationRouterView } from "./qep-certification-views";
import { QepDashboardsRouterView } from "./qep-dashboards-views";
import { QepEarlyCheckRouterView } from "./qep-early-check-views";
import { QepHomeRouterView } from "./qep-home-views";
import { QepMyWorkView } from "./qep-my-work-view";
import { QepIntegrationsRouterView } from "./qep-integrations-views";
import { QepAiWorkspaceRouterView } from "./qep-ai-workspace-views";
import { QepMcpRouterView } from "./qep-mcp-views";
import { QepPortfolioRouterView } from "./qep-portfolio-views";
import { QepQualityFlowRouterView } from "./qep-quality-flow-views";
import { QepQualityIntelligenceRouterView } from "./qep-quality-intelligence-views";
import { QepQualityJourneyRouterView } from "./qep-quality-journey-views";
import { QepPrQualityRouterView } from "./qep-pr-quality-views";
import { QepReleaseReadinessRouterView } from "./qep-release-readiness-views";
import { QepSearchRouterView } from "./qep-search-view";
import { QepScmRouterView } from "./qep-scm-views";
import { QepRiskRouterView } from "./qep-risk-views";
import { QepKnowledgeRouterView } from "./qep-knowledge-views";
import { QepAdministrationRouterView } from "./qep-administration-views";
import { QepAuditRouterView } from "./qep-audit-views";
import { QepVerificationDesignRouterView } from "./qep-verification-design-views";

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

function isPathPrefix(pathname: string, base: string): boolean {
  const n = pathname.replace(/\/+$/, "") || "/";
  return n === base || n.startsWith(`${base}/`);
}

/**
 * QEP workspace router — Home / Release Control (SPR-201) + Quality Flows + Caps A–F
 * + SPR-210 MVP modules (Risk, Admin, Audit, Verification Design) + catalogue aliases.
 */
export function QepWorkspaceRouter() {
  const pathname = usePathname() ?? "";
  const productAccess = useSoftProductAccess("qep");

  if (!isQepWorkspaceRoute(pathname)) {
    return null;
  }

  if (productAccess === null) {
    return (
      <div className="p-6 text-sm text-[var(--color-muted-foreground)]">
        Checking product access…
      </div>
    );
  }
  if (productAccess.status === "denied") {
    return (
      <ProductAccessDeniedView
        productKey={productAccess.productKey}
        reason={productAccess.reason}
        breadcrumbs={["Quality", "Product required"]}
      />
    );
  }

  if (isQepMyWorkRoute(pathname)) {
    return <QepMyWorkView />;
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

  if (isQepMcpRoute(pathname)) {
    return <QepMcpRouterView />;
  }

  if (isPathPrefix(pathname, "/workspace/qep/risk")) {
    return <QepRiskRouterView />;
  }

  if (isQepLearningRoute(pathname)) {
    return <QepKnowledgeRouterView />;
  }

  if (isPathPrefix(pathname, "/workspace/qep/administration")) {
    return <QepAdministrationRouterView />;
  }

  if (isPathPrefix(pathname, "/workspace/qep/audit")) {
    return <QepAuditRouterView />;
  }

  if (isPathPrefix(pathname, "/workspace/qep/verification-design")) {
    return <QepVerificationDesignRouterView />;
  }

  // Catalogue aliases — Cap siblings are the SoR (SPR-210-B)
  if (isPathPrefix(pathname, "/workspace/qep/verification-library")) {
    return <QepSuitesRouterView pathname="/workspace/qep/suites" />;
  }
  if (
    isPathPrefix(pathname, "/workspace/qep/execution") &&
    !isQepExecutionPlansRoute(pathname) &&
    !isQepExecutionWorkspaceRoute(pathname)
  ) {
    return <QepTestExecutionRouterView pathname="/workspace/qep/test-execution" />;
  }
  if (
    isPathPrefix(pathname, "/workspace/qep/reporting") &&
    !isQepEnterpriseReportingRoute(pathname)
  ) {
    return (
      <QepEnterpriseReportingRouterView pathname="/workspace/qep/enterprise-reporting" />
    );
  }

  if (isQepQualityFlowsRoute(pathname)) {
    return <QepQualityFlowRouterView />;
  }

  if (isQepPrQualityRoute(pathname)) {
    return <QepPrQualityRouterView />;
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
