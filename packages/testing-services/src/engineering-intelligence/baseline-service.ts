import type { Baseline, BaselineService } from "@apzhub/testing-contracts";
import { asBaselineId } from "@apzhub/testing-contracts";
import type { EngineeringBaselineRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { round2 } from "./calculations";

function toDomain(row: EngineeringBaselineRecord): Baseline {
  return {
    id: asBaselineId(row.id),
    tenantId: row.tenantId,
    scope: row.scope as Baseline["scope"],
    kind: row.kind as Baseline["kind"],
    metricKey: row.metricKey,
    value: row.value,
    sourceSnapshotId: row.sourceSnapshotId,
    period: row.periodJson as unknown as Baseline["period"],
    computedAt: row.computedAt,
    label: row.label,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createBaselineService(rt: ServiceRuntime): BaselineService {
  return {
    async record(ctx, input) {
      const row = await rt.persistence.engineeringBaselines.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          scope: { ...(input.scope ?? { tenantId: ctx.tenantId }) },
          kind: input.kind,
          metricKey: input.metricKey,
          value: round2(input.value),
          sourceSnapshotId: input.sourceSnapshotId,
          periodJson: input.period
            ? ({ ...input.period } as Readonly<Record<string, unknown>>)
            : undefined,
          computedAt: rt.now(),
          label: input.label,
          organisationId: ctx.organisationId,
        },
      );
      rt.events.record({
        eventType: "baseline.recorded",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { baselineId: row.id, kind: input.kind, metricKey: input.metricKey },
      });
      return toDomain(row);
    },
    async list(ctx) {
      return (
        await rt.persistence.engineeringBaselines.list(toRepositoryContext(ctx))
      ).items.map(toDomain);
    },
    async get(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.engineeringBaselines.get(toRepositoryContext(ctx), id),
          "engineering_baseline",
          id,
        ),
      );
    },
  };
}
