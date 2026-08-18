/**
 * Quote snapshots — checkout consumes the stored server quote, not a client total.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { CommerceQuote } from "@/lib/commercial/commerce-quote";

type Store = { quotes: CommerceQuote[] };

let store: Store = { quotes: [] };
let hydrated = false;

function persistEnabled(): boolean {
  if (process.env.APZHUB_FORCE_COMMERCE_PERSIST === "1") return true;
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") return false;
  return true;
}

function dataDir(): string {
  const override = process.env.APZHUB_COMMERCE_DATA_DIR?.trim();
  if (override) return join(override, "quotes");
  const cwd = process.cwd();
  const base =
    cwd.endsWith("/apps/web") || cwd.endsWith("\\apps/web")
      ? join(cwd, ".data")
      : join(cwd, "apps/web/.data");
  return join(base, "commerce-quotes");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = readFileSync(join(dataDir(), "ledger.json"), "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (Array.isArray(parsed.quotes)) store = { quotes: parsed.quotes };
  } catch {
    store = { quotes: [] };
  }
}

function persistAll(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(join(dataDir(), "ledger.json"), JSON.stringify(store, null, 2), "utf8");
}

export function resetQuotesForTests(): void {
  store = { quotes: [] };
  hydrated = false;
}

export function rememberQuote(quote: CommerceQuote): CommerceQuote {
  hydrate();
  store.quotes.unshift(quote);
  store.quotes = store.quotes.slice(0, 500);
  persistAll();
  return quote;
}

export function getStoredQuote(quoteId: string): CommerceQuote | undefined {
  hydrate();
  return store.quotes.find((row) => row.quoteId === quoteId);
}

export function requireFreshQuote(quoteId: string, now = new Date()): CommerceQuote {
  const quote = getStoredQuote(quoteId);
  if (!quote) {
    throw new Error("billing.quote_not_found");
  }
  if (new Date(quote.expiresAt).getTime() <= now.getTime()) {
    throw new Error("billing.quote_expired");
  }
  return quote;
}
