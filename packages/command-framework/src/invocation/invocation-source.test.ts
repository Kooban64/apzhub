import { describe, expect, it } from "vitest";

import {
  findInvocationSourceDefinition,
  isGatewayRoutedActor,
  PLANNED_INVOCATION_SOURCES,
  resolveInvocationSourceFromActor,
  SUPPORTED_INVOCATION_SOURCES,
} from "./invocation-source";

describe("invocation source", () => {
  it("maps action actors to supported invocation sources", () => {
    expect(resolveInvocationSourceFromActor("user")).toBe("user");
    expect(resolveInvocationSourceFromActor("ai-agent")).toBe("ai-agent");
    expect(resolveInvocationSourceFromActor("voice")).toBe("voice");
  });

  it("identifies gateway-routed actors", () => {
    expect(isGatewayRoutedActor("ai-agent")).toBe(true);
    expect(isGatewayRoutedActor("voice")).toBe(true);
    expect(isGatewayRoutedActor("user")).toBe(false);
  });

  it("documents planned invocation sources", () => {
    expect(PLANNED_INVOCATION_SOURCES.map((source) => source.id)).toEqual([
      "scheduler",
      "external-api",
      "webhook",
    ]);
    expect(findInvocationSourceDefinition("scheduler")?.status).toBe("planned");
  });

  it("lists supported sources with stub status for non-user actors", () => {
    const ai = SUPPORTED_INVOCATION_SOURCES.find((source) => source.id === "ai-agent");
    expect(ai?.status).toBe("stub");
    expect(ai?.actor).toBe("ai-agent");
  });
});
