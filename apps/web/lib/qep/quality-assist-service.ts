import { createHash, randomUUID } from "node:crypto";

import { ensureLocalSecretsLoaded } from "@apzhub/config";

import {
  getQualityAssistSession,
  listQualityAssistSessions,
  saveQualityAssistSession,
  type QualityAssistAuditEvent,
  type QualityAssistMode,
  type QualityAssistProvider,
  type QualityAssistSession,
  type QualityAssistSuggestion,
} from "@/lib/qep/quality-assist-store";

import type { EnvVars } from "@/lib/env-vars";

const ADVISORY_DISCLAIMER =
  "Advisory only. A human must accept or reject each suggestion. This does not certify a release or set GO/NO-GO.";

const PROHIBITED_CERTIFICATION_OPERATIONS = new Set([
  "certification.decide",
  "certification.go",
  "certification.no_go",
  "qep.certification.decide",
]);

type CreateQualityAssistInput = {
  readonly tenantId: string;
  readonly actorId: string;
  readonly correlationId: string;
  readonly mode: QualityAssistMode;
  readonly subjectRef: string;
  readonly context: string;
  readonly liveLlmRequested?: boolean;
  readonly env?: EnvVars;
  readonly fetchFn?: typeof fetch;
  readonly now?: () => Date;
};

type ActOnQualityAssistInput = {
  readonly tenantId: string;
  readonly actorId: string;
  readonly correlationId: string;
  readonly sessionId: string;
  readonly suggestionId: string;
  readonly action: "accept" | "reject";
  readonly humanNote?: string;
  readonly now?: () => Date;
};

type OpenAiResponse = {
  readonly choices?: readonly { readonly message?: { readonly content?: string } }[];
};

export function isQepLiveAssistEnabled(env: EnvVars = process.env): boolean {
  return env.APZHUB_QEP_AI_ASSIST?.trim().toLowerCase() === "true";
}

/**
 * Defence-in-depth boundary. Quality Assist has no certification dependency;
 * this guard also rejects any future attempt to route an operation there.
 */
export function assertQualityAssistNeverCertifies(operation: string): void {
  const normalized = operation.trim().toLowerCase().replaceAll("-", "_");
  if (
    PROHIBITED_CERTIFICATION_OPERATIONS.has(normalized) ||
    normalized.includes("certification.decide") ||
    normalized.endsWith(".go") ||
    normalized.endsWith(".no_go")
  ) {
    throw new Error("quality_assist.certification_forbidden");
  }
}

function stableId(prefix: string, ...parts: readonly string[]): string {
  const digest = createHash("sha256")
    .update(parts.join("|"))
    .digest("hex")
    .slice(0, 14);
  return `${prefix}-${digest}`;
}

function auditEvent(input: {
  readonly action: QualityAssistAuditEvent["action"];
  readonly actorId: string;
  readonly correlationId: string;
  readonly occurredAt: string;
  readonly detail: string;
}): QualityAssistAuditEvent {
  return { eventId: randomUUID(), ...input };
}

function suggestion(
  mode: QualityAssistMode,
  subjectRef: string,
  index: number,
  title: string,
  rationale: string,
  actions: readonly string[],
  confidence: number,
): QualityAssistSuggestion {
  return {
    suggestionId: stableId("qas", mode, subjectRef, String(index), title),
    title,
    rationale: `${rationale} ${ADVISORY_DISCLAIMER}`,
    actions,
    confidence,
    status: "pending",
  };
}

export function buildRuleBasedQualityAssist(input: {
  readonly mode: QualityAssistMode;
  readonly subjectRef: string;
  readonly context: string;
}): readonly QualityAssistSuggestion[] {
  const context = input.context.trim();
  const mentions = (value: string) => context.toLowerCase().includes(value);
  switch (input.mode) {
    case "coverage_gaps": {
      const expected = ["accessibility", "security", "performance", "regression"];
      const gaps = expected.filter((domain) => !mentions(domain));
      const effective = gaps.length > 0 ? gaps : ["boundary and negative-path"];
      return effective
        .slice(0, 4)
        .map((domain, index) =>
          suggestion(
            input.mode,
            input.subjectRef,
            index,
            `Review ${domain} coverage`,
            `The supplied context does not demonstrate ${domain} coverage.`,
            [
              `Map ${domain} checks to the affected requirements and changed paths`,
              "Run the governed check and attach resulting evidence",
              "Have a reviewer confirm the gap is closed",
            ],
            0.72,
          ),
        );
    }
    case "failure_explain":
      return [
        suggestion(
          input.mode,
          input.subjectRef,
          0,
          "Separate product failure from test instability",
          context
            ? `The failure context should be reproduced from the earliest reliable signal: ${context.slice(0, 240)}`
            : "No failure detail was supplied, so root cause cannot be asserted.",
          [
            "Re-run once with identical inputs and preserve logs",
            "Compare the first failing step with the last passing execution",
            "Assign an owner only after evidence distinguishes product, environment, and test causes",
          ],
          context ? 0.68 : 0.4,
        ),
      ];
    case "test_draft":
      return [
        suggestion(
          input.mode,
          input.subjectRef,
          0,
          `Draft verification for ${input.subjectRef}`,
          "A draft should cover the primary behaviour and a controlled failure path before human review.",
          [
            "Arrange: establish authorised preconditions and test data",
            "Act: execute the primary behaviour for the referenced change",
            "Assert: verify the expected result and one denied or invalid-input path",
            "Attach evidence and keep the specification in draft until reviewed",
          ],
          0.75,
        ),
      ];
    case "suite_recommend":
      return [
        suggestion(
          input.mode,
          input.subjectRef,
          0,
          "Run targeted smoke and impacted regression suites",
          "A bounded suite selection should start with changed paths, linked requirements, and historically failing areas.",
          [
            "Select the smoke suite covering the primary user journey",
            "Add suites linked to changed requirements or components",
            "Include one resilience or negative-path suite",
            "Have a human approve the final suite selection before execution",
          ],
          0.7,
        ),
      ];
    default: {
      const exhaustive: never = input.mode;
      return [exhaustive];
    }
  }
}

function redact(value: string): string {
  return value
    .replace(/sk-[a-zA-Z0-9_-]{10,}/g, "[redacted]")
    .replace(/ghp_[a-zA-Z0-9]{10,}/g, "[redacted]")
    .slice(0, 8_000);
}

function parseOpenAiSuggestions(
  content: string,
  mode: QualityAssistMode,
  subjectRef: string,
): readonly QualityAssistSuggestion[] {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  try {
    const parsed = JSON.parse(content.slice(start, end + 1)) as {
      suggestions?: {
        title?: unknown;
        rationale?: unknown;
        actions?: unknown;
        confidence?: unknown;
      }[];
    };
    return (parsed.suggestions ?? [])
      .filter(
        (item) =>
          typeof item.title === "string" &&
          typeof item.rationale === "string" &&
          Array.isArray(item.actions),
      )
      .slice(0, 6)
      .map((item, index) =>
        suggestion(
          mode,
          subjectRef,
          index,
          String(item.title).slice(0, 200),
          String(item.rationale).slice(0, 1_200),
          (item.actions as unknown[])
            .filter((action): action is string => typeof action === "string")
            .slice(0, 6)
            .map((action) => action.slice(0, 500)),
          Math.min(0.95, Math.max(0.2, Number(item.confidence ?? 0.65))),
        ),
      );
  } catch {
    return [];
  }
}

export async function requestOpenAiSuggestions(input: {
  readonly apiKey: string;
  readonly mode: QualityAssistMode;
  readonly subjectRef: string;
  readonly context: string;
  readonly env: EnvVars;
  readonly fetchFn: typeof fetch;
}): Promise<readonly QualityAssistSuggestion[]> {
  assertQualityAssistNeverCertifies("quality_assist.suggest");
  const response = await input.fetchFn("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${input.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: input.env.APZHUB_QEP_OPENAI_MODEL?.trim() || "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You are APZHUB Governed Quality Assist. Produce advisory suggestions only. Never certify, never set GO or NO_GO, and never claim release authority. Return JSON: {"suggestions":[{"title":"...","rationale":"...","actions":["..."],"confidence":0.0}]}.',
        },
        {
          role: "user",
          content: redact(
            `Mode: ${input.mode}\nSubject: ${input.subjectRef}\nContext:\n${input.context}`,
          ),
        },
      ],
    }),
  });
  if (!response.ok)
    throw new Error(`quality_assist.openai_unavailable:${response.status}`);
  const body = (await response.json()) as OpenAiResponse;
  return parseOpenAiSuggestions(
    body.choices?.[0]?.message?.content ?? "",
    input.mode,
    input.subjectRef,
  );
}

export function listGovernedQualityAssistSessions(input: {
  readonly tenantId: string;
  readonly limit?: number;
}): readonly QualityAssistSession[] {
  return listQualityAssistSessions(input);
}

export async function createGovernedQualityAssist(
  input: CreateQualityAssistInput,
): Promise<QualityAssistSession> {
  assertQualityAssistNeverCertifies("quality_assist.create");
  const subjectRef = input.subjectRef.trim();
  if (!subjectRef) throw new Error("quality_assist.subject_required");
  if (input.context.length > 8_000) throw new Error("quality_assist.context_too_large");

  ensureLocalSecretsLoaded();
  const now = (input.now ?? (() => new Date()))().toISOString();
  const sessionId = randomUUID();
  const liveRequested = input.liveLlmRequested === true;
  let provider: QualityAssistProvider = "rule_based";
  let providerReason = "Deterministic governed rules selected.";
  let status: QualityAssistSession["status"] = "completed";
  let suggestions: readonly QualityAssistSuggestion[] = [];

  if (liveRequested) {
    provider = "disabled";
    status = "disabled";
    providerReason =
      "Live Quality Assist LLM is superseded by Phase 7. Caller-supplied context is never sent to a model.";
  }
  if (provider === "rule_based") {
    suggestions = buildRuleBasedQualityAssist({
      mode: input.mode,
      subjectRef,
      context: input.context,
    });
  }

  const auditTrail: QualityAssistAuditEvent[] = [
    auditEvent({
      action: "session_created",
      actorId: input.actorId,
      correlationId: input.correlationId,
      occurredAt: now,
      detail: `Created ${input.mode} advisory session for ${subjectRef}.`,
    }),
    auditEvent({
      action: "provider_selected",
      actorId: input.actorId,
      correlationId: input.correlationId,
      occurredAt: now,
      detail: `${provider}: ${providerReason}`,
    }),
  ];
  return saveQualityAssistSession({
    sessionId,
    tenantId: input.tenantId,
    actorId: input.actorId,
    mode: input.mode,
    subjectRef,
    context: input.context.trim(),
    provider,
    providerReason,
    liveLlmRequested: liveRequested,
    advisoryOnly: true,
    humanAcceptanceRequired: true,
    certificationDecision: null,
    status,
    createdAt: now,
    updatedAt: now,
    suggestions,
    auditTrail,
  });
}

export function actOnGovernedQualityAssist(
  input: ActOnQualityAssistInput,
): QualityAssistSession {
  assertQualityAssistNeverCertifies(`quality_assist.suggestion.${input.action}`);
  const current = getQualityAssistSession(input.tenantId, input.sessionId);
  if (!current) throw new Error("quality_assist.session_not_found");
  const existing = current.suggestions.find(
    (item) => item.suggestionId === input.suggestionId,
  );
  if (!existing) throw new Error("quality_assist.suggestion_not_found");
  if (existing.status !== "pending") throw new Error("quality_assist.already_acted");

  const occurredAt = (input.now ?? (() => new Date()))().toISOString();
  const updated: QualityAssistSession = {
    ...current,
    certificationDecision: null,
    updatedAt: occurredAt,
    suggestions: current.suggestions.map((item) =>
      item.suggestionId === input.suggestionId
        ? {
            ...item,
            status: input.action === "accept" ? "accepted" : "rejected",
            actedAt: occurredAt,
            actedBy: input.actorId,
            humanNote: input.humanNote?.trim() || undefined,
          }
        : item,
    ),
    auditTrail: [
      ...current.auditTrail,
      auditEvent({
        action:
          input.action === "accept" ? "suggestion_accepted" : "suggestion_rejected",
        actorId: input.actorId,
        correlationId: input.correlationId,
        occurredAt,
        detail: `${input.action} recorded for ${input.suggestionId}; no certification action performed.`,
      }),
    ],
  };
  return saveQualityAssistSession(updated);
}
