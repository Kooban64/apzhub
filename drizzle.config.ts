import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.APZHUB_DATABASE_URL ?? process.env.DATABASE_URL ?? "postgres://127.0.0.1:5432/apzhub",
  },
});
