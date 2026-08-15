import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { loadLocalSecrets, resetLocalSecretsLoadForTests } from "./load-local-secrets";

describe("loadLocalSecrets", () => {
  afterEach(() => {
    resetLocalSecretsLoadForTests();
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PASS;
    delete process.env.EMAIL_FROM;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GITHUB_TOKEN;
    delete process.env.APZHUB_SCM_GITHUB_TOKEN;
    delete process.env.PLANE_API_TOKEN;
    delete process.env.PLANE_WORKSPACE_ID;
  });

  it("loads smtp openai and git secrets without overwriting existing env", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "apzhub-secrets-"));
    writeFileSync(
      path.join(dir, "smtp"),
      [
        "SMTP_HOST=smtp.example.com",
        "SMTP_PORT=587",
        "SMTP_USER=u",
        "SMTP_PASS=ab cd",
        "SMTP_FROM=from@example.com",
      ].join("\n"),
    );
    writeFileSync(path.join(dir, "openai"), "sk-test-openai-key\n");
    writeFileSync(
      path.join(dir, "git"),
      ["ghp_testtoken123", "username=ops", "login=ops@example.com"].join("\n"),
    );
    writeFileSync(
      path.join(dir, "meilisearch"),
      "MEILI_MASTER_KEY=meili-test-master-key\n",
    );
    writeFileSync(
      path.join(dir, "plane"),
      ["PLANE_API_TOKEN=plane_test_token_min_16", "PLANE_WORKSPACE_ID=apzportal"].join(
        "\n",
      ),
    );

    delete process.env.EMAIL_FROM;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GITHUB_TOKEN;
    delete process.env.APZHUB_SCM_GITHUB_TOKEN;
    delete process.env.SMTP_PASS;
    delete process.env.MEILI_MASTER_KEY;
    delete process.env.SEARCH_MEILISEARCH_API_KEY;
    delete process.env.PLANE_API_TOKEN;
    delete process.env.PLANE_WORKSPACE_ID;
    process.env.SMTP_HOST = "already.set";
    const result = loadLocalSecrets({ secretsDir: dir });

    expect(result.loadedFiles).toEqual([
      "smtp",
      "openai",
      "git",
      "meilisearch",
      "plane",
    ]);
    expect(process.env.SMTP_HOST).toBe("already.set");
    expect(process.env.SMTP_PASS).toBe("abcd");
    expect(process.env.EMAIL_FROM).toBe("from@example.com");
    expect(process.env.OPENAI_API_KEY).toBe("sk-test-openai-key");
    expect(process.env.GITHUB_TOKEN).toBe("ghp_testtoken123");
    expect(process.env.APZHUB_SCM_GITHUB_TOKEN).toBe("ghp_testtoken123");
    expect(process.env.MEILI_MASTER_KEY).toBe("meili-test-master-key");
    expect(process.env.SEARCH_MEILISEARCH_API_KEY).toBe("meili-test-master-key");
    expect(process.env.PLANE_API_TOKEN).toBe("plane_test_token_min_16");
    expect(process.env.PLANE_WORKSPACE_ID).toBe("apzportal");
  });
});
