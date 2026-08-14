import { config } from "dotenv";

config({ path: ".env" });

import {
  ensureLocalSecretsLoaded,
  resetEnvCache,
  resetLocalSecretsLoadForTests,
  seedDatabase,
} from "@apzhub/config";
import { seedDefaultAuthorizationRows } from "@apzhub/platform-authorization/postgres";
import { spawnSync } from "node:child_process";

async function main(): Promise<void> {
  resetLocalSecretsLoadForTests();
  resetEnvCache();
  ensureLocalSecretsLoaded();

  await seedDatabase();
  await seedDefaultAuthorizationRows();
  console.info("[db] Authorization catalogue seeded");

  if (process.env.SEARCH_MEILISEARCH_ENDPOINT?.trim()) {
    const result = spawnSync(
      "pnpm",
      ["exec", "tsx", "scripts/ensure-meilisearch-platform-index.ts"],
      { stdio: "inherit", cwd: process.cwd(), env: process.env },
    );
    if (result.status !== 0) {
      throw new Error("Meilisearch platform index ensure failed");
    }
  } else {
    console.info(
      "[db] SEARCH_MEILISEARCH_ENDPOINT unset — skip Meilisearch index ensure",
    );
  }

  console.info("[db] Seed complete");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
