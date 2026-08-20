import { createAssurancePersistence } from "@apzhub/qep-assurance";
import { createAssuranceService, type AssuranceService } from "@apzhub/qep-assurance";

import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";

const globalForAssurance = globalThis as typeof globalThis & {
  __apzqepAssuranceService?: AssuranceService;
};

export function getAssuranceService(): AssuranceService {
  if (!globalForAssurance.__apzqepAssuranceService) {
    const persistence = resolveCoreQePersistence();
    const repository = createAssurancePersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    globalForAssurance.__apzqepAssuranceService = createAssuranceService(repository);
  }
  return globalForAssurance.__apzqepAssuranceService;
}

export function resetAssuranceServiceForTests(): void {
  delete globalForAssurance.__apzqepAssuranceService;
}
