import type {
  KimaiActivityRecord,
  KimaiCustomerRecord,
  KimaiProjectRecord,
  KimaiTagRecord,
  KimaiTimesheetRecord,
} from "../internal/kimai-api-types";
import type {
  KimaiDomainActivity,
  KimaiDomainCustomer,
  KimaiDomainProject,
  KimaiDomainTag,
  KimaiDomainTimesheet,
} from "../models/domain";
import { KIMAI_ID_PREFIX, toIsoDateTime, toPlatformTimeId } from "./id-helpers";

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeTags(tags: readonly string[] | undefined): readonly string[] {
  if (!tags) return [];
  return tags.map((tag) => {
    // Prefer stable platform ids when tags were previously created with numeric ids.
    if (/^\d+$/.test(tag)) {
      return toPlatformTimeId(KIMAI_ID_PREFIX.tag, Number(tag));
    }
    return tag.startsWith(`${KIMAI_ID_PREFIX.tag}_`)
      ? tag
      : `${KIMAI_ID_PREFIX.tag}_${tag.replace(/[^A-Za-z0-9]/g, "").slice(0, 48) || "tag"}`;
  });
}

export function mapKimaiTimesheet(
  record: KimaiTimesheetRecord,
  userIdFallback: string,
): KimaiDomainTimesheet {
  const startedAt = toIsoDateTime(record.begin) ?? nowIso();
  const endedAt = toIsoDateTime(record.end ?? undefined);
  const durationMinutes =
    typeof record.duration === "number"
      ? Math.max(0, Math.round(record.duration / 60))
      : endedAt
        ? Math.max(
            0,
            Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 60_000),
          )
        : 0;

  return {
    id: toPlatformTimeId(KIMAI_ID_PREFIX.timesheet, record.id),
    engineId: record.id,
    userId: record.user != null ? String(record.user) : userIdFallback,
    description: record.description ?? undefined,
    status: endedAt ? "stopped" : "running",
    durationMinutes,
    startedAt,
    endedAt,
    activityId:
      record.activity != null
        ? toPlatformTimeId(KIMAI_ID_PREFIX.activity, record.activity)
        : undefined,
    customerId:
      record.customer != null
        ? toPlatformTimeId(KIMAI_ID_PREFIX.customer, record.customer)
        : undefined,
    projectId:
      record.project != null
        ? toPlatformTimeId(KIMAI_ID_PREFIX.project, record.project)
        : undefined,
    tagIds: normalizeTags(record.tags),
    billable: record.billable ?? true,
    createdAt: startedAt,
    updatedAt: endedAt ?? startedAt,
  };
}

export function mapKimaiActivity(record: KimaiActivityRecord): KimaiDomainActivity {
  const stamp = nowIso();
  return {
    id: toPlatformTimeId(KIMAI_ID_PREFIX.activity, record.id),
    engineId: record.id,
    name: record.name,
    description: record.comment ?? undefined,
    projectId:
      record.project != null
        ? toPlatformTimeId(KIMAI_ID_PREFIX.project, record.project)
        : undefined,
    status: record.visible === false ? "archived" : "active",
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function mapKimaiCustomer(record: KimaiCustomerRecord): KimaiDomainCustomer {
  const stamp = nowIso();
  return {
    id: toPlatformTimeId(KIMAI_ID_PREFIX.customer, record.id),
    engineId: record.id,
    name: record.name,
    number: record.number ?? undefined,
    status: record.visible === false ? "archived" : "active",
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function mapKimaiProject(record: KimaiProjectRecord): KimaiDomainProject {
  const stamp = nowIso();
  return {
    id: toPlatformTimeId(KIMAI_ID_PREFIX.project, record.id),
    engineId: record.id,
    name: record.name,
    customerId:
      record.customer != null
        ? toPlatformTimeId(KIMAI_ID_PREFIX.customer, record.customer)
        : undefined,
    status: record.visible === false ? "archived" : "active",
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function mapKimaiTag(record: KimaiTagRecord): KimaiDomainTag {
  const stamp = nowIso();
  return {
    id: toPlatformTimeId(KIMAI_ID_PREFIX.tag, record.id),
    engineId: record.id,
    name: record.name,
    color: record.color ?? undefined,
    status: "active",
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function normalizeTagRecords(
  raw: readonly KimaiTagRecord[] | readonly string[],
): readonly KimaiTagRecord[] {
  if (raw.length === 0) return [];
  if (typeof raw[0] === "string") {
    return (raw as readonly string[]).map((name, index) => ({
      id: index + 1,
      name,
      color: null,
    }));
  }
  return raw as readonly KimaiTagRecord[];
}
