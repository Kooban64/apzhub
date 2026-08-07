"use client";

import type { ProjectsPermissionSource } from "@/lib/projects/permissions";

import { ProjectCockpit } from "./project-cockpit";

/**
 * Project detail entry — W002 Project Cockpit with Focus Navigation.
 * Legacy tab segments soft-redirect into cockpit intents + surfaces.
 */
export function ProjectDetailView({
  projectId,
  tab,
  permissions,
}: {
  readonly projectId: string;
  readonly tab?: string;
  readonly permissions?: ProjectsPermissionSource;
}) {
  return (
    <ProjectCockpit projectId={projectId} pathSegment={tab} permissions={permissions} />
  );
}
