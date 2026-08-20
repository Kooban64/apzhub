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
  isQepTestExecutionAssignedRoute,
  isQepTestExecutionExplorerRoute,
  isQepTestExecutionNewRoute,
  isQepTestExecutionReviewRoute,
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
  isQepQualityGraphRoute,
  isQepDomainsRoute,
  isQepEarlyCheckRoute,
  isQepPortfolioRoute,
  parseQepApplicationRouteId,
  isQepHomeRoute,
  isQepMyWorkRoute,
  isQepReleaseReadinessRoute,
  isQepSearchRoute,
  isQepIntegrationsRoute,
  isQepAiWorkspaceRoute,
  isQepAiPhase7Route,
  isQepLearningRoute,
  isQepMcpRoute,
  isQepRequirementsRoute,
  isQepWorkspaceRoute,
} from "@/lib/qep/routes";
import {
  isQepExperiencePlansRoute,
  isQepExploratorySessionsRoute,
} from "@apzhub/qep-experience/presentation";
import {
  isQepQualityGatesRoute,
  isQepQualityRiskRoute,
} from "@apzhub/qep-assurance/presentation";

import { QepAutomationRouterView } from "./qep-automation-views";
import { QepEarlyCheckRouterView } from "./qep-early-check-views";
import { QepHomeRouterView } from "./qep-home-views";
import { QepMyWorkView } from "./qep-my-work-view";
import { QepIntegrationsRouterView } from "./qep-integrations-views";
import { QepPhase7RouterView, QepLegacyAiSupersededView } from "./qep-phase-7-ai-views";
import { QepApplicationsView } from "./qep-applications-view";
import { QepApplicationDetailView } from "./qep-application-detail-view";
import { QepQualityFlowRouterView } from "./qep-quality-flow-views";
import { QepQualityIntelligenceRouterView } from "./qep-quality-intelligence-views";
import { QepQualityJourneyRouterView } from "./qep-quality-journey-views";
import { QepPrQualityRouterView } from "./qep-pr-quality-views";
import { QepQualityGraphRouterView } from "./qep-quality-graph-views";
import { QepDomainsRouterView } from "./qep-domains-views";
import { QepDashboardsRouterView } from "./qep-dashboards-views";
import { QepSearchRouterView } from "./qep-search-view";
import { QepScmRouterView } from "./qep-scm-views";
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
import { QepTestExecutionRouterView } from "./qep-test-execution-views";
import { QepTestSpecificationRouterView } from "./qep-test-specification-views";
import { QepPhase3TestCaseDesignerView } from "./qep-phase-3-test-case-designer-view";
import { QepPhase3TestCaseLibraryView } from "./qep-phase-3-test-case-library-view";
import { QepPhase3TestPlansView } from "./qep-phase-3-test-plans-view";
import { QepPhase3TestSuitesView } from "./qep-phase-3-test-suites-view";
import { QepPhase4ExecutionsView } from "./qep-phase-4-executions-view";
import { QepPhase5ExploratorySessionsView } from "./qep-phase-5-exploratory-sessions-view";
import { QepPhase5ExperiencePlansView } from "./qep-phase-5-experience-plans-view";
import { QepPhase6QualityRiskView } from "./qep-phase-6-quality-risk-view";
import { QepPhase6QualityGatesView } from "./qep-phase-6-quality-gates-view";
import { QepPhase6ReleaseReadinessView } from "./qep-phase-6-release-readiness-view";
import { QepPhase6CertificationView } from "./qep-phase-6-certification-view";
import {
  isQepTestSpecificationsExplorerRoute,
  isQepTestSpecificationsNewRoute,
  isQepTestSpecificationsReviewRoute,
  isQepTestSpecificationsSearchRoute,
  parseQepTestSpecificationRouteId,
} from "@apzhub/qep-test-specifications/presentation";
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
    return <QepPhase6ReleaseReadinessView />;
  }

  if (isQepIntegrationsRoute(pathname)) {
    return <QepIntegrationsRouterView />;
  }

  if (isQepAiPhase7Route(pathname) || isQepAiWorkspaceRoute(pathname)) {
    return <QepPhase7RouterView pathname={pathname} />;
  }

  if (isQepMcpRoute(pathname)) {
    return <QepLegacyAiSupersededView surface="MCP / DX" />;
  }

  if (isQepQualityRiskRoute(pathname)) {
    return <QepPhase6QualityRiskView pathname={pathname} />;
  }

  if (isQepQualityGatesRoute(pathname)) {
    return <QepPhase6QualityGatesView />;
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
    return <QepPhase3TestSuitesView pathname="/workspace/qep/suites" />;
  }
  if (
    isPathPrefix(pathname, "/workspace/qep/execution") &&
    !isQepExecutionPlansRoute(pathname) &&
    !isQepExecutionWorkspaceRoute(pathname)
  ) {
    return <QepPhase4ExecutionsView pathname="/workspace/qep/test-execution" />;
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

  if (isQepQualityGraphRoute(pathname)) {
    return <QepQualityGraphRouterView />;
  }

  if (isQepDomainsRoute(pathname)) {
    return <QepDomainsRouterView />;
  }

  if (isQepQualityJourneyRoute(pathname)) {
    return <QepQualityJourneyRouterView />;
  }

  if (isQepEarlyCheckRoute(pathname)) {
    return <QepEarlyCheckRouterView />;
  }

  if (isQepPortfolioRoute(pathname)) {
    const applicationId = parseQepApplicationRouteId(pathname);
    if (applicationId) {
      return <QepApplicationDetailView applicationId={applicationId} />;
    }
    return <QepApplicationsView />;
  }

  if (isQepCertificationRoute(pathname)) {
    return <QepPhase6CertificationView />;
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
    return <QepPhase3TestSuitesView pathname={pathname} />;
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
    const id = parseQepTestSpecificationRouteId(pathname);
    if (id) return <QepPhase3TestCaseDesignerView testCaseId={id} />;
    if (isQepTestSpecificationsNewRoute(pathname)) {
      return <QepPhase3TestCaseDesignerView />;
    }
    if (
      isQepTestSpecificationsExplorerRoute(pathname) ||
      isQepTestSpecificationsReviewRoute(pathname) ||
      isQepTestSpecificationsSearchRoute(pathname)
    ) {
      return <QepTestSpecificationRouterView pathname={pathname} />;
    }
    return <QepPhase3TestCaseLibraryView />;
  }

  if (isQepTestExecutionRoute(pathname)) {
    if (
      isQepTestExecutionExplorerRoute(pathname) ||
      isQepTestExecutionAssignedRoute(pathname) ||
      isQepTestExecutionReviewRoute(pathname) ||
      isQepTestExecutionNewRoute(pathname)
    ) {
      return <QepTestExecutionRouterView pathname={pathname} />;
    }
    return <QepPhase4ExecutionsView pathname={pathname} />;
  }

  if (isQepTestPlansRoute(pathname)) {
    return <QepPhase3TestPlansView pathname={pathname} />;
  }

  if (isQepExploratorySessionsRoute(pathname)) {
    return <QepPhase5ExploratorySessionsView pathname={pathname} />;
  }

  if (isQepExperiencePlansRoute(pathname)) {
    return <QepPhase5ExperiencePlansView pathname={pathname} />;
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
