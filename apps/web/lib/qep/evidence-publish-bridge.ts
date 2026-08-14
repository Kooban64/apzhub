/**
 * Q4 evidence publish bridge (Tranche 2).
 *
 * Wires automation `onEvidencePublished` to durable Evidence StoragePort
 * (local filesystem when APZQEP_EVIDENCE_STORAGE_PROVIDER=local) and, when
 * available, the QEP Evidence catalogue via platform gateway capture/associate.
 * Storage always runs when configured; catalogue failures fail soft with a
 * structured log — never a silent no-op for the storage path.
 */

import { createHash } from "node:crypto";

import type {
  AutomationArtifact,
  AutomationExecutionRecord,
} from "@apzhub/platform-automation";
import {
  createEvidenceStorageSync,
  resolveEvidenceStorageConfigFromEnv,
  type EvidenceStorageManager,
  type EvidenceStoragePlatformConfig,
} from "@apzhub/qep-evidence";

export type EvidencePublishCatalogueCaptureInput = {
  readonly projectId: string;
  readonly ownerId?: string;
  readonly sourceKind: string;
  readonly sourceSystemId?: string;
  readonly mediaType: string;
  readonly contentBase64: string;
  readonly contentHash: string;
  readonly hashAlgorithm?: string;
  readonly title?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly classification?: string;
};

export type EvidencePublishCataloguePort = {
  capture(
    input: EvidencePublishCatalogueCaptureInput,
  ): Promise<{ readonly id: string; readonly revision: number }>;
  associate?(input: {
    readonly evidenceId: string;
    readonly expectedRevision: number;
    readonly targetCapability: string;
    readonly targetId: string;
    readonly relationType: string;
  }): Promise<void>;
};

export type PublishAutomationEvidenceDeps = {
  readonly storage?: EvidenceStorageManager;
  readonly storageConfig?: EvidenceStoragePlatformConfig;
  readonly catalogue?: EvidencePublishCataloguePort | null;
  readonly resolveCatalogue?: () => Promise<EvidencePublishCataloguePort | null>;
  readonly log?: (entry: Readonly<Record<string, unknown>>) => void;
};

export type PublishAutomationEvidenceResult = {
  readonly executionId: string;
  readonly storageProvider: string;
  readonly storedCount: number;
  readonly cataloguedCount: number;
  readonly storageLocators: readonly string[];
  readonly catalogueIds: readonly string[];
  readonly catalogueAvailable: boolean;
  readonly domain: string;
};

type DurableEvidenceItem = {
  readonly evidenceRef: string;
  readonly artifact?: AutomationArtifact;
  readonly bytes: Uint8Array;
  readonly mediaType: string;
  readonly contentHash: string;
  readonly classification: string;
  readonly title: string;
};

const DEFAULT_LOG = (entry: Readonly<Record<string, unknown>>): void => {
  console.info(JSON.stringify({ channel: "qep-evidence-publish", ...entry }));
};

let cachedStorage:
  { readonly key: string; readonly manager: EvidenceStorageManager } | undefined;

function storageCacheKey(config: EvidenceStoragePlatformConfig): string {
  return JSON.stringify({
    provider: config.provider,
    root: config.local?.rootDirectory ?? "",
    max: config.local?.maxObjectBytes ?? config.memory?.maxObjectBytes ?? null,
  });
}

function resolveStorage(deps: PublishAutomationEvidenceDeps): {
  readonly manager: EvidenceStorageManager;
  readonly config: EvidenceStoragePlatformConfig;
} {
  if (deps.storage) {
    return {
      manager: deps.storage,
      config: deps.storageConfig ?? resolveEvidenceStorageConfigFromEnv(),
    };
  }
  const config = deps.storageConfig ?? resolveEvidenceStorageConfigFromEnv();
  const key = storageCacheKey(config);
  if (!cachedStorage || cachedStorage.key !== key) {
    const { manager } = createEvidenceStorageSync(config);
    cachedStorage = { key, manager };
  }
  return { manager: cachedStorage.manager, config };
}

/** Test helper — drop cached storage manager between suites. */
export function resetEvidencePublishBridgeForTests(): void {
  cachedStorage = undefined;
}

function classificationFor(kind: AutomationArtifact["kind"] | undefined): string {
  // Must match qep-evidence EVIDENCE_CLASSIFICATIONS.
  switch (kind) {
    case "screenshot":
      return "screenshot";
    case "log":
    case "console":
      return "log";
    case "timing":
    case "metadata":
    case "network":
      return "structured_payload";
    case "video":
    case "trace":
      return "export";
    default:
      return "other";
  }
}

/** F3 domain tag for provider-neutral evidence matrix. */
export function evidenceDomainForProvider(
  providerId: AutomationExecutionRecord["providerId"],
): string {
  switch (providerId) {
    case "vitest":
      return "ci";
    case "accessibility":
      return "a11y";
    case "k6":
      return "performance";
    case "security":
      return "security";
    case "codequality":
      return "code_quality";
    case "playwright":
    case "selenium":
    case "cypress":
    case "appium":
    case "rest":
    case "visual":
      return "automation";
    default:
      return "automation";
  }
}

function sourceKindForProvider(
  providerId: AutomationExecutionRecord["providerId"],
): "automation" | "external_ingestion" {
  // Playwright may run live in-process; all other matrix providers are report ingest.
  if (providerId === "playwright") {
    return "automation";
  }
  return "external_ingestion";
}

function artifactIdFromRef(
  evidenceRef: string,
  executionId: string,
): string | undefined {
  const prefix = `evidence://automation/${executionId}/`;
  if (!evidenceRef.startsWith(prefix)) return undefined;
  const id = evidenceRef.slice(prefix.length).trim();
  return id.length > 0 ? id : undefined;
}

function buildDurableItems(record: AutomationExecutionRecord): DurableEvidenceItem[] {
  const byArtifactId = new Map(
    record.artifacts.map((artifact) => [artifact.artifactId, artifact] as const),
  );
  const refs =
    record.evidenceRefs.length > 0
      ? record.evidenceRefs
      : record.artifacts.map(
          (artifact) =>
            `evidence://automation/${record.executionId}/${artifact.artifactId}`,
        );

  return refs.map((evidenceRef) => {
    const artifactId = artifactIdFromRef(evidenceRef, record.executionId);
    const artifact = artifactId ? byArtifactId.get(artifactId) : undefined;

    // Prefer real binary/text payload when the provider attached contentBase64 (Q5 live).
    if (artifact?.contentBase64) {
      const raw = Buffer.from(artifact.contentBase64, "base64");
      const contentHash =
        artifact.sha256 ?? createHash("sha256").update(raw).digest("hex");
      return {
        evidenceRef,
        artifact,
        bytes: new Uint8Array(raw),
        mediaType: artifact.contentType || "application/octet-stream",
        contentHash,
        classification: classificationFor(artifact.kind),
        title: artifact.name,
      };
    }

    const payload = {
      kind: "qep.automation.evidence.publication",
      evidenceRef,
      executionId: record.executionId,
      tenantId: record.tenantId,
      projectId: record.projectId ?? null,
      providerId: record.providerId,
      correlationId: record.correlationId,
      requestedBy: record.requestedBy,
      state: record.state,
      resultSummary: record.resultSummary ?? null,
      timing: record.timing,
      artifact: artifact
        ? {
            artifactId: artifact.artifactId,
            kind: artifact.kind,
            name: artifact.name,
            contentType: artifact.contentType,
            uri: artifact.uri ?? null,
            bytes: artifact.bytes ?? null,
            sha256: artifact.sha256 ?? null,
            createdAt: artifact.createdAt,
          }
        : null,
      publishedAt: new Date().toISOString(),
    };
    const body = `${JSON.stringify(payload, null, 2)}\n`;
    const bytes = new TextEncoder().encode(body);
    const contentHash = createHash("sha256").update(bytes).digest("hex");
    return {
      evidenceRef,
      artifact,
      bytes,
      mediaType: "application/json",
      contentHash,
      classification: classificationFor(artifact?.kind),
      title: artifact?.name ?? `automation-evidence:${record.executionId}`,
    };
  });
}

async function resolveCataloguePort(
  deps: PublishAutomationEvidenceDeps,
  log: (entry: Readonly<Record<string, unknown>>) => void,
  record: AutomationExecutionRecord,
): Promise<EvidencePublishCataloguePort | null> {
  if (deps.catalogue !== undefined) {
    return deps.catalogue;
  }
  if (!deps.resolveCatalogue) {
    return null;
  }
  try {
    return await deps.resolveCatalogue();
  } catch (error) {
    log({
      event: "qep.automation.evidence.catalogue_resolve_failed",
      executionId: record.executionId,
      tenantId: record.tenantId,
      correlationId: record.correlationId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}

/**
 * Persist automation evidence refs to StoragePort and optionally catalogue them.
 */
export async function publishAutomationEvidence(
  record: AutomationExecutionRecord,
  deps: PublishAutomationEvidenceDeps = {},
): Promise<PublishAutomationEvidenceResult> {
  const log = deps.log ?? DEFAULT_LOG;
  const items = buildDurableItems(record);

  if (items.length === 0) {
    log({
      event: "qep.automation.evidence.publish_skipped",
      reason: "no_evidence_refs",
      executionId: record.executionId,
      tenantId: record.tenantId,
      correlationId: record.correlationId,
    });
    return {
      executionId: record.executionId,
      storageProvider: "none",
      storedCount: 0,
      cataloguedCount: 0,
      storageLocators: [],
      catalogueIds: [],
      catalogueAvailable: false,
      domain: evidenceDomainForProvider(record.providerId),
    };
  }

  let manager: EvidenceStorageManager;
  let config: EvidenceStoragePlatformConfig;
  try {
    ({ manager, config } = resolveStorage(deps));
  } catch (error) {
    log({
      event: "qep.automation.evidence.storage_unavailable",
      executionId: record.executionId,
      tenantId: record.tenantId,
      correlationId: record.correlationId,
      error: error instanceof Error ? error.message : "unknown",
    });
    throw error;
  }

  const storageLocators: string[] = [];
  for (const item of items) {
    const put = await manager.put({
      tenantId: record.tenantId,
      bytes: item.bytes,
      mediaType: item.mediaType,
      contentHash: item.contentHash,
      hashAlgorithm: "sha256",
    });
    storageLocators.push(put.storageLocator);
    log({
      event: "qep.automation.evidence.stored",
      executionId: record.executionId,
      tenantId: record.tenantId,
      correlationId: record.correlationId,
      evidenceRef: item.evidenceRef,
      storageLocator: put.storageLocator,
      storageProvider: config.provider,
      byteSize: put.byteSize,
      contentHash: item.contentHash,
    });
  }

  const catalogue = await resolveCataloguePort(deps, log, record);
  const catalogueIds: string[] = [];

  if (!catalogue) {
    log({
      event: "qep.automation.evidence.catalogue_unavailable",
      executionId: record.executionId,
      tenantId: record.tenantId,
      correlationId: record.correlationId,
      storedCount: storageLocators.length,
      storageProvider: config.provider,
      softFail: true,
    });
  } else {
    const projectId = record.projectId?.trim() || "qep-automation";
    const domain = evidenceDomainForProvider(record.providerId);
    const sourceKind = sourceKindForProvider(record.providerId);
    const changeEventId = record.target.metadata?.changeEventId?.trim();
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index]!;
      try {
        const tags = [
          "automation",
          `domain:${domain}`,
          `provider:${record.providerId}`,
          record.providerId,
          item.artifact?.kind ?? "publication",
          "f3-matrix",
        ];
        if (changeEventId) {
          tags.push(`change:${changeEventId}`);
        }
        const captured = await catalogue.capture({
          projectId,
          ownerId: record.requestedBy,
          sourceKind,
          sourceSystemId: record.executionId,
          mediaType: item.mediaType,
          contentBase64: Buffer.from(item.bytes).toString("base64"),
          contentHash: item.contentHash,
          hashAlgorithm: "sha256",
          title: item.title,
          description: `Provider evidence (${domain}/${record.providerId}) for execution ${record.executionId}`,
          tags,
          classification: item.classification,
        });
        catalogueIds.push(captured.id);
        // Associate requires catalogue lifecycle beyond "captured"; soft-skip here.
        // F3 graph edge uses SCM evidence links via evidence-change-link.
        log({
          event: "qep.automation.evidence.catalogued",
          executionId: record.executionId,
          tenantId: record.tenantId,
          correlationId: record.correlationId,
          evidenceRef: item.evidenceRef,
          evidenceId: captured.id,
          storageLocator: storageLocators[index],
          domain,
          changeEventId: changeEventId ?? null,
        });
      } catch (error) {
        log({
          event: "qep.automation.evidence.catalogue_failed",
          executionId: record.executionId,
          tenantId: record.tenantId,
          correlationId: record.correlationId,
          evidenceRef: item.evidenceRef,
          storageLocator: storageLocators[index],
          softFail: true,
          error: error instanceof Error ? error.message : "unknown",
        });
      }
    }
  }

  log({
    event: "qep.automation.evidence.publish_complete",
    executionId: record.executionId,
    tenantId: record.tenantId,
    correlationId: record.correlationId,
    storageProvider: config.provider,
    storedCount: storageLocators.length,
    cataloguedCount: catalogueIds.length,
    catalogueAvailable: catalogue !== null,
  });

  return {
    executionId: record.executionId,
    storageProvider: config.provider,
    storedCount: storageLocators.length,
    cataloguedCount: catalogueIds.length,
    storageLocators,
    catalogueIds,
    catalogueAvailable: catalogue !== null,
    domain: evidenceDomainForProvider(record.providerId),
  };
}
