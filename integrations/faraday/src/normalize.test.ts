import { describe, expect, it } from "vitest";
import {
  FARADAY_INTEGRATION_VERSION,
  normalizeFaradayPayload,
  probeFaradayHealth,
} from "./index";

describe("@apzhub/integration-faraday", () => {
  it("exposes integration version", () => {
    expect(FARADAY_INTEGRATION_VERSION).toBe("0.1.0");
  });

  it("normalizes Faraday vulns JSON", () => {
    const seeds = normalizeFaradayPayload({
      vulns: [{ name: "XSS", severity: "medium", target: "https://app.example" }],
    });
    expect(seeds).toEqual([
      {
        title: "XSS",
        severity: "medium",
        host: "https://app.example",
      },
    ]);
  });

  it("normalizes simplified findings array", () => {
    const seeds = normalizeFaradayPayload({
      findings: [{ level: "high", message: "open port", host: "10.0.0.1" }],
    });
    expect(seeds[0]).toMatchObject({
      title: "open port",
      severity: "high",
      host: "10.0.0.1",
      message: "open port",
    });
  });

  it("reports planned when FARADAY_URL unset", async () => {
    const prev = process.env.FARADAY_URL;
    delete process.env.FARADAY_URL;
    try {
      const health = await probeFaradayHealth();
      expect(health.ok).toBe(false);
      expect(health.detail).toContain("compose not deployed");
    } finally {
      if (prev !== undefined) process.env.FARADAY_URL = prev;
    }
  });
});
