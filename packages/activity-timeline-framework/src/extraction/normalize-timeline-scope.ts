import {
  TIMELINE_SCOPE_ORGANIZATION,
  TIMELINE_SCOPE_PERSONAL,
  TIMELINE_SCOPE_SYSTEM,
  TIMELINE_SCOPE_TEAM,
  type TimelineScopeId,
} from "../types/timeline-scope";

const MANIFEST_SCOPE_ALIASES: Readonly<Record<string, TimelineScopeId>> = {
  personal: TIMELINE_SCOPE_PERSONAL,
  team: TIMELINE_SCOPE_TEAM,
  workspace: TIMELINE_SCOPE_ORGANIZATION,
  organization: TIMELINE_SCOPE_ORGANIZATION,
  system: TIMELINE_SCOPE_SYSTEM,
  [TIMELINE_SCOPE_PERSONAL]: TIMELINE_SCOPE_PERSONAL,
  [TIMELINE_SCOPE_TEAM]: TIMELINE_SCOPE_TEAM,
  [TIMELINE_SCOPE_ORGANIZATION]: TIMELINE_SCOPE_ORGANIZATION,
  [TIMELINE_SCOPE_SYSTEM]: TIMELINE_SCOPE_SYSTEM,
};

/** Maps manifest scope tokens to canonical reserved timeline scope ids. */
export function normalizeManifestTimelineScope(
  value: string,
): TimelineScopeId | undefined {
  const normalized = value.trim().toLowerCase();
  return MANIFEST_SCOPE_ALIASES[normalized];
}
