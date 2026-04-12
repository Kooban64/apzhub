import type { ReactNode } from "react";

/** Shell chrome mode — layout and persistence only, not RBAC. */
export type ShellMode = "workspace" | "admin";

export type ShellNavIconKey = "layout-dashboard" | "shield";

export type ShellPrimaryNavItem = {
  id: string;
  href: string;
  label: string;
  iconKey: ShellNavIconKey;
  /** Muted “switch area” row vs primary destinations */
  tone?: "default" | "muted";
};

export type ShellChromeConfig = {
  mode: ShellMode;
  /** Stable id for split layout persistence (no pathname parsing inside AppShell). */
  splitStorageId: string;
  headerContextTitle: string;
  brandHomeHref: string;
  primaryNav: ShellPrimaryNavItem[];
  /** Optional quick switch shown on small screens (e.g. jump to other mode). */
  mobileQuickSwitch?: { href: string; label: string };
};

export type AppShellProps = {
  children: React.ReactNode;
  versionLabel: string;
  chrome: ShellChromeConfig;
  /** Main pathname for active nav styling — supplied by route layout. */
  pathname: string;
  /** Secondary column body; layout composes from features — AppShell does not import features. */
  secondaryRail?: ReactNode | null | undefined;
};
