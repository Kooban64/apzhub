import { createAiProposalPersistence } from "@apzhub/qep-ai";
import { createQepAiService, type QepAiService } from "@apzhub/qep-ai";

import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";

const globalForAi = globalThis as typeof globalThis & {
  __apzqepAiService?: QepAiService;
};

export function getQepAiService(): QepAiService {
  if (!globalForAi.__apzqepAiService) {
    const persistence = resolveCoreQePersistence();
    const repository = createAiProposalPersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    globalForAi.__apzqepAiService = createQepAiService(repository);
  }
  return globalForAi.__apzqepAiService;
}

export function resetQepAiServiceForTests(): void {
  delete globalForAi.__apzqepAiService;
}
