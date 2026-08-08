/**
 * APS catalogue — Programme 002 honesty face (APS-E-01).
 * Exactly seven Owner-accepted Platform Services. No AI. No machinery rows.
 */

export type ApsActionClass =
  "certify" | "certify_ownership_hygiene" | "consolidate_certify" | "certify_facade";

export type ApsCatalogueEntry = {
  readonly id: string;
  readonly shortName: string;
  readonly name: string;
  readonly inventoryId: string;
  readonly apeHint?: string;
  readonly packageHint?: string;
  readonly actionClass: ApsActionClass;
};

/** Authoritative Programme 002 inventory — APS-002 Accepted. */
export const APS_CATALOGUE: readonly ApsCatalogueEntry[] = [
  {
    id: "aps-search",
    shortName: "APS-Search",
    name: "Platform Search Service",
    inventoryId: "APS-S-01",
    apeHint: "ape-search",
    packageHint: "@apzhub/search-orchestrator",
    actionClass: "certify",
  },
  {
    id: "aps-notifications",
    shortName: "APS-Notifications",
    name: "Platform Notification Service",
    inventoryId: "APS-S-02",
    apeHint: "ape-notify",
    packageHint: "@apzhub/event-notification-framework",
    actionClass: "certify_ownership_hygiene",
  },
  {
    id: "aps-command",
    shortName: "APS-Command",
    name: "Platform Command Service",
    inventoryId: "APS-S-03",
    apeHint: "ape-command",
    packageHint: "@apzhub/command-framework",
    actionClass: "certify_ownership_hygiene",
  },
  {
    id: "aps-activity",
    shortName: "APS-Activity",
    name: "Platform Activity Service",
    inventoryId: "APS-S-04",
    apeHint: "ape-activity",
    packageHint: "@apzhub/activity-timeline-framework",
    actionClass: "certify",
  },
  {
    id: "aps-personalisation",
    shortName: "APS-Personalisation",
    name: "Platform Personalisation Service",
    inventoryId: "APS-S-05",
    packageHint: "@apzhub/platform-personalisation",
    actionClass: "consolidate_certify",
  },
  {
    id: "aps-realtime",
    shortName: "APS-Realtime",
    name: "Platform Realtime Service",
    inventoryId: "APS-S-06",
    apeHint: "ape-realtime",
    packageHint: "@apzhub/platform-services",
    actionClass: "certify",
  },
  {
    id: "aps-audit",
    shortName: "APS-Audit",
    name: "Platform Audit Service",
    inventoryId: "APS-S-07",
    apeHint: "ape-audit",
    packageHint: "@apzhub/platform-audit",
    actionClass: "certify_facade",
  },
] as const;

export function listAcceptedPlatformServices(): readonly ApsCatalogueEntry[] {
  return APS_CATALOGUE;
}
