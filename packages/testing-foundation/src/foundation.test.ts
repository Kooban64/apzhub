import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  AutomationRegistry,
  CertificationRegistry,
  DomainRegistry,
  EvidenceRegistry,
  InMemoryRegistry,
  TESTING_FOUNDATION_VERSION,
  TestingRegistry,
  createTestingRegistries,
  createValidationOutcome,
  validateCertificationTransition,
  validateEnumMembership,
  validateExecutionStatusValue,
  validatePlatformId,
  validateRequiredString,
  validateRequirementInput,
  validateTestCaseInput,
  validateTestResultStatusValue,
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

describe("@apzhub/testing-foundation version", () => {
  it("exports version 0.1.0", () => {
    expect(TESTING_FOUNDATION_VERSION).toBe("0.1.0");
  });
});

describe("registries", () => {
  it("supports register/list/get/clear for TestingRegistry", () => {
    const registry = new TestingRegistry();
    registry.register({
      id: "testing.cases",
      kind: "testing",
      name: "Cases",
      status: "planned",
    });

    expect(registry.has("testing.cases")).toBe(true);
    expect(registry.get("testing.cases")?.name).toBe("Cases");
    expect(registry.list()).toHaveLength(1);
    expect(registry.size()).toBe(1);
    expect(registry.unregister("testing.cases")).toBe(true);
    expect(registry.list()).toHaveLength(0);
    registry.register({
      id: "testing.plans",
      kind: "testing",
      name: "Plans",
    });
    registry.clear();
    expect(registry.size()).toBe(0);
  });

  it("rejects empty capability ids", () => {
    const registry = new InMemoryRegistry();
    expect(() => registry.register({ id: "  ", name: "Invalid" })).toThrow(
      /id is required/,
    );
  });

  it("creates all placeholder registries", () => {
    const registries = createTestingRegistries();
    registries.certification.register({
      id: "certification.gates",
      kind: "certification",
      name: "Gates",
    });
    registries.evidence.register({
      id: "evidence.metadata",
      kind: "evidence",
      name: "Evidence",
    });
    registries.automation.register({
      id: "automation.ingest",
      kind: "automation",
      name: "Ingest",
    });
    registries.domain.register({
      id: "domain.core",
      kind: "domain",
      name: "Core",
      entityKinds: ["Requirement", "TestCase"],
    });

    expect(registries.testing).toBeInstanceOf(TestingRegistry);
    expect(registries.certification).toBeInstanceOf(CertificationRegistry);
    expect(registries.evidence).toBeInstanceOf(EvidenceRegistry);
    expect(registries.automation).toBeInstanceOf(AutomationRegistry);
    expect(registries.domain).toBeInstanceOf(DomainRegistry);
    expect(registries.domain.get("domain.core")?.entityKinds).toEqual([
      "Requirement",
      "TestCase",
    ]);
  });
});

describe("validation helpers", () => {
  it("validates required strings and platform ids", () => {
    expect(validateRequiredString("", "title")).toEqual({
      path: "title",
      message: "title is required",
    });
    expect(validateRequiredString("ok", "title")).toBeUndefined();
    expect(validatePlatformId("x", "id")?.message).toMatch(/invalid platform id/);
    expect(validatePlatformId("req_001", "id")).toBeUndefined();
    expect(createValidationOutcome([]).valid).toBe(true);
  });

  it("validates requirement input", () => {
    const valid = validateRequirementInput({
      tenantId: "tenant_1",
      key: "REQ-1",
      title: "Login required",
      priority: "high",
      riskIds: ["risk_001"],
    });
    expect(valid.valid).toBe(true);

    const invalid = validateRequirementInput({
      tenantId: "",
      key: "REQ-1",
      title: "Login",
      priority: "nope",
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.issues.length).toBeGreaterThan(0);

    const badRisk = validateRequirementInput({
      tenantId: "tenant_1",
      key: "REQ-1",
      title: "Login",
      priority: "low",
      riskIds: ["x"],
    });
    expect(badRisk.valid).toBe(false);
  });

  it("validates test case input including nested ids", () => {
    const valid = validateTestCaseInput({
      tenantId: "tenant_1",
      key: "TC-1",
      title: "Login",
      status: "ready",
      priority: "medium",
      suiteIds: ["suite_001"],
      requirementIds: ["req_001"],
      steps: [
        {
          id: "step_001",
          caseId: "case_001",
          ordinal: 1,
          action: "Open app",
          expectedResult: "Home visible",
        },
      ],
    });
    expect(valid.valid).toBe(true);

    const invalid = validateTestCaseInput({ title: "only" });
    expect(invalid.valid).toBe(false);

    const badStepId = validateTestCaseInput({
      tenantId: "tenant_1",
      key: "TC-1",
      title: "Login",
      status: "draft",
      priority: "low",
      suiteIds: ["x"],
      requirementIds: ["y"],
      steps: [
        {
          id: "z",
          caseId: "w",
          ordinal: 0,
          action: "a",
          expectedResult: "b",
        },
      ],
    });
    expect(badStepId.valid).toBe(false);
    expect(badStepId.issues.some((issue) => issue.path.includes("suiteIds"))).toBe(
      true,
    );
    expect(badStepId.issues.some((issue) => issue.path.includes("steps"))).toBe(true);
  });

  it("validates certification transitions and status enums", () => {
    expect(
      validateCertificationTransition({
        certificationRecordId: "cert_001",
        nextStatus: "qa_ready",
      }).valid,
    ).toBe(true);

    expect(
      validateCertificationTransition({
        certificationRecordId: "x",
        nextStatus: "certified",
      }).valid,
    ).toBe(false);

    expect(validateCertificationTransition({ nextStatus: "nope" }).valid).toBe(false);
    expect(validateExecutionStatusValue("in_progress").valid).toBe(true);
    expect(validateExecutionStatusValue("flying").valid).toBe(false);
    expect(validateTestResultStatusValue("pass").valid).toBe(true);
    expect(validateTestResultStatusValue("maybe").valid).toBe(false);
    expect(validateEnumMembership("a", "field", ["a", "b"] as const)).toBeUndefined();
    expect(validateEnumMembership("c", "field", ["a", "b"] as const)?.path).toBe(
      "field",
    );
  });
});

describe("boundary constraints", () => {
  it("does not import playwright, vitest runner deps, DB, or platform-services", () => {
    const forbidden = [
      "playwright",
      "junit",
      "allure",
      "puppeteer",
      "cypress",
      "drizzle",
      "postgres",
      "@apzhub/platform-services",
    ];
    const sourceFiles = collectSourceFiles(join(packageRoot, "src"));

    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(
          content,
          `${relative(packageRoot, file)} must not import ${token}`,
        ).not.toMatch(new RegExp(`from ["'].*${token.replace("/", "\\/")}.*["']`));
      }
      expect(content).not.toMatch(/from ["']vitest["']/);
    }
  });
});
