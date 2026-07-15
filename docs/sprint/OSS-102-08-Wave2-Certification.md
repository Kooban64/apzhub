# OSS-102-08 — Wave 2 Certification Report

**Status:** Complete  
**Date:** 2026-07-11  
**Scope:** OSS-102-08 only — Zammad Wave 2 certification & closeout  
**Package:** `@apzhub/integration-zammad` **v0.6.0** (unchanged — certification only)  
**Reference standard:** [REFERENCE-ADAPTER-STANDARD.md](../architecture/REFERENCE-ADAPTER-STANDARD.md)  
**Index:** [OSS-102-08-Wave2-Index.md](./OSS-102-08-Wave2-Index.md)

---

## Executive summary

Wave 2 (Zammad / Support adapter) is **formally closed** with outcome:

### **CERTIFIED_WITH_LIMITATIONS**

`@apzhub/integration-zammad` v0.6.0 is compliant with the Reference Adapter Standard, production-ready within documented limitations, and safe as the provider foundation for a future APZHUB Support PlatformService spine. No PlatformService, mapping store, gateway, HTTP, UI, Event Bus, or webhook ingress was added.

**Limitations that justify `CERTIFIED_WITH_LIMITATIONS` (not defects):**

- In-memory synchronisation state only
- No webhook HTTP ingress
- No Platform Event Bus publication
- No binary attachment transfer
- No platform mapping / gateway / HTTP / UI integration
- Provisional `*_zammad_*` provider-boundary IDs

**Recommendation:** Proceed to **OSS-110-10 — Support Platform Service Contracts, Providers & Mapping** only after explicit owner approval.

---

## Wave 2 scope

| Milestone | Deliverable | Status |
| --- | --- | --- |
| OSS-102-01 | Discovery & architecture | Complete |
| OSS-102-02 | Adapter foundation | Complete |
| OSS-102-03 | Core Support services | Complete |
| OSS-102-04 | Articles + attachment metadata | Complete |
| OSS-102-05 | Search, history, analytics | Complete |
| OSS-102-06 | Sync, events, webhooks | Complete |
| OSS-102-07 | Operations & certification | Complete |
| OSS-102-08 | Wave 2 closeout | **Complete** |

---

## Architecture certification

| Item | Verdict |
| --- | --- |
| Architecture audit | **PASS** — [OSS-102-08-architecture-audit.md](./OSS-102-08-architecture-audit.md) |
| Dependency / boundary audit | **PASS** (0 violations) — [OSS-102-08-dependency-audit.md](./OSS-102-08-dependency-audit.md) |
| Package ownership / layering | **PASS** |
| Documented limitations | Accepted — see architecture audit |

---

## Dependency and boundary audit

**Script:** `scripts/wave2-dependency-audit.mjs`  
**Verdict:** PASS (0 violations, 63 files)

Rules verified: no platform-services, gateway, mapping-store, Next routes, database, Plane reuse, public internal API types, unexpected `@apzhub` deps; no direct fetch in service layer.

---

## Capability certification

See [OSS-102-08-capability-certification.md](./OSS-102-08-capability-certification.md).

All required Support-domain capabilities certified. Optional: search, history, analytics, webhooks. Binary attachments / ingress / Event Bus / persistent sync / PlatformService **not certified**.

---

## Canonical mapping validation

See [OSS-102-08-mapping-validation.md](./OSS-102-08-mapping-validation.md).

Ticket → Support Request; Article → Support Article; never Task/Comment. Provisional IDs documented for later MappingStore work.

---

## Mocked end-to-end verification

| Suite | Path | Result |
| --- | --- | --- |
| Adapter E2E | `testing/wave2/wave2-adapter.e2e.test.ts` | PASS (5) |
| Certification claims | `testing/wave2/wave2-certification.test.ts` | PASS (8) |
| Performance baseline | `testing/wave2/wave2-performance.baseline.test.ts` | PASS (1) |

Scenarios: bootstrap, auth, health, diagnostics, version, support/org/group/user lifecycle, articles (internal + public), search, history, analytics, sync, events, webhooks, compatibility, readiness, operational reports. **No live Zammad. No PlatformServiceGateway/HTTP.**

---

## Regression certification

| Suite | Result |
| --- | --- |
| Zammad package | PASS (**112**) |
| Wave 2 suites | PASS (**14**) |
| Plane Reference Adapter | PASS (included) |
| Integration SDK | PASS (included) |
| Platform-service contracts | PASS (10) |
| Platform services | PASS (**137**) |
| Dependency audit script | PASS |
| **Combined Wave 2 mandatory regression** | **300 passed / 32 files** (zammad+wave2+plane+sdk+contracts) + **137** platform-services |

### Known unrelated failure

`pnpm build` (`apps/web`) fails with pre-existing Next.js `/_global-error` `useContext` null. **Not introduced by Wave 2.** Not treated as Wave 2 certification failure (certification scope is adapter + contracts + related platform packages; full web build is known debt).

---

## Coverage certification

Scoped Zammad package instrumentation (thresholds disabled for non-package includes):

| Area | Statements | Branches | Functions | Lines | vs 80% target |
| --- | --- | --- | --- | --- | --- |
| Complete Zammad package | 92.43% | 74.67% | 97.89% | 92.43% | Branches **below** |
| Operations / certification | ~96.8% | ~84.4% | ~96.7% | ~96.8% | Met |
| Services | ~93.8% | ~75.3% | ~97.4% | ~93.8% | Branches near/below |
| Mappers | ~91.8% | ~77.9% | ~98.3% | ~91.8% | Branches near/below |
| Events translator | ~83.3% | ~76.3% | 100% | ~83.3% | Branches below |
| Models (type-only) | 0% | 0% | 0% | 0% | **Accepted** — types only |
| Internal API types | 0% | 0% | 0% | 0% | **Accepted** — types only |

**Accepted gaps:** Aggregate branch coverage below 80% aspirational target; type-only modules at 0%. No coverage-chasing tests added. Risk: exotic error/mapping branches less exercised — mitigated by existing failure-path tests and Wave 2 E2E.

---

## Performance baseline (mocked, ms)

Recorded 2026-07-11 (representative vitest run; **not** production Zammad latency):

| Operation | ~ms |
| --- | --- |
| adapter.connect / testConnection | ~18–33 |
| support.list | ~4–6 |
| support.get | ~2–8 |
| support.create | ~2–3 |
| articles.list | ~3–5 |
| articles.createNote | ~2–5 |
| search.supportRequests | ~2–4 |
| history.timeline | ~2–3 |
| analytics.snapshot | ~5–10 |
| sync.incremental | ~4–7 |
| events.translate | ~1 |
| certifyCapabilities | ~0.4–0.7 |
| evaluateReadiness | ~2–3 |
| buildOperationalReport | ~2–5 |
| **count / min / max / average** | **15 / ~0.4 / ~33 / ~4–6** |

No optimisation performed.

---

## Compatibility certification

| Case | Result |
| --- | --- |
| Minimum 6.3.0 | compatible |
| Mid-range 6.4.x | compatible |
| Max verified 6.5.x | compatible |
| Older 6.0.0 | incompatible (blocking) |
| Newer 6.6.x | unverified (non-blocking) |
| Missing / malformed | warning |
| CE first | assumed / configured |
| Optional feature gaps | degrade; do not fail startup |

Do not expand range without evidence.

---

## Operational readiness

Healthy CE mock typically:

- Readiness: **ready**
- Health: **HEALTHY** or **DEGRADED** (optional probes)
- Certification outcome: **CERTIFIED_WITH_LIMITATIONS** (documented Reference Adapter deviations)

Deterministic outcomes exercised: CERTIFIED_WITH_LIMITATIONS, NOT_CERTIFIED paths (unit), INCOMPATIBLE (unsupported version E2E).

---

## Security and privacy audit

| Concern | Result |
| --- | --- |
| API-token via SecretProvider | PASS |
| Diagnostics / ops report redaction | PASS — tokens, Bearer, webhook secret values absent |
| Article bodies in diagnostics | PASS — not included |
| Ticket titles/descriptions in ops reports | PASS — not included |
| Recipient / PII in ordinary ops output | PASS |
| Error translation (no raw payloads) | PASS |
| Wave 2 secret-leakage tests | PASS |

---

## Reference Adapter comparison (Plane vs Zammad)

| Area | Classification |
| --- | --- |
| Package layout | equivalent |
| Factory / lifecycle / operation runner | equivalent |
| REST-client / error translation | equivalent |
| Canonical mapping | compliant with domain-specific differences (Support ≠ Projects) |
| Capability registration | equivalent |
| Diagnostics / compatibility / readiness / health / reports | equivalent |
| Mocks / test quality / documentation | equivalent |
| Architecture boundaries | equivalent |
| PlatformService / HTTP spine | **not applicable** to Wave 2 (Plane Wave 1 included OSS-110; Zammad deferred) |
| Domain feature parity | **not required** — separate domains |

---

## Known limitations / technical debt / risks

**Limitations:** as listed in executive summary.  
**Debt:** Zammad branch coverage below 80%; full monorepo web build Next.js defect; backlog phase titles historically drifted (corrected in foundation).  
**Risks:** Unverified newer Zammad versions; optional webhook/search permission gaps; provisional IDs must not leak to future HTTP/UI.

---

## Readiness for Support PlatformService integration

**Ready as provider foundation:** Yes, within limitations.

**Not ready until:** contracts review, Zammad providers in platform-services, persistent mapping, SupportServiceImpl, permissions, gateway, then HTTP, then UI.

---

## Wave 2 closeout decision

| Decision | Value |
| --- | --- |
| Wave 2 status | **CLOSED** |
| Certification outcome | **CERTIFIED_WITH_LIMITATIONS** |
| Architecture freeze | Remains for integration work |
| Plane Reference Adapter | Unchanged — remains the certified Reference Adapter |
| Next milestone | **OSS-110-10** (await owner approval) |

---

## Recommended next milestone sequence

1. **OSS-110-10** — Support-domain Platform Service Contracts review/extension + Zammad providers  
2. Persistent mapping for support requests, orgs, groups, users, articles  
3. Mapping-aware SupportService implementation  
4. Production permission catalogue / operation map for Support  
5. PlatformServiceGateway Support exposure  
6. Versioned Support HTTP API  
7. Support UI only after secure API is complete  

(`OSS-102-09` remains reserved for owner sequencing if a Zammad-specific follow-on is preferred over OSS-110 numbering.)

**Do not begin without owner approval.**
