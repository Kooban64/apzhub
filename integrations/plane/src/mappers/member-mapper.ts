import { createBidirectionalEnumMapper, createEnumMapper } from "@apzhub/integration-sdk/mapping";

import type { TeamMember, TeamRole } from "../models/canonical";
import type { PlaneMemberRecord } from "../internal/plane-api-types";
import { toMemberId, toProjectId, toUserId, extractProjectPlaneId } from "./mapper-context";

const roleMapper = createEnumMapper<TeamRole>({
  map: {
    "5": "admin",
    "10": "admin",
    "15": "member",
    "20": "viewer",
    admin: "admin",
    member: "member",
    viewer: "viewer",
  },
  unknownPolicy: "fallback",
  fallback: "member",
  normalizeKey: (raw) => raw.trim().toLowerCase(),
});

const roleToPlane = createBidirectionalEnumMapper<TeamRole>({
  toCanonical: {
    admin: "admin",
    member: "member",
    viewer: "viewer",
  },
  toProvider: {
    admin: "10",
    member: "15",
    viewer: "20",
  },
  unknownPolicy: "fallback",
  fallback: "member",
});

function mapRole(role: number | string): TeamRole {
  return roleMapper.map(String(role));
}

export function mapPlaneMember(record: PlaneMemberRecord, projectId: string): TeamMember {
  return {
    id: toMemberId(record.id),
    projectId: projectId.startsWith("proj_") ? projectId : toProjectId(projectId),
    userId: toUserId(record.member),
    role: mapRole(record.role),
    joinedAt: record.created_at ?? new Date().toISOString(),
  };
}

export function mapMemberToPlaneBody(input: {
  readonly userId?: string;
  readonly role?: TeamRole;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.userId !== undefined) body.member = input.userId;
  if (input.role !== undefined) body.role = Number(roleToPlane.toProvider(input.role));
  return body;
}

export function resolveProjectPlaneId(projectId: string): string {
  return extractProjectPlaneId(projectId);
}

export function extractPlaneUserId(userId: string): string {
  return userId.startsWith("user_plane_") ? userId.slice("user_plane_".length) : userId;
}
