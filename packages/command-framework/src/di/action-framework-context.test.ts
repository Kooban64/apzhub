import { describe, expect, it } from "vitest";

import { createActionFrameworkContext } from "./action-framework-context";

describe("createActionFrameworkContext", () => {
  it("provides default invocation gateway registry for dependency injection", () => {
    const context = createActionFrameworkContext();

    expect(context.gateways.ai.getDiagnostics().source).toBe("ai-agent");
    expect(context.gateways.voice.getDiagnostics().source).toBe("voice");
    expect(context.gateways.automation.getDiagnostics().source).toBe("automation");
  });
});
