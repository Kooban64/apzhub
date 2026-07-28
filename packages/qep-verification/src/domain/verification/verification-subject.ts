import { VerificationInvariantViolation } from "../../shared/errors";
import { VERIFICATION_SUBJECT_KINDS } from "./constants";

export type VerificationSubjectKind = (typeof VERIFICATION_SUBJECT_KINDS)[number];

/**
 * Value object: typed reference to the artefact under verification.
 */
export type VerificationSubjectReference = {
  readonly kind: VerificationSubjectKind;
  readonly artefactId: string;
  readonly contentVersionId?: string;
  readonly baselineId?: string;
  readonly externalUri?: string;
  readonly owningDomain: string;
};

const KIND_OWNING_DOMAIN: Record<VerificationSubjectKind, string> = {
  requirement: "requirements",
  requirement_content_version: "requirements",
  requirement_baseline: "requirements",
  trace_link: "traceability",
  test_specification: "verification",
  test_case: "verification",
  test_execution: "execution",
  evidence: "evidence",
  certification_artefact: "certification",
  document: "documents",
  external_reference: "cross_cutting",
};

export function createVerificationSubject(input: {
  readonly kind: string;
  readonly artefactId: string;
  readonly contentVersionId?: string;
  readonly baselineId?: string;
  readonly externalUri?: string;
}): VerificationSubjectReference {
  const kind = input.kind.trim() as VerificationSubjectKind;
  if (!(VERIFICATION_SUBJECT_KINDS as readonly string[]).includes(kind)) {
    throw new VerificationInvariantViolation(
      `Verification subject kind must be one of: ${VERIFICATION_SUBJECT_KINDS.join(", ")}`,
    );
  }

  if (kind === "external_reference") {
    const externalUri = input.externalUri?.trim();
    if (!externalUri) {
      throw new VerificationInvariantViolation(
        "external_reference subject requires externalUri",
      );
    }
    try {
      new URL(externalUri);
    } catch {
      throw new VerificationInvariantViolation(
        "external_reference externalUri must be a valid URI",
      );
    }
    const artefactId = input.artefactId.trim();
    if (!artefactId) {
      throw new VerificationInvariantViolation("external_reference subject requires artefactId");
    }
    return {
      kind,
      artefactId,
      externalUri,
      owningDomain: KIND_OWNING_DOMAIN[kind],
    };
  }

  const artefactId = input.artefactId.trim();
  if (!artefactId) {
    throw new VerificationInvariantViolation("Verification subject requires artefactId");
  }

  const contentVersionId = input.contentVersionId?.trim() || undefined;
  const baselineId = input.baselineId?.trim() || undefined;
  if (contentVersionId && !/^rcv_[A-Za-z0-9_-]+$/.test(contentVersionId)) {
    throw new VerificationInvariantViolation("Subject contentVersionId must start with rcv_");
  }
  if (baselineId && !/^rbl_[A-Za-z0-9_-]+$/.test(baselineId)) {
    throw new VerificationInvariantViolation("Subject baselineId must start with rbl_");
  }

  return {
    kind,
    artefactId,
    contentVersionId,
    baselineId,
    owningDomain: KIND_OWNING_DOMAIN[kind],
  };
}

export function subjectIdentityKey(subject: VerificationSubjectReference): string {
  return [
    subject.kind,
    subject.artefactId,
    subject.contentVersionId ?? "",
    subject.baselineId ?? "",
    subject.externalUri ?? "",
  ].join("|");
}
