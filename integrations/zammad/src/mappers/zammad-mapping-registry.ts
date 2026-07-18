/**
 * Zammad mapping provider registration — wraps existing mapper functions.
 * Public mapper APIs remain the source of truth for call sites.
 */

import {
  createDefinition,
  createMappingPipeline,
  createMappingProvider,
  createMappingRegistry,
  type MappingPipeline,
  type MappingProvider,
  type MappingRegistry,
} from "@apzhub/integration-sdk/mapping";

import type { MapperContext } from "./mapper-context";
import { mapSupportTicketToZammadBody, mapZammadTicket } from "./support-ticket-mapper";
import {
  mapPriorityToZammad,
  mapStatusToZammadState,
  mapZammadPriorityToCanonical,
  mapZammadStateToStatus,
} from "./state-priority-mapper";
import type { SupportTicketPriority, SupportTicketStatus } from "../models/canonical";

export const ZAMMAD_MAPPING_PROVIDER_ID = "zammad.entity-mapping";

export function createZammadMappingProvider(): MappingProvider {
  return createMappingProvider({
    id: ZAMMAD_MAPPING_PROVIDER_ID,
    integrationSlug: "zammad",
    definitions: [
      createDefinition({
        id: "zammad.ticket.default.read",
        entityType: "support_ticket",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) => {
          const payload = input as {
            readonly record: Parameters<typeof mapZammadTicket>[0];
            readonly context: MapperContext;
          };
          return mapZammadTicket(payload.record, payload.context);
        },
      }),
      createDefinition({
        id: "zammad.ticket.create.write",
        entityType: "support_ticket",
        direction: "write",
        profile: "create",
        map: (input) =>
          mapSupportTicketToZammadBody(
            input as Parameters<typeof mapSupportTicketToZammadBody>[0],
          ),
      }),
      createDefinition({
        id: "zammad.ticket.update.partial",
        entityType: "support_ticket",
        direction: "partial_update",
        profile: "update",
        map: (input) =>
          mapSupportTicketToZammadBody(
            input as Parameters<typeof mapSupportTicketToZammadBody>[0],
          ),
      }),
      createDefinition({
        id: "zammad.status.default.read",
        entityType: "support_ticket_status",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) => {
          const payload = input as {
            readonly state?: string;
            readonly stateId?: number;
          };
          return mapZammadStateToStatus(payload.state, payload.stateId);
        },
      }),
      createDefinition({
        id: "zammad.status.write",
        entityType: "support_ticket_status",
        direction: "write",
        profile: "create",
        map: (input) => mapStatusToZammadState(input as SupportTicketStatus),
      }),
      createDefinition({
        id: "zammad.priority.default.read",
        entityType: "support_ticket_priority",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) => {
          const payload = input as {
            readonly priority?: string;
            readonly priorityId?: number;
          };
          return mapZammadPriorityToCanonical(payload.priority, payload.priorityId);
        },
      }),
      createDefinition({
        id: "zammad.priority.write",
        entityType: "support_ticket_priority",
        direction: "write",
        profile: "create",
        map: (input) => mapPriorityToZammad(input as SupportTicketPriority),
      }),
    ],
    capabilities: {
      supportsPartialUpdate: true,
      supportsRelationships: true,
      supportsCollections: true,
      supportsNested: false,
    },
  });
}

export function createZammadMappingRegistry(): MappingRegistry {
  const registry = createMappingRegistry();
  registry.register(createZammadMappingProvider());
  return registry;
}

export function createZammadMappingPipeline(
  registry: MappingRegistry = createZammadMappingRegistry(),
): MappingPipeline {
  return createMappingPipeline({ registry });
}
