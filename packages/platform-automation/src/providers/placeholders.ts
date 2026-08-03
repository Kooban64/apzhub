import type { AutomationProvider } from "../contracts/provider";
import type { AutomationProviderId } from "../contracts/execution";

const PLACEHOLDER_IDS: readonly AutomationProviderId[] = [
  "selenium",
  "cypress",
  "appium",
  "rest",
  "k6",
  "visual",
  "accessibility",
] as const;

function createPlaceholder(
  providerId: AutomationProviderId,
  name: string,
): AutomationProvider {
  return {
    descriptor: {
      providerId,
      name,
      version: "0.0.0",
      status: "placeholder",
      capabilities: ["registered", "not-implemented-apzqep-161"],
    },
    async prepare() {
      throw new Error(`${providerId} provider is a Wave-later placeholder`);
    },
    async execute() {
      return {
        ok: false,
        summary: `${providerId} not implemented in APZQEP-161`,
        artifacts: [],
        errorMessage: "PLACEHOLDER_PROVIDER",
      };
    },
  };
}

export function createPlaceholderProviders(): readonly AutomationProvider[] {
  return [
    createPlaceholder("selenium", "Selenium Provider"),
    createPlaceholder("cypress", "Cypress Provider"),
    createPlaceholder("appium", "Appium Provider"),
    createPlaceholder("rest", "REST / API Provider"),
    createPlaceholder("k6", "k6 Performance Provider"),
    createPlaceholder("visual", "Visual Testing Provider"),
    createPlaceholder("accessibility", "Accessibility Provider"),
  ];
}

export { PLACEHOLDER_IDS };
