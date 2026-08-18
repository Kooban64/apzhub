/**
 * Commerce order lifecycle mapped onto the existing billing ledger.
 *
 * DRAFT → PENDING_PAYMENT → PAID → PROVISIONING → ACTIVE
 * (+ cancelled | failed)
 *
 * Payment and organisation entitlement are separate events.
 */

import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { CommerceQuote } from "@/lib/commercial/commerce-quote";

export type CommerceOrderStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "provisioning"
  | "active"
  | "cancelled"
  | "failed";

export type CommerceOrder = {
  readonly orderId: string;
  readonly organisationId: string;
  readonly ownerUserId: string;
  readonly invoiceId: string;
  readonly packageIds: readonly string[];
  readonly seats: number;
  readonly totalCents: number;
  readonly currency: string;
  readonly status: CommerceOrderStatus;
  readonly quote: CommerceQuote;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type Store = { orders: CommerceOrder[] };

let store: Store = { orders: [] };
let hydrated = false;

function persistEnabled(): boolean {
  if (process.env.APZHUB_FORCE_COMMERCE_PERSIST === "1") return true;
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") return false;
  return true;
}

function dataDir(): string {
  const override = process.env.APZHUB_COMMERCE_DATA_DIR?.trim();
  if (override) return join(override, "orders");
  const cwd = process.cwd();
  const base =
    cwd.endsWith("/apps/web") || cwd.endsWith("\\apps/web")
      ? join(cwd, ".data")
      : join(cwd, "apps/web/.data");
  return join(base, "commerce-orders");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = readFileSync(join(dataDir(), "ledger.json"), "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (Array.isArray(parsed.orders)) store = { orders: parsed.orders };
  } catch {
    store = { orders: [] };
  }
}

function persistAll(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(join(dataDir(), "ledger.json"), JSON.stringify(store, null, 2), "utf8");
}

export function resetCommerceOrdersForTests(): void {
  store = { orders: [] };
  hydrated = false;
}

export function createCommerceOrder(input: {
  readonly organisationId: string;
  readonly ownerUserId: string;
  readonly invoiceId: string;
  readonly quote: CommerceQuote;
}): CommerceOrder {
  hydrate();
  const now = new Date().toISOString();
  const order: CommerceOrder = {
    orderId: `ord-${randomUUID()}`,
    organisationId: input.organisationId,
    ownerUserId: input.ownerUserId,
    invoiceId: input.invoiceId,
    packageIds: input.quote.packageIds,
    seats: input.quote.seats,
    totalCents: input.quote.totalCents,
    currency: input.quote.currency,
    status: "pending_payment",
    quote: input.quote,
    createdAt: now,
    updatedAt: now,
  };
  store.orders.unshift(order);
  persistAll();
  return order;
}

export function getCommerceOrderByInvoice(
  invoiceId: string,
): CommerceOrder | undefined {
  hydrate();
  return store.orders.find((row) => row.invoiceId === invoiceId);
}

export function getCommerceOrder(orderId: string): CommerceOrder | undefined {
  hydrate();
  return store.orders.find((row) => row.orderId === orderId);
}

export function setCommerceOrderStatus(
  orderId: string,
  status: CommerceOrderStatus,
): CommerceOrder | undefined {
  hydrate();
  const idx = store.orders.findIndex((row) => row.orderId === orderId);
  if (idx < 0) return undefined;
  const current = store.orders[idx]!;
  const updated: CommerceOrder = {
    ...current,
    status,
    updatedAt: new Date().toISOString(),
  };
  store.orders[idx] = updated;
  persistAll();
  return updated;
}
