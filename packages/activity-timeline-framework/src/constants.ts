import { TIMELINE_SCOPE_PERSONAL } from "./types/timeline-scope";

/** Canonical manifest block for activity type declarations. */
export const ACTIVITY_MANIFEST_BLOCK = "activities.types" as const;

/** Canonical manifest block for timeline definition declarations (under `activities`). */
export const ACTIVITY_TIMELINES_MANIFEST_BLOCK = "activities.timelines" as const;

/** Default timeline scope — SPR-007 locked decision. */
export const DEFAULT_TIMELINE_SCOPE_ID = TIMELINE_SCOPE_PERSONAL;
