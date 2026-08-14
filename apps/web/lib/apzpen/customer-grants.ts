/**
 * APZPEN customer portal grants — engagement-scoped external access.
 * Replaces email/spreadsheet remediation chains for managed pentest customers.
 */

import { createHash, randomBytes } from "node:crypto";

export type CustomerGrantPermission =
  "read" | "request_retest" | "download_reports" | "upload_evidence" | "assign";

export type CustomerGrant = {
  readonly grantId: string;
  readonly tenantId: string;
  readonly engagementId: string;
  readonly customerEmail: string;
  /** SHA-256 of the plaintext token — never store raw token at rest. */
  readonly tokenHash: string;
  readonly permissions: readonly CustomerGrantPermission[];
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly createdBy: string;
  readonly label?: string;
};

export type CustomerGrantIssueResult = {
  readonly grant: CustomerGrant;
  /** Plaintext token — show once to operator / send to customer. */
  readonly token: string;
};

export function hashGrantToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function issueCustomerGrant(input: {
  readonly grantId: string;
  readonly tenantId: string;
  readonly engagementId: string;
  readonly customerEmail: string;
  readonly createdBy: string;
  readonly permissions?: readonly CustomerGrantPermission[];
  readonly ttlDays?: number;
  readonly label?: string;
}): CustomerGrantIssueResult {
  const token = `apzpen_${randomBytes(24).toString("base64url")}`;
  const now = new Date();
  const ttlDays = input.ttlDays ?? 30;
  const expires = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
  const grant: CustomerGrant = {
    grantId: input.grantId,
    tenantId: input.tenantId,
    engagementId: input.engagementId,
    customerEmail: input.customerEmail.trim().toLowerCase(),
    tokenHash: hashGrantToken(token),
    permissions: input.permissions ?? [
      "read",
      "request_retest",
      "download_reports",
      "upload_evidence",
      "assign",
    ],
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    createdBy: input.createdBy,
    label: input.label,
  };
  return { grant, token };
}

export function isGrantValid(grant: CustomerGrant, now = new Date()): boolean {
  return new Date(grant.expiresAt).getTime() > now.getTime();
}

export function grantAllows(
  grant: CustomerGrant,
  permission: CustomerGrantPermission,
): boolean {
  return grant.permissions.includes(permission);
}

export function findGrantByToken(
  grants: readonly CustomerGrant[],
  token: string,
): CustomerGrant | undefined {
  const hash = hashGrantToken(token.trim());
  return grants.find((g) => g.tokenHash === hash && isGrantValid(g));
}
