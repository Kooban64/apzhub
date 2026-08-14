/**
 * SPR-IAM-COMMERCIAL-001 — org-scoped member invite / role / suspend ledger.
 * File-backed outside tests. One ruleset for all orgs.
 */

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type OrgMemberStatus = "invited" | "active" | "suspended" | "removed";

export type OrgMemberRecord = {
  readonly membershipId: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly email: string;
  readonly displayName?: string;
  readonly personaRoleId: string;
  readonly status: OrgMemberStatus;
  readonly invitedBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

const members: OrgMemberRecord[] = [];
const MAX = 5000;
let hydrated = false;

function persistEnabled(): boolean {
  if (process.env.APZHUB_QEP_LEDGER_PERSIST === "true") return true;
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") return false;
  return true;
}

function dataDir(): string {
  const override = process.env.APZHUB_QEP_DATA_DIR?.trim();
  const cwd = process.cwd();
  const base = override
    ? override
    : cwd.endsWith("/apps/web") || cwd.endsWith("\\apps/web")
      ? join(cwd, ".data")
      : join(cwd, "apps/web/.data");
  return join(base, "iam-org-members");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!persistEnabled()) return;
  const path = join(dataDir(), "ledger.json");
  if (!existsSync(path)) return;
  try {
    const snap = JSON.parse(readFileSync(path, "utf8")) as OrgMemberRecord[];
    if (Array.isArray(snap)) members.push(...snap.slice(0, MAX));
  } catch {
    /* ignore corrupt */
  }
}

function persistAll(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(
    join(dataDir(), "ledger.json"),
    JSON.stringify(members.slice(0, MAX), null, 2),
    "utf8",
  );
}

export function resetOrgMemberStoreForTests(): void {
  members.splice(0, members.length);
  hydrated = false;
}

export function listOrgMembers(filter: {
  readonly organisationId: string;
  readonly limit?: number;
}): readonly OrgMemberRecord[] {
  hydrate();
  const limit = filter.limit ?? 200;
  return members
    .filter((row) => row.organisationId === filter.organisationId)
    .filter((row) => row.status !== "removed")
    .slice(0, Math.max(0, limit));
}

export function getOrgMember(
  organisationId: string,
  membershipId: string,
): OrgMemberRecord | undefined {
  hydrate();
  return members.find(
    (row) => row.organisationId === organisationId && row.membershipId === membershipId,
  );
}

export function inviteOrgMember(input: {
  readonly organisationId: string;
  readonly email: string;
  readonly personaRoleId: string;
  readonly invitedBy: string;
  readonly userId?: string;
  readonly displayName?: string;
  readonly now?: () => Date;
}): OrgMemberRecord {
  hydrate();
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("iam.invite.email_invalid");
  }
  if (!input.personaRoleId.trim()) {
    throw new Error("iam.invite.persona_required");
  }
  const existing = members.find(
    (row) =>
      row.organisationId === input.organisationId &&
      row.email === email &&
      row.status !== "removed",
  );
  if (existing) {
    throw new Error("iam.invite.already_member");
  }
  const now = (input.now ?? (() => new Date()))().toISOString();
  const record: OrgMemberRecord = {
    membershipId: `omem-${randomUUID()}`,
    organisationId: input.organisationId,
    userId: input.userId?.trim() || `pending:${email}`,
    email,
    displayName: input.displayName?.trim() || undefined,
    personaRoleId: input.personaRoleId.trim(),
    status: "invited",
    invitedBy: input.invitedBy,
    createdAt: now,
    updatedAt: now,
  };
  members.unshift(record);
  if (members.length > MAX) members.splice(MAX);
  persistAll();
  return record;
}

export function assignOrgMemberPersona(input: {
  readonly organisationId: string;
  readonly membershipId: string;
  readonly personaRoleId: string;
  readonly now?: () => Date;
}): OrgMemberRecord {
  hydrate();
  const index = members.findIndex(
    (row) =>
      row.organisationId === input.organisationId &&
      row.membershipId === input.membershipId,
  );
  if (index < 0) throw new Error("iam.member.not_found");
  const current = members[index]!;
  if (current.status === "removed") throw new Error("iam.member.removed");
  const updated: OrgMemberRecord = {
    ...current,
    personaRoleId: input.personaRoleId.trim(),
    updatedAt: (input.now ?? (() => new Date()))().toISOString(),
  };
  members[index] = updated;
  persistAll();
  return updated;
}

export function setOrgMemberStatus(input: {
  readonly organisationId: string;
  readonly membershipId: string;
  readonly status: Exclude<OrgMemberStatus, "invited">;
  readonly now?: () => Date;
}): OrgMemberRecord {
  hydrate();
  const index = members.findIndex(
    (row) =>
      row.organisationId === input.organisationId &&
      row.membershipId === input.membershipId,
  );
  if (index < 0) throw new Error("iam.member.not_found");
  const current = members[index]!;
  const updated: OrgMemberRecord = {
    ...current,
    status: input.status,
    updatedAt: (input.now ?? (() => new Date()))().toISOString(),
  };
  members[index] = updated;
  persistAll();
  return updated;
}
