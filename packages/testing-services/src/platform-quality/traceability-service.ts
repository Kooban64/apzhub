import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  PlatformCrossProductLink,
  PlatformProductKey,
  PlatformTraceabilityService,
} from "@apzhub/testing-contracts";
import {
  asPlatformCrossProductLinkId,
  type PlatformCrossProductLinkId,
} from "@apzhub/testing-contracts";

import type { Clock, IdGenerator } from "../services/types";
import type { PlatformQualityStore } from "./store";

export interface TraceabilityServiceDeps {
  readonly store: PlatformQualityStore;
  readonly now: Clock;
  readonly id: IdGenerator;
}

export function createPlatformTraceabilityService(
  deps: TraceabilityServiceDeps,
): PlatformTraceabilityService {
  const { store, now, id } = deps;

  return {
    async link(
      ctx: ServiceRequestContext,
      input: Omit<
        PlatformCrossProductLink,
        "id" | "tenantId" | "createdAt" | "updatedAt"
      > & { readonly id?: PlatformCrossProductLinkId },
    ): Promise<PlatformCrossProductLink> {
      const timestamp = now();
      const linkId = input.id ?? asPlatformCrossProductLinkId(id());
      const existing = store.crossProductLinks.get(linkId);
      const record: PlatformCrossProductLink = {
        id: linkId,
        tenantId: ctx.tenantId,
        sourceProductKey: input.sourceProductKey,
        targetProductKey: input.targetProductKey,
        linkKind: input.linkKind,
        sourceRef: input.sourceRef,
        targetRef: input.targetRef,
        summary: input.summary,
        underlyingTraceabilityLink: input.underlyingTraceabilityLink,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
        createdBy: existing?.createdBy ?? ctx.userId,
        updatedBy: ctx.userId,
      };
      store.crossProductLinks.set(linkId, record);
      return record;
    },

    async list(
      ctx: ServiceRequestContext,
    ): Promise<readonly PlatformCrossProductLink[]> {
      return [...store.crossProductLinks.values()].filter(
        (link) => link.tenantId === ctx.tenantId,
      );
    },

    async listForProduct(
      ctx: ServiceRequestContext,
      productKey: PlatformProductKey,
    ): Promise<readonly PlatformCrossProductLink[]> {
      return [...store.crossProductLinks.values()].filter(
        (link) =>
          link.tenantId === ctx.tenantId &&
          (link.sourceProductKey === productKey ||
            link.targetProductKey === productKey),
      );
    },
  };
}
