/**
 * User-specific Operational Workspace preferences (W002).
 * Does not alter enterprise behaviour or permissions.
 */

export type WorkspaceDensity = "comfortable" | "compact" | "dense";

export type WorkspacePreferences = {
  readonly density: WorkspaceDensity;
  readonly portfolioSort: string;
  readonly healthFilter: string;
  readonly confidenceFilter: string;
  readonly agedWaitOnly: boolean;
  readonly queueKind: string;
  readonly collapsedDecision: boolean;
  readonly collapsedAttention: boolean;
  readonly collapsedWaiting: boolean;
};

const KEY = "apzhub.projects.workspacePreferences.v1";

const DEFAULTS: WorkspacePreferences = Object.freeze({
  density: "comfortable",
  portfolioSort: "attention",
  healthFilter: "",
  confidenceFilter: "",
  agedWaitOnly: false,
  queueKind: "",
  collapsedDecision: false,
  collapsedAttention: false,
  collapsedWaiting: false,
});

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readWorkspacePreferences(): WorkspacePreferences {
  if (!canUseStorage()) return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<WorkspacePreferences>;
    return Object.freeze({
      density:
        parsed.density === "compact" || parsed.density === "dense"
          ? parsed.density
          : "comfortable",
      portfolioSort:
        typeof parsed.portfolioSort === "string" && parsed.portfolioSort
          ? parsed.portfolioSort
          : DEFAULTS.portfolioSort,
      healthFilter: typeof parsed.healthFilter === "string" ? parsed.healthFilter : "",
      confidenceFilter:
        typeof parsed.confidenceFilter === "string" ? parsed.confidenceFilter : "",
      agedWaitOnly: Boolean(parsed.agedWaitOnly),
      queueKind: typeof parsed.queueKind === "string" ? parsed.queueKind : "",
      collapsedDecision: Boolean(parsed.collapsedDecision),
      collapsedAttention: Boolean(parsed.collapsedAttention),
      collapsedWaiting: Boolean(parsed.collapsedWaiting),
    });
  } catch {
    return DEFAULTS;
  }
}

export function writeWorkspacePreferences(
  patch: Partial<WorkspacePreferences>,
): WorkspacePreferences {
  const next = Object.freeze({ ...readWorkspacePreferences(), ...patch });
  if (!canUseStorage()) return next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function defaultWorkspacePreferences(): WorkspacePreferences {
  return DEFAULTS;
}
