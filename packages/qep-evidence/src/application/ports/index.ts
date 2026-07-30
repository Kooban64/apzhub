/**
 * Application outbound ports — APZQEP-ENG-110C / ENG-110E.
 * Repository interfaces are defined in domain/ports (dependency inward).
 * StoragePort is an application/infrastructure content port (not Domain).
 */

import type { EvidenceRequestContext } from "../context";

export type {
  EvidenceAccessGrant,
  EvidenceAccessGrantRepository,
  EvidenceAuditRecord,
  EvidenceAuditRepository,
  EvidenceCollectionRepository,
  EvidenceListFilter,
  EvidenceRelationshipRepository,
  EvidenceRepository,
  EvidenceSetRepository,
  EvidenceUnitOfWork,
  EvidenceVersionRepository,
  Page,
  PageRequest,
  StoredEvidence,
  StoredEvidenceCollection,
  StoredEvidenceRelationship,
  StoredEvidenceSet,
} from "../../domain/ports/index";

export type {
  StorageContentMetadata,
  StorageGetResult,
  StorageLocator,
  StoragePort,
  StoragePutInput,
  StoragePutResult,
  StorageStreamHandle,
} from "./storage-port";

/** Retained ENG-110A identity catalogue for discoverability. */
export const EVIDENCE_PORT_IDS = [
  "EvidenceRepository",
  "EvidenceCollectionRepository",
  "EvidenceSetRepository",
  "EvidenceRelationshipRepository",
  "EvidenceVersionRepository",
  "EvidenceAccessGrantRepository",
  "EvidenceAuditRepository",
  "EvidenceUnitOfWork",
  "StoragePort",
  "PermissionPort",
  "AuditPort",
  "EventOutboxPort",
  "SearchPublicationPort",
  "ClockPort",
  "IdPort",
] as const;

export type EvidencePortId = (typeof EVIDENCE_PORT_IDS)[number];

export type EvidencePortIdentity = {
  readonly portId: EvidencePortId;
};

/**
 * PermissionPort — platform permission keys from security context (ENG-110E).
 * Default-deny. Does not evaluate Evidence ACL grants.
 */
export type PermissionPort = EvidencePortIdentity & {
  readonly portId: "PermissionPort";
  has(ctx: EvidenceRequestContext, permission: string): boolean;
  assertAny(ctx: EvidenceRequestContext, requiredOneOf: readonly string[]): void;
};

/** Audit append is coordinated; platform audit bus publication is deferred. */
export type AuditPort = EvidencePortIdentity & {
  readonly portId: "AuditPort";
  append(entry: {
    readonly tenantId: string;
    readonly evidenceId: string;
    readonly action: string;
    readonly actorId: string;
    readonly outcome: "allowed" | "denied";
    readonly correlationId?: string;
    readonly occurredAt: string;
    readonly details?: Readonly<Record<string, unknown>>;
  }): Promise<void>;
};

/**
 * Outbox port held for DI. ENG-110D collects domain events but MUST NOT publish.
 */
export type EventOutboxPort = EvidencePortIdentity & {
  readonly portId: "EventOutboxPort";
};

export type SearchPublicationPort = EvidencePortIdentity & {
  readonly portId: "SearchPublicationPort";
};

export type ClockPort = EvidencePortIdentity & {
  readonly portId: "ClockPort";
  now(): string;
};

export type IdPort = EvidencePortIdentity & {
  readonly portId: "IdPort";
  createId(prefix?: string): string;
};
