import type { NotificationSeverity } from "../domain/classification";
import type { NotificationPreference } from "../domain/types";

const SEVERITY_RANK: Record<NotificationSeverity, number> = {
  info: 0,
  warning: 1,
  error: 2,
  critical: 3,
};

export type PreferenceStore = {
  upsert(preference: NotificationPreference): void;
  get(input: {
    readonly tenantId: string;
    readonly subjectKind: NotificationPreference["subjectKind"];
    readonly subjectId: string;
  }): NotificationPreference | undefined;
  list(tenantId: string): readonly NotificationPreference[];
};

export function createInMemoryPreferenceStore(
  initial: readonly NotificationPreference[] = [],
): PreferenceStore {
  const key = (tenantId: string, subjectKind: string, subjectId: string): string =>
    `${tenantId}:${subjectKind}:${subjectId}`;
  const map = new Map<string, NotificationPreference>();
  for (const p of initial) {
    map.set(key(p.tenantId, p.subjectKind, p.subjectId), p);
  }
  return {
    upsert(preference) {
      map.set(
        key(preference.tenantId, preference.subjectKind, preference.subjectId),
        preference,
      );
    },
    get(input) {
      return map.get(key(input.tenantId, input.subjectKind, input.subjectId));
    },
    list(tenantId) {
      return [...map.values()].filter((p) => p.tenantId === tenantId);
    },
  };
}

export type PreferenceDecision =
  | { readonly allow: true; readonly channelId: string }
  | { readonly allow: false; readonly reason: string };

export function evaluatePreference(input: {
  readonly preference: NotificationPreference | undefined;
  readonly channelId: string;
  readonly category: string;
  readonly severity: NotificationSeverity;
}): PreferenceDecision {
  const pref = input.preference;
  if (!pref) {
    return { allow: true, channelId: input.channelId };
  }
  if (!pref.enabled) {
    return { allow: false, reason: "preference.disabled" };
  }
  if (pref.mutedCategories.includes(input.category)) {
    return { allow: false, reason: "preference.muted_category" };
  }
  if (
    pref.allowedChannels.length > 0 &&
    !pref.allowedChannels.includes(input.channelId)
  ) {
    return { allow: false, reason: "preference.channel_blocked" };
  }
  if (
    pref.minSeverity &&
    SEVERITY_RANK[input.severity] < SEVERITY_RANK[pref.minSeverity]
  ) {
    return { allow: false, reason: "preference.below_min_severity" };
  }
  return { allow: true, channelId: input.channelId };
}
