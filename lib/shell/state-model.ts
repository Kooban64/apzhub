import type { Layout } from "react-resizable-panels";
import { z } from "zod";

import type { ShellMode } from "@/types/shell-config";

const STORAGE_KEY = "apzhub.shell.state.v1";

const layoutSchema = z.record(z.string(), z.number());

export const shellStateV1Schema = z.object({
  version: z.literal(1),
  primaryRailCollapsed: z.boolean(),
  secondaryRailOpenByMode: z.object({
    workspace: z.boolean(),
    admin: z.boolean(),
  }),
  rightPanelCollapsed: z.boolean(),
  splitLayouts: z.record(z.string(), layoutSchema),
  /** Last explicit workspace/admin choice when both modes are available (Phase 2 mode switch). */
  preferredShellMode: z.enum(["workspace", "admin"]).optional(),
});

export type ShellStateV1 = z.infer<typeof shellStateV1Schema>;

const defaultState = (): ShellStateV1 => ({
  version: 1,
  primaryRailCollapsed: false,
  secondaryRailOpenByMode: {
    workspace: false,
    /** Admin local nav (SecondaryRail) starts closed — avoids “double sidebar” with PrimaryRail until user opens it. */
    admin: false,
  },
  rightPanelCollapsed: false,
  splitLayouts: {},
  preferredShellMode: undefined,
});

function readLegacyBooleans(): Partial<{
  primaryRailCollapsed: boolean;
  rightPanelCollapsed: boolean;
  secondaryWorkspace: boolean;
  secondaryAdmin: boolean;
}> {
  if (typeof window === "undefined") {
    return {};
  }
  const out: {
    primaryRailCollapsed?: boolean;
    rightPanelCollapsed?: boolean;
    secondaryWorkspace?: boolean;
    secondaryAdmin?: boolean;
  } = {};
  const pr = window.localStorage.getItem("apzhub.shell.primaryCollapsed");
  if (pr === "true") {
    out.primaryRailCollapsed = true;
  }
  if (pr === "false") {
    out.primaryRailCollapsed = false;
  }
  const rc = window.localStorage.getItem("apzhub.shell.rightPanelCollapsed");
  if (rc === "true") {
    out.rightPanelCollapsed = true;
  }
  if (rc === "false") {
    out.rightPanelCollapsed = false;
  }
  const sw = window.localStorage.getItem("apzhub.shell.secondaryOpen.workspace");
  if (sw === "true") {
    out.secondaryWorkspace = true;
  }
  if (sw === "false") {
    out.secondaryWorkspace = false;
  }
  const sa = window.localStorage.getItem("apzhub.shell.secondaryOpen.admin");
  if (sa === "true") {
    out.secondaryAdmin = true;
  }
  if (sa === "false") {
    out.secondaryAdmin = false;
  }
  return out;
}

function readLegacyLayout(splitId: string): Record<string, number> | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(`apzhub.layout.${splitId}`);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    const r = layoutSchema.safeParse(parsed);
    return r.success ? (parsed as Record<string, number>) : null;
  } catch {
    return null;
  }
}

export function readShellState(): ShellStateV1 {
  if (typeof window === "undefined") {
    return defaultState();
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      const r = shellStateV1Schema.safeParse(parsed);
      if (r.success) {
        return r.data;
      }
    } catch {
      /* fall through */
    }
  }

  const merged = defaultState();
  const leg = readLegacyBooleans();
  if (typeof leg.primaryRailCollapsed === "boolean") {
    merged.primaryRailCollapsed = leg.primaryRailCollapsed;
  }
  if (typeof leg.rightPanelCollapsed === "boolean") {
    merged.rightPanelCollapsed = leg.rightPanelCollapsed;
  }
  if (typeof leg.secondaryWorkspace === "boolean") {
    merged.secondaryRailOpenByMode.workspace = leg.secondaryWorkspace;
  }
  if (typeof leg.secondaryAdmin === "boolean") {
    merged.secondaryRailOpenByMode.admin = leg.secondaryAdmin;
  }

  (["apzhub-main-workspace", "apzhub-main-admin"] as const).forEach((id) => {
    const layout = readLegacyLayout(id);
    if (layout) {
      merged.splitLayouts[id] = layout;
    }
  });

  return merged;
}

export function writeShellState(next: ShellStateV1): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shellStateV1Schema.parse(next)));
}

export type ShellStatePatch = {
  primaryRailCollapsed?: boolean;
  rightPanelCollapsed?: boolean;
  secondaryRailOpenByMode?: Partial<ShellStateV1["secondaryRailOpenByMode"]>;
  splitLayouts?: Partial<ShellStateV1["splitLayouts"]>;
  preferredShellMode?: ShellMode;
};

export function applyShellPatch(patch: ShellStatePatch): ShellStateV1 {
  const cur = readShellState();
  const next = shellStateV1Schema.parse({
    version: 1 as const,
    primaryRailCollapsed: patch.primaryRailCollapsed ?? cur.primaryRailCollapsed,
    rightPanelCollapsed: patch.rightPanelCollapsed ?? cur.rightPanelCollapsed,
    secondaryRailOpenByMode: {
      ...cur.secondaryRailOpenByMode,
      ...patch.secondaryRailOpenByMode,
    },
    splitLayouts: {
      ...cur.splitLayouts,
      ...patch.splitLayouts,
    },
    preferredShellMode: patch.preferredShellMode ?? cur.preferredShellMode,
  });
  writeShellState(next);
  return next;
}

export function getSecondaryOpenForMode(mode: ShellMode, state: ShellStateV1): boolean {
  return state.secondaryRailOpenByMode[mode];
}

export function setSecondaryOpenForMode(mode: ShellMode, open: boolean): void {
  applyShellPatch({
    secondaryRailOpenByMode: {
      [mode]: open,
    },
  });
}

export function getSplitLayoutRecord(splitId: string, state: ShellStateV1): Record<string, number> | null {
  const v = state.splitLayouts[splitId];
  if (!v || Object.keys(v).length === 0) {
    return null;
  }
  return v;
}

export function setSplitLayout(splitId: string, layout: Layout): void {
  applyShellPatch({
    splitLayouts: {
      [splitId]: layout as Record<string, number>,
    },
  });
}
