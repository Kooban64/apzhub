/**
 * APZQEP-120-S07 — authoritative Evidence domain event catalogue keys.
 * Product documentation: docs/products/apzqep/events/
 */

export const QEP_EVIDENCE_EVENT_CATALOGUE_VERSION = "1.0.1" as const;

export const QEP_EVIDENCE_PLATFORM_EVENTS = {
  created: "qep.evidence.created",
  updated: "qep.evidence.updated",
  lifecycleChanged: "qep.evidence.lifecycle_changed",
  integrityEstablished: "qep.evidence.integrity_established",
  integrityVerified: "qep.evidence.integrity_verified",
  archived: "qep.evidence.archived",
  superseded: "qep.evidence.superseded",
  deleted: "qep.evidence.deleted",
} as const;

export type QepEvidencePlatformEventId =
  (typeof QEP_EVIDENCE_PLATFORM_EVENTS)[keyof typeof QEP_EVIDENCE_PLATFORM_EVENTS];

/** Catalogue maturity — Experimental / Stable / Deprecated */
export type QepEvidenceEventStability = "Experimental" | "Stable" | "Deprecated";

export type QepEvidenceEventDescriptor = {
  readonly eventId: QepEvidencePlatformEventId;
  readonly name: string;
  readonly version: string;
  readonly stability: QepEvidenceEventStability;
  readonly introducedIn: string;
  readonly lifecycleStatus: "active" | "reserved" | "deprecated";
  readonly purpose: string;
};

const S07 = "APZQEP-120-S07" as const;

export const QEP_EVIDENCE_EVENT_DESCRIPTORS: readonly QepEvidenceEventDescriptor[] = [
  {
    eventId: QEP_EVIDENCE_PLATFORM_EVENTS.created,
    name: "Evidence Created",
    version: "1.0.0",
    stability: "Stable",
    introducedIn: S07,
    lifecycleStatus: "active",
    purpose: "Evidence record was captured / created in the Evidence domain.",
  },
  {
    eventId: QEP_EVIDENCE_PLATFORM_EVENTS.updated,
    name: "Evidence Updated",
    version: "1.0.0",
    stability: "Stable",
    introducedIn: S07,
    lifecycleStatus: "active",
    purpose:
      "Evidence metadata or content identity changed without lifecycle transition.",
  },
  {
    eventId: QEP_EVIDENCE_PLATFORM_EVENTS.lifecycleChanged,
    name: "Evidence Lifecycle Changed",
    version: "1.0.0",
    stability: "Stable",
    introducedIn: S07,
    lifecycleStatus: "active",
    purpose: "Authoritative lifecycle governance state changed.",
  },
  {
    eventId: QEP_EVIDENCE_PLATFORM_EVENTS.integrityEstablished,
    name: "Evidence Integrity Established",
    version: "1.0.0",
    stability: "Stable",
    introducedIn: S07,
    lifecycleStatus: "active",
    purpose: "Content integrity digest was established for evidence.",
  },
  {
    eventId: QEP_EVIDENCE_PLATFORM_EVENTS.integrityVerified,
    name: "Evidence Integrity Verified",
    version: "1.0.0",
    stability: "Stable",
    introducedIn: S07,
    lifecycleStatus: "active",
    purpose: "Content integrity verification succeeded.",
  },
  {
    eventId: QEP_EVIDENCE_PLATFORM_EVENTS.archived,
    name: "Evidence Archived",
    version: "1.0.0",
    stability: "Stable",
    introducedIn: S07,
    lifecycleStatus: "active",
    purpose: "Evidence entered archived lifecycle / status.",
  },
  {
    eventId: QEP_EVIDENCE_PLATFORM_EVENTS.superseded,
    name: "Evidence Superseded",
    version: "1.0.0",
    stability: "Stable",
    introducedIn: S07,
    lifecycleStatus: "active",
    purpose: "Evidence was superseded by a successor record.",
  },
  {
    eventId: QEP_EVIDENCE_PLATFORM_EVENTS.deleted,
    name: "Evidence Deleted",
    version: "1.0.0",
    stability: "Stable",
    introducedIn: S07,
    lifecycleStatus: "active",
    purpose: "Evidence was logically deleted (bytes preserved).",
  },
] as const;

export function isRegisteredQepEvidenceEvent(
  eventId: string,
): eventId is QepEvidencePlatformEventId {
  return QEP_EVIDENCE_EVENT_DESCRIPTORS.some((d) => d.eventId === eventId);
}

export function requireQepEvidenceEventDescriptor(
  eventId: string,
): QepEvidenceEventDescriptor {
  const found = QEP_EVIDENCE_EVENT_DESCRIPTORS.find((d) => d.eventId === eventId);
  if (!found) {
    throw new Error(`EVENT_NOT_REGISTERED:${eventId}`);
  }
  return found;
}
