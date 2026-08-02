import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  EVIDENCE_APPLICATION_REGISTRY_PLACEHOLDER,
  EVIDENCE_PORT_IDS,
  EVIDENCE_PERMISSIONS,
  EVIDENCE_PERSISTENCE_REGISTRY_PLACEHOLDER,
  EVIDENCE_REPOSITORY_IDS,
  PERSISTENCE_EVENT_NAMES,
  QEP_EVIDENCE_API_BASE_PATH,
  QEP_EVIDENCE_API_STATUS,
  QEP_EVIDENCE_APPLICATION_STATUS,
  QEP_EVIDENCE_DOMAIN_STATUS,
  QEP_EVIDENCE_INFRASTRUCTURE_STATUS,
  QEP_EVIDENCE_MODULE_ID,
  QEP_EVIDENCE_PRESENTATION_STATUS,
  QEP_EVIDENCE_PROGRAMME,
  QEP_EVIDENCE_VERSION,
  STORAGE_ADAPTER_SCAFFOLD,
  StoragePortAdapterSkeleton,
} from "./index";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(full));
      continue;
    }
    if (full.endsWith(".ts") && !full.endsWith(".test.ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("APZQEP-RELEASE-004 architecture boundaries", () => {
  it("exports programme and layer markers at RELEASE-004 production baseline", () => {
    expect(QEP_EVIDENCE_VERSION).toBe("1.0.0");
    expect(QEP_EVIDENCE_PROGRAMME).toBe(
      "APZQEP-RELEASE-004 — PRODUCTION BASELINE 1.0.0",
    );
    expect(QEP_EVIDENCE_DOMAIN_STATUS).toBe("implemented-eng-110b");
    expect(QEP_EVIDENCE_APPLICATION_STATUS).toBe("event-platform-s07");
    expect(QEP_EVIDENCE_INFRASTRUCTURE_STATUS).toBe("lifecycle-platform-s06");
    expect(QEP_EVIDENCE_MODULE_ID).toBe("qep-evidence");
    expect(QEP_EVIDENCE_API_BASE_PATH).toBe("/api/v1/qep/evidence");
    expect(QEP_EVIDENCE_API_STATUS).toBe("implemented-eng-110f");
    expect(QEP_EVIDENCE_PRESENTATION_STATUS).toBe("implemented-eng-110f");
    expect(STORAGE_ADAPTER_SCAFFOLD.technology).toBe("undecided");
    expect(STORAGE_ADAPTER_SCAFFOLD.skeleton).toBe(StoragePortAdapterSkeleton);
    expect(EVIDENCE_PORT_IDS).toContain("StoragePort");
    expect(EVIDENCE_PORT_IDS).toContain("EvidenceUnitOfWork");
    expect(EVIDENCE_REPOSITORY_IDS).toContain("EvidenceVersionRepository");
    expect(EVIDENCE_PERMISSIONS).toContain("qep.evidence.read");
    expect(EVIDENCE_PERSISTENCE_REGISTRY_PLACEHOLDER.activated).toBe(false);
    expect(EVIDENCE_APPLICATION_REGISTRY_PLACEHOLDER.activated).toBe(false);
    expect(PERSISTENCE_EVENT_NAMES.length).toBeGreaterThan(0);
  });

  it("has required layer directories including ports and registration", () => {
    for (const layer of [
      "domain",
      "domain/ports",
      "application",
      "application/ports",
      "infrastructure",
      "infrastructure/persistence",
      "infrastructure/storage",
      "infrastructure/registration",
      "shared",
      "api",
      "presentation",
    ]) {
      expect(existsSync(join(packageRoot, "src", layer)), layer).toBe(true);
    }
  });

  it("forbids persistence / framework / crypto imports in the domain layer", () => {
    const domainRoot = join(packageRoot, "src", "domain");
    const forbidden = [
      "drizzle",
      "postgres",
      '"pg"',
      "'pg'",
      "@aws-sdk",
      "minio",
      "@apzhub/config",
      "@apzhub/platform-services",
      "next/server",
      "next/",
      '"react"',
      "'react'",
      "react-dom",
      "node:fs",
      "fs/promises",
      "node:crypto",
      "createHash(",
      "CREATE TABLE",
      "../infrastructure",
      "../../infrastructure",
    ];
    const sqlish = /CREATE TABLE|INSERT INTO|SELECT \*/i;
    for (const file of collectSourceFiles(domainRoot)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(
          false,
        );
      }
      expect(sqlish.test(source), `${file} must not contain SQL`).toBe(false);
    }
  });

  it("forbids Next.js / React / SQL / provider SDK imports in the application layer", () => {
    const forbidden = [
      "next/server",
      "next/",
      '"react"',
      "'react'",
      "react-dom",
      "drizzle",
      "CREATE TABLE",
      "@aws-sdk",
      "minio",
      "node:fs",
    ];
    const appRoot = join(packageRoot, "src", "application");
    for (const file of collectSourceFiles(appRoot)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(
          false,
        );
      }
    }
  });

  it("storage adapter skeleton exposes contract methods but selects no technology", () => {
    const storage = readFileSync(
      join(packageRoot, "src", "infrastructure", "storage", "storage-port-adapter.ts"),
      "utf8",
    );
    expect(storage.includes("put(")).toBe(true);
    expect(storage.includes("get(")).toBe(true);
    expect(storage.includes("delete(")).toBe(true);
    expect(storage.includes("archive(")).toBe(true);
    expect(storage.includes("dispose(")).toBe(true);
    expect(storage.includes("PersistenceNotImplementedError")).toBe(true);
    expect(storage.includes('technology: "undecided"')).toBe(true);
    expect(storage.includes("@aws-sdk")).toBe(false);
    expect(storage.includes("minio")).toBe(false);
    expect(storage.includes("node:fs")).toBe(false);
  });

  it("Storage Platform isolates filesystem I/O to Local provider only", () => {
    const storageRoot = join(packageRoot, "src", "infrastructure", "storage");
    const localRoot = join(storageRoot, "providers", "local");
    const forbiddenOutsideLocal = ["node:fs", "fs/promises"];
    for (const file of collectSourceFiles(storageRoot)) {
      if (
        file.startsWith(localRoot) ||
        file.includes(`${join("providers", "local")}`)
      ) {
        continue;
      }
      const source = readFileSync(file, "utf8");
      for (const token of forbiddenOutsideLocal) {
        expect(
          source.includes(token),
          `${file} must not reference ${token} (Local provider only)`,
        ).toBe(false);
      }
      expect(source.includes("@aws-sdk")).toBe(false);
      expect(source.includes("minio")).toBe(false);
    }

    const platformManager = readFileSync(
      join(storageRoot, "platform", "evidence-storage-manager.ts"),
      "utf8",
    );
    expect(platformManager.includes("EvidenceStorageManager")).toBe(true);
    expect(platformManager.includes("createLocalEvidenceStorageProvider")).toBe(false);

    const localProvider = readFileSync(
      join(localRoot, "local-evidence-storage-provider.ts"),
      "utf8",
    );
    expect(localProvider.includes("node:fs")).toBe(true);
  });

  it("infrastructure persistence adapters contain no SQL or provider I/O", () => {
    const persistenceRoot = join(packageRoot, "src", "infrastructure", "persistence");
    const forbidden = [
      "CREATE TABLE",
      "INSERT INTO",
      "drizzle",
      '"pg"',
      "'pg'",
      "@aws-sdk",
      "minio",
      "node:fs",
      "fetch(",
    ];
    for (const file of collectSourceFiles(persistenceRoot)) {
      const source = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(source.includes(token), `${file} must not reference ${token}`).toBe(
          false,
        );
      }
    }
  });

  it("APZQEP-120-S05: drizzle is confined to infrastructure/postgres", () => {
    const infraRoot = join(packageRoot, "src", "infrastructure");
    const postgresRoot = join(infraRoot, "postgres");
    expect(existsSync(postgresRoot)).toBe(true);
    for (const file of collectSourceFiles(infraRoot)) {
      if (file.startsWith(postgresRoot)) continue;
      const source = readFileSync(file, "utf8");
      expect(
        source.includes("drizzle-orm") || source.includes('from "drizzle'),
        `${file} must not import drizzle (postgres adapters only)`,
      ).toBe(false);
    }
    const evidenceRepo = readFileSync(
      join(postgresRoot, "evidence-repository.ts"),
      "utf8",
    );
    expect(evidenceRepo.includes("createPostgresEvidenceRepository")).toBe(true);
    expect(evidenceRepo.includes("EvidenceRepository")).toBe(true);
  });

  it("APZQEP-120-S05: Catalogue Repository Port is EvidenceRepository (no duplicate port)", () => {
    expect(EVIDENCE_REPOSITORY_IDS).toContain("EvidenceRepository");
    expect(
      EVIDENCE_REPOSITORY_IDS.filter((id) => id.includes("Catalogue")).length,
    ).toBe(0);
  });
});
