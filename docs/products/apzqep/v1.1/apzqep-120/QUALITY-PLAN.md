# Quality Plan — APZQEP-120

Aligns with APZHUB Engineering Standard, Lifecycle Standard, and foundation doc **015**.

---

## Test pyramid (programme)

| Layer             | Use                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Unit              | Domain rules, ACL filters, hash, state transitions, mappers                                      |
| Component/package | Evidence/TE/search providers in isolation                                                        |
| Integration       | PG, storage, outbox worker, bus, ENF                                                             |
| Contract          | OpenAPI (S15), event.yaml (S07), search provider contracts                                       |
| Security          | Tenant isolation, upload abuse, deny paths (every ACL slice + S19)                               |
| Perf              | Baselines S18 only unless slice claims latency AC                                                |
| E2E Playwright    | Smoke for flagged runner (S16) and shell command registration (S14) — not full suite every slice |

---

## Slice certification (minimum)

Every slice:

1. Targeted unit + integration for changed paths
2. Lint/types/build for affected packages
3. Security tests if ACL/tenant/upload/authz touched
4. Docs + evidence update
5. Clean tree; releasable

---

## When to expand regression

| Trigger                                      | Regression level                                    |
| -------------------------------------------- | --------------------------------------------------- |
| Single-package behaviour, no shared contract | Targeted package tests                              |
| Shared authz/search/event contracts          | Package + consumer contract tests                   |
| Persistence/migration (S03–S06)              | Migration + Evidence package cert + TE attach smoke |
| Worker/outbox (S08–S09)                      | TE integration + idempotency suite                  |
| Search ACL (S12)                             | Search + Evidence/TE isolation                      |
| Before R2/R3/R4 release                      | Cross-product APZQEP smoke (Evidence+TE+health)     |
| S19 / S20                                    | Full APZQEP-120 security + programme checklist      |

Do **not** require full-repo Playwright on every small ACL unit change unless shell routes change.

---

## Defect classification (for implementation phase)

| Class          | Example                       | Gate                |
| -------------- | ----------------------------- | ------------------- |
| P0 Security    | Cross-tenant leak             | Block release       |
| P0 Data        | Evidence loss/corruption      | Block release       |
| P1 Operability | Worker stuck without DLQ path | Block affected band |
| P2 Contract    | OpenAPI drift                 | Block S15/S20       |
| P3 Docs        | Stale limitation text         | Fix before cert     |

---

## Evidence retention (QA)

Per-slice: test command outputs, CERT limitation updates, migration dry-run logs under `docs/operations/evidence/apzqep/` (implementation programmes).

---

## Release readiness

See [RELEASE-STRATEGY.md](./RELEASE-STRATEGY.md) and [ACCEPTANCE-AND-CERTIFICATION-GATES.md](./ACCEPTANCE-AND-CERTIFICATION-GATES.md).
