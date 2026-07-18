# Integration SDK v1.0 Certification Report

> **Milestone:** OSS-100-10 — Integration SDK v1.0 Certification & Release Readiness  
> **Package:** `@apzhub/integration-sdk` **1.0.0** (promoted OSS-100-11; this doc originated at 0.9.0 certification)  
> **Date:** 2026-07-12  
> **Authority:** [sdk-v1-audit-notes.md](../../../docs/architecture/sdk-v1-audit-notes.md) · [026](../../../docs/026-integration-sdk-adapter-framework-integration-manifest-specification.md)  
> **Status:** Certified — **PRODUCTION_READY_WITH_LIMITATIONS**

---

## Purpose

Master certification report for `@apzhub/integration-sdk` ahead of an owner-governed **v1.0.0** promotion. This document promotes governance findings from the OSS-100-10 audit into a formal architecture, quality, adapter, and verdict record. It does **not** publish package **1.0.0**.

---

## Outcome

| Field                     | Value                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Programme outcome**     | `PRODUCTION_READY_WITH_LIMITATIONS`                                                                                      |
| **Exit criteria mapping** | **PRODUCTION READY** (with documented limitations)                                                                       |
| **Package version**       | **0.9.0** — remain until owner promotes                                                                                  |
| **Hard blockers**         | **None**                                                                                                                 |
| **Recommendation**        | **Promote to `@apzhub/integration-sdk` v1.0.0** after owner accepts limitations and API freeze — **do not auto-promote** |

Alternative wording: if the owner rejects “PRODUCTION READY” without a **1.0.0** bump first, package maturity labelling may remain **Release Candidate** until the version bump — the technical certification outcome remains `PRODUCTION_READY_WITH_LIMITATIONS`.

---

## Scope

**In scope**

- Architecture / dependency boundary audit
- Public API classification
- Security controls review
- Documentation inventory
- Quality gates (typecheck, lint, tests)
- Plane / Zammad reference adapter re-certification via SDK harness
- Release readiness determination

**Out of scope (documented limitations, not defects)**

- Platform Event Bus publish
- Webhook HTTP ingress / route handlers
- Provisioning / upgrade orchestration
- Durable checkpoint / dedup / replay stores (production SoR)
- Production Vault client (`PlaceholderVaultSecretProvider` only)
- Package version bump to **1.0.0**

---

## Architecture certification

### SDK package isolation

Non-test sources under `packages/integration-sdk/src` do **not** import `@apzhub/integration-plane`, `@apzhub/integration-zammad`, `@apzhub/platform-services`, or live `EntityMappingStore` usage. Mentions of `EntityMappingStore` are documentation / harness rules / certification subject flags only.

### Boundary tests

| Suite                                             | Result       |
| ------------------------------------------------- | ------------ |
| Events boundary (`src/events/boundary.test.ts`)   | **3/3 PASS** |
| Harness boundary (`src/harness/boundary.test.ts`) | **1/1 PASS** |

Boundary suites confirm: no plane/zammad/platform-services/EntityMappingStore imports; no webhook ingress / Event Bus / scheduler; no secret field keys in diagnostics/metrics sources.

### Accidental platform concerns in SDK

| Concern                      | Finding                                      |
| ---------------------------- | -------------------------------------------- |
| Event Bus publish            | **Absent**                                   |
| Webhook HTTP ingress         | **Absent** — contracts + pipelines only      |
| Provisioning runtime         | **Absent** — error category string only      |
| Durable checkpoint/dedup SoR | **Absent** — `InMemory*` test utilities only |

### Exports map (16 subpaths)

```text
. | ./client | ./adapter | ./diagnostics | ./lifecycle | ./errors
./auth | ./connection | ./health | ./version | ./resilience
./observability | ./transport | ./mapping | ./events | ./harness
```

**Verdict:** Architecture boundaries **PASS**. No certification blockers.

---

## Quality certification

| Check                                                         | Result       | Numbers                           |
| ------------------------------------------------------------- | ------------ | --------------------------------- |
| `pnpm --filter @apzhub/integration-sdk typecheck`             | **PASS**     | exit 0                            |
| `pnpm --filter @apzhub/integration-sdk lint`                  | **PASS**     | exit 0                            |
| `vitest run packages/integration-sdk`                         | **PASS**     | **13** files, **185** tests       |
| `vitest run integrations/plane integrations/zammad`           | **PASS**     | **25** files, **223** tests       |
| Wave1 + Wave2 + support-vertical + platform-service-contracts | **PASS**     | **9** files, **105** tests        |
| `packages/platform-services` (excl. Postgres integration)     | **PASS**     | **10** files, **129** tests       |
| Postgres entity-mapping integration                           | **ENV FAIL** | Needs env — **not an SDK defect** |
| events + harness unit tests                                   | **PASS**     | **4** files, **61** tests         |
| `testing/sdk-v1` re-certification                             | **PASS**     | **1** file, **7** tests           |

**Combined SDK-relevant:** typecheck ✅ lint ✅ **185** SDK + **7** sdk-v1 = **192** when including `testing/sdk-v1` with the SDK package; Plane+Zammad **223**; Wave1/2 + support-vertical + platform-service-contracts **105**.

Coverage note: scoped coverage for `src/events` + `src/harness` under monorepo global thresholds was inconclusive; suite pass rates are authoritative. Coverage is **not blocking**.

**Verdict:** Quality gates **PASS**.

---

## Reference adapter certification

| Check                                                | Result                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| Plane harness boot/cleanup                           | **PASS**                                                                   |
| `certifyPlaneWithSdkHarness`                         | **PASS** — overall ≠ fail; **15** capabilities; Architecture fails = **0** |
| Zammad harness boot/cleanup                          | **PASS**                                                                   |
| `certifyZammadWithSdkHarness`                        | **PASS** — overall ≠ fail; **11** capabilities; Architecture fails = **0** |
| `AdapterBoundaryValidator` clean / forbidden samples | **PASS**                                                                   |
| `AdapterCompliance` on scaffold                      | **PASS**                                                                   |
| `AdapterCertification` on Plane/Zammad metadata      | **PASS**                                                                   |
| Version alignment                                    | **PASS** — SDK **0.9.0**; adapters **0.6.0**                               |

Re-cert suite: `testing/sdk-v1/integration-sdk-v1-recertification.test.ts` (**7** tests).

**Verdict:** Reference adapters **re-certified** via SDK harness.

---

## Companion certification documents

| Document           | Path                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Public API audit   | [SDK-API-AUDIT.md](./SDK-API-AUDIT.md)                                                                              |
| Security audit     | [SDK-SECURITY-AUDIT.md](./SDK-SECURITY-AUDIT.md)                                                                    |
| Release readiness  | [SDK-RELEASE-READINESS.md](./SDK-RELEASE-READINESS.md)                                                              |
| Public API guide   | [SDK-PUBLIC-API.md](./SDK-PUBLIC-API.md)                                                                            |
| Compatibility      | [SDK-COMPATIBILITY.md](./SDK-COMPATIBILITY.md)                                                                      |
| Architecture index | [APZHUB-Integration-SDK-V1-Certification.md](../../../docs/architecture/APZHUB-Integration-SDK-V1-Certification.md) |
| Completion report  | [OSS-100-10-completion-report.md](../../../docs/sprint/OSS-100-10-completion-report.md)                             |
| ADR                | [ADR-0058](../../../docs/adr/ADR-0058-integration-sdk-v1-readiness-limitations.md)                                  |

---

## Limitations (accepted)

1. No platform **Event Bus** publish from Integration SDK
2. No webhook **HTTP ingress** / route handlers
3. No **provisioning** / upgrade orchestration (deferred; see backlog 100-11+)
4. No durable **checkpoint / dedup / replay** stores (in-memory test utilities only)
5. No production Vault — `PlaceholderVaultSecretProvider` only
6. Large root barrel (~581 symbols) — prefer **subpath imports** for new consumers
7. Package remains **0.9.0** until owner approves **1.0.0** API freeze

---

## Blockers

| ID  | Severity  | Item                                                                        | Disposition      |
| --- | --------- | --------------------------------------------------------------------------- | ---------------- |
| B0  | —         | Hard blockers                                                               | **None**         |
| N1  | Info      | Postgres mapping integration needs env                                      | Out of SDK scope |
| N2  | Info      | Scoped coverage tooling inconclusive                                        | Non-blocking     |
| R1  | Recommend | Document or relocate `PlaneIdentityMapper` / `ZammadIdentityMapper` pre-1.0 | Non-blocking     |
| R2  | Recommend | Publish stable API matrix before `1.0.0` bump                               | Owner gate       |
| R3  | Recommend | Clarify historical `v0.x.0` headers in per-milestone docs                   | Optional polish  |

---

## Final verdict

**`PRODUCTION_READY_WITH_LIMITATIONS`** — quality, architecture, security, and Plane/Zammad harness re-certification pass; known absences are explicit and acceptable.

**Recommendation:** Promote to `@apzhub/integration-sdk` **v1.0.0** after owner accepts limitations and freezes the public API. **Remain at 0.9.0 until that approval.** Do not auto-promote.
