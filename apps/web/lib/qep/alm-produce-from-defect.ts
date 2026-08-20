/**
 * Flagship F16 — produce APZ Projects tasks / Support tickets from QEP defects.
 * Via Platform Service Gateway only. Default MODE=record_only (soft-fail live).
 * Never auto-certifies. QEP stays quality SoR.
 */

import { randomUUID } from "node:crypto";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import { getDefectRuntime } from "@/lib/qep/defect-runtime";
import {
  appendAlmProduceRecord,
  listAlmProduceRecords,
  type AlmProduceChannel,
  type AlmProduceRecord,
} from "@/lib/qep/alm-produce-store";

import type { EnvVars } from "@/lib/env-vars";
export const F16_ASSIST_ORIGIN = "f16_alm_produce" as const;

export type AlmProduceMode = "record_only" | "live";

export type AlmProduceConfig = {
  readonly mode: AlmProduceMode;
  readonly channels: readonly AlmProduceChannel[];
  readonly projectsProjectId?: string;
  readonly supportGroupId?: string;
  readonly supportRequesterId?: string;
};

export type AlmProduceDeps = {
  readonly createProjectTask?: (input: {
    readonly ctx: ServiceRequestContext;
    readonly projectId: string;
    readonly title: string;
    readonly description?: string;
  }) => Promise<{ id: string }>;
  readonly createSupportRequest?: (input: {
    readonly ctx: ServiceRequestContext;
    readonly title: string;
    readonly groupId: string;
    readonly requesterId: string;
  }) => Promise<{ id: string; displayId?: string }>;
  readonly now?: () => Date;
};

export function resolveAlmProduceConfig(env: EnvVars = process.env): AlmProduceConfig {
  const modeRaw = (env.APZHUB_ALM_PRODUCE_MODE ?? "record_only").toLowerCase();
  const mode: AlmProduceMode =
    modeRaw === "live" || modeRaw === "produce" ? "live" : "record_only";
  const channelsRaw = (env.APZHUB_ALM_PRODUCE_CHANNELS ?? "projects").toLowerCase();
  const channels = channelsRaw
    .split(",")
    .map((c) => c.trim())
    .filter((c): c is AlmProduceChannel => c === "projects" || c === "support");
  return {
    mode,
    channels: channels.length > 0 ? channels : ["projects"],
    projectsProjectId: env.APZHUB_ALM_PROJECTS_PROJECT_ID?.trim() || undefined,
    supportGroupId: env.APZHUB_ALM_SUPPORT_GROUP_ID?.trim() || undefined,
    supportRequesterId: env.APZHUB_ALM_SUPPORT_REQUESTER_ID?.trim() || undefined,
  };
}

type DefectSnapshot = {
  readonly defectId: string;
  readonly title: string;
  readonly description: string;
  readonly customMetadata?: Readonly<Record<string, unknown>>;
  readonly revision: number;
};

async function loadDefect(
  tenantId: string,
  defectId: string,
  permissions: readonly string[],
  userId: string,
): Promise<DefectSnapshot> {
  const agg = await getDefectRuntime().service.get(
    { userId, tenantId, permissions: [...permissions] },
    defectId,
  );
  const defect = (agg as { defect: DefectSnapshot }).defect;
  if (!defect?.defectId) {
    throw new Error("alm_produce.defect_not_found");
  }
  return {
    defectId: defect.defectId,
    title: defect.title,
    description: defect.description ?? "",
    customMetadata: defect.customMetadata,
    revision: defect.revision ?? 0,
  };
}

async function persistAlmMetadata(input: {
  readonly tenantId: string;
  readonly userId: string;
  readonly permissions: readonly string[];
  readonly defect: DefectSnapshot;
  readonly produced: readonly {
    readonly channel: AlmProduceChannel;
    readonly status: string;
    readonly externalRef?: string;
    readonly platformEntityId?: string;
    readonly mode: string;
  }[];
}): Promise<void> {
  try {
    const prior =
      (input.defect.customMetadata?.almProduce as { items?: unknown[] } | undefined) ??
      {};
    const items = [
      ...((prior.items as unknown[]) ?? []),
      ...input.produced.map((p) => ({
        ...p,
        at: new Date().toISOString(),
        assistOrigin: F16_ASSIST_ORIGIN,
      })),
    ].slice(-20);
    await getDefectRuntime().service.update(
      {
        userId: input.userId,
        tenantId: input.tenantId,
        permissions: [...input.permissions],
      },
      input.defect.defectId,
      {
        customMetadata: {
          ...(input.defect.customMetadata ?? {}),
          almProduce: { items },
        },
      },
      new Date().toISOString(),
    );
  } catch {
    // soft — ledger still holds truth for F16 proof
  }
}

export async function produceAlmWorkItemsFromDefect(input: {
  readonly tenantId: string;
  readonly userId: string;
  readonly permissions: readonly string[];
  readonly serviceContext: ServiceRequestContext;
  readonly defectId: string;
  readonly changeEventId?: string;
  readonly channels?: readonly AlmProduceChannel[];
  readonly env?: EnvVars;
  readonly deps?: AlmProduceDeps;
}): Promise<{
  readonly defectId: string;
  readonly records: readonly AlmProduceRecord[];
  readonly advisory: true;
  readonly autoCertified: false;
}> {
  const defectId = input.defectId.trim();
  if (!defectId) {
    throw new Error("alm_produce.defect_id_required");
  }

  const config = resolveAlmProduceConfig(input.env);
  const channels = input.channels ?? config.channels;
  const correlationId = randomUUID();
  const nowIso = (input.deps?.now ?? (() => new Date()))().toISOString();

  const defect = await loadDefect(
    input.tenantId,
    defectId,
    input.permissions,
    input.userId,
  );

  const created: AlmProduceRecord[] = [];
  const metaBatch: {
    channel: AlmProduceChannel;
    status: string;
    externalRef?: string;
    platformEntityId?: string;
    mode: string;
  }[] = [];

  for (const channel of channels) {
    if (channel === "projects") {
      if (config.mode === "live" && !config.projectsProjectId) {
        created.push(
          appendAlmProduceRecord({
            produceId: `alm-${randomUUID()}`,
            tenantId: input.tenantId,
            defectId,
            changeEventId: input.changeEventId,
            channel,
            status: "skipped",
            mode: config.mode,
            correlationId,
            createdAt: nowIso,
            title: defect.title,
            detail: "missing_APZHUB_ALM_PROJECTS_PROJECT_ID",
          }),
        );
        continue;
      }

      if (config.mode === "record_only" || !input.deps?.createProjectTask) {
        const externalRef = `pending://projects/task/${defectId}/${correlationId}`;
        const row = appendAlmProduceRecord({
          produceId: `alm-${randomUUID()}`,
          tenantId: input.tenantId,
          defectId,
          changeEventId: input.changeEventId,
          channel,
          status: "recorded",
          mode: "record_only",
          correlationId,
          createdAt: nowIso,
          externalRef,
          title: defect.title,
          detail: "record_only",
        });
        created.push(row);
        metaBatch.push({
          channel,
          status: row.status,
          externalRef,
          mode: "record_only",
        });
        continue;
      }

      try {
        const task = await input.deps.createProjectTask({
          ctx: input.serviceContext,
          projectId: config.projectsProjectId!,
          title: `[QEP] ${defect.title}`.slice(0, 500),
          description: [
            defect.description,
            `QEP defect: ${defectId}`,
            input.changeEventId ? `changeEventId: ${input.changeEventId}` : "",
            `assistOrigin: ${F16_ASSIST_ORIGIN}`,
          ]
            .filter(Boolean)
            .join("\n\n"),
        });
        const row = appendAlmProduceRecord({
          produceId: `alm-${randomUUID()}`,
          tenantId: input.tenantId,
          defectId,
          changeEventId: input.changeEventId,
          channel,
          status: "created",
          mode: "live",
          correlationId,
          createdAt: nowIso,
          platformEntityId: task.id,
          externalRef: `task://${task.id}`,
          title: defect.title,
          detail: "projects_task_created",
        });
        created.push(row);
        metaBatch.push({
          channel,
          status: row.status,
          externalRef: row.externalRef,
          platformEntityId: task.id,
          mode: "live",
        });
      } catch (error) {
        const detail =
          error instanceof Error ? error.message : "projects_create_failed";
        created.push(
          appendAlmProduceRecord({
            produceId: `alm-${randomUUID()}`,
            tenantId: input.tenantId,
            defectId,
            changeEventId: input.changeEventId,
            channel,
            status: "failed",
            mode: "live",
            correlationId,
            createdAt: nowIso,
            title: defect.title,
            detail,
          }),
        );
      }
    }

    if (channel === "support") {
      if (
        config.mode === "live" &&
        (!config.supportGroupId || !config.supportRequesterId)
      ) {
        created.push(
          appendAlmProduceRecord({
            produceId: `alm-${randomUUID()}`,
            tenantId: input.tenantId,
            defectId,
            changeEventId: input.changeEventId,
            channel,
            status: "skipped",
            mode: config.mode,
            correlationId,
            createdAt: nowIso,
            title: defect.title,
            detail: "missing_support_group_or_requester",
          }),
        );
        continue;
      }

      if (config.mode === "record_only" || !input.deps?.createSupportRequest) {
        const externalRef = `pending://support/request/${defectId}/${correlationId}`;
        const row = appendAlmProduceRecord({
          produceId: `alm-${randomUUID()}`,
          tenantId: input.tenantId,
          defectId,
          changeEventId: input.changeEventId,
          channel,
          status: "recorded",
          mode: "record_only",
          correlationId,
          createdAt: nowIso,
          externalRef,
          title: defect.title,
          detail: "record_only",
        });
        created.push(row);
        metaBatch.push({
          channel,
          status: row.status,
          externalRef,
          mode: "record_only",
        });
        continue;
      }

      try {
        const ticket = await input.deps.createSupportRequest({
          ctx: input.serviceContext,
          title: `[QEP] ${defect.title}`.slice(0, 200),
          groupId: config.supportGroupId!,
          requesterId: config.supportRequesterId!,
        });
        const row = appendAlmProduceRecord({
          produceId: `alm-${randomUUID()}`,
          tenantId: input.tenantId,
          defectId,
          changeEventId: input.changeEventId,
          channel,
          status: "created",
          mode: "live",
          correlationId,
          createdAt: nowIso,
          platformEntityId: ticket.id,
          externalRef: `support://${ticket.id}`,
          title: defect.title,
          detail: "support_request_created",
        });
        created.push(row);
        metaBatch.push({
          channel,
          status: row.status,
          externalRef: row.externalRef,
          platformEntityId: ticket.id,
          mode: "live",
        });
      } catch (error) {
        const detail = error instanceof Error ? error.message : "support_create_failed";
        created.push(
          appendAlmProduceRecord({
            produceId: `alm-${randomUUID()}`,
            tenantId: input.tenantId,
            defectId,
            changeEventId: input.changeEventId,
            channel,
            status: "failed",
            mode: "live",
            correlationId,
            createdAt: nowIso,
            title: defect.title,
            detail,
          }),
        );
      }
    }
  }

  await persistAlmMetadata({
    tenantId: input.tenantId,
    userId: input.userId,
    permissions: input.permissions,
    defect,
    produced: metaBatch,
  });

  return {
    defectId,
    records: created,
    advisory: true,
    autoCertified: false,
  };
}

export function listProducesForChange(
  tenantId: string,
  changeEventId: string,
): readonly AlmProduceRecord[] {
  return listAlmProduceRecords({ tenantId, changeEventId, limit: 100 });
}
