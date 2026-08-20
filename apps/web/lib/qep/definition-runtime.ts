import { createDefinitionPersistence } from "@apzhub/qep-definition";
import {
  createDefinitionService,
  type DefinitionService,
} from "@apzhub/qep-definition";

import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";

const globalForDefinition = globalThis as typeof globalThis & {
  __apzqepDefinitionService?: DefinitionService;
};

export function getDefinitionService(): DefinitionService {
  if (!globalForDefinition.__apzqepDefinitionService) {
    const persistence = resolveCoreQePersistence();
    const repository = createDefinitionPersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    globalForDefinition.__apzqepDefinitionService = createDefinitionService(repository);
  }
  return globalForDefinition.__apzqepDefinitionService;
}

export function resetDefinitionServiceForTests(): void {
  delete globalForDefinition.__apzqepDefinitionService;
}
