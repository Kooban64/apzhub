import type { LayoutState, PanelState, ShellRegionId } from "../interfaces/types";
import { parseSelectionState } from "../engines/selection-engine/selection-state";
import type { SelectionState } from "../interfaces/types";

export const WORKBENCH_SESSION_SCHEMA_VERSION = "1.0" as const;

export type WorkbenchSessionSchemaVersion = typeof WORKBENCH_SESSION_SCHEMA_VERSION;

export interface WorkbenchSessionViewEntry {
  readonly viewId: string;
  readonly workspace: string;
}

export interface WorkbenchSessionPayload {
  readonly schemaVersion: WorkbenchSessionSchemaVersion;
  readonly activeWorkspace: string;
  readonly focusedViewId?: string;
  readonly activeActivityBarItemId?: string;
  readonly activeSidebarItemId?: string;
  readonly openViews: readonly WorkbenchSessionViewEntry[];
  readonly panels: {
    readonly sidebar?: { readonly collapsed: boolean; readonly width: number };
    readonly context?: {
      readonly collapsed: boolean;
      readonly width: number;
      readonly activeTab?: string;
    };
  };
  readonly layout?: {
    readonly regions: Partial<Record<ShellRegionId, { readonly visible: boolean }>>;
  };
  readonly dock?: { readonly splitRatios: Readonly<Record<string, number>> };
  readonly selection?: SelectionState;
  readonly capturedAt: string;
}

export type SessionRestoreStatus =
  "none" | "success" | "partial" | "invalid" | "version_mismatch";

export interface SessionParseResult {
  readonly ok: true;
  readonly payload: WorkbenchSessionPayload;
}

export interface SessionParseFailure {
  readonly ok: false;
  readonly status: SessionRestoreStatus;
  readonly errors: readonly string[];
}

export type SessionParseOutcome = SessionParseResult | SessionParseFailure;

export function createEmptySessionPayload(
  activeWorkspace: string,
  capturedAt = new Date().toISOString(),
): WorkbenchSessionPayload {
  return {
    schemaVersion: WORKBENCH_SESSION_SCHEMA_VERSION,
    activeWorkspace,
    openViews: [],
    panels: {},
    capturedAt,
  };
}

export function parseWorkbenchSessionPayload(raw: unknown): SessionParseOutcome {
  if (typeof raw !== "object" || raw === null) {
    return {
      ok: false,
      status: "invalid",
      errors: ["Session payload must be an object"],
    };
  }

  const candidate = raw as Record<string, unknown>;

  if (candidate.schemaVersion !== WORKBENCH_SESSION_SCHEMA_VERSION) {
    return {
      ok: false,
      status: "version_mismatch",
      errors: [
        `Unsupported session schema version "${String(candidate.schemaVersion)}"`,
      ],
    };
  }

  if (
    typeof candidate.activeWorkspace !== "string" ||
    candidate.activeWorkspace.length === 0
  ) {
    return {
      ok: false,
      status: "invalid",
      errors: ["activeWorkspace must be a non-empty string"],
    };
  }

  if (
    typeof candidate.capturedAt !== "string" ||
    Number.isNaN(Date.parse(candidate.capturedAt))
  ) {
    return {
      ok: false,
      status: "invalid",
      errors: ["capturedAt must be a valid ISO timestamp"],
    };
  }

  const openViews = parseOpenViews(candidate.openViews);
  if (!openViews.ok) {
    return openViews;
  }

  const panels = parsePanels(candidate.panels);

  return {
    ok: true,
    payload: {
      schemaVersion: WORKBENCH_SESSION_SCHEMA_VERSION,
      activeWorkspace: candidate.activeWorkspace,
      focusedViewId:
        typeof candidate.focusedViewId === "string"
          ? candidate.focusedViewId
          : undefined,
      activeActivityBarItemId:
        typeof candidate.activeActivityBarItemId === "string"
          ? candidate.activeActivityBarItemId
          : undefined,
      activeSidebarItemId:
        typeof candidate.activeSidebarItemId === "string"
          ? candidate.activeSidebarItemId
          : undefined,
      openViews: openViews.value,
      panels,
      layout: parseLayout(candidate.layout),
      dock: parseDock(candidate.dock),
      selection: parseSelection(candidate.selection),
      capturedAt: candidate.capturedAt,
    },
  };
}

function parseOpenViews(
  value: unknown,
):
  | { ok: true; value: WorkbenchSessionViewEntry[] }
  | { ok: false; status: SessionRestoreStatus; errors: string[] } {
  if (value === undefined) {
    return { ok: true, value: [] };
  }

  if (!Array.isArray(value)) {
    return { ok: false, status: "invalid", errors: ["openViews must be an array"] };
  }

  const entries: WorkbenchSessionViewEntry[] = [];

  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as WorkbenchSessionViewEntry).viewId !== "string" ||
      typeof (item as WorkbenchSessionViewEntry).workspace !== "string"
    ) {
      return {
        ok: false,
        status: "invalid",
        errors: ["openViews entries must include viewId and workspace"],
      };
    }

    entries.push({
      viewId: (item as WorkbenchSessionViewEntry).viewId,
      workspace: (item as WorkbenchSessionViewEntry).workspace,
    });
  }

  return { ok: true, value: entries };
}

function parsePanels(value: unknown): WorkbenchSessionPayload["panels"] {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  const panels = value as Record<string, unknown>;
  const parsed: {
    sidebar?: { collapsed: boolean; width: number };
    context?: { collapsed: boolean; width: number; activeTab?: string };
  } = {};

  if (panels.sidebar && typeof panels.sidebar === "object") {
    const sidebar = panels.sidebar as PanelState["sidebar"];
    if (typeof sidebar.collapsed === "boolean" && typeof sidebar.width === "number") {
      parsed.sidebar = { collapsed: sidebar.collapsed, width: sidebar.width };
    }
  }

  if (panels.context && typeof panels.context === "object") {
    const context = panels.context as PanelState["context"];
    if (typeof context.collapsed === "boolean" && typeof context.width === "number") {
      parsed.context = {
        collapsed: context.collapsed,
        width: context.width,
        activeTab: context.activeTabKey,
      };
    }
  }

  return parsed;
}

function parseLayout(value: unknown): WorkbenchSessionPayload["layout"] {
  if (typeof value !== "object" || value === null || !("regions" in value)) {
    return undefined;
  }

  const regions = (value as LayoutState).regions;
  if (typeof regions !== "object" || regions === null) {
    return undefined;
  }

  const parsed: NonNullable<WorkbenchSessionPayload["layout"]>["regions"] = {};

  for (const [regionId, region] of Object.entries(regions)) {
    if (region && typeof region.visible === "boolean") {
      parsed[regionId as ShellRegionId] = { visible: region.visible };
    }
  }

  return { regions: parsed };
}

function parseDock(value: unknown): WorkbenchSessionPayload["dock"] {
  if (typeof value !== "object" || value === null || !("splitRatios" in value)) {
    return undefined;
  }

  const splitRatios = (value as { splitRatios?: Record<string, number> }).splitRatios;
  if (typeof splitRatios !== "object" || splitRatios === null) {
    return undefined;
  }

  return { splitRatios: { ...splitRatios } };
}

function parseSelection(value: unknown): SelectionState | undefined {
  return parseSelectionState(value);
}
