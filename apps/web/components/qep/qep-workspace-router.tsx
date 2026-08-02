"use client";

import { usePathname } from "next/navigation";

import {
  isQepEvidenceRoute,
  isQepExecutionPlansRoute,
  isQepSuitesRoute,
  isQepTestExecutionRoute,
  isQepTestPlansRoute,
  isQepTestSpecificationsRoute,
  isQepTraceabilityRoute,
  isQepVerificationRoute,
  isQepWorkspaceRoute,
} from "@/lib/qep/routes";

import { QepEvidenceRouterView } from "./qep-evidence-views";
import { QepExecutionPlansRouterView } from "./qep-execution-plans-views";
import { QepRequirementsRouterView } from "./qep-requirements-views";
import { QepSuitesRouterView } from "./qep-suites-views";
import { QepTestExecutionRouterView } from "./qep-test-execution-views";
import { QepTestPlanRouterView } from "./qep-test-plan-views";
import { QepTestSpecificationRouterView } from "./qep-test-specification-views";
import { QepTraceabilityRouterView } from "./qep-traceability-views";
import { QepVerificationRouterView } from "./qep-verification-views";

/**
 * QEP workspace router — Suites (140-A) / Execution Planning (140-B) /
 * Requirements / Traceability / Verification / Specs / Plans / Execution / Evidence.
 */
export function QepWorkspaceRouter() {
  const pathname = usePathname() ?? "";

  if (!isQepWorkspaceRoute(pathname)) {
    return null;
  }

  if (isQepSuitesRoute(pathname)) {
    return <QepSuitesRouterView pathname={pathname} />;
  }

  if (isQepExecutionPlansRoute(pathname)) {
    return <QepExecutionPlansRouterView pathname={pathname} />;
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
