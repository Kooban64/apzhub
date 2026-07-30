import { EvidenceApplicationValidationError } from "../../shared/errors";
import type {
  CaptureEvidenceCommand,
  CreateCollectionCommand,
  CreateEvidenceSetCommand,
  EvidenceIdCommandBase,
  ManageRelationshipCommand,
  VersionEvidenceCommand,
} from "./types";

function requireNonEmpty(value: string | undefined, field: string): string {
  if (!value || value.trim().length === 0) {
    throw new EvidenceApplicationValidationError(`${field} is required`);
  }
  return value.trim();
}

export function assertEvidenceIdCommand(command: EvidenceIdCommandBase): void {
  requireNonEmpty(command.evidenceId, "evidenceId");
  if (!Number.isInteger(command.expectedRevision) || command.expectedRevision < 0) {
    throw new EvidenceApplicationValidationError(
      "expectedRevision must be a non-negative integer",
    );
  }
}

export function assertCaptureCommand(command: CaptureEvidenceCommand): void {
  requireNonEmpty(command.projectId, "projectId");
  requireNonEmpty(command.source.kind, "source.kind");
  requireNonEmpty(command.content.mediaType, "content.mediaType");
  requireNonEmpty(command.content.contentHash, "content.contentHash");
  if (!(command.content.bytes instanceof Uint8Array)) {
    throw new EvidenceApplicationValidationError("content.bytes must be Uint8Array");
  }
  if (command.content.bytes.byteLength === 0) {
    throw new EvidenceApplicationValidationError("content.bytes must be non-empty");
  }
}

export function assertVersionCommand(command: VersionEvidenceCommand): void {
  assertEvidenceIdCommand(command);
  requireNonEmpty(command.content.mediaType, "content.mediaType");
  requireNonEmpty(command.content.contentHash, "content.contentHash");
  if (
    !(command.content.bytes instanceof Uint8Array) ||
    command.content.bytes.byteLength === 0
  ) {
    throw new EvidenceApplicationValidationError(
      "content.bytes must be non-empty Uint8Array",
    );
  }
}

export function assertCreateCollectionCommand(command: CreateCollectionCommand): void {
  requireNonEmpty(command.projectId, "projectId");
  requireNonEmpty(command.name, "name");
  requireNonEmpty(command.purpose, "purpose");
}

export function assertCreateEvidenceSetCommand(
  command: CreateEvidenceSetCommand,
): void {
  requireNonEmpty(command.collectionId, "collectionId");
  requireNonEmpty(command.sealHash, "sealHash");
  if (!Number.isInteger(command.expectedRevision) || command.expectedRevision < 0) {
    throw new EvidenceApplicationValidationError(
      "expectedRevision must be a non-negative integer",
    );
  }
}

export function assertManageRelationshipCommand(
  command: ManageRelationshipCommand,
): void {
  requireNonEmpty(command.evidenceId, "evidenceId");
  if (command.action === "create") {
    requireNonEmpty(command.targetCapability, "targetCapability");
    requireNonEmpty(command.targetId, "targetId");
    requireNonEmpty(command.relationType, "relationType");
  }
  if (command.action === "delete") {
    requireNonEmpty(command.relationshipId, "relationshipId");
  }
}
