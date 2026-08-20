/**
 * OpenAI-backed APZPEN intelligence — advisory only.
 * Uses OPENAI_API_KEY from env / `.secrets/openai`. Never auto-certifies.
 */

import { ensureLocalSecretsLoaded } from "@apzhub/config";

import {
  assistSecurityIntelligence,
  type IntelligenceAssistResult,
  type IntelligenceSuggestion,
} from "./intelligence";
import type { Engagement, Finding } from "./types";

import type { EnvVars } from "@/lib/env-vars";
export type IntelligenceMode = "offline_rules" | "openai";

const OPENAI_DISCLAIMER =
  "AI-assisted (OpenAI). Advisory only — humans decide. Never auto-certifies. Do not treat as certification.";

type ChatMessage = {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
};

type OpenAiChatResponse = {
  readonly choices?: Array<{
    message?: { content?: string };
  }>;
};

function redact(text: string): string {
  return text
    .replace(/sk-[a-zA-Z0-9_-]{10,}/g, "[redacted]")
    .replace(/ghp_[a-zA-Z0-9]{10,}/g, "[redacted]")
    .replace(/github_pat_[a-zA-Z0-9_]{10,}/g, "[redacted]");
}

function buildPrompt(input: {
  readonly engagement: Engagement;
  readonly findings: readonly Finding[];
}): ChatMessage[] {
  const open = input.findings.filter(
    (f) =>
      f.status !== "closed" &&
      f.status !== "risk_accepted" &&
      f.status !== "false_positive" &&
      f.status !== "retest_passed",
  );
  const findingLines = open
    .slice(0, 25)
    .map((f) =>
      redact(
        `- [${f.severity}/${f.status}] ${f.title} | loc=${f.location ?? "—"} | tool=${f.providerTool ?? "manual"} | rem=${f.remediation ?? "—"}`,
      ),
    );
  const system: ChatMessage = {
    role: "system",
    content: [
      "You are APZPEN Security Intelligence — an advisory assistant for penetration test engagements.",
      "Never claim certification. Never instruct illegal attacks. Never invent CVEs.",
      "Respond with compact JSON only matching:",
      '{"suggestions":[{"kind":"engagement_summary|priority_order|remediation_hints|fp_candidates","title":"...","body":"...","confidence":0.0}]}',
      "Keep bodies under 800 characters each. Prefer actionable remediation language.",
    ].join(" "),
  };
  const user: ChatMessage = {
    role: "user",
    content: [
      `Engagement: ${input.engagement.title}`,
      `Customer: ${input.engagement.customerName}`,
      `Application: ${input.engagement.applicationName}`,
      `Status: ${input.engagement.status}`,
      `Assessment: ${input.engagement.assessmentPosition}`,
      `RoE: ${input.engagement.roe.status}`,
      `Scope count: ${input.engagement.scope.length}`,
      `Open findings (${open.length}):`,
      ...findingLines,
    ].join("\n"),
  };
  return [system, user];
}

function parseSuggestions(
  content: string,
  fallbackFindingIds: readonly string[],
): IntelligenceSuggestion[] {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  try {
    const parsed = JSON.parse(content.slice(start, end + 1)) as {
      suggestions?: Array<{
        kind?: string;
        title?: string;
        body?: string;
        confidence?: number;
      }>;
    };
    const rows = parsed.suggestions ?? [];
    return rows
      .filter((r) => r.title && r.body)
      .slice(0, 6)
      .map((r, i) => ({
        id: `oai_${i + 1}`,
        kind: ([
          "engagement_summary",
          "priority_order",
          "remediation_hints",
          "fp_candidates",
        ].includes(String(r.kind))
          ? r.kind
          : "engagement_summary") as IntelligenceSuggestion["kind"],
        title: String(r.title),
        body: String(r.body).slice(0, 1200),
        confidence: Math.min(0.95, Math.max(0.2, Number(r.confidence ?? 0.65))),
        findingIds: fallbackFindingIds.slice(0, 8),
        disclaimer: OPENAI_DISCLAIMER,
      }));
  } catch {
    return [];
  }
}

export function isOpenAiConfigured(env: EnvVars = process.env): boolean {
  ensureLocalSecretsLoaded();
  return Boolean(env.OPENAI_API_KEY?.trim());
}

export async function assistSecurityIntelligenceOpenAi(input: {
  readonly engagement: Engagement;
  readonly findings: readonly Finding[];
  readonly fetchFn?: typeof fetch;
  readonly env?: EnvVars;
  readonly model?: string;
}): Promise<IntelligenceAssistResult> {
  ensureLocalSecretsLoaded();
  const env = input.env ?? process.env;
  const apiKey = env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ...assistSecurityIntelligence(input),
      mode: "offline_rules",
    };
  }

  const offline = assistSecurityIntelligence(input);
  const fetchFn = input.fetchFn ?? fetch;
  const model = input.model?.trim() || env.APZPEN_OPENAI_MODEL?.trim() || "gpt-4o-mini";

  try {
    const res = await fetchFn("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: buildPrompt(input),
      }),
    });
    if (!res.ok) {
      // Soft-fallback to offline — do not leak response body with possible echo
      return {
        ...offline,
        mode: "offline_rules",
        suggestions: [
          {
            id: "oai_fallback",
            kind: "engagement_summary",
            title: "OpenAI unavailable — offline rules used",
            body: `OpenAI request failed (${res.status}). Showing offline advisory rules instead.`,
            confidence: 0.4,
            findingIds: [],
            disclaimer: OPENAI_DISCLAIMER,
          },
          ...offline.suggestions,
        ],
      };
    }
    const json = (await res.json()) as OpenAiChatResponse;
    const content = json.choices?.[0]?.message?.content ?? "";
    const openIds = offline.suggestions[0]?.findingIds ?? [];
    const parsed = parseSuggestions(content, openIds);
    if (parsed.length === 0) {
      return { ...offline, mode: "offline_rules" };
    }
    return {
      engagementId: input.engagement.engagementId,
      generatedAt: new Date().toISOString(),
      mode: "openai",
      autoCertify: false,
      suggestions: parsed,
    };
  } catch {
    return {
      ...offline,
      mode: "offline_rules",
    };
  }
}

/**
 * Prefer OpenAI when configured unless APZPEN_AI_PROVIDER=offline.
 */
export async function assistSecurityIntelligenceAuto(input: {
  readonly engagement: Engagement;
  readonly findings: readonly Finding[];
  readonly fetchFn?: typeof fetch;
  readonly env?: EnvVars;
}): Promise<IntelligenceAssistResult> {
  ensureLocalSecretsLoaded();
  const env = input.env ?? process.env;
  const provider = (env.APZPEN_AI_PROVIDER ?? "auto").trim().toLowerCase();
  if (provider === "offline" || provider === "offline_rules") {
    return assistSecurityIntelligence(input);
  }
  if (provider === "openai" || provider === "auto" || isOpenAiConfigured(env)) {
    if (isOpenAiConfigured(env) && provider !== "offline") {
      return assistSecurityIntelligenceOpenAi(input);
    }
  }
  return assistSecurityIntelligence(input);
}
