import type { IntelligenceProvider } from "../contracts/provider";
import type { IntelligenceProviderId } from "../contracts/provider";

const PLACEHOLDER_IDS = [
  "openai",
  "claude",
  "gemini",
  "azure_openai",
  "local_llm",
  "risk_engine",
] as const satisfies readonly IntelligenceProviderId[];

function createPlaceholder(
  providerId: IntelligenceProviderId,
  name: string,
  kind: IntelligenceProvider["descriptor"]["kind"],
): IntelligenceProvider {
  const refuse = async () => {
    throw new Error(
      `Provider ${providerId} is a placeholder and cannot evaluate in APZQEP-163`,
    );
  };

  return {
    descriptor: {
      providerId,
      name,
      kind,
      version: "0.0.0",
      status: "placeholder",
      capabilities: ["registered", "not-implemented-apzqep-163"],
    },
    health: async () => ({ ok: false, detail: "placeholder" }),
    evaluate: refuse,
  };
}

export function createPlaceholderIntelligenceProviders(): readonly IntelligenceProvider[] {
  return [
    createPlaceholder("openai", "OpenAI Provider", "ai"),
    createPlaceholder("claude", "Claude Provider", "ai"),
    createPlaceholder("gemini", "Gemini Provider", "ai"),
    createPlaceholder("azure_openai", "Azure OpenAI Provider", "ai"),
    createPlaceholder("local_llm", "Local LLM Provider", "ai"),
    createPlaceholder("risk_engine", "Risk Engine Provider", "risk"),
  ];
}

export { PLACEHOLDER_IDS };
