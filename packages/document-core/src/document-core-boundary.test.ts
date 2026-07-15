import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../../..");

describe("document-core boundary", () => {
  it("does not import apps, HTTP handlers, or product integrations", () => {
    const files = [
      "packages/document-core/src/index.ts",
      "packages/document-core/src/service/create-document-platform-service.ts",
      "packages/document-core/src/storage/storage-provider.ts",
    ];
    for (const file of files) {
      const content = readFileSync(join(ROOT, file), "utf8");
      expect(content).not.toMatch(/@apzhub\/testing-services/);
      expect(content).not.toMatch(/@apzhub\/integration-plane/);
      expect(content).not.toMatch(/@apzhub\/integration-zammad/);
      expect(content).not.toMatch(/apps\/web/);
      expect(content).not.toMatch(/\/api\/v1/);
    }
  });

  it("storage module declares interfaces only (no provider implementations)", () => {
    const content = readFileSync(
      join(ROOT, "packages/document-core/src/storage/storage-provider.ts"),
      "utf8",
    );
    expect(content).toMatch(
      /export (?:type|interface) DocumentStorageProvider/,
    );
    expect(content).not.toMatch(/class\s+\w+StorageProvider/);
    expect(content).not.toMatch(/fs\.promises|@aws-sdk|@azure\/storage|@google-cloud\/storage/);
  });
});
