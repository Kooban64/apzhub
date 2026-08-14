/**
 * Platform console configuration store (Superadmin).
 * File-backed — secrets stored as refs/status only, never plaintext values.
 */

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { SuiteId } from "@/lib/commercial/catalogue";

export type ConsoleCustomer = {
  readonly customerId: string;
  readonly organisationId: string;
  readonly name: string;
  readonly status: "active" | "suspended" | "closed";
  readonly suiteIds: readonly SuiteId[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PaymentProviderConfig = {
  readonly providerId: string;
  readonly name: string;
  readonly kind: "payfast" | "manual" | "other";
  readonly enabled: boolean;
  readonly merchantIdRef: string;
  readonly webhookUrl: string;
  readonly updatedAt: string;
};

export type ApiCredential = {
  readonly credentialId: string;
  readonly name: string;
  readonly prefix: string;
  readonly status: "active" | "revoked" | "rotated";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly lastUsedAt?: string;
};

export type PlatformLimit = {
  readonly limitId: string;
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly updatedAt: string;
};

export type SecretRefStatus = {
  readonly secretId: string;
  readonly name: string;
  readonly ref: string;
  readonly status: "configured" | "missing" | "rotation_due";
  readonly updatedAt: string;
};

type Snapshot = {
  customers: ConsoleCustomer[];
  payments: PaymentProviderConfig[];
  apiCredentials: ApiCredential[];
  limits: PlatformLimit[];
  secrets: SecretRefStatus[];
  complianceSignups: ComplianceSignup[];
};

export type ComplianceSignup = {
  readonly signupId: string;
  readonly organisationId: string;
  readonly organisationName: string;
  readonly status: "pending" | "approved" | "rejected";
  readonly notes: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

const store: Snapshot = {
  customers: [],
  payments: [],
  apiCredentials: [],
  limits: [],
  secrets: [],
  complianceSignups: [],
};
let hydrated = false;

function persistEnabled(): boolean {
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") return false;
  return true;
}

function dataDir(): string {
  const cwd = process.cwd();
  const base =
    cwd.endsWith("/apps/web") || cwd.endsWith("\\apps/web")
      ? join(cwd, ".data")
      : join(cwd, "apps/web/.data");
  return join(base, "platform-console");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  seedDefaults();
  if (!persistEnabled()) return;
  const path = join(dataDir(), "console.json");
  if (!existsSync(path)) return;
  try {
    const snap = JSON.parse(readFileSync(path, "utf8")) as Snapshot;
    if (Array.isArray(snap.customers)) store.customers = snap.customers;
    if (Array.isArray(snap.payments)) store.payments = snap.payments;
    if (Array.isArray(snap.apiCredentials)) store.apiCredentials = snap.apiCredentials;
    if (Array.isArray(snap.limits)) store.limits = snap.limits;
    if (Array.isArray(snap.secrets)) store.secrets = snap.secrets;
    if (Array.isArray(snap.complianceSignups))
      store.complianceSignups = snap.complianceSignups;
  } catch {
    /* ignore */
  }
}

function persistAll(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(
    join(dataDir(), "console.json"),
    JSON.stringify(store, null, 2),
    "utf8",
  );
}

function seedDefaults(): void {
  if (store.payments.length === 0) {
    store.payments.push({
      providerId: "payfast-default",
      name: "PayFast",
      kind: "payfast",
      enabled: true,
      merchantIdRef: "env:PAYFAST_MERCHANT_ID",
      webhookUrl: "/api/v1/billing/payfast/itn",
      updatedAt: new Date().toISOString(),
    });
  }
  if (store.limits.length === 0) {
    const now = new Date().toISOString();
    store.limits.push(
      {
        limitId: "lim-seats",
        key: "seats.max",
        label: "Max seats per org",
        value: 500,
        unit: "seats",
        updatedAt: now,
      },
      {
        limitId: "lim-api",
        key: "api.rate",
        label: "API rate limit",
        value: 1200,
        unit: "req/min",
        updatedAt: now,
      },
      {
        limitId: "lim-storage",
        key: "storage.gb",
        label: "Evidence storage",
        value: 100,
        unit: "GB",
        updatedAt: now,
      },
    );
  }
  if (store.secrets.length === 0) {
    const now = new Date().toISOString();
    store.secrets.push(
      {
        secretId: "sec-auth",
        name: "Better Auth secret",
        ref: "env:BETTER_AUTH_SECRET",
        status: process.env.BETTER_AUTH_SECRET ? "configured" : "missing",
        updatedAt: now,
      },
      {
        secretId: "sec-db",
        name: "Database URL",
        ref: "env:DATABASE_URL",
        status: process.env.DATABASE_URL ? "configured" : "missing",
        updatedAt: now,
      },
      {
        secretId: "sec-payfast",
        name: "PayFast passphrase",
        ref: "env:PAYFAST_PASSPHRASE",
        status: process.env.PAYFAST_PASSPHRASE ? "configured" : "missing",
        updatedAt: now,
      },
    );
  }
}

export function listConsoleCustomers(): readonly ConsoleCustomer[] {
  hydrate();
  return store.customers;
}

export function upsertConsoleCustomer(input: {
  readonly organisationId: string;
  readonly name: string;
  readonly suiteIds?: readonly SuiteId[];
  readonly status?: ConsoleCustomer["status"];
}): ConsoleCustomer {
  hydrate();
  const now = new Date().toISOString();
  const existing = store.customers.find(
    (c) => c.organisationId === input.organisationId,
  );
  if (existing) {
    const updated: ConsoleCustomer = {
      ...existing,
      name: input.name,
      suiteIds: input.suiteIds ?? existing.suiteIds,
      status: input.status ?? existing.status,
      updatedAt: now,
    };
    store.customers[store.customers.indexOf(existing)] = updated;
    persistAll();
    return updated;
  }
  const created: ConsoleCustomer = {
    customerId: `cus-${randomUUID()}`,
    organisationId: input.organisationId,
    name: input.name,
    status: input.status ?? "active",
    suiteIds: input.suiteIds ?? ["qa"],
    createdAt: now,
    updatedAt: now,
  };
  store.customers.push(created);
  persistAll();
  return created;
}

export function removeConsoleCustomer(customerId: string): boolean {
  hydrate();
  const before = store.customers.length;
  store.customers = store.customers.filter((c) => c.customerId !== customerId);
  persistAll();
  return store.customers.length < before;
}

export function listPaymentProviders(): readonly PaymentProviderConfig[] {
  hydrate();
  return store.payments;
}

export function updatePaymentProvider(
  providerId: string,
  patch: Partial<
    Pick<PaymentProviderConfig, "enabled" | "merchantIdRef" | "webhookUrl" | "name">
  >,
): PaymentProviderConfig | undefined {
  hydrate();
  const idx = store.payments.findIndex((p) => p.providerId === providerId);
  if (idx < 0) return undefined;
  const updated = {
    ...store.payments[idx]!,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.payments[idx] = updated;
  persistAll();
  return updated;
}

export function listApiCredentials(): readonly ApiCredential[] {
  hydrate();
  return store.apiCredentials;
}

export function createApiCredential(name: string): {
  readonly credential: ApiCredential;
  readonly plaintextOnce: string;
} {
  hydrate();
  const now = new Date().toISOString();
  const secret = `apz_${randomUUID().replace(/-/g, "")}`;
  const credential: ApiCredential = {
    credentialId: `key-${randomUUID()}`,
    name,
    prefix: secret.slice(0, 10),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  store.apiCredentials.push(credential);
  persistAll();
  return { credential, plaintextOnce: secret };
}

export function revokeApiCredential(credentialId: string): ApiCredential | undefined {
  hydrate();
  const idx = store.apiCredentials.findIndex((c) => c.credentialId === credentialId);
  if (idx < 0) return undefined;
  const updated = {
    ...store.apiCredentials[idx]!,
    status: "revoked" as const,
    updatedAt: new Date().toISOString(),
  };
  store.apiCredentials[idx] = updated;
  persistAll();
  return updated;
}

export function listPlatformLimits(): readonly PlatformLimit[] {
  hydrate();
  return store.limits;
}

export function updatePlatformLimit(
  limitId: string,
  value: number,
): PlatformLimit | undefined {
  hydrate();
  const idx = store.limits.findIndex((l) => l.limitId === limitId);
  if (idx < 0) return undefined;
  const updated = {
    ...store.limits[idx]!,
    value,
    updatedAt: new Date().toISOString(),
  };
  store.limits[idx] = updated;
  persistAll();
  return updated;
}

export function listSecretRefs(): readonly SecretRefStatus[] {
  hydrate();
  return store.secrets.map((s) => ({
    ...s,
    status:
      s.ref.startsWith("env:") && process.env[s.ref.slice(4)]
        ? "configured"
        : s.status === "rotation_due"
          ? "rotation_due"
          : "missing",
  }));
}

export function listComplianceSignups(): readonly ComplianceSignup[] {
  hydrate();
  return store.complianceSignups;
}

export function upsertComplianceSignup(input: {
  readonly organisationId: string;
  readonly organisationName: string;
  readonly status?: ComplianceSignup["status"];
  readonly notes?: string;
}): ComplianceSignup {
  hydrate();
  const now = new Date().toISOString();
  const existing = store.complianceSignups.find(
    (s) => s.organisationId === input.organisationId,
  );
  if (existing) {
    const updated: ComplianceSignup = {
      ...existing,
      organisationName: input.organisationName,
      status: input.status ?? existing.status,
      notes: input.notes ?? existing.notes,
      updatedAt: now,
    };
    store.complianceSignups[store.complianceSignups.indexOf(existing)] = updated;
    persistAll();
    return updated;
  }
  const created: ComplianceSignup = {
    signupId: `sgn-${randomUUID()}`,
    organisationId: input.organisationId,
    organisationName: input.organisationName,
    status: input.status ?? "pending",
    notes: input.notes ?? "",
    createdAt: now,
    updatedAt: now,
  };
  store.complianceSignups.push(created);
  persistAll();
  return created;
}

export function resetConsoleStoreForTests(): void {
  store.customers = [];
  store.payments = [];
  store.apiCredentials = [];
  store.limits = [];
  store.secrets = [];
  store.complianceSignups = [];
  hydrated = false;
}
