import { describe, expect, it } from "vitest";

import { findingFingerprint, ingestProviderPayload } from "./provider-ingest";

describe("APZPEN provider ingest", () => {
  it("parses ZAP JSON alerts", () => {
    const result = ingestProviderPayload({
      format: "zap",
      payload: {
        site: [
          {
            alerts: [
              {
                name: "Absence of Anti-CSRF Tokens",
                riskdesc: "Medium (Medium)",
                desc: "No Anti-CSRF tokens were found",
                solution: "Add CSRF tokens",
                pluginid: "10202",
                count: "3",
              },
            ],
          },
        ],
      },
    });
    expect(result.toolId).toBe("zap");
    expect(result.parsedCount).toBe(1);
    expect(result.seeds[0]?.title).toContain("Anti-CSRF");
    expect(result.seeds[0]?.severity).toBe("medium");
  });

  it("parses Trivy-style SARIF", () => {
    const result = ingestProviderPayload({
      format: "sarif",
      toolId: "trivy",
      payload: {
        runs: [
          {
            results: [
              {
                ruleId: "CVE-2024-1234",
                level: "error",
                message: {
                  text: "SEVERITY: HIGH — openssl vulnerable package",
                },
                locations: [
                  {
                    physicalLocation: {
                      artifactLocation: { uri: "package-lock.json" },
                      region: { startLine: 42 },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    expect(result.toolId).toBe("trivy");
    expect(result.seeds[0]?.location).toContain("package-lock.json");
    expect(result.seeds[0]?.severity).toBe("high");
  });

  it("parses Greenbone simplified findings and Nuclei JSONL", () => {
    const greenbone = ingestProviderPayload({
      format: "simplified",
      toolId: "greenbone",
      payload: {
        findings: [
          {
            name: "OpenSSH outdated",
            severity: "high",
            host: "10.0.0.8",
            description: "SSH version vulnerable",
          },
        ],
      },
    });
    expect(greenbone.seeds[0]?.providerTool).toBe("greenbone");
    expect(greenbone.seeds[0]?.location).toBe("10.0.0.8");

    const faraday = ingestProviderPayload({
      format: "simplified",
      toolId: "faraday",
      payload: {
        vulns: [{ name: "Weak cipher", severity: "medium", target: "10.0.0.9" }],
      },
    });
    expect(faraday.toolId).toBe("faraday");
    expect(faraday.seeds[0]?.location).toBe("10.0.0.9");

    const nuclei = ingestProviderPayload({
      format: "nuclei_jsonl",
      rawText:
        '{"template-id":"http-missing-security-headers","info":{"name":"Missing headers","severity":"low"},"host":"https://staging.example","matched-at":"https://staging.example"}\n',
    });
    expect(nuclei.toolId).toBe("nuclei");
    expect(nuclei.parsedCount).toBeGreaterThanOrEqual(1);
  });

  it("auto-detects SARIF and builds stable fingerprints", () => {
    const result = ingestProviderPayload({
      format: "auto",
      toolId: "semgrep",
      payload: {
        runs: [
          {
            results: [
              {
                ruleId: "javascript.lang.security.audit.xss",
                level: "warning",
                message: { text: "Possible XSS" },
              },
            ],
          },
        ],
      },
    });
    expect(result.format).toBe("sarif");
    const fp = findingFingerprint(result.seeds[0]!);
    expect(fp).toContain("semgrep");
    expect(fp).toContain("possible xss");
  });

  it("parses Gitleaks JSON array", () => {
    const result = ingestProviderPayload({
      format: "gitleaks",
      payload: [
        {
          RuleID: "aws-access-key",
          Description: "AWS Access Key",
          File: "config.env",
          StartLine: 12,
        },
      ],
    });
    expect(result.toolId).toBe("gitleaks");
    expect(result.parsedCount).toBe(1);
    expect(result.seeds[0]?.severity).toBe("high");
    expect(result.seeds[0]?.location).toContain("config.env");
  });

  it("parses MobSF JSON report", () => {
    const result = ingestProviderPayload({
      format: "mobsf",
      payload: {
        app_name: "Banking",
        package_name: "com.demo.bank",
        security_score: 35,
        manifest_analysis: {
          high: [
            {
              title: "Clear text traffic",
              severity: "high",
              description: "android:usesCleartextTraffic is true",
              file: "AndroidManifest.xml",
            },
          ],
        },
      },
    });
    expect(result.toolId).toBe("mobsf");
    expect(result.parsedCount).toBeGreaterThanOrEqual(1);
    expect(result.seeds.some((s) => s.providerTool === "mobsf")).toBe(true);
  });
});
