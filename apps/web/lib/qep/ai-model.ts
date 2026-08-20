import { ensureLocalSecretsLoaded } from "@apzhub/config";
import {
  assertContextSafeForModel,
  redactContextForModel,
  validateProposalContent,
  type ComposedAiContext,
  type ProposalType,
} from "@apzhub/qep-ai";

import type { EnvVars } from "@/lib/env-vars";
type OpenAiResponse = {
  readonly choices?: readonly { readonly message?: { readonly content?: string } }[];
};

export type ModelInvocationResult = {
  readonly provider: string;
  readonly model: string;
  readonly content: Record<string, unknown>;
  readonly text?: string;
};

function parseJsonObject(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("ai.model.empty");
  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("ai.model.invalid_json");
  }
  return parsed as Record<string, unknown>;
}

export function isQepAiTestFixtureEnabled(env: EnvVars = process.env): boolean {
  return env.APZHUB_QEP_AI_TEST_FIXTURE?.trim().toLowerCase() === "true";
}

export async function invokeQepAiModel(input: {
  readonly granted: readonly string[];
  readonly context: ComposedAiContext;
  readonly proposalType?: ProposalType;
  readonly instruction: string;
  readonly mode: "generate" | "ask" | "analyse";
  readonly env?: EnvVars;
  readonly fetchFn?: typeof fetch;
}): Promise<ModelInvocationResult> {
  assertContextSafeForModel(input.context, input.granted);
  const env = input.env ?? process.env;
  const safeContext = redactContextForModel(input.context);
  if (safeContext.source && !input.context.sourceAuthorised) {
    throw new Error("ai.source.leak");
  }

  if (isQepAiTestFixtureEnabled(env)) {
    const title =
      input.proposalType === "quality_risk"
        ? "Draft quality risk from gaps"
        : "Generated test case from authorised QEP facts";
    return {
      provider: "test_fixture",
      model: "fixture",
      content: validateProposalContent(input.proposalType ?? "test_case", {
        title,
        description: "Fixture output. Not a production model response.",
      }),
    };
  }

  ensureLocalSecretsLoaded();
  const apiKey = env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("ai.model.unavailable");
  const model = env.APZHUB_QEP_OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const system =
    input.mode === "ask"
      ? 'You are APZHUB APZQEP AI Quality Companion. Answer from authorised QEP context only. Never certify, never set GO/NO_GO, never invent Source. Return JSON {"answer":"..."}.'
      : input.mode === "analyse"
        ? 'You interpret deterministic QEP facts. Do not invent counts. Never certify. Return JSON {"interpretation":"..."}.'
        : 'You draft an untrusted APZQEP proposal. Never write SoR. Never certify. Return JSON {"title":"...","description":"..."} plus type-specific fields.';

  const response = await (input.fetchFn ?? fetch)(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: JSON.stringify({
              instruction: input.instruction,
              proposalType: input.proposalType,
              context: safeContext,
            }),
          },
        ],
      }),
    },
  );
  if (!response.ok) throw new Error(`ai.model.unavailable:${response.status}`);
  const body = (await response.json()) as OpenAiResponse;
  const raw = body.choices?.[0]?.message?.content ?? "";
  const parsed = parseJsonObject(raw);
  if (input.mode === "generate") {
    return {
      provider: "openai",
      model,
      content: validateProposalContent(input.proposalType ?? "test_case", parsed),
    };
  }
  return {
    provider: "openai",
    model,
    content: parsed,
    text: String(parsed.answer ?? parsed.interpretation ?? ""),
  };
}
