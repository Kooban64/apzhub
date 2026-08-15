/**
 * QEP Learning KB ledger (SPR-APZQEP-220-B) — platform metadata, not Cap SoR.
 */

import { randomUUID } from "node:crypto";

import {
  isQepLedgerPersistEnabled,
  readJsonLedgerSnapshot,
  resolveQepDataRoot,
  writeJsonLedgerSnapshot,
} from "@/lib/qep/qep-ledger-fs";

export type ArticleStatus = "draft" | "published";

export type KnowledgeArticle = {
  readonly articleId: string;
  readonly title: string;
  readonly body: string;
  readonly status: ArticleStatus;
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
};

type Snapshot = { readonly items: readonly KnowledgeArticle[] };

const FILE = "articles.json";
const items: KnowledgeArticle[] = [];
let hydrated = false;

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  const snap = readJsonLedgerSnapshot<Snapshot>(
    resolveQepDataRoot("qep-knowledge"),
    FILE,
  );
  if (snap?.items?.length) items.push(...snap.items);
}

function persist(): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerSnapshot(resolveQepDataRoot("qep-knowledge"), FILE, {
    items: items.slice(0, 500),
  });
}

export function resetKnowledgeStoreForTests(): void {
  items.splice(0, items.length);
  hydrated = false;
}

export function listArticles(): readonly KnowledgeArticle[] {
  hydrate();
  return [...items];
}

export function createArticle(input: {
  readonly title: string;
  readonly body: string;
  readonly tags?: readonly string[];
  readonly actorId: string;
}): KnowledgeArticle {
  hydrate();
  const now = new Date().toISOString();
  const tags = (input.tags ?? []).map((t) => t.trim()).filter((t) => t.length > 0);
  const item: KnowledgeArticle = {
    articleId: `art_${randomUUID().slice(0, 8)}`,
    title: input.title.trim(),
    body: input.body.trim(),
    status: "draft",
    tags,
    createdAt: now,
    updatedAt: now,
    createdBy: input.actorId,
  };
  items.unshift(item);
  persist();
  return item;
}

export function publishArticle(input: {
  readonly articleId: string;
}): KnowledgeArticle | null {
  hydrate();
  const idx = items.findIndex((a) => a.articleId === input.articleId);
  if (idx < 0) return null;
  const prev = items[idx]!;
  const next: KnowledgeArticle = {
    ...prev,
    status: "published",
    updatedAt: new Date().toISOString(),
  };
  items[idx] = next;
  persist();
  return next;
}
