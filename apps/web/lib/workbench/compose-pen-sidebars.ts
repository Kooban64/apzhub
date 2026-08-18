/**
 * APZPEN Security context sidebars — real product routes only (Owner Slice 4).
 * Labels map Owner vocabulary → repository capability (no invented modules).
 */

import type { SidebarItem } from "@apzhub/ui";

import { APZPEN_WB } from "@/lib/apzpen/workbench-routes";
import { SOURCE_ROUTES } from "@/lib/source/routes";

export type PenSidebarNavItem = SidebarItem & {
  readonly href?: string;
};

function sep(id: string): PenSidebarNavItem {
  return { id, label: "", kind: "separator" };
}

function item(
  id: string,
  label: string,
  href: string,
  active: boolean,
  icon?: string,
): PenSidebarNavItem {
  return { id, label, href, active, icon };
}

function pathActive(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Security rail sidebar — denser operational IA.
 * Overview → Home. Testing tools → Providers. Assurance → Certification.
 * Source link only when independent source.read is granted.
 */
export function composePenContextSidebar(
  pathname: string,
  options?: { readonly hasSourceAccess?: boolean },
): readonly PenSidebarNavItem[] {
  const items: PenSidebarNavItem[] = [
    item(
      "pen-overview",
      "Overview",
      APZPEN_WB.home,
      pathActive(pathname, APZPEN_WB.home, true) ||
        pathname === "/apzpen" ||
        pathname === "/apzpen/",
      "layout-dashboard",
    ),
    item(
      "pen-engagements",
      "Engagements",
      APZPEN_WB.engagements,
      pathActive(pathname, APZPEN_WB.engagements) ||
        pathActive(pathname, "/apzpen/engagements"),
      "shield",
    ),
    item(
      "pen-my-work",
      "My Work",
      APZPEN_WB.myWork,
      pathActive(pathname, APZPEN_WB.myWork) || pathActive(pathname, "/apzpen/my-work"),
      "list-todo",
    ),
    item(
      "pen-findings",
      "Findings",
      APZPEN_WB.findings,
      pathActive(pathname, APZPEN_WB.findings) ||
        pathActive(pathname, "/apzpen/findings"),
      "bug",
    ),
    item(
      "pen-evidence",
      "Evidence",
      APZPEN_WB.evidence,
      pathActive(pathname, APZPEN_WB.evidence) ||
        pathActive(pathname, "/apzpen/evidence"),
      "file-image",
    ),
    item(
      "pen-retests",
      "Retests",
      APZPEN_WB.retests,
      pathActive(pathname, APZPEN_WB.retests) ||
        pathActive(pathname, "/apzpen/retests"),
      "refresh-cw",
    ),
    item(
      "pen-remediation",
      "Remediation",
      APZPEN_WB.remediation,
      pathActive(pathname, APZPEN_WB.remediation) ||
        pathActive(pathname, "/apzpen/remediation"),
      "wrench",
    ),
    item(
      "pen-reports",
      "Reports",
      APZPEN_WB.reports,
      pathActive(pathname, APZPEN_WB.reports) ||
        pathActive(pathname, "/apzpen/reports"),
      "file-text",
    ),
    sep("pen-sep-ops"),
    item(
      "pen-assets",
      "Assets",
      APZPEN_WB.assets,
      pathActive(pathname, APZPEN_WB.assets) || pathActive(pathname, "/apzpen/assets"),
      "server",
    ),
    item(
      "pen-providers",
      "Tools",
      APZPEN_WB.providers,
      pathActive(pathname, APZPEN_WB.providers) ||
        pathActive(pathname, "/apzpen/providers"),
      "hammer",
    ),
    item(
      "pen-assurance",
      "Assurance",
      APZPEN_WB.certification,
      pathActive(pathname, APZPEN_WB.certification) ||
        pathActive(pathname, "/apzpen/certification"),
      "badge-check",
    ),
    item(
      "pen-risk",
      "Risk acceptance",
      APZPEN_WB.riskAcceptance,
      pathActive(pathname, APZPEN_WB.riskAcceptance) ||
        pathActive(pathname, "/apzpen/risk-acceptance"),
      "alert-triangle",
    ),
    item(
      "pen-code",
      "Code security",
      APZPEN_WB.code,
      pathActive(pathname, APZPEN_WB.code) || pathActive(pathname, "/apzpen/code"),
      "code-2",
    ),
  ];

  if (options?.hasSourceAccess) {
    items.push(
      sep("pen-sep-source"),
      item(
        "pen-source",
        "Source",
        SOURCE_ROUTES.home,
        pathActive(pathname, SOURCE_ROUTES.home),
        "folder-git-2",
      ),
    );
  }

  return items;
}

const PEN_HREF_BY_ID: Record<string, string> = {
  "pen-overview": APZPEN_WB.home,
  "pen-engagements": APZPEN_WB.engagements,
  "pen-my-work": APZPEN_WB.myWork,
  "pen-findings": APZPEN_WB.findings,
  "pen-evidence": APZPEN_WB.evidence,
  "pen-retests": APZPEN_WB.retests,
  "pen-remediation": APZPEN_WB.remediation,
  "pen-reports": APZPEN_WB.reports,
  "pen-assets": APZPEN_WB.assets,
  "pen-providers": APZPEN_WB.providers,
  "pen-assurance": APZPEN_WB.certification,
  "pen-risk": APZPEN_WB.riskAcceptance,
  "pen-code": APZPEN_WB.code,
  "pen-source": SOURCE_ROUTES.home,
};

export function resolvePenSidebarHref(id: string): string | null {
  return PEN_HREF_BY_ID[id] ?? null;
}
