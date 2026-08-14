import { generateKeyPairSync } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createGithubAppJwt,
  getGithubAuthStatus,
  resolveGithubAccessToken,
} from "./github-app-auth";
import { assistSecurityIntelligenceOpenAi } from "./openai-intelligence";
import { tryCompileApzpenPdf } from "./report-pdf";
import { buildReportPack } from "./reports";
import { resetAllApzpenStoresForTests } from "./follow-on-service";
import { ensureDemoEngagement } from "./service";
import type { Engagement, SecurityPosture } from "./types";
import { loadLocalSecrets, resetLocalSecretsLoadForTests } from "@apzhub/config";

beforeEach(() => {
  resetAllApzpenStoresForTests();
});

afterEach(() => {
  resetLocalSecretsLoadForTests();
  delete process.env.OPENAI_API_KEY;
  delete process.env.GITHUB_APP_ID;
  delete process.env.GITHUB_APP_INSTALLATION_ID;
  delete process.env.GITHUB_APP_PRIVATE_KEY;
  delete process.env.GITHUB_TOKEN;
  delete process.env.APZHUB_SCM_GITHUB_TOKEN;
});

describe("APZPEN GitHub App JWT", () => {
  it("signs RS256 JWT and prefers App token over PAT", async () => {
    const { privateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
      publicKeyEncoding: { type: "spki", format: "pem" },
    });
    const jwt = createGithubAppJwt({
      appId: "12345",
      privateKeyPem: privateKey,
      nowSec: 1_700_000_000,
    });
    expect(jwt.split(".")).toHaveLength(3);

    const fetchFn: typeof fetch = async (input) => {
      const url = String(input);
      expect(url).toContain("/app/installations/99/access_tokens");
      return new Response(
        JSON.stringify({
          token: "ghs_test_installation_token",
          expires_at: "2099-01-01T00:00:00Z",
        }),
        { status: 201 },
      );
    };

    const token = await resolveGithubAccessToken({
      env: {
        GITHUB_APP_ID: "12345",
        GITHUB_APP_INSTALLATION_ID: "99",
        GITHUB_APP_PRIVATE_KEY: privateKey,
        GITHUB_TOKEN: "ghp_should_not_use",
      },
      fetchFn,
    });
    expect(token?.mode).toBe("github_app");
    expect(token?.token).toBe("ghs_test_installation_token");
  });

  it("falls back to PAT when App not configured", async () => {
    const token = await resolveGithubAccessToken({
      env: { GITHUB_TOKEN: "ghp_fallback" },
      fetchFn: async () => new Response("nope", { status: 500 }),
    });
    expect(token).toEqual({ token: "ghp_fallback", mode: "pat" });
    expect(
      getGithubAuthStatus({
        GITHUB_TOKEN: "ghp_x",
      }).mode,
    ).toBe("pat");
  });
});

describe("APZPEN OpenAI intelligence", () => {
  it("parses OpenAI JSON suggestions and never auto-certifies", async () => {
    const eng = ensureDemoEngagement("t_oai", "op");
    const fetchFn: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  suggestions: [
                    {
                      kind: "engagement_summary",
                      title: "Executive brief",
                      body: "Focus on BOLA first.",
                      confidence: 0.8,
                    },
                  ],
                }),
              },
            },
          ],
        }),
        { status: 200 },
      );

    const result = await assistSecurityIntelligenceOpenAi({
      engagement: eng,
      findings: [],
      fetchFn,
      env: { OPENAI_API_KEY: "sk-test" },
    });
    expect(result.autoCertify).toBe(false);
    expect(result.mode).toBe("openai");
    expect(result.suggestions[0]?.title).toBe("Executive brief");
  });

  it("falls back offline when OpenAI errors", async () => {
    const eng = ensureDemoEngagement("t_oai2", "op");
    const result = await assistSecurityIntelligenceOpenAi({
      engagement: eng,
      findings: [],
      fetchFn: async () => new Response("nope", { status: 500 }),
      env: { OPENAI_API_KEY: "sk-test" },
    });
    expect(result.mode).toBe("offline_rules");
    expect(result.autoCertify).toBe(false);
  });
});

describe("APZPEN branded PDF via Typst", () => {
  it("compiles branded pack when typst binary exists", async () => {
    const engagement = {
      engagementId: "eng_brand",
      tenantId: "t",
      customerName: "Acme",
      applicationName: "Portal",
      title: "Branded Assessment",
      status: "in_progress",
      environment: "staging",
      methodology: ["OWASP WSTG"],
      scope: [],
      roe: {
        roeId: "r",
        status: "approved",
        allowedTechniques: [],
        restrictedTechniques: [],
      },
      assessmentPosition: "in_progress",
      createdAt: "2026-08-14T00:00:00.000Z",
      updatedAt: "2026-08-14T00:00:00.000Z",
      createdBy: "t",
      scheduleMode: "once",
    } as Engagement;
    const posture = {
      engagementId: "eng_brand",
      status: "in_progress",
      assessmentPosition: "in_progress",
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      openCount: 0,
      remediatingCount: 0,
      retestCount: 0,
      closedCount: 0,
      roeApproved: true,
      scopeCount: 0,
    } as SecurityPosture;
    const pack = buildReportPack({
      kind: "executive",
      engagement,
      findings: [],
      posture,
    });
    const workDir = mkdtempSync(join(tmpdir(), "apzpen-pdf-"));
    const pdf = await tryCompileApzpenPdf(pack, { workDir });
    expect(pdf.ok).toBe(true);
    if (pdf.ok) {
      expect(pdf.bytes.subarray(0, 5).toString("utf8")).toBe("%PDF-");
      expect(["typst", "embedded"]).toContain(pdf.engine);
    }
  });
});

describe("github-app secrets loader", () => {
  it("loads github-app file keys without exposing PEM in assertions beyond presence", () => {
    const dir = mkdtempSync(join(tmpdir(), "apzhub-ghapp-"));
    writeFileSync(
      join(dir, "github-app"),
      [
        "GITHUB_APP_ID=42",
        "GITHUB_APP_INSTALLATION_ID=7",
        "GITHUB_APP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----",
        "APZPEN_GITHUB_WEBHOOK_SECRET=whsec",
      ].join("\n"),
    );
    delete process.env.GITHUB_APP_ID;
    delete process.env.GITHUB_APP_INSTALLATION_ID;
    delete process.env.GITHUB_APP_PRIVATE_KEY;
    delete process.env.APZPEN_GITHUB_WEBHOOK_SECRET;
    const result = loadLocalSecrets({ secretsDir: dir });
    expect(result.loadedFiles).toContain("github-app");
    expect(process.env.GITHUB_APP_ID).toBe("42");
    expect(process.env.GITHUB_APP_INSTALLATION_ID).toBe("7");
    expect(process.env.GITHUB_APP_PRIVATE_KEY).toContain("BEGIN PRIVATE KEY");
    expect(process.env.APZPEN_GITHUB_WEBHOOK_SECRET).toBe("whsec");
  });
});
