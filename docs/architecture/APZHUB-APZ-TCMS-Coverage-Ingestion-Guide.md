# APZ TCMS — Coverage Ingestion Guide

**Milestone:** APZTCMS-007

---

## Principle

APZ TCMS **ingests coverage summaries** supplied by external tools. It does **not** run a code-coverage engine (Istanbul, c8, nyc, etc.).

---

## Model

```ts
CanonicalAutomationCoverageSummary {
  covered?: number;
  total?: number;
  percentage?: number;
  kind?: string;          // e.g. lines | statements | branches
  raw?: Record<string, unknown>;
}
```

Persisted as `testing_automation_coverage_snapshot` linked to import/execution.

---

## Service

`AutomationCoverageService`:

- ingest summary from an import
- aggregate counts for certification/readiness **inputs**
- never invent coverage numbers

---

## Related

[Automation Ingestion Architecture](./APZHUB-APZ-TCMS-Automation-Ingestion-Architecture.md)
