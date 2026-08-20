/**
 * Access-driven User Workbench activity rail.
 * Groups APZPRD products under Productivity; omits products without effective access.
 */

import type { ActivityBarItem, SidebarItem } from "@apzhub/ui";

import type { ProductKey } from "@/lib/commercial/catalogue";

import {
  composeProductContextSidebar,
  composeProductivityLauncherSidebar,
} from "./compose-apzprd-sidebars";
import { composePenContextSidebar } from "./compose-pen-sidebars";
import { composeQepContextSidebar } from "./compose-qep-sidebars";

const PRD_PRODUCT_KEYS = [
  "projects",
  "support",
  "time",
  "workflow",
  "analytics",
  "knowledge",
  "documents",
] as const satisfies readonly ProductKey[];

export type RailProductMeta = {
  readonly key: ProductKey;
  readonly label: string;
  readonly href: string;
  readonly icon: string;
  readonly match: (id: string, label: string, route?: string) => boolean;
};

export const PRODUCTIVITY_PRODUCTS: readonly RailProductMeta[] = [
  {
    key: "projects",
    label: "Projects",
    href: "/workspace/projects",
    icon: "folder-kanban",
    match: (id, label, route) =>
      /project/i.test(id) ||
      /project/i.test(label) ||
      Boolean(route?.includes("/projects")),
  },
  {
    key: "support",
    label: "Support",
    href: "/workspace/support",
    icon: "life-buoy",
    match: (id, label, route) =>
      /support/i.test(id) ||
      /support/i.test(label) ||
      Boolean(route?.includes("/support")),
  },
  {
    key: "time",
    label: "Time",
    href: "/workspace/time",
    icon: "clock",
    match: (id, label, route) =>
      /(^|-)time($|-)/i.test(id) ||
      /^time$/i.test(label) ||
      Boolean(route?.includes("/time")),
  },
  {
    key: "workflow",
    label: "Workflow",
    href: "/workspace/workflow",
    icon: "git-branch",
    match: (id, label, route) =>
      /workflow/i.test(id) ||
      /workflow/i.test(label) ||
      Boolean(route?.includes("/workflow")),
  },
  {
    key: "analytics",
    label: "Analytics",
    href: "/workspace/analytics",
    icon: "chart-column",
    match: (id, label, route) =>
      /analytics|reporting/i.test(id) ||
      /analytics|reporting/i.test(label) ||
      Boolean(route?.includes("/analytics") || route?.includes("/reporting")),
  },
  {
    key: "knowledge",
    label: "Knowledge",
    href: "/workspace/knowledge",
    icon: "book-open",
    match: (id, label, route) =>
      /knowledge/i.test(id) ||
      /knowledge/i.test(label) ||
      Boolean(route?.includes("/knowledge")),
  },
  {
    key: "documents",
    label: "Documents",
    href: "/workspace/documents",
    icon: "file-text",
    match: (id, label, route) =>
      /document/i.test(id) ||
      /document/i.test(label) ||
      Boolean(route?.includes("/documents")),
  },
];

export type WorkbenchRailModel = {
  readonly primary: readonly ActivityBarItem[];
  readonly footer: readonly ActivityBarItem[];
  readonly productivityProducts: readonly RailProductMeta[];
  readonly sidebarTitle: string;
  readonly contextSidebarItems: readonly SidebarItem[];
  readonly mode:
    | "home"
    | "productivity-launcher"
    | "product"
    | "quality"
    | "security"
    | "source"
    | "search"
    | "notifications"
    | "other";
};

function hasProduct(effective: ReadonlySet<string>, key: ProductKey): boolean {
  return effective.has(key);
}

function isProductivityNavItem(item: ActivityBarItem): boolean {
  return PRODUCTIVITY_PRODUCTS.some((p) => p.match(item.id, item.label));
}

function isAdminOrOps(item: ActivityBarItem): boolean {
  return /admin|operation|observ|config|identity|metric|billing|console/i.test(
    `${item.id} ${item.label}`,
  );
}

/**
 * Build rail from effective product keys + existing presentation items.
 * Never shows inaccessible products as disabled.
 */
export function composeWorkbenchRail(input: {
  readonly activityBarItems: readonly ActivityBarItem[];
  readonly sidebarItems: readonly SidebarItem[];
  readonly effectiveProducts: readonly string[];
  readonly pathname: string;
  readonly activeRailId?: string;
  /** Independent Source Workspace access (source.read) — not implied by QEP. */
  readonly hasSourceAccess?: boolean;
  /** Effective session permissions — used to filter QEP IA. */
  readonly permissions?: readonly string[];
}): WorkbenchRailModel {
  const effective = new Set(input.effectiveProducts);
  const productivityProducts = PRODUCTIVITY_PRODUCTS.filter((p) =>
    hasProduct(effective, p.key),
  );

  const hasQep =
    hasProduct(effective, "qep") ||
    input.activityBarItems.some((i) =>
      /qep|quality|testing/i.test(`${i.id} ${i.label}`),
    );
  const hasPen =
    hasProduct(effective, "pentest") ||
    input.pathname.startsWith("/apzpen") ||
    input.pathname.startsWith("/workspace/pen") ||
    input.activityBarItems.some((i) =>
      /pen|security|pentest/i.test(`${i.id} ${i.label}`),
    );
  const hasSourceEntitlement = input.hasSourceAccess === true;
  const showSourceRail =
    hasSourceEntitlement || input.pathname.startsWith("/workspace/source");

  const path = input.pathname;
  const onHome = path === "/workspace/home" || path === "/workspace/home/";
  const onMyWorkQueues =
    path === "/workspace/my-work" || path.startsWith("/workspace/my-work/");
  const onProductivityProduct = productivityProducts.some((p) =>
    path.startsWith(p.href),
  );
  const onQep =
    path.startsWith("/workspace/qep") || path.startsWith("/workspace/testing");
  const onPen = path.startsWith("/apzpen") || path.startsWith("/workspace/pen");
  const onSource = path.startsWith("/workspace/source");
  const onSearch = path.startsWith("/workspace/search");
  const onNotifications = path.startsWith("/workspace/notifications");

  const activeId =
    input.activeRailId ??
    (onHome
      ? "home"
      : onMyWorkQueues
        ? "productivity"
        : onProductivityProduct
          ? "productivity"
          : onQep
            ? "quality"
            : onPen
              ? "security"
              : onSource
                ? "source"
                : onSearch
                  ? "search"
                  : onNotifications
                    ? "notifications"
                    : "home");

  const primary: ActivityBarItem[] = [
    {
      id: "home",
      label: "Home / My Work",
      icon: "house",
      active: activeId === "home",
      ariaLabel: "Home / My Work",
    },
  ];

  if (productivityProducts.length > 0) {
    primary.push({
      id: "productivity",
      label: "Productivity",
      icon: "layout-grid",
      active: activeId === "productivity",
      ariaLabel: "Productivity",
    });
  }

  if (hasQep) {
    primary.push({
      id: "quality",
      label: "APZQEP",
      icon: "badge-check",
      active: activeId === "quality",
      ariaLabel: "APZQEP",
    });
  }

  if (hasPen) {
    primary.push({
      id: "security",
      label: "Security",
      icon: "shield",
      active: activeId === "security",
      ariaLabel: "Security",
    });
  }

  if (showSourceRail) {
    primary.push({
      id: "source",
      label: "Source",
      icon: "code-2",
      active: activeId === "source",
      ariaLabel: "Source",
    });
  }

  primary.push(
    {
      id: "search",
      label: "Search",
      icon: "search",
      active: activeId === "search",
      ariaLabel: "Search",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: "bell",
      active: activeId === "notifications",
      ariaLabel: "Notifications",
    },
  );

  const moreCandidates = input.activityBarItems.filter(
    (i) =>
      !isProductivityNavItem(i) &&
      !/home|search|notif|qep|quality|testing|source|pen|security/i.test(
        `${i.id} ${i.label}`,
      ) &&
      !isAdminOrOps(i),
  );
  if (moreCandidates.length > 0) {
    primary.push({
      id: "more",
      label: "More",
      icon: "ellipsis",
      active: activeId === "more",
      ariaLabel: "More",
    });
  }

  const footer: ActivityBarItem[] = [
    {
      id: "settings",
      label: "Settings",
      icon: "settings",
      active:
        path.startsWith("/workspace/personalisation") ||
        path.startsWith("/workspace/settings"),
      ariaLabel: "Settings",
    },
    {
      id: "account",
      label: "Account",
      icon: "user",
      active: false,
      ariaLabel: "Account",
    },
  ];

  let mode: WorkbenchRailModel["mode"] = "other";
  let sidebarTitle = "WORKSPACE";
  let contextSidebarItems: SidebarItem[] = [...input.sidebarItems];

  // Explicit Productivity rail click always shows the launcher (Owner Slice 2).
  const explicitProductivityClick = input.activeRailId === "productivity";

  if (explicitProductivityClick || (activeId === "productivity" && onMyWorkQueues)) {
    mode = "productivity-launcher";
    sidebarTitle = "PRODUCTIVITY";
    contextSidebarItems = [
      ...composeProductivityLauncherSidebar({
        pathname: path,
        products: productivityProducts,
      }),
    ];
  } else if (activeId === "productivity" && !onProductivityProduct) {
    mode = "productivity-launcher";
    sidebarTitle = "PRODUCTIVITY";
    contextSidebarItems = [
      ...composeProductivityLauncherSidebar({
        pathname: path,
        products: productivityProducts,
      }),
    ];
  } else if (activeId === "home" || onHome) {
    mode = "home";
    sidebarTitle = "MY WORK";
    contextSidebarItems = [
      { id: "nav-home", label: "Home", icon: "house", active: onHome },
      {
        id: "nav-assigned",
        label: "Assigned to Me",
        icon: "user-check",
        active: onMyWorkQueues,
      },
      {
        id: "nav-activity",
        label: "Activity",
        icon: "activity",
        active: path.startsWith("/workspace/activity"),
      },
    ];
  } else if (onProductivityProduct) {
    mode = "product";
    const current = productivityProducts.find((p) => path.startsWith(p.href));
    sidebarTitle = current?.label.toUpperCase() ?? "PRODUCTIVITY";
    contextSidebarItems = current
      ? [...composeProductContextSidebar(current.key, path)]
      : [
          ...composeProductivityLauncherSidebar({
            pathname: path,
            products: productivityProducts,
          }),
        ];
  } else if (activeId === "quality" || onQep) {
    mode = "quality";
    sidebarTitle = "APZQEP";
    contextSidebarItems = [
      ...composeQepContextSidebar(path, {
        hasSourceAccess: hasSourceEntitlement,
        entitled: hasQep,
        permissions: input.permissions,
      }),
    ];
  } else if (activeId === "security" || onPen) {
    mode = "security";
    sidebarTitle = "SECURITY";
    contextSidebarItems = [
      ...composePenContextSidebar(path, {
        hasSourceAccess: hasSourceEntitlement,
      }),
    ];
  } else if (activeId === "source" || onSource) {
    mode = "source";
    sidebarTitle = "EXPLORER";
    contextSidebarItems = [
      {
        id: "source-repos",
        label: "Repositories",
        icon: "folder-git-2",
        active:
          path === "/workspace/source" ||
          path.startsWith("/workspace/source/repositories"),
      },
      {
        id: "source-changes",
        label: "Changes",
        icon: "git-commit-horizontal",
        active: path.startsWith("/workspace/source/changes"),
      },
    ];
  } else if (activeId === "search" || onSearch) {
    mode = "search";
    sidebarTitle = "SEARCH";
  } else if (activeId === "notifications" || onNotifications) {
    mode = "notifications";
    sidebarTitle = "NOTIFICATIONS";
  }

  return {
    primary,
    footer,
    productivityProducts,
    sidebarTitle,
    contextSidebarItems,
    mode,
  };
}

export { PRD_PRODUCT_KEYS };
