import { PlatformGovernanceService } from "./platform-governance-service";
import { getSharedGovernanceService } from "./index";

export async function createPostgresGovernanceService(): Promise<PlatformGovernanceService> {
  const { createPostgresGovernanceRepositories, seedPostgresGovernanceRows } = await import(
    "./postgres-governance-store"
  );
  const repositories = await createPostgresGovernanceRepositories();
  await seedPostgresGovernanceRows();
  return new PlatformGovernanceService({ repositories, storageBackend: "postgres" });
}

export async function getGovernanceServiceForSession(): Promise<PlatformGovernanceService> {
  if (process.env.DATABASE_URL) {
    try {
      return await createPostgresGovernanceService();
    } catch {
      // Fall through to in-memory governance.
    }
  }
  return getSharedGovernanceService();
}
