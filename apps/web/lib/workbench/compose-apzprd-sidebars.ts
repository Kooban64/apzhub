/**
 * APZPRD product context sidebars — real product routes only.
 * Favourites / Recent omitted until product capability exists (Owner Slice 2).
 */

import type { SidebarItem } from "@apzhub/ui";

import { ANALYTICS_BASE } from "@/lib/analytics/routes";
import type { ProductKey } from "@/lib/commercial/catalogue";
import { DOCUMENTS_BASE } from "@/lib/documents/routes";
import { KNOWLEDGE_BASE } from "@/lib/knowledge/routes";
import { PROJECTS_BASE } from "@/lib/projects/routes";
import { SUPPORT_BASE } from "@/lib/support/routes";
import { TIME_BASE } from "@/lib/time/routes";
import { WORKFLOW_BASE } from "@/lib/workflow/routes";

export type ApzprdSidebarNavItem = SidebarItem & {
  readonly href?: string;
};

function sep(id: string): ApzprdSidebarNavItem {
  return { id, label: "", kind: "separator" };
}

function item(
  id: string,
  label: string,
  href: string,
  active: boolean,
  icon?: string,
): ApzprdSidebarNavItem {
  return { id, label, href, active, icon };
}

function pathActive(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Productivity launcher: My Work + entitled products only. */
export function composeProductivityLauncherSidebar(input: {
  readonly pathname: string;
  readonly products: readonly {
    readonly key: ProductKey;
    readonly label: string;
    readonly href: string;
    readonly icon: string;
  }[];
}): readonly ApzprdSidebarNavItem[] {
  const items: ApzprdSidebarNavItem[] = [
    item(
      "prd-my-work",
      "My Work",
      "/workspace/my-work",
      pathActive(input.pathname, "/workspace/my-work") ||
        pathActive(input.pathname, "/workspace/home", true),
      "house",
    ),
  ];
  if (input.products.length > 0) {
    items.push(sep("prd-sep-products"));
    for (const p of input.products) {
      items.push(
        item(
          `prd-${p.key}`,
          p.label,
          p.href,
          pathActive(input.pathname, p.href),
          p.icon,
        ),
      );
    }
  }
  return items;
}

export function composeProductContextSidebar(
  productKey: ProductKey,
  pathname: string,
): readonly ApzprdSidebarNavItem[] {
  switch (productKey) {
    case "projects":
      return [
        item(
          "prj-overview",
          "Overview",
          PROJECTS_BASE,
          pathActive(pathname, PROJECTS_BASE, true),
          "layout-dashboard",
        ),
        item(
          "prj-my-work",
          "My Tasks",
          `${PROJECTS_BASE}/my-work`,
          pathActive(pathname, `${PROJECTS_BASE}/my-work`),
          "user-check",
        ),
        item(
          "prj-projects",
          "Projects",
          `${PROJECTS_BASE}/list`,
          pathActive(pathname, `${PROJECTS_BASE}/list`) ||
            /\/workspace\/projects\/proj_/.test(pathname),
          "folder-kanban",
        ),
        item(
          "prj-tasks",
          "Tasks",
          `${PROJECTS_BASE}/tasks`,
          pathActive(pathname, `${PROJECTS_BASE}/tasks`),
          "list-checks",
        ),
        item(
          "prj-backlog",
          "Backlog",
          `${PROJECTS_BASE}/backlog`,
          pathActive(pathname, `${PROJECTS_BASE}/backlog`),
          "layers",
        ),
        item(
          "prj-sprints",
          "Sprints",
          `${PROJECTS_BASE}/sprints`,
          pathActive(pathname, `${PROJECTS_BASE}/sprints`),
          "gauge",
        ),
        item(
          "prj-roadmap",
          "Roadmap",
          `${PROJECTS_BASE}/roadmap`,
          pathActive(pathname, `${PROJECTS_BASE}/roadmap`),
          "map",
        ),
      ];
    case "support":
      return [
        item(
          "sup-requests",
          "My Tickets",
          `${SUPPORT_BASE}/requests`,
          pathActive(pathname, SUPPORT_BASE, true) ||
            pathActive(pathname, `${SUPPORT_BASE}/requests`),
          "inbox",
        ),
        item(
          "sup-search",
          "Search",
          `${SUPPORT_BASE}/search`,
          pathActive(pathname, `${SUPPORT_BASE}/search`),
          "search",
        ),
        item(
          "sup-orgs",
          "Organisations",
          `${SUPPORT_BASE}/organizations`,
          pathActive(pathname, `${SUPPORT_BASE}/organizations`),
          "building-2",
        ),
        item(
          "sup-groups",
          "Groups",
          `${SUPPORT_BASE}/groups`,
          pathActive(pathname, `${SUPPORT_BASE}/groups`),
          "users",
        ),
        item(
          "sup-analytics",
          "Analytics",
          `${SUPPORT_BASE}/analytics`,
          pathActive(pathname, `${SUPPORT_BASE}/analytics`),
          "chart-column",
        ),
      ];
    case "time":
      return [
        item(
          "time-today",
          "Today",
          TIME_BASE,
          pathActive(pathname, TIME_BASE, true),
          "timer",
        ),
        item(
          "time-timesheets",
          "My Timesheet",
          `${TIME_BASE}/timesheets`,
          pathActive(pathname, `${TIME_BASE}/timesheets`),
          "calendar-days",
        ),
        item(
          "time-activities",
          "Activities",
          `${TIME_BASE}/activities`,
          pathActive(pathname, `${TIME_BASE}/activities`),
          "activity",
        ),
        item(
          "time-customers",
          "Customers",
          `${TIME_BASE}/customers`,
          pathActive(pathname, `${TIME_BASE}/customers`),
          "briefcase",
        ),
      ];
    case "workflow":
      return [
        item(
          "wf-home",
          "My Workflows",
          WORKFLOW_BASE,
          pathActive(pathname, WORKFLOW_BASE, true),
          "git-branch",
        ),
        item(
          "wf-runs",
          "Runs",
          `${WORKFLOW_BASE}/runs`,
          pathActive(pathname, `${WORKFLOW_BASE}/runs`),
          "play",
        ),
        item(
          "wf-tasks",
          "Tasks",
          `${WORKFLOW_BASE}/tasks`,
          pathActive(pathname, `${WORKFLOW_BASE}/tasks`),
          "list-todo",
        ),
        item(
          "wf-approvals",
          "Approvals",
          `${WORKFLOW_BASE}/approvals`,
          pathActive(pathname, `${WORKFLOW_BASE}/approvals`),
          "check-circle",
        ),
        item(
          "wf-monitoring",
          "Failures",
          `${WORKFLOW_BASE}/monitoring`,
          pathActive(pathname, `${WORKFLOW_BASE}/monitoring`),
          "triangle-alert",
        ),
      ];
    case "analytics":
      return [
        item(
          "an-home",
          "Home",
          ANALYTICS_BASE,
          pathActive(pathname, ANALYTICS_BASE, true),
          "layout-dashboard",
        ),
        item(
          "an-questions",
          "Questions",
          `${ANALYTICS_BASE}/questions`,
          pathActive(pathname, `${ANALYTICS_BASE}/questions`),
          "circle-help",
        ),
        item(
          "an-saved",
          "Saved insights",
          `${ANALYTICS_BASE}/saved`,
          pathActive(pathname, `${ANALYTICS_BASE}/saved`),
          "bookmark",
        ),
        item(
          "an-reports",
          "Reports",
          `${ANALYTICS_BASE}/reports`,
          pathActive(pathname, `${ANALYTICS_BASE}/reports`),
          "file-bar-chart",
        ),
        item(
          "an-datasets",
          "Datasets",
          `${ANALYTICS_BASE}/datasets`,
          pathActive(pathname, `${ANALYTICS_BASE}/datasets`),
          "database",
        ),
      ];
    case "knowledge":
      return [
        item(
          "kn-home",
          "Home",
          KNOWLEDGE_BASE,
          pathActive(pathname, KNOWLEDGE_BASE, true),
          "book-open",
        ),
        item(
          "kn-memory",
          "Browse",
          `${KNOWLEDGE_BASE}/memory`,
          pathActive(pathname, `${KNOWLEDGE_BASE}/memory`) ||
            pathActive(pathname, `${KNOWLEDGE_BASE}/objects`),
          "library",
        ),
        item(
          "kn-library",
          "Library",
          `${KNOWLEDGE_BASE}/library`,
          pathActive(pathname, `${KNOWLEDGE_BASE}/library`),
          "book-marked",
        ),
        item(
          "kn-lessons",
          "Lessons",
          `${KNOWLEDGE_BASE}/lessons`,
          pathActive(pathname, `${KNOWLEDGE_BASE}/lessons`),
          "graduation-cap",
        ),
        item(
          "kn-decisions",
          "Decisions",
          `${KNOWLEDGE_BASE}/decision-knowledge`,
          pathActive(pathname, `${KNOWLEDGE_BASE}/decision-knowledge`),
          "scale",
        ),
      ];
    case "documents":
      return [
        item(
          "doc-overview",
          "My Documents",
          `${DOCUMENTS_BASE}/overview`,
          pathActive(pathname, DOCUMENTS_BASE, true) ||
            pathActive(pathname, `${DOCUMENTS_BASE}/overview`),
          "file-text",
        ),
        item(
          "doc-library",
          "Library",
          `${DOCUMENTS_BASE}/documents`,
          pathActive(pathname, `${DOCUMENTS_BASE}/documents`),
          "files",
        ),
        item(
          "doc-folders",
          "Folders",
          `${DOCUMENTS_BASE}/folders`,
          pathActive(pathname, `${DOCUMENTS_BASE}/folders`),
          "folder",
        ),
        item(
          "doc-collections",
          "Collections",
          `${DOCUMENTS_BASE}/collections`,
          pathActive(pathname, `${DOCUMENTS_BASE}/collections`),
          "layers",
        ),
        item(
          "doc-tags",
          "Tags",
          `${DOCUMENTS_BASE}/tags`,
          pathActive(pathname, `${DOCUMENTS_BASE}/tags`),
          "tags",
        ),
      ];
    default:
      return [];
  }
}

export function resolveApzprdSidebarHref(
  id: string,
  products: readonly { readonly key: string; readonly href: string }[],
): string | null {
  if (id === "prd-my-work") return "/workspace/my-work";
  if (id.startsWith("prd-") && !id.startsWith("prd-sep-")) {
    const key = id.slice(4);
    return products.find((p) => p.key === key)?.href ?? null;
  }
  const map: Record<string, string> = {
    "prj-overview": PROJECTS_BASE,
    "prj-my-work": `${PROJECTS_BASE}/my-work`,
    "prj-projects": `${PROJECTS_BASE}/list`,
    "prj-tasks": `${PROJECTS_BASE}/tasks`,
    "prj-backlog": `${PROJECTS_BASE}/backlog`,
    "prj-sprints": `${PROJECTS_BASE}/sprints`,
    "prj-roadmap": `${PROJECTS_BASE}/roadmap`,
    "sup-requests": `${SUPPORT_BASE}/requests`,
    "sup-search": `${SUPPORT_BASE}/search`,
    "sup-orgs": `${SUPPORT_BASE}/organizations`,
    "sup-groups": `${SUPPORT_BASE}/groups`,
    "sup-analytics": `${SUPPORT_BASE}/analytics`,
    "time-today": TIME_BASE,
    "time-timesheets": `${TIME_BASE}/timesheets`,
    "time-activities": `${TIME_BASE}/activities`,
    "time-customers": `${TIME_BASE}/customers`,
    "wf-home": WORKFLOW_BASE,
    "wf-runs": `${WORKFLOW_BASE}/runs`,
    "wf-tasks": `${WORKFLOW_BASE}/tasks`,
    "wf-approvals": `${WORKFLOW_BASE}/approvals`,
    "wf-monitoring": `${WORKFLOW_BASE}/monitoring`,
    "an-home": ANALYTICS_BASE,
    "an-questions": `${ANALYTICS_BASE}/questions`,
    "an-saved": `${ANALYTICS_BASE}/saved`,
    "an-reports": `${ANALYTICS_BASE}/reports`,
    "an-datasets": `${ANALYTICS_BASE}/datasets`,
    "kn-home": KNOWLEDGE_BASE,
    "kn-memory": `${KNOWLEDGE_BASE}/memory`,
    "kn-library": `${KNOWLEDGE_BASE}/library`,
    "kn-lessons": `${KNOWLEDGE_BASE}/lessons`,
    "kn-decisions": `${KNOWLEDGE_BASE}/decision-knowledge`,
    "doc-overview": `${DOCUMENTS_BASE}/overview`,
    "doc-library": `${DOCUMENTS_BASE}/documents`,
    "doc-folders": `${DOCUMENTS_BASE}/folders`,
    "doc-collections": `${DOCUMENTS_BASE}/collections`,
    "doc-tags": `${DOCUMENTS_BASE}/tags`,
  };
  return map[id] ?? null;
}
