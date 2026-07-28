import type { Verification } from "../../domain/verification/verification";
import type {
  StoredVerification,
  VerificationListQuery,
} from "../../domain/verification/verification-repository";

export function toStoredVerification(verification: Verification): StoredVerification {
  const { domainEvents: _events, ...rest } = verification;
  return {
    ...rest,
    domainEvents: [],
  };
}

export function verificationMatchesListFilters(
  row: StoredVerification,
  query: VerificationListQuery,
): boolean {
  if (query.status && row.status !== query.status) return false;
  if (query.outcome && row.outcome !== query.outcome) return false;
  if (query.subjectKind && row.subject.kind !== query.subjectKind) return false;
  if (query.subjectArtefactId && row.subject.artefactId !== query.subjectArtefactId)
    return false;
  if (query.authorityActorId && row.authority.actorId !== query.authorityActorId)
    return false;
  return true;
}
