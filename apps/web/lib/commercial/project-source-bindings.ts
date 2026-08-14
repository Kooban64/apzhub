/**
 * Project-scoped source code bindings for APZQEP + APZPEN only.
 * Bindings attach when a quality project / engagement is created (or updated).
 * Never store plaintext tokens — secretRef only.
 * Authority: SPR-COMM-002 · SAAS commercial model · platform-scm provider ids.
 */

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { ScmProviderId } from "@apzhub/platform-scm";

import {
  isKnownSourceProvider,
  isSourceProviderAvailable,
  type ProjectSourceOperatingMode,
  type SourceBoundProductKey,
} from "@/lib/commercial/project-source-catalogue";

export {
  PROJECT_SOURCE_PROVIDER_CATALOGUE,
  isKnownSourceProvider,
  isSourceProviderAvailable,
  type ProjectSourceOperatingMode,
  type SourceBoundProductKey,
} from "@/lib/commercial/project-source-catalogue";

export type ProjectSourceBindingStatus = "active" | "disabled" | "pending";

export type ProjectSourceBinding = {
  readonly bindingId: string;
  readonly tenantId: string;
  /** qep quality project id OR apzpen engagement id */
  readonly projectId: string;
  readonly productKey: SourceBoundProductKey;
  readonly providerId: ScmProviderId;
  /** e.g. owner/repo — provider-neutral string */
  readonly externalRef: string;
  readonly displayName: string;
  readonly mode: ProjectSourceOperatingMode;
  readonly status: ProjectSourceBindingStatus;
  readonly secretRef?: string;
  readonly defaultBranch?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProjectSourceBindingInput = {
  readonly providerId: ScmProviderId;
  readonly externalRef: string;
  readonly mode: ProjectSourceOperatingMode;
  readonly displayName?: string;
  readonly secretRef?: string;
  readonly defaultBranch?: string;
};

type Snapshot = {
  bindings: ProjectSourceBinding[];
};

const store: Snapshot = { bindings: [] };
let hydrated = false;

function persistEnabled(): boolean {
  if (process.env.APZHUB_QEP_LEDGER_PERSIST === "true") return true;
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") return false;
  return true;
}

function dataDir(): string {
  const override = process.env.APZHUB_QEP_DATA_DIR?.trim();
  const cwd = process.cwd();
  const base = override
    ? override
    : cwd.endsWith("/apps/web") || cwd.endsWith("\\apps/web")
      ? join(cwd, ".data")
      : join(cwd, "apps/web/.data");
  return join(base, "project-source");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!persistEnabled()) return;
  const path = join(dataDir(), "bindings.json");
  if (!existsSync(path)) return;
  try {
    const snap = JSON.parse(readFileSync(path, "utf8")) as Snapshot;
    if (Array.isArray(snap.bindings)) {
      store.bindings.push(...snap.bindings);
    }
  } catch {
    /* ignore corrupt */
  }
}

function persistAll(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(
    join(dataDir(), "bindings.json"),
    JSON.stringify(store, null, 2),
    "utf8",
  );
}

export function resetProjectSourceBindingsForTests(): void {
  store.bindings.splice(0, store.bindings.length);
  hydrated = false;
}

export function listProjectSourceBindings(input: {
  readonly tenantId: string;
  readonly productKey?: SourceBoundProductKey;
  readonly projectId?: string;
}): readonly ProjectSourceBinding[] {
  hydrate();
  return store.bindings.filter((row) => {
    if (row.tenantId !== input.tenantId) return false;
    if (input.productKey && row.productKey !== input.productKey) return false;
    if (input.projectId && row.projectId !== input.projectId) return false;
    return row.status !== "disabled";
  });
}

export function upsertProjectSourceBinding(input: {
  readonly tenantId: string;
  readonly projectId: string;
  readonly productKey: SourceBoundProductKey;
  readonly binding: ProjectSourceBindingInput;
}): ProjectSourceBinding {
  if (input.productKey !== "qep" && input.productKey !== "pentest") {
    throw new Error("source.product_not_supported");
  }
  hydrate();
  const externalRef = input.binding.externalRef.trim();
  if (!externalRef) throw new Error("source.external_ref_required");
  if (!isKnownSourceProvider(input.binding.providerId)) {
    throw new Error("source.provider_unknown");
  }
  if (!isSourceProviderAvailable(input.binding.providerId)) {
    throw new Error("source.provider_not_available");
  }

  const now = new Date().toISOString();
  const existing = store.bindings.find(
    (b) =>
      b.tenantId === input.tenantId &&
      b.productKey === input.productKey &&
      b.projectId === input.projectId &&
      b.providerId === input.binding.providerId &&
      b.externalRef.toLowerCase() === externalRef.toLowerCase(),
  );

  if (existing) {
    const updated: ProjectSourceBinding = {
      ...existing,
      externalRef,
      displayName: input.binding.displayName?.trim() || existing.displayName,
      mode: input.binding.mode,
      secretRef: input.binding.secretRef ?? existing.secretRef,
      defaultBranch: input.binding.defaultBranch ?? existing.defaultBranch,
      status: "active",
      updatedAt: now,
    };
    store.bindings[store.bindings.indexOf(existing)] = updated;
    persistAll();
    return updated;
  }

  const created: ProjectSourceBinding = {
    bindingId: `psb-${randomUUID()}`,
    tenantId: input.tenantId,
    projectId: input.projectId,
    productKey: input.productKey,
    providerId: input.binding.providerId,
    externalRef,
    displayName: input.binding.displayName?.trim() || externalRef,
    mode: input.binding.mode,
    status: "active",
    secretRef: input.binding.secretRef,
    defaultBranch: input.binding.defaultBranch,
    createdAt: now,
    updatedAt: now,
  };
  store.bindings.push(created);
  persistAll();
  return created;
}

export function attachSourceBindingsToProject(input: {
  readonly tenantId: string;
  readonly projectId: string;
  readonly productKey: SourceBoundProductKey;
  readonly bindings: readonly ProjectSourceBindingInput[];
}): readonly ProjectSourceBinding[] {
  return input.bindings.map((binding) =>
    upsertProjectSourceBinding({
      tenantId: input.tenantId,
      projectId: input.projectId,
      productKey: input.productKey,
      binding,
    }),
  );
}

export function parseSourceBindingInput(
  raw: unknown,
): ProjectSourceBindingInput | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Record<string, unknown>;
  if (typeof row.providerId !== "string" || typeof row.externalRef !== "string") {
    return undefined;
  }
  if (row.mode !== "granted_read" && row.mode !== "customer_pipeline") {
    return undefined;
  }
  if (!isKnownSourceProvider(row.providerId)) return undefined;
  return {
    providerId: row.providerId,
    externalRef: row.externalRef,
    mode: row.mode,
    displayName: typeof row.displayName === "string" ? row.displayName : undefined,
    secretRef: typeof row.secretRef === "string" ? row.secretRef : undefined,
    defaultBranch:
      typeof row.defaultBranch === "string" ? row.defaultBranch : undefined,
  };
}

export function parseSourceBindingInputs(
  raw: unknown,
): readonly ProjectSourceBindingInput[] {
  if (!Array.isArray(raw)) {
    const single = parseSourceBindingInput(raw);
    return single ? [single] : [];
  }
  return raw
    .map(parseSourceBindingInput)
    .filter((b): b is ProjectSourceBindingInput => Boolean(b));
}
