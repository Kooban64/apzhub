import { createApplicationPersistence } from "@apzhub/qep-applications";
import {
  createApplicationService,
  type ApplicationService,
} from "@apzhub/qep-applications";

import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";

const globalForApps = globalThis as typeof globalThis & {
  __apzqepApplicationService?: ApplicationService;
};

export function getApplicationService(): ApplicationService {
  if (!globalForApps.__apzqepApplicationService) {
    const persistence = resolveCoreQePersistence();
    const repository = createApplicationPersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    globalForApps.__apzqepApplicationService = createApplicationService(repository);
  }
  return globalForApps.__apzqepApplicationService;
}
