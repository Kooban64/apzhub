/**
 * Phase J — User Inspector timeline enrichment (Activity · Audit · Sessions).
 */

import { loadSharedActivityTimelineContext } from "@/lib/load-shared-activity-timeline-context";
import { getPlatformServiceGateway } from "@/lib/api/v1/gateway/bootstrap";

export type ActivityAccessLine = {
  readonly id: string;
  readonly title: string;
  readonly timestamp: string;
  readonly activityTypeId: string;
  readonly why: string;
};

export type AuditAccessLine = {
  readonly id: string;
  readonly summary: string;
  readonly timestamp: string;
  readonly why: string;
};

export type SessionAccessLine = {
  readonly status: "unavailable" | "none";
  readonly why: string;
};

export type InspectionTimelineTabs = {
  readonly activity: readonly ActivityAccessLine[];
  readonly audit: readonly AuditAccessLine[];
  readonly sessions: readonly SessionAccessLine[];
};

export async function loadInspectionTimelineTabs(input: {
  readonly userId: string;
  readonly serviceContext: {
    readonly userId: string;
    readonly tenantId?: string;
    readonly permissions?: readonly string[];
    readonly correlationId?: string;
  };
}): Promise<InspectionTimelineTabs> {
  const activity: ActivityAccessLine[] = [];
  try {
    const timeline = await loadSharedActivityTimelineContext();
    const docs = timeline?.service.listActivities() ?? [];
    for (const doc of docs) {
      if (!doc.actor?.id || doc.actor.id !== input.userId) continue;
      activity.push({
        id: doc.activityId,
        title: doc.title,
        timestamp: doc.timestamp,
        activityTypeId: doc.activityTypeId,
        why: `Activity attributed to this user (actor ${doc.actor.id}).`,
      });
      if (activity.length >= 25) break;
    }
  } catch {
    // Timeline optional in CE.
  }

  const audit: AuditAccessLine[] = [];
  if (!input.userId.startsWith("pending:")) {
    try {
      const gateway = await getPlatformServiceGateway();
      const history = gateway.identity?.history;
      if (history?.list) {
        const items = await history.list(
          input.serviceContext as never,
          input.userId as never,
        );
        for (const item of items.slice(0, 25)) {
          const record = item as {
            id?: string;
            historyId?: string;
            summary?: string;
            action?: string;
            createdAt?: string;
            timestamp?: string;
          };
          audit.push({
            id: String(record.id ?? record.historyId ?? "history"),
            summary: String(
              record.summary ?? record.action ?? "Identity history entry",
            ),
            timestamp: String(record.createdAt ?? record.timestamp ?? ""),
            why: "Identity history entry for this userId.",
          });
        }
      }
    } catch {
      // Identity history may be unavailable.
    }
  }

  const sessions: SessionAccessLine[] = [
    {
      status: "unavailable",
      why: "Session list/revoke is not exposed yet — BetterAuth session admin API is not wired. No fake sessions.",
    },
  ];

  if (activity.length === 0) {
    activity.push({
      id: "none",
      title: "No recent activity",
      timestamp: "",
      activityTypeId: "none",
      why: "No Activity Timeline documents currently attribute this user as actor.",
    });
  }
  if (audit.length === 0) {
    audit.push({
      id: "none",
      summary: "No identity history",
      timestamp: "",
      why: "No identity history entries for this user (or history service unavailable).",
    });
  }

  return { activity, audit, sessions };
}
