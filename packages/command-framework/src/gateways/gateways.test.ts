import { describe, expect, it, vi } from "vitest";

import {
  createDefaultInvocationGatewayRegistry,
  createStubAiActionGateway,
  createStubAutomationCommandGateway,
  createStubVoiceActionGateway,
} from "./index";

describe("gateway stubs", () => {
  it("returns NOT_IMPLEMENTED from AI gateway execute", () => {
    const gateway = createStubAiActionGateway();

    const result = gateway.execute({
      actionId: "platform.theme.toggle",
      context: { actor: "ai-agent" },
    });

    expect(result.ok).toBe(false);
    expect(result.code).toBe("NOT_IMPLEMENTED");
    expect(gateway.getDiagnostics().source).toBe("ai-agent");
    expect(gateway.getDiagnostics().invocationCount).toBe(1);
  });

  it("returns NOT_IMPLEMENTED from voice utterance entry point", () => {
    const gateway = createStubVoiceActionGateway();

    const result = gateway.executeUtterance("toggle theme", { actor: "voice" });

    expect(result.code).toBe("NOT_IMPLEMENTED");
    expect(gateway.getDiagnostics().lastActionId).toBe("voice.utterance");
  });

  it("returns NOT_IMPLEMENTED from automation system command entry point", () => {
    const gateway = createStubAutomationCommandGateway();

    const result = gateway.executeSystemCommand({
      actionId: "system.job.run",
      context: { actor: "system" },
    });

    expect(result.code).toBe("NOT_IMPLEMENTED");
    expect(gateway.getDiagnostics().source).toBe("automation");
  });

  it("tracks diagnostics across registry gateways", () => {
    const registry = createDefaultInvocationGatewayRegistry();

    registry.ai.execute({ actionId: "a", context: { actor: "ai-agent" } });
    registry.voice.execute({ actionId: "b", context: { actor: "voice" } });
    registry.automation.executeSystemCommand({
      actionId: "c",
      context: { actor: "system" },
    });

    expect(registry.ai.getDiagnostics().invocationCount).toBe(1);
    expect(registry.voice.getDiagnostics().invocationCount).toBe(1);
    expect(registry.automation.getDiagnostics().invocationCount).toBe(1);
  });

  it("accepts optional delegate for future gateway implementations", () => {
    const delegate = { execute: vi.fn() };
    const registry = createDefaultInvocationGatewayRegistry({ delegate });

    expect(registry.ai.getDiagnostics().status).toBe("stub");
    expect(delegate.execute).not.toHaveBeenCalled();
  });
});
