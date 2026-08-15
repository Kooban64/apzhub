import { describe, expect, it } from "vitest";

import {
  buildGmpAuthenticateCommand,
  parseGmpResultsXml,
  parseGmpVersionXml,
  resolveGmpConfigFromEnv,
  toGreenboneSimplifiedArtefact,
} from "./gmp-client.js";

describe("greenbone gmp-client (SPR-FULL-002-B)", () => {
  it("builds authenticate XML without leaking raw angle brackets", () => {
    const xml = buildGmpAuthenticateCommand("admin", 'p<a>&"');
    expect(xml).toContain("<username>admin</username>");
    expect(xml).toContain("&lt;");
    expect(xml).toContain("&amp;");
  });

  it("parses get_results XML into finding seeds", () => {
    const xml = `
      <get_results_response>
        <result id="1"><name>SSL Weak Cipher</name><threat>High</threat><host>10.0.0.1</host><description>Old TLS</description></result>
        <result id="2"><name>Info Banner</name><threat>Log</threat></result>
      </get_results_response>`;
    const seeds = parseGmpResultsXml(xml);
    expect(seeds).toHaveLength(2);
    expect(seeds[0]?.title).toBe("SSL Weak Cipher");
    expect(seeds[0]?.severity).toBe("high");
    expect(seeds[0]?.host).toBe("10.0.0.1");
  });

  it("parses version and resolves env config", () => {
    expect(
      parseGmpVersionXml(
        `<get_version_response><version>22.4</version></get_version_response>`,
      ).version,
    ).toBe("22.4");
    expect(resolveGmpConfigFromEnv({})).toBeNull();
    expect(
      resolveGmpConfigFromEnv({
        GREENBONE_GMP_HOST: "127.0.0.1",
        GREENBONE_GMP_USER: "admin",
        GREENBONE_GMP_PASSWORD: "secret",
      })?.port,
    ).toBe(9390);
  });

  it("wraps seeds as simplified artefact", () => {
    const artefact = toGreenboneSimplifiedArtefact([
      { title: "x", severity: "medium" },
    ]);
    expect(artefact.tool).toBe("greenbone");
    expect(artefact.findings).toHaveLength(1);
  });
});
