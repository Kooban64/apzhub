import "dotenv/config";

import { seedDatabase } from "@apzhub/config";

async function main() {
  await seedDatabase();
  console.info("[db] Seed complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
