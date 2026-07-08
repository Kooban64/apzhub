import { KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS } from "../../status";
import type {
  InstrumentedKnowledgeQueryClient,
  KnowledgeQueryClient,
} from "../query/knowledge-query-client";
import type { KnowledgeQueryInput } from "../query/knowledge-query-client";
import type { CreateKnowledgeServiceOptions } from "./create-knowledge-service";
import type {
  KnowledgeService,
  KnowledgeServiceQueryResult,
} from "./knowledge-service";
import type { KnowledgeServiceDiagnostics } from "./knowledge-service-diagnostics";

function getQueryClientDiagnostics(
  queryClient: KnowledgeQueryClient,
): KnowledgeServiceDiagnostics["queryClient"] {
  if (
    "getDiagnostics" in queryClient &&
    typeof queryClient.getDiagnostics === "function"
  ) {
    return (queryClient as InstrumentedKnowledgeQueryClient).getDiagnostics();
  }

  return {
    kind: "orchestrator",
    ready: true,
  };
}

export class DefaultKnowledgeService implements KnowledgeService {
  private readonly queryClient: KnowledgeQueryClient;
  private readonly registryReady: boolean;
  private readonly registryDiagnostics: CreateKnowledgeServiceOptions["registryDiagnostics"];

  constructor(options: CreateKnowledgeServiceOptions) {
    this.queryClient = options.queryClient;
    this.registryReady = options.registryReady ?? false;
    this.registryDiagnostics = options.registryDiagnostics;
  }

  async query(input: KnowledgeQueryInput): Promise<KnowledgeServiceQueryResult> {
    return this.queryClient.query(input);
  }

  getDiagnostics(): KnowledgeServiceDiagnostics {
    const queryClient = getQueryClientDiagnostics(this.queryClient);
    const queryAvailable = this.registryReady && queryClient.ready;

    return {
      frameworkStatus: KNOWLEDGE_DISCOVERY_FRAMEWORK_STATUS,
      serviceStatus: queryClient.ready ? "ready" : "unavailable",
      registryStatus: this.registryDiagnostics?.status,
      registryReady: this.registryReady,
      queryAvailable,
      queryClient,
    };
  }
}
