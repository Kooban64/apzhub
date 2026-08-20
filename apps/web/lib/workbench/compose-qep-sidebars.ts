/**
 * APZQEP Master information architecture — Phase 1 / 1E.
 * Hierarchy is the product IA. Only real, permissioned destinations are linked.
 * Environments live under Application Detail.
 */

import type { SidebarItem } from "@apzhub/ui";

import { QEP_AUTOMATION_BASE_PATH } from "@apzhub/qep-automation/presentation";
import { QEP_DEFECTS_BASE_PATH } from "@apzhub/qep-defects/presentation";
import { QEP_EVIDENCE_BASE_PATH } from "@apzhub/qep-evidence/presentation";
import { QEP_EXECUTION_WORKSPACE_BASE_PATH } from "@apzhub/qep-execution-workspace/presentation";
import { QEP_QI_BASE_PATH } from "@apzhub/qep-quality-intelligence/presentation";
import { QEP_ENTERPRISE_REPORTING_BASE_PATH } from "@apzhub/qep-reporting/presentation";
import { QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH } from "@apzhub/qep-requirements-traceability/presentation";
import { QEP_REQUIREMENTS_BASE_PATH } from "@apzhub/qep-requirements/presentation";
import { QEP_SCM_BASE_PATH } from "@apzhub/qep-scm/presentation";
import { QEP_SUITES_BASE_PATH } from "@apzhub/qep-suites/presentation";
import { QEP_TEST_EXECUTION_BASE_PATH } from "@apzhub/qep-test-execution/presentation";
import { QEP_TEST_PLANS_BASE_PATH } from "@apzhub/qep-test-plans/presentation";
import { QEP_TEST_SPECIFICATIONS_BASE_PATH } from "@apzhub/qep-test-specifications/presentation";
import { QEP_TRACEABILITY_BASE_PATH } from "@apzhub/qep-traceability/presentation";
import {
  QEP_EXPERIENCE_PLANS_BASE_PATH,
  QEP_EXPLORATORY_SESSIONS_BASE_PATH,
} from "@apzhub/qep-experience/presentation";
import {
  QEP_QUALITY_GATES_BASE_PATH,
  QEP_QUALITY_RISK_BASE_PATH,
} from "@apzhub/qep-assurance/presentation";
import {
  QEP_AI_ANALYSIS_BASE_PATH,
  QEP_AI_COMPANION_BASE_PATH,
  QEP_AI_GENERATE_BASE_PATH,
  QEP_AI_REVIEW_BASE_PATH,
} from "@apzhub/qep-ai/presentation";

import { QEP_CERTIFICATION_BASE_PATH } from "@/lib/qep/certification-routes";
import { QEP_HOME_BASE_PATH, QEP_MY_WORK_BASE_PATH } from "@/lib/qep/home-routes";
import { QEP_INTEGRATIONS_BASE_PATH } from "@/lib/qep/integrations-routes";
import { canShowQepNavItem } from "@/lib/qep/qep-permission";
import { QEP_PORTFOLIO_BASE_PATH } from "@/lib/qep/portfolio-routes";
import { QEP_RELEASE_READINESS_BASE_PATH } from "@/lib/qep/release-readiness-routes";
import { SOURCE_ROUTES } from "@/lib/source/routes";

export type QepSidebarNavItem = SidebarItem & {
  readonly href?: string;
};

export type QepSidebarComposeOptions = {
  readonly hasSourceAccess?: boolean;
  readonly entitled?: boolean;
  readonly permissions?: readonly string[];
};

function section(id: string, label: string): QepSidebarNavItem {
  return { id, label, kind: "section" };
}

function item(
  id: string,
  label: string,
  href: string,
  active: boolean,
  icon?: string,
): QepSidebarNavItem {
  return { id, label, href, active, ...(icon ? { icon } : {}) };
}

function pathActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const QEP_HREF_BY_ID: Readonly<Record<string, string>> = {
  "qep-overview": QEP_HOME_BASE_PATH,
  "qep-my-work": QEP_MY_WORK_BASE_PATH,
  "qep-applications": QEP_PORTFOLIO_BASE_PATH,
  "qep-requirements": QEP_REQUIREMENTS_BASE_PATH,
  "qep-test-cases": QEP_TEST_SPECIFICATIONS_BASE_PATH,
  "qep-test-suites": QEP_SUITES_BASE_PATH,
  "qep-test-plans": QEP_TEST_PLANS_BASE_PATH,
  "qep-test-runs": QEP_TEST_EXECUTION_BASE_PATH,
  "qep-manual-execution": QEP_EXECUTION_WORKSPACE_BASE_PATH,
  "qep-automation": QEP_AUTOMATION_BASE_PATH,
  "qep-exploratory-sessions": QEP_EXPLORATORY_SESSIONS_BASE_PATH,
  "qep-ui-ux-plans": QEP_EXPERIENCE_PLANS_BASE_PATH,
  "qep-defects": QEP_DEFECTS_BASE_PATH,
  "qep-evidence": QEP_EVIDENCE_BASE_PATH,
  "qep-traceability": QEP_TRACEABILITY_BASE_PATH,
  "qep-coverage": `${QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH}/coverage`,
  "qep-quality-risk": QEP_QUALITY_RISK_BASE_PATH,
  "qep-quality-gates": QEP_QUALITY_GATES_BASE_PATH,
  "qep-builds-ci": QEP_SCM_BASE_PATH,
  "qep-source": SOURCE_ROUTES.home,
  "qep-readiness": QEP_RELEASE_READINESS_BASE_PATH,
  "qep-certification": QEP_CERTIFICATION_BASE_PATH,
  "qep-quality-intelligence": QEP_QI_BASE_PATH,
  "qep-ai-companion": QEP_AI_COMPANION_BASE_PATH,
  "qep-ai-generate": QEP_AI_GENERATE_BASE_PATH,
  "qep-ai-review": QEP_AI_REVIEW_BASE_PATH,
  "qep-ai-analysis": QEP_AI_ANALYSIS_BASE_PATH,
  "qep-reports": QEP_ENTERPRISE_REPORTING_BASE_PATH,
  "qep-administration": "/workspace/qep/administration",
  "qep-integrations": QEP_INTEGRATIONS_BASE_PATH,
  "qep-audit": "/workspace/qep/audit",
};

type LeafSpec = {
  readonly id: keyof typeof QEP_HREF_BY_ID;
  readonly label: string;
  readonly required: string;
  readonly icon: string;
  readonly sourceOnly?: boolean;
};

type SectionSpec = {
  readonly id: string;
  readonly label: string;
  readonly leaves: readonly LeafSpec[];
};

const MASTER_IA: readonly SectionSpec[] = [
  {
    id: "qep-sec-home",
    label: "Home",
    leaves: [
      {
        id: "qep-overview",
        label: "Overview",
        required: "qep.home.read",
        icon: "house",
      },
      {
        id: "qep-my-work",
        label: "My Work",
        required: "qep.home.read",
        icon: "list-todo",
      },
    ],
  },
  {
    id: "qep-sec-portfolio",
    label: "Portfolio",
    leaves: [
      {
        id: "qep-applications",
        label: "Applications",
        required: "qep.portfolio.read",
        icon: "app-window",
      },
    ],
  },
  {
    id: "qep-sec-define",
    label: "Define",
    leaves: [
      {
        id: "qep-requirements",
        label: "Requirements",
        required: "qep.requirements.view",
        icon: "file-text",
      },
    ],
  },
  {
    id: "qep-sec-test",
    label: "Test",
    leaves: [
      {
        id: "qep-test-cases",
        label: "Test Cases",
        required: "qep.specification.read",
        icon: "file-check",
      },
      {
        id: "qep-test-suites",
        label: "Test Suites",
        required: "qep.suites.read",
        icon: "layers",
      },
      {
        id: "qep-test-plans",
        label: "Test Plans",
        required: "qep.plan.read",
        icon: "clipboard-list",
      },
      {
        id: "qep-test-runs",
        label: "Executions",
        required: "qep.execution.read",
        icon: "play",
      },
    ],
  },
  {
    id: "qep-sec-verify",
    label: "Verify",
    leaves: [
      {
        id: "qep-manual-execution",
        label: "Manual Execution",
        required: "qep.execution_workspace.read",
        icon: "hand",
      },
      {
        id: "qep-automation",
        label: "Automation",
        required: "qep.automation.read",
        icon: "bot",
      },
      {
        id: "qep-exploratory-sessions",
        label: "Exploratory Sessions",
        required: "qep.exploratory.read",
        icon: "compass",
      },
      {
        id: "qep-ui-ux-plans",
        label: "UI / UX Plans",
        required: "qep.experience.read",
        icon: "app-window",
      },
    ],
  },
  {
    id: "qep-sec-assure",
    label: "Assure",
    leaves: [
      {
        id: "qep-defects",
        label: "Defects",
        required: "qep.defects.read",
        icon: "bug",
      },
      {
        id: "qep-evidence",
        label: "Evidence",
        required: "qep.evidence.read",
        icon: "paperclip",
      },
      {
        id: "qep-traceability",
        label: "Traceability",
        required: "qep.traceability.trace_links.view",
        icon: "git-branch",
      },
      {
        id: "qep-coverage",
        label: "Coverage",
        required: "qep.enterprise_requirements.read",
        icon: "pie-chart",
      },
      {
        id: "qep-quality-risk",
        label: "Quality Risk",
        required: "qep.risk.read",
        icon: "triangle-alert",
      },
      {
        id: "qep-quality-gates",
        label: "Quality Gates",
        required: "qep.gate.read",
        icon: "shield",
      },
    ],
  },
  {
    id: "qep-sec-engineering",
    label: "Engineering",
    leaves: [
      {
        id: "qep-builds-ci",
        label: "Builds & CI",
        required: "qep.scm.read",
        icon: "hammer",
      },
      {
        id: "qep-source",
        label: "Source",
        required: "source.read",
        sourceOnly: true,
        icon: "code",
      },
    ],
  },
  {
    id: "qep-sec-release",
    label: "Release Assurance",
    leaves: [
      {
        id: "qep-readiness",
        label: "Readiness",
        required: "qep.release_readiness.read",
        icon: "shield-check",
      },
      {
        id: "qep-certification",
        label: "Certification",
        required: "qep.certification.read",
        icon: "badge-check",
      },
    ],
  },
  {
    id: "qep-sec-insights",
    label: "Insights",
    leaves: [
      {
        id: "qep-ai-companion",
        label: "AI Quality Companion",
        required: "qep.ai_workspace.read",
        icon: "sparkles",
      },
      {
        id: "qep-ai-generate",
        label: "Generate & Analyse",
        required: "qep.ai_workspace.operate",
        icon: "wand-sparkles",
      },
      {
        id: "qep-ai-review",
        label: "AI Review Queue",
        required: "qep.ai_workspace.read",
        icon: "list-checks",
      },
      {
        id: "qep-ai-analysis",
        label: "AI Analysis",
        required: "qep.ai_workspace.read",
        icon: "git-branch",
      },
      {
        id: "qep-quality-intelligence",
        label: "Quality Intelligence",
        required: "qep.qi.read",
        icon: "sparkles",
      },
      {
        id: "qep-reports",
        label: "Reports",
        required: "qep.enterprise_reporting.read",
        icon: "bar-chart-3",
      },
    ],
  },
  {
    id: "qep-sec-admin",
    label: "Administration",
    leaves: [
      {
        id: "qep-administration",
        label: "Settings",
        required: "qep.administration.read",
        icon: "settings",
      },
      {
        id: "qep-integrations",
        label: "Integrations",
        required: "qep.integrations.read",
        icon: "plug",
      },
      {
        id: "qep-audit",
        label: "Audit",
        required: "qep.audit.read",
        icon: "scroll-text",
      },
    ],
  },
];

function overviewActive(pathname: string): boolean {
  return (
    pathActive(pathname, QEP_HOME_BASE_PATH) ||
    pathname === "/workspace/qep" ||
    pathname === "/workspace/qep/"
  );
}

export function composeQepContextSidebar(
  pathname: string,
  options?: QepSidebarComposeOptions,
): readonly QepSidebarNavItem[] {
  const entitled = options?.entitled !== false;
  const items: QepSidebarNavItem[] = [];

  for (const group of MASTER_IA) {
    const visibleLeaves: QepSidebarNavItem[] = [];
    for (const leaf of group.leaves) {
      if (leaf.sourceOnly) {
        if (options?.hasSourceAccess !== true) continue;
      } else if (
        !canShowQepNavItem({
          entitled,
          permissions: options?.permissions,
          required: leaf.required,
        })
      ) {
        continue;
      }
      const href = QEP_HREF_BY_ID[leaf.id];
      if (!href) continue;
      const active =
        leaf.id === "qep-overview"
          ? overviewActive(pathname)
          : pathActive(pathname, href);
      visibleLeaves.push(item(leaf.id, leaf.label, href, active, leaf.icon));
    }
    if (visibleLeaves.length === 0) continue;
    items.push(section(group.id, group.label), ...visibleLeaves);
  }

  return items;
}

export function resolveQepSidebarHref(id: string): string | null {
  return QEP_HREF_BY_ID[id] ?? null;
}

export function isQepSidebarSectionId(id: string): boolean {
  return id.startsWith("qep-sec-");
}
