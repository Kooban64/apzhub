import type { ClientKnowledgeRegistryDiagnostics } from "../client-knowledge-registry-diagnostics";
import type { KnowledgeService } from "../service/knowledge-service";
import type { KnowledgeQueryInput } from "./knowledge-query-client";
import {
  createInitialKnowledgeQueryState,
  createLoadingKnowledgeQueryState,
  type KnowledgeQueryError,
  type KnowledgeQueryState,
} from "./knowledge-query-lifecycle";

export interface ExecuteKnowledgeQueryOptions {
  readonly input: KnowledgeQueryInput;
  readonly service: KnowledgeService;
  readonly registryReady: boolean;
  readonly registryDiagnostics: ClientKnowledgeRegistryDiagnostics;
}

export interface ExecuteKnowledgeQueryResult {
  readonly state: KnowledgeQueryState;
  readonly queriedAt: string;
}

export async function executeKnowledgeQuery(
  options: ExecuteKnowledgeQueryOptions,
): Promise<ExecuteKnowledgeQueryResult> {
  const { input, service, registryReady, registryDiagnostics } = options;
  const text = input.text ?? "";

  if (!registryReady) {
    const error: KnowledgeQueryError = {
      code: "REGISTRY_NOT_READY",
      message:
        registryDiagnostics.status === "invalid"
          ? "Knowledge registry hydration failed — query unavailable"
          : "Knowledge registry is not ready — query unavailable",
    };

    return {
      state: {
        status: "error",
        text,
        documents: [],
        diagnostics: undefined,
        error,
      },
      queriedAt: new Date().toISOString(),
    };
  }

  try {
    const result = await service.query(input);

    return {
      state: {
        status: "success",
        text,
        documents: result.documents,
        diagnostics: result.diagnostics,
        error: undefined,
      },
      queriedAt: new Date().toISOString(),
    };
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Knowledge query failed unexpectedly";
    const error: KnowledgeQueryError = {
      code: message.includes("not configured") ? "QUERY_CLIENT_ERROR" : "QUERY_FAILED",
      message,
    };

    return {
      state: {
        status: "error",
        text,
        documents: [],
        diagnostics: undefined,
        error,
      },
      queriedAt: new Date().toISOString(),
    };
  }
}

export function createKnowledgeQueryLoadingState(text: string): KnowledgeQueryState {
  return createLoadingKnowledgeQueryState(text);
}

export function createKnowledgeQueryIdleState(): KnowledgeQueryState {
  return createInitialKnowledgeQueryState();
}
