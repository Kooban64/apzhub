import type { CapabilityManifest } from "../manifest-engine";
import type { RegisteredCapabilityRecord } from "./types";
import {
  hasWorkbenchNavigation,
  type WorkbenchNavigationManifest,
} from "../manifest-engine/schemas/workbench";

/** Normalised navigation contribution extracted from a capability manifest. */
export interface WorkbenchNavigationContribution {
  readonly id: string;
  readonly capabilityId: string;
  readonly capabilityKind: RegisteredCapabilityRecord["kind"];
  readonly level: WorkbenchNavigationManifest["level"];
  readonly workspace: string;
  readonly label: string;
  readonly icon?: string;
  readonly route?: string;
  readonly order: number;
  readonly parent?: string;
  readonly permission?: string;
  readonly hidden: boolean;
  readonly badge?: string;
}

export interface WorkbenchNavigationExtractionDiagnostics {
  readonly scannedCapabilities: number;
  readonly contributionCount: number;
  readonly skippedInactive: number;
  readonly skippedWithoutNavigation: number;
  readonly duplicateIds: readonly string[];
  readonly orphanParents: readonly string[];
}

export interface WorkbenchNavigationExtractionResult {
  readonly contributions: readonly WorkbenchNavigationContribution[];
  readonly diagnostics: WorkbenchNavigationExtractionDiagnostics;
}

const ACTIVE_LIFECYCLE_STATES = new Set(["active", "healthy"]);

export function extractNavigationContribution(
  record: RegisteredCapabilityRecord,
): WorkbenchNavigationContribution | null {
  if (!hasWorkbenchNavigation(record.manifest)) {
    return null;
  }

  const navigation = record.manifest.workbench.navigation;
  return {
    id: navigation.id ?? record.id,
    capabilityId: record.id,
    capabilityKind: record.kind,
    level: navigation.level,
    workspace: navigation.workspace,
    label: navigation.label ?? record.name,
    icon: navigation.icon,
    route: navigation.route,
    order: navigation.order ?? 100,
    parent: navigation.parent,
    permission: navigation.permission,
    hidden: navigation.hidden ?? false,
    badge: navigation.badge,
  };
}

export function extractWorkbenchNavigationContributions(
  records: readonly RegisteredCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): WorkbenchNavigationExtractionResult {
  const activeOnly = options.activeOnly ?? true;
  let skippedInactive = 0;
  let skippedWithoutNavigation = 0;
  const rawContributions: WorkbenchNavigationContribution[] = [];

  for (const record of records) {
    if (activeOnly && !ACTIVE_LIFECYCLE_STATES.has(record.lifecycleState)) {
      skippedInactive += 1;
      continue;
    }

    const contribution = extractNavigationContribution(record);
    if (!contribution) {
      skippedWithoutNavigation += 1;
      continue;
    }

    rawContributions.push(contribution);
  }

  const { contributions, duplicateIds } = dedupeContributions(rawContributions);
  const orphanParents = findOrphanParents(contributions);

  return {
    contributions,
    diagnostics: {
      scannedCapabilities: records.length,
      contributionCount: contributions.length,
      skippedInactive,
      skippedWithoutNavigation,
      duplicateIds,
      orphanParents,
    },
  };
}

function dedupeContributions(
  contributions: readonly WorkbenchNavigationContribution[],
): {
  contributions: WorkbenchNavigationContribution[];
  duplicateIds: string[];
} {
  const seen = new Set<string>();
  const duplicateIds: string[] = [];
  const unique: WorkbenchNavigationContribution[] = [];

  for (const contribution of contributions) {
    if (seen.has(contribution.id)) {
      duplicateIds.push(contribution.id);
      continue;
    }
    seen.add(contribution.id);
    unique.push(contribution);
  }

  return { contributions: unique, duplicateIds };
}

function findOrphanParents(
  contributions: readonly WorkbenchNavigationContribution[],
): string[] {
  const ids = new Set(contributions.map((contribution) => contribution.id));
  const orphans = new Set<string>();

  for (const contribution of contributions) {
    if (contribution.parent && !ids.has(contribution.parent)) {
      orphans.add(contribution.parent);
    }
  }

  return [...orphans].sort();
}

export function contributionFromManifest(
  manifest: CapabilityManifest,
): WorkbenchNavigationContribution | null {
  if (!hasWorkbenchNavigation(manifest)) {
    return null;
  }

  return {
    id: manifest.workbench.navigation.id ?? manifest.id,
    capabilityId: manifest.id,
    capabilityKind: manifest.kind,
    level: manifest.workbench.navigation.level,
    workspace: manifest.workbench.navigation.workspace,
    label: manifest.workbench.navigation.label ?? manifest.name,
    icon: manifest.workbench.navigation.icon,
    route: manifest.workbench.navigation.route,
    order: manifest.workbench.navigation.order ?? 100,
    parent: manifest.workbench.navigation.parent,
    permission: manifest.workbench.navigation.permission,
    hidden: manifest.workbench.navigation.hidden ?? false,
    badge: manifest.workbench.navigation.badge,
  };
}
