/**
 * APZPEN follow-on orchestration — GitHub PR, grants, intelligence, PDF.
 */

import {
  findGrantByToken,
  grantAllows,
  issueCustomerGrant,
  type CustomerGrant,
  type CustomerGrantIssueResult,
  type CustomerGrantPermission,
} from "./customer-grants";
import { ApzpenDomainError } from "./domain";
import {
  listAllCustomerGrants,
  listCustomerGrants,
  listPrEvents,
  newId,
  resetApzpenExtStoreForTests,
  saveCustomerGrant,
  savePrEvent,
} from "./ext-store";
import {
  computePrSecurityPosition,
  normalizeGithubPullRequestPayload,
  seedDemoPrEvent,
  type PrSecurityAssessment,
  type PrSecurityEvent,
} from "./github-pr-security";
import {
  assistSecurityIntelligence,
  type IntelligenceAssistResult,
} from "./intelligence";
import { assistSecurityIntelligenceAuto } from "./openai-intelligence";
import { getGithubAuthStatus, type GithubAuthStatus } from "./github-app-auth";
import { syncGithubPullRequests } from "./github-sync";
import { tryCompileApzpenPdf, type ApzpenPdfResult } from "./report-pdf";
import type { ReportPackKind } from "./reports";
import {
  generateEngagementReport,
  getEngagementPosture,
  getTenantEngagement,
  listTenantFindings,
  addFindingEvidence,
  assignFinding,
  requestRetest,
  updateFindingStatus,
} from "./service";
import { resetApzpenStoreForTests } from "./store";
import { resetApzpenMetaStoreForTests } from "./meta-store";
import { resetEvidenceVaultForTests } from "./evidence-vault";

export { resetApzpenExtStoreForTests };

export function resetAllApzpenStoresForTests(): void {
  resetApzpenStoreForTests();
  resetApzpenExtStoreForTests();
  resetApzpenMetaStoreForTests();
  resetEvidenceVaultForTests();
}

export function listPrSecurityAssessments(
  tenantId: string,
  engagementId?: string,
): readonly PrSecurityAssessment[] {
  const events = listPrEvents(tenantId, engagementId);
  return events.map((event) =>
    computePrSecurityPosition({
      event,
      findings: listTenantFindings(tenantId, event.engagementId),
    }),
  );
}

export function ensureDemoPrSecurity(
  tenantId: string,
  engagementId: string,
): readonly PrSecurityAssessment[] {
  const existing = listPrEvents(tenantId, engagementId);
  if (existing.length === 0) {
    const eng = getTenantEngagement(tenantId, engagementId);
    savePrEvent(seedDemoPrEvent(eng, newId("pr")));
  }
  return listPrSecurityAssessments(tenantId, engagementId);
}

export function ingestPrSecurityEvent(event: PrSecurityEvent): PrSecurityAssessment {
  getTenantEngagement(event.tenantId, event.engagementId);
  savePrEvent(event);
  return computePrSecurityPosition({
    event,
    findings: listTenantFindings(event.tenantId, event.engagementId),
  });
}

export function ingestGithubWebhookPullRequest(input: {
  readonly tenantId: string;
  readonly engagementId: string;
  readonly payload: Record<string, unknown>;
}): PrSecurityAssessment {
  const event = normalizeGithubPullRequestPayload({
    tenantId: input.tenantId,
    engagementId: input.engagementId,
    payload: input.payload,
    eventId: newId("pr"),
  });
  if (!event) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "Payload is not a recognisable pull_request event.",
    );
  }
  return ingestPrSecurityEvent(event);
}

export function createCustomerPortalGrant(input: {
  readonly tenantId: string;
  readonly engagementId: string;
  readonly customerEmail: string;
  readonly createdBy: string;
  readonly permissions?: readonly CustomerGrantPermission[];
  readonly label?: string;
}): CustomerGrantIssueResult {
  getTenantEngagement(input.tenantId, input.engagementId);
  const issued = issueCustomerGrant({
    grantId: newId("grant"),
    tenantId: input.tenantId,
    engagementId: input.engagementId,
    customerEmail: input.customerEmail,
    createdBy: input.createdBy,
    permissions: input.permissions,
    label: input.label,
  });
  saveCustomerGrant(issued.grant);
  return issued;
}

export function listEngagementGrants(
  tenantId: string,
  engagementId: string,
): readonly CustomerGrant[] {
  return listCustomerGrants(tenantId, engagementId);
}

export function revokeCustomerPortalGrant(input: {
  readonly tenantId: string;
  readonly grantId: string;
}): CustomerGrant {
  const grant = listCustomerGrants(input.tenantId).find(
    (g) => g.grantId === input.grantId,
  );
  if (!grant) {
    throw new ApzpenDomainError("NOT_FOUND", "Grant not found.");
  }
  const revoked: CustomerGrant = {
    ...grant,
    expiresAt: new Date().toISOString(),
  };
  return saveCustomerGrant(revoked);
}

export function resolveCustomerGrant(token: string): CustomerGrant {
  const grant = findGrantByToken(listAllCustomerGrants(), token);
  if (!grant) {
    throw new ApzpenDomainError(
      "NOT_FOUND",
      "Customer grant token is invalid or expired.",
    );
  }
  return grant;
}

export function getCustomerPortalView(token: string): {
  readonly grant: CustomerGrant;
  readonly engagement: ReturnType<typeof getTenantEngagement>;
  readonly findings: ReturnType<typeof listTenantFindings>;
  readonly posture: ReturnType<typeof getEngagementPosture>;
} {
  const grant = resolveCustomerGrant(token);
  if (!grantAllows(grant, "read")) {
    throw new ApzpenDomainError("VALIDATION", "Grant does not allow read.");
  }
  const engagement = getTenantEngagement(grant.tenantId, grant.engagementId);
  const findings = listTenantFindings(grant.tenantId, grant.engagementId);
  const posture = getEngagementPosture(grant.tenantId, grant.engagementId);
  return { grant, engagement, findings, posture };
}

export function customerRequestRetest(input: {
  readonly token: string;
  readonly findingId: string;
}): ReturnType<typeof requestRetest> {
  const grant = resolveCustomerGrant(input.token);
  if (!grantAllows(grant, "request_retest")) {
    throw new ApzpenDomainError("VALIDATION", "Grant does not allow retest requests.");
  }
  return requestRetest(grant.tenantId, input.findingId, grant.customerEmail);
}

export function customerAssignFinding(input: {
  readonly token: string;
  readonly findingId: string;
  readonly assignedTo: string;
}): ReturnType<typeof assignFinding> {
  const grant = resolveCustomerGrant(input.token);
  if (!grantAllows(grant, "assign")) {
    throw new ApzpenDomainError("VALIDATION", "Grant does not allow assignment.");
  }
  return assignFinding(grant.tenantId, input.findingId, input.assignedTo);
}

export function customerUploadEvidence(input: {
  readonly token: string;
  readonly findingId: string;
  readonly kind?: string;
  readonly label: string;
  readonly ref: string;
}): ReturnType<typeof addFindingEvidence> {
  const grant = resolveCustomerGrant(input.token);
  if (!grantAllows(grant, "upload_evidence")) {
    throw new ApzpenDomainError("VALIDATION", "Grant does not allow evidence upload.");
  }
  return addFindingEvidence(grant.tenantId, input.findingId, {
    kind: input.kind ?? "customer_upload",
    label: input.label,
    ref: input.ref,
    createdBy: grant.customerEmail,
  });
}

export function customerDownloadReport(input: {
  readonly token: string;
  readonly kind: ReportPackKind;
}): ReturnType<typeof generateEngagementReport> {
  const grant = resolveCustomerGrant(input.token);
  if (!grantAllows(grant, "download_reports")) {
    throw new ApzpenDomainError("VALIDATION", "Grant does not allow report download.");
  }
  return generateEngagementReport({
    tenantId: grant.tenantId,
    engagementId: grant.engagementId,
    kind: input.kind,
  });
}

export function runSecurityIntelligence(
  tenantId: string,
  engagementId: string,
): IntelligenceAssistResult {
  const engagement = getTenantEngagement(tenantId, engagementId);
  const findings = listTenantFindings(tenantId, engagementId);
  return assistSecurityIntelligence({ engagement, findings });
}

export async function runSecurityIntelligenceAuto(
  tenantId: string,
  engagementId: string,
  options?: { readonly fetchFn?: typeof fetch },
): Promise<IntelligenceAssistResult> {
  const engagement = getTenantEngagement(tenantId, engagementId);
  const findings = listTenantFindings(tenantId, engagementId);
  return assistSecurityIntelligenceAuto({
    engagement,
    findings,
    fetchFn: options?.fetchFn,
  });
}

export function getApzpenGithubAuthStatus(): GithubAuthStatus {
  return getGithubAuthStatus();
}

export async function syncEngagementGithubPullRequests(input: {
  readonly tenantId: string;
  readonly engagementId: string;
  readonly repository?: string;
  readonly fetchFn?: typeof fetch;
}): Promise<{
  readonly mode: string;
  readonly repository: string;
  readonly imported: number;
  readonly assessments: ReturnType<typeof listPrSecurityAssessments>;
}> {
  const { ensureRepositoryScopeFromSourceBindings } = await import("./source-scope");
  ensureRepositoryScopeFromSourceBindings(input.tenantId, input.engagementId);
  const engagement = getTenantEngagement(input.tenantId, input.engagementId);
  const synced = await syncGithubPullRequests({
    engagement,
    repository: input.repository,
    fetchFn: input.fetchFn,
  });
  for (const event of synced.events) {
    savePrEvent(event);
  }
  return {
    mode: synced.mode,
    repository: synced.repository,
    imported: synced.imported,
    assessments: listPrSecurityAssessments(input.tenantId, input.engagementId),
  };
}

export async function generateEngagementReportPdf(input: {
  readonly tenantId: string;
  readonly engagementId: string;
  readonly kind: ReportPackKind;
  readonly preferEmbedded?: boolean;
}): Promise<{
  readonly pack: ReturnType<typeof generateEngagementReport>;
  readonly pdf: ApzpenPdfResult;
}> {
  const pack = generateEngagementReport(input);
  const pdf = await tryCompileApzpenPdf(pack, {
    preferEmbedded: input.preferEmbedded,
  });
  return { pack, pdf };
}

/** Mark finding remediating via customer portal (optional helper). */
export function customerMarkRemediating(input: {
  readonly token: string;
  readonly findingId: string;
}): ReturnType<typeof updateFindingStatus> {
  const grant = resolveCustomerGrant(input.token);
  if (!grantAllows(grant, "request_retest")) {
    throw new ApzpenDomainError(
      "VALIDATION",
      "Grant does not allow remediation updates.",
    );
  }
  return updateFindingStatus(grant.tenantId, input.findingId, "remediating");
}
