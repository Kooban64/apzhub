import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  isPathUnderGreenboneRoot,
  listLatestGreenboneArtefacts,
  readGreenboneArtefact,
} from "./greenbone-artefact";

describe("greenbone-artefact", () => {
  const prevRoot = process.env.APZTOOLS_ROOT;
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "apztools-gb-"));
    process.env.APZTOOLS_ROOT = root;
    const out = join(root, "security", "out", "greenbone", "lovebloom");
    mkdirSync(out, { recursive: true });
    writeFileSync(
      join(out, "greenbone-findings.json"),
      JSON.stringify({
        findings: [{ name: "OpenSSH", severity: "high", host: "10.0.0.1" }],
      }),
    );
    writeFileSync(
      join(out, "extra-findings.json"),
      JSON.stringify({ findings: [{ name: "TLS", severity: "medium" }] }),
    );
    writeFileSync(join(out, "ignore.json"), JSON.stringify({ findings: [] }));
  });

  afterEach(() => {
    if (prevRoot === undefined) delete process.env.APZTOOLS_ROOT;
    else process.env.APZTOOLS_ROOT = prevRoot;
  });

  it("lists findings artefacts newest-first and skips non-matching names", () => {
    const listed = listLatestGreenboneArtefacts(10);
    expect(listed.length).toBe(2);
    expect(
      listed.every(
        (a) =>
          a.path.endsWith("-findings.json") ||
          a.path.endsWith("greenbone-findings.json"),
      ),
    ).toBe(true);
    expect(listed.every((a) => typeof a.mtime === "string")).toBe(true);
  });

  it("reads JSON only under the greenbone out root", () => {
    const listed = listLatestGreenboneArtefacts(1);
    const payload = readGreenboneArtefact(listed[0]!.path) as {
      findings: unknown[];
    };
    expect(Array.isArray(payload.findings)).toBe(true);

    expect(() =>
      readGreenboneArtefact(join(root, "security", "out", "..", "secrets.json")),
    ).toThrow(/under security\/out\/greenbone/i);
  });

  it("rejects path traversal outside root", () => {
    const gbRoot = join(root, "security", "out", "greenbone");
    expect(isPathUnderGreenboneRoot(join(gbRoot, "a.json"), gbRoot)).toBe(true);
    expect(isPathUnderGreenboneRoot(join(gbRoot, "..", "escape.json"), gbRoot)).toBe(
      false,
    );
  });
});
