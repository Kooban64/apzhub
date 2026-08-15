import { describe, expect, it, vi } from "vitest";

import {
  buildFaradayVulnsPath,
  fetchFaradayVulns,
  resolveFaradayExportConfig,
  toFaradayArtefact,
} from "./export-client.js";

describe("faraday export-client (SPR-FULL-002-C)", () => {
  it("resolves config and vulns path", () => {
    expect(resolveFaradayExportConfig({})).toBeNull();
    const cfg = resolveFaradayExportConfig({
      FARADAY_URL: "http://127.0.0.1:5985/",
      FARADAY_API_TOKEN: "tok",
      FARADAY_WORKSPACE: "ws1",
    });
    expect(cfg?.baseUrl).toBe("http://127.0.0.1:5985");
    expect(buildFaradayVulnsPath(cfg!)).toBe("/_api/v3/ws/ws1/vulns");
  });

  it("fetches and normalizes vulns rows", async () => {
    const fetchFn = vi.fn(async () =>
      Response.json({
        rows: [{ name: "XSS", severity: "high", target: "app.local" }],
      }),
    ) as unknown as typeof fetch;
    const seeds = await fetchFaradayVulns(
      { baseUrl: "http://127.0.0.1:5985", token: "tok", workspace: "default" },
      fetchFn,
    );
    expect(seeds[0]?.title).toBe("XSS");
    expect(toFaradayArtefact(seeds).tool).toBe("faraday");
  });
});
