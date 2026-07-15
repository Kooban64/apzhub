# Integration SDK — Compatibility & Migration

> **Milestone:** OSS-100-10  
> **Package:** `@apzhub/integration-sdk` **0.9.0**  
> **Date:** 2026-07-12  
> **Source:** [sdk-v1-audit-notes.md](../../../docs/architecture/sdk-v1-audit-notes.md)  
> **Companion:** [SDK-V1-CERTIFICATION.md](./SDK-V1-CERTIFICATION.md) · [SDK-PUBLIC-API.md](./SDK-PUBLIC-API.md)

---

## Purpose

Compatibility matrix, migration notes, and interoperability rules for `@apzhub/integration-sdk` relative to reference adapters and platform packages.

---

## Version matrix

| Component                                  | Version    | Notes                                   |
| ------------------------------------------ | ---------- | --------------------------------------- |
| `@apzhub/integration-sdk` (`package.json`) | **0.9.0**  | Remain until owner promotes             |
| `INTEGRATION_SDK_VERSION` constant         | **0.9.0**  | **Matches** package version             |
| `@apzhub/integration-plane`                | **0.6.0**  | `workspace:*` SDK dependency            |
| `@apzhub/integration-zammad`               | **0.6.0**  | `workspace:*` SDK dependency            |
| Promote to **1.0.0**                       | Owner gate | Semver 1.0 commits to stable public API |

---

## Interoperability

| Relationship                                 | Rule                                                                |
| -------------------------------------------- | ------------------------------------------------------------------- |
| SDK → Plane / Zammad                         | **Forbidden** — SDK must not import vendor adapters                 |
| SDK → platform-services / EntityMappingStore | **Forbidden** in production SDK sources                             |
| Adapter → SDK                                | Required — adapters consume SDK subpaths                            |
| Adapter ops APIs vs SDK harness              | Complementary (ADR-0057) — harness does not replace operations APIs |
| SDK mapping vs EntityMappingStore            | Distinct layers — SDK mapping ≠ durable global ID SoR (ADR-0049)    |
| Events pipelines vs Event Bus                | SDK contracts/pipelines only; platform owns bus (future)            |

---

## Migration / promotion notes

### Remaining at 0.9.0 (current)

No consumer migration required. Certification is governance-only; public APIs are unchanged by OSS-100-10 documentation closeout.

### Promoting to 1.0.0 (owner-approved future)

When the owner authorises promotion:

1. Accept documented limitations (Event Bus, ingress, provisioning, durable stores, PlaceholderVault, large root barrel).
2. Freeze the public API (prefer publishing a stable API matrix; prefer subpath imports).
3. Bump `@apzhub/integration-sdk` to **1.0.0** and align `INTEGRATION_SDK_VERSION`.
4. Re-run `testing/sdk-v1/integration-sdk-v1-recertification.test.ts` and Plane/Zammad suites.
5. Do **not** treat 1.0.0 as implying Event Bus, ingress, or provisioning delivery.

### Optional pre-1.0 polish (non-blocking)

| Item                                           | Guidance                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------- |
| `PlaneIdentityMapper` / `ZammadIdentityMapper` | Keep as stable helpers or relocate to vendor packages                     |
| Historical milestone doc headers (`v0.6.0` …)  | Interpret as as-shipped-at-milestone; optional “cumulative in 0.9.0” note |
| Root barrel                                    | Prefer subpaths for new consumers                                         |

---

## Compatibility verification (OSS-100-10)

| Check                                         | Result                                   |
| --------------------------------------------- | ---------------------------------------- |
| Version alignment (SDK 0.9.0; adapters 0.6.0) | **PASS**                                 |
| Plane certify via SDK harness                 | **PASS** — 15 caps, 0 architecture fails |
| Zammad certify via SDK harness                | **PASS** — 11 caps, 0 architecture fails |
| Boundary / compliance on harness subjects     | **PASS**                                 |

---

## Verdict

Compatibility **PASS**. SDK and reference adapters remain interoperable at current versions. Promotion to **1.0.0** is an owner-governed semver commitment, not a technical migration forced by this certification.
