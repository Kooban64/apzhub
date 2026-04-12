import type { InferSelectModel } from "drizzle-orm";

import type { launchEvents } from "@/db/schema/launch";

export type LaunchEventRowDto = {
  id: string;
  userId: string | null;
  serviceId: string;
  launchMethod: string;
  readinessAtDecision: string | null;
  outcome: string;
  reasonCode: string | null;
  userMessage: string;
  operatorMessage: string | null;
  correlationId: string;
  authSessionId: string | null;
  createdAt: string;
};

export function toLaunchEventDto(row: InferSelectModel<typeof launchEvents>): LaunchEventRowDto {
  return {
    id: row.id,
    userId: row.userId,
    serviceId: row.serviceId,
    launchMethod: row.launchMethod,
    readinessAtDecision: row.readinessAtDecision,
    outcome: row.outcome,
    reasonCode: row.reasonCode,
    userMessage: row.userMessage,
    operatorMessage: row.operatorMessage,
    correlationId: row.correlationId,
    authSessionId: row.authSessionId,
    createdAt: row.createdAt.toISOString(),
  };
}
