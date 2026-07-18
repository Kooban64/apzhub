/**
 * Plane mapping provider registration — wraps existing mapper functions.
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
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "@apzhub/platform-service-contracts";

import type { PlaneIssueRecord } from "../internal/plane-api-types";
import type { MapperContext } from "./mapper-context";
import { mapPlaneMember, mapMemberToPlaneBody } from "./member-mapper";
import { mapPlaneProject, mapProjectToPlaneBody } from "./project-mapper";
import {
  mapPlaneIssue,
  mapTaskToPlaneCreateBody,
  mapTaskToPlaneUpdateBody,
} from "./task-mapper";

export const PLANE_MAPPING_PROVIDER_ID = "plane.entity-mapping";

export function createPlaneMappingProvider(): MappingProvider {
  return createMappingProvider({
    id: PLANE_MAPPING_PROVIDER_ID,
    integrationSlug: "plane",
    definitions: [
      createDefinition({
        id: "plane.task.default.read",
        entityType: "task",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) => {
          const payload = input as {
            readonly record: PlaneIssueRecord;
            readonly projectId: string;
            readonly stateGroup?: string;
          };
          return mapPlaneIssue(payload.record, payload.projectId, {
            stateGroup: payload.stateGroup,
          });
        },
      }),
      createDefinition({
        id: "plane.task.create.write",
        entityType: "task",
        direction: "write",
        profile: "create",
        map: (input) => mapTaskToPlaneCreateBody(input as CreateTaskInput),
      }),
      createDefinition({
        id: "plane.task.update.partial",
        entityType: "task",
        direction: "partial_update",
        profile: "update",
        map: (input) => mapTaskToPlaneUpdateBody(input as UpdateTaskInput),
      }),
      createDefinition({
        id: "plane.project.default.read",
        entityType: "project",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) => {
          const payload = input as {
            readonly record: Parameters<typeof mapPlaneProject>[0];
            readonly context: MapperContext;
          };
          return mapPlaneProject(payload.record, payload.context);
        },
      }),
      createDefinition({
        id: "plane.project.create.write",
        entityType: "project",
        direction: "write",
        profile: "create",
        map: (input) =>
          mapProjectToPlaneBody(input as Parameters<typeof mapProjectToPlaneBody>[0]),
      }),
      createDefinition({
        id: "plane.project.update.partial",
        entityType: "project",
        direction: "partial_update",
        profile: "update",
        map: (input) =>
          mapProjectToPlaneBody(input as Parameters<typeof mapProjectToPlaneBody>[0]),
      }),
      createDefinition({
        id: "plane.member.default.read",
        entityType: "member",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) => {
          const payload = input as {
            readonly record: Parameters<typeof mapPlaneMember>[0];
            readonly projectId: string;
          };
          return mapPlaneMember(payload.record, payload.projectId);
        },
      }),
      createDefinition({
        id: "plane.member.update.partial",
        entityType: "member",
        direction: "partial_update",
        profile: "update",
        map: (input) =>
          mapMemberToPlaneBody(input as Parameters<typeof mapMemberToPlaneBody>[0]),
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

export function createPlaneMappingRegistry(): MappingRegistry {
  const registry = createMappingRegistry();
  registry.register(createPlaneMappingProvider());
  return registry;
}

export function createPlaneMappingPipeline(
  registry: MappingRegistry = createPlaneMappingRegistry(),
): MappingPipeline {
  return createMappingPipeline({ registry });
}
