import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/db/schema.ts",
    "./src/db/legal-schema.ts",
    "./src/db/platform-identity-schema.ts",
    "./src/db/platform-authorization-schema.ts",
    "./src/db/platform-personalisation-schema.ts",
    "./src/db/platform-governance-schema.ts",
    "./src/db/platform-entity-mapping-schema.ts",
    "./src/db/testing-schema.ts",
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ?? "postgresql://apzhub:apzhub@localhost:54334/apzhub",
  },
});
