/**
 * Flagship F14 — Quality Project store (PM Portfolio hub).
 * File-backed under apps/web/.data when not in test; SCM repos remain SoR.
 */

import { randomUUID } from "node:crypto";

import {
  isQepLedgerPersistEnabled,
  listJsonLedgerFiles,
  readJsonLedgerFile,
  resolveQepDataRoot,
  writeJsonLedgerFile,
} from "@/lib/qep/qep-ledger-fs";

export type QualityProjectStatus = "draft" | "active" | "archived";

export type QualityProject = {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string;
  readonly ownerUserId?: string;
  readonly repositoryIds: readonly string[];
  readonly status: QualityProjectStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};

const projects: QualityProject[] = [];
const MAX = 500;
let hydrated = false;

function dataDir(): string {
  return resolveQepDataRoot("qep-quality-projects");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  for (const file of listJsonLedgerFiles(dataDir())) {
    const id = file.replace(/\.json$/, "");
    const row = readJsonLedgerFile<QualityProject>(dataDir(), id);
    if (row?.id) {
      projects.push(row);
    }
  }
  projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function persistOne(project: QualityProject): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerFile(dataDir(), project.id, project);
}

export function resetQualityProjectStoreForTests(): void {
  projects.splice(0, projects.length);
  hydrated = false;
}

export function listQualityProjects(filter: {
  readonly tenantId: string;
  readonly limit?: number;
}): readonly QualityProject[] {
  hydrate();
  const limit = filter.limit ?? 100;
  return projects
    .filter((row) => row.tenantId === filter.tenantId)
    .filter((row) => row.status !== "archived")
    .slice(0, Math.max(0, limit));
}

export function getQualityProject(
  tenantId: string,
  projectId: string,
): QualityProject | undefined {
  hydrate();
  return projects.find((row) => row.tenantId === tenantId && row.id === projectId);
}

export function createQualityProject(input: {
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string;
  readonly ownerUserId?: string;
  readonly createdBy: string;
  readonly repositoryIds?: readonly string[];
  readonly now?: () => Date;
}): QualityProject {
  hydrate();
  const name = input.name.trim();
  if (!name) {
    throw new Error("quality_project.name_required");
  }
  if (name.length > 120) {
    throw new Error("quality_project.name_too_long");
  }
  const now = (input.now ?? (() => new Date()))().toISOString();
  const project: QualityProject = {
    id: `qproj-${randomUUID()}`,
    tenantId: input.tenantId,
    name,
    description: input.description?.trim() || undefined,
    ownerUserId: input.ownerUserId?.trim() || undefined,
    repositoryIds: [...(input.repositoryIds ?? [])],
    status: "active",
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
  projects.unshift(project);
  if (projects.length > MAX) {
    projects.splice(MAX);
  }
  persistOne(project);
  return project;
}

export function attachRepositoriesToQualityProject(input: {
  readonly tenantId: string;
  readonly projectId: string;
  readonly repositoryIds: readonly string[];
  readonly now?: () => Date;
}): QualityProject {
  hydrate();
  const index = projects.findIndex(
    (row) => row.tenantId === input.tenantId && row.id === input.projectId,
  );
  if (index < 0) {
    throw new Error("quality_project.not_found");
  }
  const current = projects[index]!;
  const merged = Array.from(
    new Set([
      ...current.repositoryIds,
      ...input.repositoryIds.map((id) => id.trim()).filter(Boolean),
    ]),
  );
  const updated: QualityProject = {
    ...current,
    repositoryIds: merged,
    updatedAt: (input.now ?? (() => new Date()))().toISOString(),
  };
  projects[index] = updated;
  persistOne(updated);
  return updated;
}

export function detachRepositoryFromQualityProject(input: {
  readonly tenantId: string;
  readonly projectId: string;
  readonly repositoryId: string;
  readonly now?: () => Date;
}): QualityProject {
  hydrate();
  const index = projects.findIndex(
    (row) => row.tenantId === input.tenantId && row.id === input.projectId,
  );
  if (index < 0) {
    throw new Error("quality_project.not_found");
  }
  const current = projects[index]!;
  const updated: QualityProject = {
    ...current,
    repositoryIds: current.repositoryIds.filter((id) => id !== input.repositoryId),
    updatedAt: (input.now ?? (() => new Date()))().toISOString(),
  };
  projects[index] = updated;
  persistOne(updated);
  return updated;
}
