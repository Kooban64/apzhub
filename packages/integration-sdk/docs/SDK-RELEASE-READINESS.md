# Integration SDK — Release Readiness

> **Milestone:** OSS-100-10  
> **Package:** `@apzhub/integration-sdk` **0.9.0**  
> **Date:** 2026-07-12  
> **Source:** [sdk-v1-audit-notes.md](../../../docs/architecture/sdk-v1-audit-notes.md)  
> **Companion:** [SDK-V1-CERTIFICATION.md](./SDK-V1-CERTIFICATION.md)

---

## Purpose

Release readiness determination for owner-governed promotion of `@apzhub/integration-sdk` to **v1.0.0**. This document does **not** perform the version bump.

---

## Exit criteria mapping

| Programme language                  | Exit criteria option                          | Applied                                                                 |
| ----------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| Not ready                           | **NOT READY**                                 | No                                                                      |
| Release Candidate (pre-cert)        | **RELEASE CANDIDATE**                         | Alternate label only if owner rejects PRODUCTION READY without 1.0 bump |
| `PRODUCTION_READY_WITH_LIMITATIONS` | **PRODUCTION READY** (documented limitations) | **Yes**                                                                 |

---

## Readiness checklist

| Area                                                       | Status                               |
| ---------------------------------------------------------- | ------------------------------------ |
| Architecture / dependency boundaries                       | **PASS**                             |
| Public API audit (no must-hide blockers)                   | **PASS**                             |
| Security controls                                          | **PASS** — blockers **none**         |
| Documentation inventory (32 package docs; README links OK) | **PASS**                             |
| Quality (typecheck / lint / tests)                         | **PASS**                             |
| Plane re-cert (15 caps, 0 architecture fails)              | **PASS**                             |
| Zammad re-cert (11 caps, 0 architecture fails)             | **PASS**                             |
| Hard blockers                                              | **None**                             |
| Package version bump to 1.0.0                              | **Pending owner** — remain **0.9.0** |

---

## Verified quality numbers

| Suite                                                   | Result   |
| ------------------------------------------------------- | -------- |
| SDK typecheck / lint                                    | **PASS** |
| SDK package tests                                       | **185**  |
| sdk-v1 re-cert                                          | **7**    |
| Combined (SDK + sdk-v1)                                 | **192**  |
| Plane + Zammad                                          | **223**  |
| Wave1/2 + support-vertical + platform-service-contracts | **105**  |

---

## Documented limitations

1. No Event Bus publish
2. No webhook HTTP ingress
3. No provisioning / upgrade orchestration
4. No durable checkpoint / dedup / replay stores
5. PlaceholderVault only (not production Vault)
6. Large root barrel — prefer subpath imports
7. Version remains **0.9.0** until owner promotes

---

## Recommendation

| Field                       | Value                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Technical outcome**       | `PRODUCTION_READY_WITH_LIMITATIONS`                                                                                   |
| **Package action now**      | **Remain 0.9.0** — do not auto-promote                                                                                |
| **Owner action**            | Accept limitations + freeze public API, then bump to **1.0.0**                                                        |
| **Recommendation sentence** | **Promote to `@apzhub/integration-sdk` v1.0.0 after owner accepts limitations and API freeze — do not auto-promote.** |

If the owner prefers stricter wording: keep maturity labelled **Release Candidate** until the **1.0.0** bump; technical certification still stands as `PRODUCTION_READY_WITH_LIMITATIONS`.

---

## Stop condition

Stop before version bump, Event Bus, webhook ingress, provisioning, or next domain adapter unless the owner explicitly authorises the next milestone.
