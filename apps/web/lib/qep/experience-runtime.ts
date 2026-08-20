import { createExperiencePersistence } from "@apzhub/qep-experience";
import {
  createExperienceService,
  type ExperienceService,
} from "@apzhub/qep-experience";

import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";

const globalForExperience = globalThis as typeof globalThis & {
  __apzqepExperienceService?: ExperienceService;
};

export function getExperienceService(): ExperienceService {
  if (!globalForExperience.__apzqepExperienceService) {
    const persistence = resolveCoreQePersistence();
    const repository = createExperiencePersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    globalForExperience.__apzqepExperienceService = createExperienceService(repository);
  }
  return globalForExperience.__apzqepExperienceService;
}

export function resetExperienceServiceForTests(): void {
  delete globalForExperience.__apzqepExperienceService;
}
