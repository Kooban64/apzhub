/**
 * Extended APZPEN stores — PR events + customer grants (file-backed).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { CustomerGrant } from "./customer-grants";
import type { PrSecurityEvent } from "./github-pr-security";
import { newId } from "./store";

function persistEnabled(): boolean {
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") {
    return false;
  }
  return true;
}

function dataDir(): string {
  const override = process.env.APZPEN_DATA_DIR?.trim();
  if (override) return override;
  return join(process.cwd(), ".data", "apzpen");
}

const prStore: { events: PrSecurityEvent[] } = { events: [] };
const grantStore: { grants: CustomerGrant[] } = { grants: [] };
let prHydrated = false;
let grantHydrated = false;

function hydratePr(): void {
  if (prHydrated) return;
  prHydrated = true;
  if (!persistEnabled()) return;
  try {
    const path = join(dataDir(), "pr-events.json");
    if (!existsSync(path)) return;
    const raw = JSON.parse(readFileSync(path, "utf8")) as {
      events?: PrSecurityEvent[];
    };
    prStore.events = Array.isArray(raw.events) ? raw.events : [];
  } catch {
    /* empty */
  }
}

function persistPr(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(
    join(dataDir(), "pr-events.json"),
    JSON.stringify({ events: prStore.events }, null, 2),
    "utf8",
  );
}

function hydrateGrants(): void {
  if (grantHydrated) return;
  grantHydrated = true;
  if (!persistEnabled()) return;
  try {
    const path = join(dataDir(), "customer-grants.json");
    if (!existsSync(path)) return;
    const raw = JSON.parse(readFileSync(path, "utf8")) as {
      grants?: CustomerGrant[];
    };
    grantStore.grants = Array.isArray(raw.grants) ? raw.grants : [];
  } catch {
    /* empty */
  }
}

function persistGrants(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(
    join(dataDir(), "customer-grants.json"),
    JSON.stringify({ grants: grantStore.grants }, null, 2),
    "utf8",
  );
}

export function resetApzpenExtStoreForTests(): void {
  prStore.events = [];
  grantStore.grants = [];
  prHydrated = true;
  grantHydrated = true;
}

export function listPrEvents(
  tenantId: string,
  engagementId?: string,
): readonly PrSecurityEvent[] {
  hydratePr();
  return prStore.events
    .filter(
      (e) =>
        e.tenantId === tenantId &&
        (engagementId ? e.engagementId === engagementId : true),
    )
    .slice()
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export function savePrEvent(event: PrSecurityEvent): PrSecurityEvent {
  hydratePr();
  const idx = prStore.events.findIndex((e) => e.eventId === event.eventId);
  if (idx >= 0) prStore.events[idx] = event;
  else prStore.events.push(event);
  persistPr();
  return event;
}

export function listCustomerGrants(
  tenantId: string,
  engagementId?: string,
): readonly CustomerGrant[] {
  hydrateGrants();
  return grantStore.grants.filter(
    (g) =>
      g.tenantId === tenantId &&
      (engagementId ? g.engagementId === engagementId : true),
  );
}

export function saveCustomerGrant(grant: CustomerGrant): CustomerGrant {
  hydrateGrants();
  const idx = grantStore.grants.findIndex((g) => g.grantId === grant.grantId);
  if (idx >= 0) grantStore.grants[idx] = grant;
  else grantStore.grants.push(grant);
  persistGrants();
  return grant;
}

export function listAllCustomerGrants(): readonly CustomerGrant[] {
  hydrateGrants();
  return grantStore.grants.slice();
}

export { newId };
