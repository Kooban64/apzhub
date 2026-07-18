import {
  createSearchOrchestrationForTest,
  type SearchOrchestrationRuntime,
} from "@apzhub/search-orchestrator";

import { createInMemoryPublicationAdminAuditStore } from "./audit/memory";
import type { PublicationAdminAuditStore } from "./audit/port";
import {
  createSearchPublicationAdminGateway,
  type SearchPublicationAdminGateway,
} from "./gateway";
import { createInMemoryPublicationAdminMarkerStore } from "./markers/memory";
import type { PublicationAdminMarkerStore } from "./markers/port";
import {
  createSearchPublicationAdminService,
  type SearchPublicationAdminService,
} from "./service";

export type SearchPublicationAdminFramework = {
  readonly service: SearchPublicationAdminService;
  readonly gateway: SearchPublicationAdminGateway;
  readonly runtime: SearchOrchestrationRuntime;
  readonly audit: PublicationAdminAuditStore;
  readonly markers: PublicationAdminMarkerStore;
};

export type CreateSearchPublicationAdminInput = {
  readonly runtime?: SearchOrchestrationRuntime;
  readonly audit?: PublicationAdminAuditStore;
  readonly markers?: PublicationAdminMarkerStore;
  readonly compositionRegistered?: boolean;
  readonly allowInMemoryOrchestration?: boolean;
  readonly env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
};

export function createSearchPublicationAdmin(
  input: CreateSearchPublicationAdminInput = {},
): SearchPublicationAdminFramework {
  const runtime =
    input.runtime ??
    (input.allowInMemoryOrchestration
      ? createSearchOrchestrationForTest({
          allowInMemoryJournal: true,
          env: input.env ?? { APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" },
        })
      : (() => {
          throw new Error(
            "createSearchPublicationAdmin requires runtime or allowInMemoryOrchestration: true",
          );
        })());

  const audit = input.audit ?? createInMemoryPublicationAdminAuditStore();
  const markers = input.markers ?? createInMemoryPublicationAdminMarkerStore();
  const service = createSearchPublicationAdminService({
    runtime,
    audit,
    markers,
    compositionRegistered: input.compositionRegistered ?? true,
  });
  const gateway = createSearchPublicationAdminGateway(service);

  return { service, gateway, runtime, audit, markers };
}
