/**
 * APZPEN file evidence vault — hashed blob storage (SPR-APZPEN-014).
 * Metadata refs use vault:// URIs; binaries live under the vault directory.
 */

import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type VaultObjectMeta = {
  readonly objectId: string;
  readonly tenantId: string;
  readonly engagementId?: string;
  readonly findingId?: string;
  readonly sha256: string;
  readonly contentType: string;
  readonly byteLength: number;
  readonly originalName: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly vaultUri: string;
};

const metaStore: { objects: VaultObjectMeta[] } = { objects: [] };
let hydrated = false;

function persistEnabled(): boolean {
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") {
    return false;
  }
  return true;
}

export function vaultRoot(): string {
  const override = process.env.APZPEN_VAULT_DIR?.trim();
  if (override) return override;
  const data =
    process.env.APZPEN_DATA_DIR?.trim() || join(process.cwd(), ".data", "apzpen");
  return join(data, "vault");
}

function metaPath(): string {
  return join(vaultRoot(), "index.json");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!persistEnabled()) return;
  try {
    const path = metaPath();
    if (!existsSync(path)) return;
    const raw = JSON.parse(readFileSync(path, "utf8")) as {
      objects?: VaultObjectMeta[];
    };
    metaStore.objects = Array.isArray(raw.objects) ? raw.objects : [];
  } catch {
    /* empty */
  }
}

function persist(): void {
  if (!persistEnabled()) return;
  mkdirSync(vaultRoot(), { recursive: true });
  writeFileSync(
    metaPath(),
    JSON.stringify({ objects: metaStore.objects }, null, 2),
    "utf8",
  );
}

export function resetEvidenceVaultForTests(): void {
  metaStore.objects = [];
  hydrated = true;
}

export function vaultUriFor(objectId: string): string {
  return `vault://${objectId}`;
}

export function parseVaultUri(ref: string): string | null {
  const m = /^vault:\/\/([a-zA-Z0-9_-]+)$/.exec(ref.trim());
  return m?.[1] ?? null;
}

const MAX_BYTES = 15 * 1024 * 1024; // 15 MiB CE limit

export function putEvidenceObject(input: {
  readonly tenantId: string;
  readonly engagementId?: string;
  readonly findingId?: string;
  readonly createdBy: string;
  readonly originalName: string;
  readonly contentType?: string;
  readonly bytes: Buffer | Uint8Array | string;
}): VaultObjectMeta {
  hydrate();
  const buf = Buffer.isBuffer(input.bytes)
    ? input.bytes
    : typeof input.bytes === "string"
      ? Buffer.from(input.bytes, "utf8")
      : Buffer.from(input.bytes);
  if (buf.byteLength === 0) {
    throw new Error("Evidence object is empty.");
  }
  if (buf.byteLength > MAX_BYTES) {
    throw new Error(`Evidence exceeds ${MAX_BYTES} byte limit.`);
  }
  const sha256 = createHash("sha256").update(buf).digest("hex");
  const objectId = `ev_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  const dir = join(vaultRoot(), input.tenantId);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${objectId}.bin`), buf);
  const meta: VaultObjectMeta = {
    objectId,
    tenantId: input.tenantId,
    engagementId: input.engagementId,
    findingId: input.findingId,
    sha256,
    contentType: input.contentType?.trim() || "application/octet-stream",
    byteLength: buf.byteLength,
    originalName: input.originalName.trim() || objectId,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
    vaultUri: vaultUriFor(objectId),
  };
  metaStore.objects.push(meta);
  persist();
  return meta;
}

export function getEvidenceObjectMeta(
  tenantId: string,
  objectId: string,
): VaultObjectMeta | undefined {
  hydrate();
  return metaStore.objects.find(
    (o) => o.tenantId === tenantId && o.objectId === objectId,
  );
}

export function readEvidenceBytes(
  tenantId: string,
  objectId: string,
): Buffer | undefined {
  const meta = getEvidenceObjectMeta(tenantId, objectId);
  if (!meta) return undefined;
  const path = join(vaultRoot(), tenantId, `${objectId}.bin`);
  if (!existsSync(path)) return undefined;
  return readFileSync(path);
}

export function listEvidenceObjects(
  tenantId: string,
  filter?: { readonly findingId?: string; readonly engagementId?: string },
): readonly VaultObjectMeta[] {
  hydrate();
  return metaStore.objects
    .filter((o) => {
      if (o.tenantId !== tenantId) return false;
      if (filter?.findingId && o.findingId !== filter.findingId) return false;
      if (filter?.engagementId && o.engagementId !== filter.engagementId) {
        return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
