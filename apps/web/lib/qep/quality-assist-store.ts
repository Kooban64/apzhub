import {
  isQepLedgerPersistEnabled,
  readJsonLedgerSnapshot,
  resolveQepDataRoot,
  writeJsonLedgerSnapshot,
} from "@/lib/qep/qep-ledger-fs";

export type QualityAssistMode =
  "coverage_gaps" | "failure_explain" | "test_draft" | "suite_recommend";

export type QualityAssistProvider = "rule_based" | "openai" | "disabled";
export type QualityAssistSuggestionStatus = "pending" | "accepted" | "rejected";

export type QualityAssistSuggestion = {
  readonly suggestionId: string;
  readonly title: string;
  readonly rationale: string;
  readonly actions: readonly string[];
  readonly confidence: number;
  readonly status: QualityAssistSuggestionStatus;
  readonly actedAt?: string;
  readonly actedBy?: string;
  readonly humanNote?: string;
};

export type QualityAssistAuditEvent = {
  readonly eventId: string;
  readonly action:
    | "session_created"
    | "provider_selected"
    | "suggestion_accepted"
    | "suggestion_rejected";
  readonly actorId: string;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly detail: string;
};

export type QualityAssistSession = {
  readonly sessionId: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly mode: QualityAssistMode;
  readonly subjectRef: string;
  readonly context: string;
  readonly provider: QualityAssistProvider;
  readonly providerReason: string;
  readonly liveLlmRequested: boolean;
  readonly advisoryOnly: true;
  readonly humanAcceptanceRequired: true;
  readonly certificationDecision: null;
  readonly status: "completed" | "disabled";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly suggestions: readonly QualityAssistSuggestion[];
  readonly auditTrail: readonly QualityAssistAuditEvent[];
};

const sessions: QualityAssistSession[] = [];
const MAX_SESSIONS = 500;
let hydrated = false;

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  const snapshot = readJsonLedgerSnapshot<QualityAssistSession[]>(
    resolveQepDataRoot("qep-quality-assist"),
    "sessions.json",
  );
  if (Array.isArray(snapshot)) sessions.push(...snapshot.slice(0, MAX_SESSIONS));
}

function persist(): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerSnapshot(
    resolveQepDataRoot("qep-quality-assist"),
    "sessions.json",
    sessions.slice(0, MAX_SESSIONS),
  );
}

export function listQualityAssistSessions(input: {
  readonly tenantId: string;
  readonly limit?: number;
}): readonly QualityAssistSession[] {
  hydrate();
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);
  return sessions
    .filter((session) => session.tenantId === input.tenantId)
    .slice(0, limit);
}

export function getQualityAssistSession(
  tenantId: string,
  sessionId: string,
): QualityAssistSession | undefined {
  hydrate();
  return sessions.find(
    (session) => session.tenantId === tenantId && session.sessionId === sessionId,
  );
}

export function saveQualityAssistSession(
  session: QualityAssistSession,
): QualityAssistSession {
  hydrate();
  const existing = sessions.findIndex((row) => row.sessionId === session.sessionId);
  if (existing >= 0) sessions.splice(existing, 1);
  sessions.unshift(session);
  if (sessions.length > MAX_SESSIONS) sessions.splice(MAX_SESSIONS);
  persist();
  return session;
}

export function resetQualityAssistStoreForTests(): void {
  sessions.splice(0, sessions.length);
  hydrated = false;
}
