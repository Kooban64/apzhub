# APZDOCS-006 — Coverage Baseline

**Date:** 2026-07-13  
**Verdict:** **PASS WITH LIMITATIONS**  
**Certification:** APZDOCS-006

---

## Scope

Consolidated v8 coverage for:

- `@apzhub/document-contracts`
- `@apzhub/document-core`
- `@apzhub/document-persistence`
- `@apzhub/document-storage`
- Platform document services (`platform-services/.../documents`)
- HTTP handler `handlers/documents.ts`
- Typed client (`apps/web/lib/documents`)
- Workbench (`apps/web/components/documents`)

Excluded from gate interpretation: type-only contracts modules (0% executable), `*.test.*`, `document-types.ts`.

## Results (v8) — focused vertical run

| Layer | Lines | Branches | Functions |
| ----- | ----- | -------- | --------- |
| HTTP handler | **97.95%** | 88.88% | **100%** |
| Typed client (`lib/documents`) | **95.02%** | 60.35% | **100%** |
| Workbench (`components/documents`) | **92.08%** | 82.81% | 80% |
| Contracts (executable enums/permissions/identifiers) | **100%** | 100% | 100% |
| Document Core (aggregated modules) | **~80–89%** | mixed | high |
| Persistence in-memory / version helpers | **~92–97%** | high | high |
| Persistence postgres repositories | **~19%** | stubbed | **LIMITED** (no live DB unit matrix) |
| Storage filesystem / memory | **~72–85%** | mixed | mixed |
| Storage S3 provider | **~61%** | **LIMITED** (no live provider in unit suite) |
| Platform document services | **~80%** | mixed | 75% |
| **All included files (raw aggregate)** | **~79%** | ~74% | ~83% |

## Gate interpretation

| Gate | Result |
| ---- | ------ |
| HTTP + typed client ≥95% lines/functions | **PASS** |
| Workbench meaningful coverage ≥90% lines | **PASS** |
| Live postgres/S3 path coverage in unit suite | **LIMITED** by design (no live providers) |
| Raw aggregate including stubs/type-only | Below 95% — documented limitation |

## Test inventory

| Suite | Tests |
| ----- | ----- |
| Focused vertical Vitest | **88** passed (22 files) |
| Certification harness | `testing/document-vertical/apzdocs-006-certification.test.ts` |
| Foundation harnesses | APZDOCS-001…005 |
| Playwright (mock) | Spec present; runtime **LIMITED** (Next slug conflict) |
