/**
 * APE catalogue — PE-P1-02 honesty face (Programme 001).
 * AI / RAG are Phase 3 and must not appear as Foundation engines.
 */

export type ApeMaturity = "mature" | "substantial" | "partial" | "deferred";

export type ApeCatalogueEntry = {
  readonly id: string;
  readonly shortName: string;
  readonly name: string;
  readonly maturity: ApeMaturity;
  readonly inventoryId: string;
  readonly foundationScope: boolean;
  readonly packageHint?: string;
};

export const APE_CATALOGUE: readonly ApeCatalogueEntry[] = [
  {
    id: "ape-registry",
    shortName: "APE-Registry",
    name: "Provider Registry Engine",
    maturity: "mature",
    inventoryId: "PE-PR-01",
    foundationScope: true,
    packageHint: "@apzhub/platform-runtime",
  },
  {
    id: "ape-search",
    shortName: "APE-Search",
    name: "Search Engine",
    maturity: "mature",
    inventoryId: "PE-PR-02",
    foundationScope: true,
    packageHint: "@apzhub/search-orchestrator",
  },
  {
    id: "ape-notify",
    shortName: "APE-Notify",
    name: "Notification Engine",
    maturity: "mature",
    inventoryId: "PE-PR-03",
    foundationScope: true,
    packageHint: "@apzhub/event-notification-framework",
  },
  {
    id: "ape-activity",
    shortName: "APE-Activity",
    name: "Activity Engine",
    maturity: "substantial",
    inventoryId: "PE-PR-04",
    foundationScope: true,
    packageHint: "@apzhub/activity-timeline-framework",
  },
  {
    id: "ape-audit",
    shortName: "APE-Audit",
    name: "Unified Audit Engine",
    maturity: "partial",
    inventoryId: "PE-PR-05",
    foundationScope: true,
    packageHint: "@apzhub/platform-audit",
  },
  {
    id: "ape-command",
    shortName: "APE-Command",
    name: "Command Engine",
    maturity: "substantial",
    inventoryId: "PE-PR-06",
    foundationScope: true,
    packageHint: "@apzhub/command-framework",
  },
  {
    id: "ape-events",
    shortName: "APE-Events",
    name: "Event Engine",
    maturity: "mature",
    inventoryId: "PE-PR-07",
    foundationScope: true,
    packageHint: "@apzhub/platform-event-bus",
  },
  {
    id: "ape-integration",
    shortName: "APE-Integration",
    name: "Integration Engine",
    maturity: "mature",
    inventoryId: "PE-PR-08",
    foundationScope: true,
    packageHint: "@apzhub/integration-sdk",
  },
  {
    id: "ape-config",
    shortName: "APE-Config",
    name: "Configuration Engine",
    maturity: "mature",
    inventoryId: "PE-PR-09",
    foundationScope: true,
    packageHint: "@apzhub/configuration-core",
  },
  {
    id: "ape-flags",
    shortName: "APE-Flags",
    name: "Feature Flag Engine",
    maturity: "substantial",
    inventoryId: "PE-PR-10",
    foundationScope: true,
    packageHint: "@apzhub/platform-governance",
  },
  {
    id: "ape-realtime",
    shortName: "APE-Realtime",
    name: "Realtime Engine",
    maturity: "substantial",
    inventoryId: "PE-PR-11",
    foundationScope: true,
    packageHint: "@apzhub/platform-services",
  },
  {
    id: "ape-ai",
    shortName: "APE-AI",
    name: "AI Gateway Engine",
    maturity: "deferred",
    inventoryId: "PHASE-3",
    foundationScope: false,
  },
  {
    id: "ape-rag",
    shortName: "APE-RAG",
    name: "RAG Engine",
    maturity: "deferred",
    inventoryId: "PHASE-3",
    foundationScope: false,
  },
] as const;

export function listFoundationApes(): readonly ApeCatalogueEntry[] {
  return APE_CATALOGUE.filter((entry) => entry.foundationScope);
}
