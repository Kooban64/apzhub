# Metabase Integration — Certification Report

> **Programme:** APZHUB-INTEGRATION-METABASE-001  
> **Title:** Metabase Integration Foundation  
> **Package:** `@apzhub/integration-metabase` **0.1.0**  
> **SDK:** `@apzhub/integration-sdk` **1.0.0** (unchanged / frozen)  
> **Status:** **ACCEPTED / CLOSED** — **CERTIFIED_FOUNDATION**  
> **Recommendation:** **CERTIFIED_FOUNDATION**

---

## Verdict

**CERTIFIED_FOUNDATION** — **ACCEPTED** — suitable for future Analytics Platform Services.

| Dimension                                             | Result                        |
| ----------------------------------------------------- | ----------------------------- |
| Integration SDK **1.0.0** compatibility               | **PASS**                      |
| Manifest-first (`integration.yaml`)                   | **PASS**                      |
| Adapter / Client / Factory / Bootstrap                | **PASS**                      |
| Auth (API key + session) via SecretProvider           | **PASS**                      |
| Health · diagnostics · version · capability detection | **PASS**                      |
| Error translation · metrics · logging                 | **PASS**                      |
| Readiness · compatibility · capability registration   | **PASS**                      |
| Mock provider + tests                                 | **PASS** (15)                 |
| Analytics Services / HTTP / Workbench / product       | **ABSENT** (correct)          |
| Embed token issuance                                  | **PLANNED** (not implemented) |
| Engine branding hidden from standard users            | **PASS** (adapter-internal)   |

## Quality evidence

| Gate                                              | Result        |
| ------------------------------------------------- | ------------- |
| `pnpm typecheck` (`integrations/metabase`)        | PASS          |
| `pnpm lint` (`integrations/metabase`)             | PASS          |
| `pnpm test` (`integrations/metabase`)             | PASS (**15**) |
| Integration SDK source changes                    | **None**      |
| Analytics contracts / services / HTTP / Workbench | **None**      |

## Certification class

| Class                      | Status                                                  |
| -------------------------- | ------------------------------------------------------- |
| CERTIFIED_FOUNDATION       | **Recommended**                                         |
| CERTIFIED_DOMAIN           | Not applicable — domain expansion not in this programme |
| CERTIFIED_WITH_LIMITATIONS | N/A (foundation scope; limitations documented)          |

## STOP

Do not implement Analytics Contracts, Services, HTTP APIs, Workbench, or APZ Analytics without explicit Owner Approval.
