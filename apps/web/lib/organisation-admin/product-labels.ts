/**
 * Tenant-facing product labels — APZ product language only (never Plane/Zammad/…).
 */

import type { ProductKey, SuiteId } from "@/lib/commercial/catalogue";

export const ORG_ADMIN_SUITE_SECTION: Record<SuiteId, string> = {
  qa: "QUALITY",
  pentest: "SECURITY",
  productivity: "PRODUCTIVITY",
  law: "LAW",
};

export const ORG_ADMIN_SUITE_BRAND: Record<SuiteId, string> = {
  qa: "APZQEP",
  pentest: "APZPEN",
  productivity: "APZPRD",
  law: "APZLaw",
};

export const ORG_ADMIN_PRODUCT_LABEL: Record<string, string> = {
  projects: "Projects",
  support: "Support",
  time: "Time",
  workflow: "Workflow",
  analytics: "Analytics",
  knowledge: "Knowledge",
  documents: "Documents",
  qep: "APZQEP",
  pentest: "APZPEN",
  law: "Law",
  monitoring: "Monitoring",
};

export function orgAdminProductLabel(productKey: string): string {
  return ORG_ADMIN_PRODUCT_LABEL[productKey] ?? productKey;
}

export function orgAdminSuiteBrand(suiteId: SuiteId): string {
  return ORG_ADMIN_SUITE_BRAND[suiteId];
}

/** Provider brand strings that must never appear in Organisation Admin payloads. */
export const FORBIDDEN_PROVIDER_LEAKS = [
  "Plane",
  "Zammad",
  "Kimai",
  "n8n",
  "Metabase",
  "Paperless",
] as const;

export function assertNoProviderLeak(text: string): boolean {
  return !FORBIDDEN_PROVIDER_LEAKS.some((p) =>
    text.toLowerCase().includes(p.toLowerCase()),
  );
}

export type { ProductKey, SuiteId };
