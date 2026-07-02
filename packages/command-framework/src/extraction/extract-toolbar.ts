import {
  collectWorkbenchToolbarManifests,
  hasWorkbenchToolbar,
  type WorkbenchBlockManifest,
  type WorkbenchToolbarRegionManifest,
} from "@apzhub/platform-runtime/manifest-engine";

import type { ActionToolbarRegionDto } from "../server/map-action-registry-dto";
import type { ActionCapabilityRecord } from "./types";

const ACTIVE_LIFECYCLE_STATES = new Set(["active", "healthy"]);

export interface ToolbarExtractionWarning {
  readonly code: "ORPHAN_COMMAND_ID";
  readonly commandId: string;
  readonly capabilityId: string;
  readonly region: string;
  readonly message: string;
}

export interface ToolbarExtractionDiagnostics {
  readonly scannedCapabilities: number;
  readonly extractedRegionCount: number;
  readonly extractedItemCount: number;
  readonly omittedOrphanCount: number;
  readonly capabilityIds: readonly string[];
}

export interface ToolbarExtractionResult {
  readonly ok: boolean;
  readonly regions: readonly ActionToolbarRegionDto[];
  readonly diagnostics: ToolbarExtractionDiagnostics;
  readonly warnings: readonly ToolbarExtractionWarning[];
}

function workbenchBlockFromManifest(
  manifest: unknown,
): WorkbenchBlockManifest | undefined {
  if (typeof manifest !== "object" || manifest === null || !("workbench" in manifest)) {
    return undefined;
  }

  return (manifest as { workbench?: WorkbenchBlockManifest }).workbench;
}

function mergeToolbarRegions(
  regions: Map<string, ActionToolbarRegionDto>,
  manifestRegions: readonly WorkbenchToolbarRegionManifest[],
  capabilityId: string,
  knownActionIds: ReadonlySet<string>,
  warnings: ToolbarExtractionWarning[],
): number {
  let omittedOrphans = 0;

  for (const manifestRegion of manifestRegions) {
    const existing = regions.get(manifestRegion.region) ?? {
      region: manifestRegion.region,
      items: [],
    };
    const seenCommandIds = new Set(existing.items.map((item) => item.commandId));
    const nextItems = [...existing.items];

    for (const item of manifestRegion.items) {
      if (!knownActionIds.has(item.commandId)) {
        omittedOrphans += 1;
        warnings.push({
          code: "ORPHAN_COMMAND_ID",
          commandId: item.commandId,
          capabilityId,
          region: manifestRegion.region,
          message: `Toolbar item references unknown commandId "${item.commandId}" — omitted`,
        });
        continue;
      }

      if (seenCommandIds.has(item.commandId)) {
        continue;
      }

      seenCommandIds.add(item.commandId);
      nextItems.push({
        commandId: item.commandId,
        icon: item.icon,
        label: item.label,
        order: item.order,
      });
    }

    regions.set(manifestRegion.region, {
      region: manifestRegion.region,
      items: Object.freeze(nextItems),
    });
  }

  return omittedOrphans;
}

/**
 * Extract toolbar regions from capability manifests.
 * Orphan `commandId` references are omitted with warnings (ADR-0025 default).
 */
export function extractToolbarRegionsFromCapabilities(
  records: readonly ActionCapabilityRecord[],
  options: {
    activeOnly?: boolean;
    knownActionIds: ReadonlySet<string>;
  },
): ToolbarExtractionResult {
  const activeOnly = options.activeOnly ?? true;
  const sortedRecords = [...records].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const regions = new Map<string, ActionToolbarRegionDto>();
  const warnings: ToolbarExtractionWarning[] = [];
  const capabilityIds: string[] = [];
  let omittedOrphanCount = 0;

  for (const record of sortedRecords) {
    if (activeOnly && !ACTIVE_LIFECYCLE_STATES.has(record.lifecycleState)) {
      continue;
    }

    if (!hasWorkbenchToolbar(record.manifest)) {
      continue;
    }

    const workbench = workbenchBlockFromManifest(record.manifest);
    if (!workbench) {
      continue;
    }

    capabilityIds.push(record.id);
    omittedOrphanCount += mergeToolbarRegions(
      regions,
      collectWorkbenchToolbarManifests(workbench),
      record.id,
      options.knownActionIds,
      warnings,
    );
  }

  const mergedRegions = Object.freeze(
    [...regions.values()].sort((left, right) =>
      left.region.localeCompare(right.region),
    ),
  );
  const extractedItemCount = mergedRegions.reduce(
    (total, region) => total + region.items.length,
    0,
  );

  return {
    ok: true,
    regions: mergedRegions,
    diagnostics: {
      scannedCapabilities: records.length,
      extractedRegionCount: mergedRegions.length,
      extractedItemCount,
      omittedOrphanCount,
      capabilityIds: Object.freeze([...capabilityIds].sort()),
    },
    warnings: Object.freeze([...warnings]),
  };
}
