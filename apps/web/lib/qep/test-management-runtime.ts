import { createTestManagementPersistence } from "@apzhub/qep-test-management";
import {
  createTestManagementService,
  type TestManagementService,
} from "@apzhub/qep-test-management";

import { resolveCoreQePersistence } from "./persistence/resolve-core-qe-persistence";

const globalForTestManagement = globalThis as typeof globalThis & {
  __apzqepTestManagementService?: TestManagementService;
};

export function getTestManagementService(): TestManagementService {
  if (!globalForTestManagement.__apzqepTestManagementService) {
    const persistence = resolveCoreQePersistence();
    const repository = createTestManagementPersistence({
      mode: persistence.mode,
      ...(persistence.db ? { db: persistence.db } : {}),
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    globalForTestManagement.__apzqepTestManagementService =
      createTestManagementService(repository);
  }
  return globalForTestManagement.__apzqepTestManagementService;
}

export function resetTestManagementServiceForTests(): void {
  delete globalForTestManagement.__apzqepTestManagementService;
}
