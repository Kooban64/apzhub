import {
  collectWorkbenchActionManifests,
  hasWorkbenchActions,
  type WorkbenchBlockManifest,
} from "@apzhub/platform-runtime/manifest-engine";

import type { ActionRegistrationIssue } from "../registry/action-batch-registration";
import { mapWorkbenchActionToDescriptor } from "./map-action-manifest";
import type { ActionCapabilityRecord, ActionExtractionResult } from "./types";
import { ActionRegistryValidationError } from "../registry/registry-errors";

const ACTIVE_LIFECYCLE_STATES = new Set(["active", "healthy"]);

function workbenchBlockFromManifest(
  manifest: unknown,
): WorkbenchBlockManifest | undefined {
  if (typeof manifest !== "object" || manifest === null || !("workbench" in manifest)) {
    return undefined;
  }

  return (manifest as { workbench?: WorkbenchBlockManifest }).workbench;
}

/**
 * Discover action descriptors declared in capability manifests.
 * Returns no descriptors when any validation or duplicate-id error is present (atomic extraction).
 */
export function extractActionDescriptorsFromCapabilities(
  records: readonly ActionCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): ActionExtractionResult {
  const activeOnly = options.activeOnly ?? true;
  const sortedRecords = [...records].sort((left, right) =>
    left.id.localeCompare(right.id),
  );

  let skippedInactive = 0;
  let skippedWithoutActions = 0;
  const errors: ActionRegistrationIssue[] = [];
  const pending: ReturnType<typeof mapWorkbenchActionToDescriptor>[] = [];
  const seenActionIds = new Map<string, string>();
  const capabilityIds: string[] = [];

  for (const record of sortedRecords) {
    if (activeOnly && !ACTIVE_LIFECYCLE_STATES.has(record.lifecycleState)) {
      skippedInactive += 1;
      continue;
    }

    if (!hasWorkbenchActions(record.manifest)) {
      skippedWithoutActions += 1;
      continue;
    }

    const workbench = workbenchBlockFromManifest(record.manifest);
    if (!workbench) {
      skippedWithoutActions += 1;
      continue;
    }

    capabilityIds.push(record.id);
    const manifestActions = collectWorkbenchActionManifests(workbench);

    for (const manifestAction of manifestActions) {
      try {
        const descriptor = mapWorkbenchActionToDescriptor(
          manifestAction,
          record.id,
          record.version,
        );
        const previousCapability = seenActionIds.get(descriptor.id);

        if (previousCapability) {
          errors.push({
            code: "DUPLICATE_ID",
            actionId: descriptor.id,
            capabilityId: record.id,
            message: `Duplicate action id "${descriptor.id}" declared by "${previousCapability}" and "${record.id}"`,
          });
          continue;
        }

        seenActionIds.set(descriptor.id, record.id);
        pending.push(descriptor);
      } catch (error) {
        if (error instanceof ActionRegistryValidationError) {
          errors.push({
            code: "VALIDATION",
            actionId: manifestAction.id,
            capabilityId: record.id,
            message: error.message,
            field: error.field,
          });
          continue;
        }
        throw error;
      }
    }
  }

  const diagnostics = {
    scannedCapabilities: records.length,
    extractedCount: errors.length === 0 ? pending.length : 0,
    skippedInactive,
    skippedWithoutActions,
    capabilityIds: Object.freeze([...capabilityIds].sort()),
  };

  if (errors.length > 0) {
    return {
      ok: false,
      descriptors: [],
      diagnostics,
      errors: Object.freeze([...errors]),
    };
  }

  return {
    ok: true,
    descriptors: Object.freeze([...pending]),
    diagnostics,
    errors: [],
  };
}
