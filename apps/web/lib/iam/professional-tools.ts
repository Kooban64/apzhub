/**
 * Stream 4 — Professional Tools entitlement overlay (APZ-owned, not provider SSO).
 * Grants reason/expiry/audit; launch remains out of scope for Stream 4.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type ProfessionalToolId = "workflow-designer" | "analytics-models";

export type ProfessionalToolGrant = {
  readonly id: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly toolId: ProfessionalToolId;
  readonly reason: string;
  readonly expiresAt: string;
  readonly grantedBy: string;
  readonly createdAt: string;
  readonly revokedAt?: string;
};

type Store = { grants: ProfessionalToolGrant[] };

let store: Store = { grants: [] };
let hydrated = false;

const TOOL_CATALOGUE: readonly {
  readonly id: ProfessionalToolId;
  readonly label: string;
  readonly description: string;
}[] = [
  {
    id: "workflow-designer",
    label: "Workflow designer",
    description:
      "Advanced process design for specialists. Ordinary users stay in APZ Workflow journeys.",
  },
  {
    id: "analytics-models",
    label: "Analytics models",
    description:
      "Analyst modelling tools. Ordinary viewers use APZ Analytics questions and dashboards.",
  },
];

function persistEnabled(): boolean {
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") {
    return false;
  }
  return true;
}

function dataDir(): string {
  return (
    process.env.APZHUB_PROFESSIONAL_TOOLS_DATA_DIR?.trim() ||
    join(process.cwd(), ".data", "professional-tools")
  );
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = readFileSync(join(dataDir(), "grants.json"), "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (Array.isArray(parsed.grants)) store = { grants: parsed.grants };
  } catch {
    store = { grants: [] };
  }
}

function persistAll(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(join(dataDir(), "grants.json"), JSON.stringify(store, null, 2), "utf8");
}

export function resetProfessionalToolGrantsForTests(): void {
  store = { grants: [] };
  hydrated = false;
}

export function listProfessionalToolsCatalogue() {
  return TOOL_CATALOGUE;
}

export function listProfessionalToolGrants(filter: {
  readonly organisationId: string;
  readonly activeOnly?: boolean;
}): readonly ProfessionalToolGrant[] {
  hydrate();
  const now = Date.now();
  return store.grants.filter((grant) => {
    if (grant.organisationId !== filter.organisationId) return false;
    if (!filter.activeOnly) return true;
    if (grant.revokedAt) return false;
    return Date.parse(grant.expiresAt) > now;
  });
}

export function grantProfessionalTool(input: {
  readonly organisationId: string;
  readonly userId: string;
  readonly toolId: ProfessionalToolId;
  readonly reason: string;
  readonly expiresAt: string;
  readonly grantedBy: string;
}): ProfessionalToolGrant {
  const reason = input.reason.trim();
  if (!reason) throw new Error("professional_tools.reason_required");
  if (!input.userId.trim()) throw new Error("professional_tools.user_required");
  if (!Number.isFinite(Date.parse(input.expiresAt))) {
    throw new Error("professional_tools.expiry_invalid");
  }
  if (!TOOL_CATALOGUE.some((tool) => tool.id === input.toolId)) {
    throw new Error("professional_tools.unknown_tool");
  }
  hydrate();
  const now = new Date().toISOString();
  const grant: ProfessionalToolGrant = {
    id: `ptg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    organisationId: input.organisationId,
    userId: input.userId.trim(),
    toolId: input.toolId,
    reason,
    expiresAt: new Date(input.expiresAt).toISOString(),
    grantedBy: input.grantedBy,
    createdAt: now,
  };
  store.grants.unshift(grant);
  persistAll();
  return grant;
}

export function revokeProfessionalToolGrant(input: {
  readonly organisationId: string;
  readonly grantId: string;
}): ProfessionalToolGrant | null {
  hydrate();
  const idx = store.grants.findIndex(
    (row) => row.id === input.grantId && row.organisationId === input.organisationId,
  );
  if (idx < 0) return null;
  const prior = store.grants[idx]!;
  const next: ProfessionalToolGrant = {
    ...prior,
    revokedAt: new Date().toISOString(),
  };
  store.grants[idx] = next;
  persistAll();
  return next;
}
