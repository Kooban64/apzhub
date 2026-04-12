import type { ShellChromeConfig, ShellMode } from "@/types/shell-config";

/** Product defaults for shell chrome; safe to import from route layouts (not from `AppShell`). */

export function getWorkspaceChrome(): ShellChromeConfig {
  return {
    mode: "workspace",
    splitStorageId: "apzhub-main-workspace",
    headerContextTitle: "Workspace",
    brandHomeHref: "/workspace",
    primaryNav: [
      { id: "home", href: "/workspace", label: "Home", iconKey: "layout-dashboard" },
      {
        id: "admin",
        href: "/admin",
        label: "Admin",
        iconKey: "shield",
        tone: "muted",
      },
    ],
    mobileQuickSwitch: { href: "/admin", label: "Admin" },
  };
}

export function getAdminChrome(): ShellChromeConfig {
  return {
    mode: "admin",
    splitStorageId: "apzhub-main-admin",
    headerContextTitle: "Admin",
    brandHomeHref: "/admin",
    primaryNav: [
      { id: "admin-home", href: "/admin", label: "Admin Home", iconKey: "shield" },
      {
        id: "workspace",
        href: "/workspace",
        label: "Workspace",
        iconKey: "layout-dashboard",
        tone: "muted",
      },
    ],
    mobileQuickSwitch: { href: "/workspace", label: "Workspace" },
  };
}

export function getChromeForMode(mode: ShellMode): ShellChromeConfig {
  return mode === "admin" ? getAdminChrome() : getWorkspaceChrome();
}
