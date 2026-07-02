import "dotenv/config";

import { runMigrations } from "@apzhub/config";

async function main() {
  await runMigrations();
  console.info("[db] Migrations applied");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
