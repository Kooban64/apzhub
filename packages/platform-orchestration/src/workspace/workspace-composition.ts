/**
 * Workspace composition helpers (QO-017).
 * Composition only — every item resolves to existing artefact/contract refs.
 */

import type {
  WorkspaceLayout,
  WorkspaceLayoutKind,
  WorkspaceNavigationPreferences,
  WorkspacePreferences,
} from "../contracts/workspace-experience";
import { WORKSPACE_LAYOUT_KINDS } from "../contracts/workspace-experience";

export function isWorkspaceLayoutKind(value: string): value is WorkspaceLayoutKind {
  return (WORKSPACE_LAYOUT_KINDS as readonly string[]).includes(value);
}

export function buildNavigationPreferences(input: {
  readonly entryPoints?: readonly string[];
  readonly navigationGroups?: readonly string[];
  readonly breadcrumbs?: readonly string[];
  readonly deepLinkHints?: readonly string[];
}): WorkspaceNavigationPreferences {
  return Object.freeze({
    navigationModelId: `wsnav_${Date.now().toString(36)}`,
    entryPoints: Object.freeze([
      ...(input.entryPoints ?? [
        "ops_home",
        "readiness",
        "evidence",
        "executive_projection",
      ]),
    ]),
    navigationGroups: Object.freeze([
      ...(input.navigationGroups ?? [
        "operations",
        "readiness",
        "evidence",
        "executive",
      ]),
    ]),
    breadcrumbs: Object.freeze([...(input.breadcrumbs ?? ["workspace", "operations"])]),
    deepLinkHints: Object.freeze([...(input.deepLinkHints ?? [])]),
    compositionOnly: true as const,
    metadata: Object.freeze({}),
  });
}

export function buildWorkspaceLayout(input: {
  readonly kind: WorkspaceLayoutKind;
  readonly name?: string;
  readonly panelRefs?: readonly string[];
  readonly contextPanelRefs?: readonly string[];
  readonly viewRefs?: readonly string[];
}): WorkspaceLayout {
  const defaults: Record<
    WorkspaceLayoutKind,
    { name: string; panels: string[]; views: string[] }
  > = {
    operations_console: {
      name: "Operations Console",
      panels: ["panel:readiness", "panel:events", "panel:navigation"],
      views: ["view:ops_overview"],
    },
    operator_home: {
      name: "Operator Home",
      panels: ["panel:tasks", "panel:readiness"],
      views: ["view:operator_home"],
    },
    incident_focus: {
      name: "Incident Focus",
      panels: ["panel:incident", "panel:context"],
      views: ["view:incident"],
    },
    readiness_focus: {
      name: "Readiness Focus",
      panels: ["panel:health", "panel:readiness", "panel:liveness"],
      views: ["view:readiness"],
    },
    evidence_focus: {
      name: "Evidence Focus",
      panels: ["panel:evidence", "panel:traceability"],
      views: ["view:evidence"],
    },
    custom: {
      name: "Custom Workspace",
      panels: [],
      views: [],
    },
  };
  const d = defaults[input.kind];
  return Object.freeze({
    layoutId: `wslayout_${input.kind}`,
    kind: input.kind,
    name: input.name?.trim() || d.name,
    panelRefs: Object.freeze([...(input.panelRefs ?? d.panels)]),
    contextPanelRefs: Object.freeze([...(input.contextPanelRefs ?? ["panel:context"])]),
    viewRefs: Object.freeze([...(input.viewRefs ?? d.views)]),
    compositionOnly: true as const,
    ownsBusinessState: false as const,
    metadata: Object.freeze({}),
  });
}

export function buildWorkspacePreferences(input: {
  readonly defaultLayoutKind: WorkspaceLayoutKind;
  readonly densityHint?: "compact" | "comfortable" | "spacious";
  readonly pinnedEntryPoints?: readonly string[];
}): WorkspacePreferences {
  return Object.freeze({
    preferenceId: `wspref_${Date.now().toString(36)}`,
    defaultLayoutKind: input.defaultLayoutKind,
    densityHint: input.densityHint,
    pinnedEntryPoints: Object.freeze([...(input.pinnedEntryPoints ?? [])]),
    metadata: Object.freeze({}),
  });
}
