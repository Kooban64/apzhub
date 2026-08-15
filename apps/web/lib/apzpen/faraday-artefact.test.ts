import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  isPathUnderFaradayRoot,
  listLatestFaradayArtefacts,
  readFaradayArtefact,
} from "./faraday-artefact";

describe("faraday-artefact", () => {
  const prevRoot = process.env.APZTOOLS_ROOT;
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "apztools-fd-"));
    process.env.APZTOOLS_ROOT = root;
    const out = join(root, "security", "out", "faraday", "engagement-a");
    mkdirSync(out, { recursive: true });
    writeFileSync(
      join(out, "faraday-findings.json"),
      JSON.stringify({
        findings: [{ name: "XSS", severity: "high", host: "10.0.0.1" }],
      }),
    );
    writeFileSync(
      join(out, "extra-findings.json"),
      JSON.stringify({ findings: [{ name: "SQLi", severity: "critical" }] }),
    );
    writeFileSync(
      join(out, "vulns.json"),
      JSON.stringify({
        vulns: [{ name: "OpenSSH", severity: "medium", target: "10.0.0.2" }],
      }),
    );
    writeFileSync(join(out, "ignore.json"), JSON.stringify({ vulns: [] }));
  });

  afterEach(() => {
    if (prevRoot === undefined) delete process.env.APZTOOLS_ROOT;
    else process.env.APZTOOLS_ROOT = prevRoot;
  });

  it("lists findings artefacts newest-first and skips non-matching names", () => {
    const listed = listLatestFaradayArtefacts(10);
    expect(listed.length).toBe(3);
    expect(
      listed.every(
        (a) =>
          a.path.endsWith("-findings.json") ||
          a.path.endsWith("faraday-findings.json") ||
          a.path.endsWith("vulns.json"),
      ),
    ).toBe(true);
    expect(listed.every((a) => typeof a.mtime === "string")).toBe(true);
  });

  it("reads JSON only under the faraday out root", () => {
    const listed = listLatestFaradayArtefacts(1);
    const payload = readFaradayArtefact(listed[0]!.path) as {
      findings?: unknown[];
      vulns?: unknown[];
    };
    expect(Array.isArray(payload.findings) || Array.isArray(payload.vulns)).toBe(true);

    expect(() =>
      readFaradayArtefact(join(root, "security", "out", "..", "secrets.json")),
    ).toThrow(/under security\/out\/faraday/i);
  });

  it("rejects path traversal outside root", () => {
    const fdRoot = join(root, "security", "out", "faraday");
    expect(isPathUnderFaradayRoot(join(fdRoot, "a.json"), fdRoot)).toBe(true);
    expect(isPathUnderFaradayRoot(join(fdRoot, "..", "escape.json"), fdRoot)).toBe(
      false,
    );
  });
});
