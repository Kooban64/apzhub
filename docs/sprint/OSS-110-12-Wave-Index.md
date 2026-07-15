# OSS-110-12 Artefact Index

**Milestone:** OSS-110-12 — Support Vertical Slice Certification & Closeout  
**Date:** 2026-07-11  
**Status:** CERTIFIED_WITH_LIMITATIONS

---

## Scripts

| Artefact | Path |
|----------|------|
| Dependency audit script | `scripts/support-vertical-dependency-audit.mjs` |

---

## Test files

| Artefact | Path | Tests |
|----------|------|-------|
| Full stack E2E | `testing/support-vertical/support-vertical-stack.e2e.test.ts` | 17 |
| Performance baseline | `testing/support-vertical/support-vertical-performance.baseline.test.ts` | 2 |
| Certification assertions | `testing/support-vertical/support-vertical-certification.test.ts` | 59 |
| HTTP API tests (OSS-110-11) | `apps/web/lib/api/v1/platform-api.support.v1.test.ts` | 48 |
| Platform service tests (OSS-110-10) | `packages/platform-services/src/support-platform-services.test.ts` | 20 |

---

## Documentation

| Artefact | Path |
|----------|------|
| Master certification report | `docs/architecture/SUPPORT-VERTICAL-CERTIFICATION.md` |
| Architecture audit | `docs/sprint/OSS-110-12-architecture-audit.md` |
| Support API certification | `docs/sprint/OSS-110-12-Support-API-Certification.md` |
| Performance baseline | `docs/sprint/OSS-110-12-performance-baseline.md` |
| Test summary | `docs/sprint/OSS-110-12-test-summary.md` |
| Dependency audit (Markdown) | `docs/sprint/OSS-110-12-dependency-audit.md` |
| Dependency audit (JSON) | `docs/sprint/OSS-110-12-dependency-audit.json` |
| Completion report | `docs/sprint/OSS-110-12-completion-report.md` |
| This index | `docs/sprint/OSS-110-12-Wave-Index.md` |

---

## Configuration

| Artefact | Path | Change |
|----------|------|--------|
| Vitest config | `vitest.config.ts` | Added `testing/support-vertical/**/*.test.{ts,tsx}` to include |

---

## Source (already certified in OSS-110-11, referenced here)

| Artefact | Path |
|----------|------|
| Support routes (21 files) | `apps/web/app/api/v1/support-*/` |
| Support handler | `apps/web/lib/api/v1/handlers/support.ts` |
| Support schemas | `apps/web/lib/api/v1/schemas/support.ts` |
| Zammad providers (11 files) | `packages/platform-services/src/providers/zammad/` |
| Support service impls | `packages/platform-services/src/services/support-service-impls.ts` |
| Support mapping helpers | `packages/platform-services/src/services/support-mapping-helpers.ts` |

---

## Upstream certifications

| Milestone | Report | Status |
|-----------|--------|--------|
| OSS-102-08 — Wave 2 (Zammad adapter) | `docs/sprint/OSS-102-08-Wave2-Certification.md` | CERTIFIED_WITH_LIMITATIONS |
| OSS-110-11 — Support HTTP API + Platform Services | `docs/sprint/OSS-110-11-completion-report.md` | Complete |
| OSS-110-12 — Support Vertical Closeout | `docs/architecture/SUPPORT-VERTICAL-CERTIFICATION.md` | **CERTIFIED_WITH_LIMITATIONS** |

---

## Recommended next milestone

> **OSS-110-13 — Support Module UI (Frontend Slice)**
>
> Prerequisite: OSS-110-12 CERTIFIED. Owner approval required.
