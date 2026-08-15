/**
 * SPR-APZPRD-001-D / 003-B — pure Projects engine health payload (BetterAuth only).
 */

export function buildProjectsEngineHealthPayload(input: {
  readonly userId: string | undefined;
  readonly diagnostics: {
    readonly integrationEnabled: boolean;
    readonly healthStatus: string;
    readonly apiTokenPresent: boolean;
    readonly connectionConfigured: boolean;
    readonly workspaceConfigured: boolean;
    readonly issues: readonly string[];
  };
  readonly liveListOk: boolean | null;
  readonly liveListError?: string;
}) {
  return {
    product: "projects" as const,
    authN: "betterauth" as const,
    authZ: "apzhub_permission_service" as const,
    engineAuth: "adapter_api_key" as const,
    /** Locked — Projects never uses Authentik. */
    authentikUsed: false as const,
    sessionUserId: input.userId,
    plane: {
      integrationEnabled: input.diagnostics.integrationEnabled,
      healthStatus: input.diagnostics.healthStatus,
      apiTokenPresent: input.diagnostics.apiTokenPresent,
      connectionConfigured: input.diagnostics.connectionConfigured,
      workspaceConfigured: input.diagnostics.workspaceConfigured,
      issues: input.diagnostics.issues,
    },
    liveListOk: input.liveListOk,
    liveListError: input.liveListError,
  };
}
