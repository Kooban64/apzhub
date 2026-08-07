/**
 * APZ Projects Cockpit Focus Navigation (W002 D8.1).
 * Intents are the product navigation identity; registers are surfaces inside intents.
 */

export const COCKPIT_INTENTS = [
  "overview",
  "delivery",
  "planning",
  "control",
  "history",
] as const;

export type CockpitIntent = (typeof COCKPIT_INTENTS)[number];

/** Surfaces opened inside an intent (query ?surface=). */
export type CockpitSurface =
  | "risks"
  | "decisions"
  | "actions"
  | "milestones"
  | "roadmap"
  | "tasks"
  | "backlog"
  | "sprints"
  | "lifecycle"
  | "settings"
  | "waiting"
  | "commitments";

export type CockpitResolution = {
  readonly intent: CockpitIntent;
  readonly surface?: CockpitSurface;
  /** True when path was a legacy entity tab. */
  readonly legacy: boolean;
};

const INTENT_SET = new Set<string>(COCKPIT_INTENTS);

const LEGACY_MAP: Record<string, CockpitResolution> = {
  overview: { intent: "overview", legacy: true },
  delivery: { intent: "delivery", legacy: true },
  control: { intent: "control", legacy: true },
  history: { intent: "history", legacy: false },
  milestones: { intent: "planning", surface: "milestones", legacy: true },
  roadmap: { intent: "planning", surface: "roadmap", legacy: true },
  risks: { intent: "control", surface: "risks", legacy: true },
  decisions: { intent: "control", surface: "decisions", legacy: true },
  actions: { intent: "control", surface: "actions", legacy: true },
  tasks: { intent: "delivery", surface: "tasks", legacy: true },
  backlog: { intent: "delivery", surface: "backlog", legacy: true },
  sprints: { intent: "delivery", surface: "sprints", legacy: true },
  lifecycle: { intent: "overview", surface: "lifecycle", legacy: true },
};

export function resolveCockpitRoute(
  pathSegment: string | undefined,
  surfaceQuery?: string | null,
): CockpitResolution {
  if (!pathSegment) {
    return applySurfaceQuery({ intent: "overview", legacy: false }, surfaceQuery);
  }
  if (INTENT_SET.has(pathSegment)) {
    return applySurfaceQuery(
      { intent: pathSegment as CockpitIntent, legacy: false },
      surfaceQuery,
    );
  }
  const mapped = LEGACY_MAP[pathSegment];
  if (mapped) {
    return applySurfaceQuery(mapped, surfaceQuery);
  }
  return { intent: "overview", legacy: true };
}

function applySurfaceQuery(
  base: CockpitResolution,
  surfaceQuery?: string | null,
): CockpitResolution {
  if (!surfaceQuery) return base;
  const allowed: CockpitSurface[] = [
    "risks",
    "decisions",
    "actions",
    "milestones",
    "roadmap",
    "tasks",
    "backlog",
    "sprints",
    "lifecycle",
    "settings",
    "waiting",
    "commitments",
  ];
  if (allowed.includes(surfaceQuery as CockpitSurface)) {
    return { ...base, surface: surfaceQuery as CockpitSurface };
  }
  return base;
}

export function cockpitPath(
  projectId: string,
  intent: CockpitIntent = "overview",
  surface?: CockpitSurface,
  objectRef?: string,
): string {
  const base =
    intent === "overview"
      ? `/workspace/projects/${projectId}`
      : `/workspace/projects/${projectId}/${intent}`;
  const params = new URLSearchParams();
  if (surface) params.set("surface", surface);
  if (objectRef) params.set("obj", objectRef);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function intentLabel(intent: CockpitIntent): string {
  switch (intent) {
    case "overview":
      return "Overview";
    case "delivery":
      return "Delivery";
    case "planning":
      return "Planning";
    case "control":
      return "Control";
    case "history":
      return "History";
    default:
      return intent;
  }
}
