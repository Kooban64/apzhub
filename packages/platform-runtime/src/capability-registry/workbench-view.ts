import type { CapabilityManifest } from "../manifest-engine";
import type { RegisteredCapabilityRecord } from "./types";
import {
  hasWorkbenchView,
  type WorkbenchViewManifest,
} from "../manifest-engine/schemas/workbench";

/** Normalised view descriptor extracted from a capability manifest. */
export interface WorkbenchViewDescriptor {
  readonly viewId: string;
  readonly capabilityId: string;
  readonly capabilityKind: RegisteredCapabilityRecord["kind"];
  readonly title: string;
  readonly workspace: string;
  readonly route?: string;
  readonly permission?: string;
  readonly default?: boolean;
  readonly icon?: string;
}

export interface WorkbenchViewExtractionDiagnostics {
  readonly scannedCapabilities: number;
  readonly descriptorCount: number;
  readonly skippedInactive: number;
  readonly skippedWithoutView: number;
  readonly duplicateViewIds: readonly string[];
}

export interface WorkbenchViewExtractionResult {
  readonly descriptors: readonly WorkbenchViewDescriptor[];
  readonly diagnostics: WorkbenchViewExtractionDiagnostics;
}

const ACTIVE_LIFECYCLE_STATES = new Set(["active", "healthy"]);

export function extractViewDescriptor(
  record: RegisteredCapabilityRecord,
): WorkbenchViewDescriptor | null {
  if (!hasWorkbenchView(record.manifest)) {
    return null;
  }

  return descriptorFromManifest(record.manifest, record);
}

export function extractWorkbenchViewDescriptors(
  records: readonly RegisteredCapabilityRecord[],
  options: { activeOnly?: boolean } = {},
): WorkbenchViewExtractionResult {
  const activeOnly = options.activeOnly ?? true;
  let skippedInactive = 0;
  let skippedWithoutView = 0;
  const rawDescriptors: WorkbenchViewDescriptor[] = [];

  for (const record of records) {
    if (activeOnly && !ACTIVE_LIFECYCLE_STATES.has(record.lifecycleState)) {
      skippedInactive += 1;
      continue;
    }

    const descriptor = extractViewDescriptor(record);
    if (!descriptor) {
      skippedWithoutView += 1;
      continue;
    }

    rawDescriptors.push(descriptor);
  }

  const { descriptors, duplicateViewIds } = dedupeDescriptors(rawDescriptors);

  return {
    descriptors,
    diagnostics: {
      scannedCapabilities: records.length,
      descriptorCount: descriptors.length,
      skippedInactive,
      skippedWithoutView,
      duplicateViewIds,
    },
  };
}

export function descriptorFromManifest(
  manifest: CapabilityManifest,
  record?: Pick<RegisteredCapabilityRecord, "id" | "kind">,
): WorkbenchViewDescriptor | null {
  if (!hasWorkbenchView(manifest)) {
    return null;
  }

  const capabilityId = record?.id ?? manifest.id;
  const capabilityKind = record?.kind ?? manifest.kind;
  const view = manifest.workbench.view;

  return normaliseViewDescriptor(view, capabilityId, capabilityKind);
}

function normaliseViewDescriptor(
  view: WorkbenchViewManifest,
  capabilityId: string,
  capabilityKind: RegisteredCapabilityRecord["kind"],
): WorkbenchViewDescriptor {
  return {
    viewId: view.viewId ?? capabilityId,
    capabilityId,
    capabilityKind,
    title: view.title,
    workspace: view.workspace,
    route: view.route,
    permission: view.permission,
    default: view.default ?? false,
    icon: view.icon,
  };
}

function dedupeDescriptors(descriptors: readonly WorkbenchViewDescriptor[]): {
  descriptors: WorkbenchViewDescriptor[];
  duplicateViewIds: string[];
} {
  const seen = new Set<string>();
  const duplicateViewIds: string[] = [];
  const unique: WorkbenchViewDescriptor[] = [];

  for (const descriptor of descriptors) {
    if (seen.has(descriptor.viewId)) {
      duplicateViewIds.push(descriptor.viewId);
      continue;
    }
    seen.add(descriptor.viewId);
    unique.push(descriptor);
  }

  return { descriptors: unique, duplicateViewIds };
}
