/**
 * APZQEP Quality context sidebars — real QEP routes only (Owner Slice 3).
 * Labels map Owner vocabulary → repository capability (no invented modules).
 */

import type { SidebarItem } from "@apzhub/ui";

import { QEP_AUTOMATION_BASE_PATH } from "@apzhub/qep-automation/presentation";
import { QEP_DEFECTS_BASE_PATH } from "@apzhub/qep-defects/presentation";
import { QEP_EVIDENCE_BASE_PATH } from "@apzhub/qep-evidence/presentation";
import { QEP_TEST_EXECUTION_BASE_PATH } from "@apzhub/qep-test-execution/presentation";
import { QEP_TEST_PLANS_BASE_PATH } from "@apzhub/qep-test-plans/presentation";
import { QEP_TEST_SPECIFICATIONS_BASE_PATH } from "@apzhub/qep-test-specifications/presentation";

import { QEP_HOME_BASE_PATH } from "@/lib/qep/home-routes";
import { QEP_PORTFOLIO_BASE_PATH } from "@/lib/qep/portfolio-routes";
import { QEP_RELEASE_READINESS_BASE_PATH } from "@/lib/qep/release-readiness-routes";
import { SOURCE_ROUTES } from "@/lib/source/routes";

export type QepSidebarNavItem = SidebarItem & {
  readonly href?: string;
};

function sep(id: string): QepSidebarNavItem {
  return { id, label: "", kind: "separator" };
}

function item(
  id: string,
  label: string,
  href: string,
  active: boolean,
  icon?: string,
): QepSidebarNavItem {
  return { id, label, href, active, icon };
}

function pathActive(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Quality rail sidebar — denser engineering IA.
 * Applications → Portfolio (quality projects). Test Library → Test Specifications.
 * Runs → Test Execution. Releases → Release Readiness.
 * Source link only when independent source.read is granted.
 */
export function composeQepContextSidebar(
  pathname: string,
  options?: { readonly hasSourceAccess?: boolean },
): readonly QepSidebarNavItem[] {
  const items: QepSidebarNavItem[] = [
    item(
      "qep-overview",
      "Overview",
      QEP_HOME_BASE_PATH,
      pathActive(pathname, QEP_HOME_BASE_PATH) ||
        pathname === "/workspace/qep" ||
        pathname === "/workspace/qep/",
      "layout-dashboard",
    ),
    item(
      "qep-applications",
      "Applications",
      QEP_PORTFOLIO_BASE_PATH,
      pathActive(pathname, QEP_PORTFOLIO_BASE_PATH),
      "app-window",
    ),
    item(
      "qep-test-library",
      "Test Library",
      QEP_TEST_SPECIFICATIONS_BASE_PATH,
      pathActive(pathname, QEP_TEST_SPECIFICATIONS_BASE_PATH),
      "library",
    ),
    item(
      "qep-test-plans",
      "Test Plans",
      QEP_TEST_PLANS_BASE_PATH,
      pathActive(pathname, QEP_TEST_PLANS_BASE_PATH),
      "clipboard-list",
    ),
    item(
      "qep-runs",
      "Runs",
      QEP_TEST_EXECUTION_BASE_PATH,
      pathActive(pathname, QEP_TEST_EXECUTION_BASE_PATH),
      "play",
    ),
    item(
      "qep-defects",
      "Defects",
      QEP_DEFECTS_BASE_PATH,
      pathActive(pathname, QEP_DEFECTS_BASE_PATH),
      "bug",
    ),
    item(
      "qep-automation",
      "Automation",
      QEP_AUTOMATION_BASE_PATH,
      pathActive(pathname, QEP_AUTOMATION_BASE_PATH),
      "bot",
    ),
    item(
      "qep-evidence",
      "Evidence",
      QEP_EVIDENCE_BASE_PATH,
      pathActive(pathname, QEP_EVIDENCE_BASE_PATH),
      "file-image",
    ),
    item(
      "qep-releases",
      "Releases",
      QEP_RELEASE_READINESS_BASE_PATH,
      pathActive(pathname, QEP_RELEASE_READINESS_BASE_PATH),
      "badge-check",
    ),
  ];
  if (options?.hasSourceAccess) {
    items.push(
      sep("qep-sep-source"),
      item(
        "qep-source",
        "Source",
        SOURCE_ROUTES.home,
        pathActive(pathname, SOURCE_ROUTES.home),
        "code-2",
      ),
    );
  }
  return items;
}

export function resolveQepSidebarHref(id: string): string | null {
  const map: Record<string, string> = {
    "qep-overview": QEP_HOME_BASE_PATH,
    "qep-applications": QEP_PORTFOLIO_BASE_PATH,
    "qep-test-library": QEP_TEST_SPECIFICATIONS_BASE_PATH,
    "qep-test-plans": QEP_TEST_PLANS_BASE_PATH,
    "qep-runs": QEP_TEST_EXECUTION_BASE_PATH,
    "qep-defects": QEP_DEFECTS_BASE_PATH,
    "qep-automation": QEP_AUTOMATION_BASE_PATH,
    "qep-evidence": QEP_EVIDENCE_BASE_PATH,
    "qep-releases": QEP_RELEASE_READINESS_BASE_PATH,
    "qep-source": SOURCE_ROUTES.home,
  };
  return map[id] ?? null;
}
