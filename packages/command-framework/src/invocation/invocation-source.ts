import type { ActionActor } from "../types";

/** Invocation sources implemented or stubbed in Sprint 004. */
export type SupportedInvocationSourceId =
  "user" | "system" | "ai-agent" | "voice" | "automation";

/** Future invocation sources — documentation only (AF-018). */
export type PlannedInvocationSourceId = "scheduler" | "external-api" | "webhook";

export type InvocationSourceId =
  SupportedInvocationSourceId | PlannedInvocationSourceId;

export type InvocationSourceStatus = "implemented" | "stub" | "planned";

export interface InvocationSourceDefinition {
  readonly id: InvocationSourceId;
  readonly label: string;
  readonly status: InvocationSourceStatus;
  /** Primary Action Framework actor when the source executes through the executor. */
  readonly actor?: ActionActor;
}

export const USER_INVOCATION_SOURCE: InvocationSourceDefinition = Object.freeze({
  id: "user",
  label: "User",
  status: "implemented",
  actor: "user",
});

export const SYSTEM_INVOCATION_SOURCE: InvocationSourceDefinition = Object.freeze({
  id: "system",
  label: "System",
  status: "implemented",
  actor: "system",
});

export const AI_AGENT_INVOCATION_SOURCE: InvocationSourceDefinition = Object.freeze({
  id: "ai-agent",
  label: "AI Agent",
  status: "stub",
  actor: "ai-agent",
});

export const VOICE_INVOCATION_SOURCE: InvocationSourceDefinition = Object.freeze({
  id: "voice",
  label: "Voice",
  status: "stub",
  actor: "voice",
});

export const AUTOMATION_INVOCATION_SOURCE: InvocationSourceDefinition = Object.freeze({
  id: "automation",
  label: "Automation",
  status: "stub",
  actor: "system",
});

export const SUPPORTED_INVOCATION_SOURCES = Object.freeze([
  USER_INVOCATION_SOURCE,
  SYSTEM_INVOCATION_SOURCE,
  AI_AGENT_INVOCATION_SOURCE,
  VOICE_INVOCATION_SOURCE,
  AUTOMATION_INVOCATION_SOURCE,
] satisfies readonly InvocationSourceDefinition[]);

export const PLANNED_INVOCATION_SOURCES = Object.freeze([
  { id: "scheduler", label: "Scheduler", status: "planned" },
  { id: "external-api", label: "External API", status: "planned" },
  { id: "webhook", label: "Webhook", status: "planned" },
] satisfies readonly InvocationSourceDefinition[]);

const ACTOR_TO_SOURCE: Readonly<Record<ActionActor, SupportedInvocationSourceId>> = {
  user: "user",
  system: "system",
  "ai-agent": "ai-agent",
  voice: "voice",
};

export type GatewayRoutedActor = "ai-agent" | "voice";

export function resolveInvocationSourceFromActor(
  actor: ActionActor,
): SupportedInvocationSourceId {
  return ACTOR_TO_SOURCE[actor];
}

export function isGatewayRoutedActor(actor: ActionActor): actor is GatewayRoutedActor {
  return actor === "ai-agent" || actor === "voice";
}

export function findInvocationSourceDefinition(
  id: InvocationSourceId,
): InvocationSourceDefinition | undefined {
  return (
    SUPPORTED_INVOCATION_SOURCES.find((source) => source.id === id) ??
    PLANNED_INVOCATION_SOURCES.find((source) => source.id === id)
  );
}
