import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "test/e2e"],
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./"),
      // Real `server-only` throws in jsdom; server modules are still exercised via explicit mocks where needed.
      "server-only": path.resolve(dirname, "test/server-only-stub.ts"),
    },
  },
});
