# APZ Time 1.0 — Gap Analysis

> **Product:** APZ Time  
> **Classification:** Documentation only  
> **Related:** [Readiness Assessment](./APZ-TIME-1.0-READINESS-ASSESSMENT.md) · [Recommendation](./APZ-TIME-1.0-RECOMMENDATION.md)  
> **Rule:** Gaps from repository evidence only — no invented APIs or Kimai mappings

---

## Gaps preventing Release 1.0 / Implementation Ready

| ID   | Gap                                                                           | Classification                                                                                                                                | Blocks IR?                                                                                                                              | Evidence                                                  |
| ---- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| G-01 | Kimai Integration SDK adapter absent (`integrations/kimai`)                   | **Critical** → **Closed (foundation)** by APZHUB-INTEGRATION-KIMAI-001 (`@apzhub/integration-kimai` **0.1.0**)                                | No (adapter) / Yes remains for product IR via G-02+                                                                                     | Package on disk; still no TimeTrackingService             |
| G-02 | Platform TimeTrackingService (contracts/core/persistence/service.yaml) absent | **Critical** → **Partial** (PLATFORM-TIME-001 ACCEPTED; TIME-HTTP-001 HTTP delivered, Awaiting Acceptance; domain CRUD limited; no Workbench) | Softened — Workbench / Kimai domain still block product IR                                                                              | services **0.26.0** · OpenAPI **1.10.0** `/api/v1/time/*` |
| G-03 | Platform HTTP / gateway surface for Time absent                               | **Critical** → **Closed (limited)** by APZHUB-TIME-HTTP-001 (OpenAPI **1.10.0**; Kimai domain → 501)                                          | Softened — remaining IR block is Kimai domain (see IR-01/IR-02 in [APZ-TIME-IMPLEMENTATION-GAPS.md](./APZ-TIME-IMPLEMENTATION-GAPS.md)) | `/api/v1/time/*` on disk                                  |
| G-04 | Module manifest + permissions (`time.*`) absent                               | **Critical**                                                                                                                                  | Yes                                                                                                                                     | No `services/time/manifests`                              |
| G-05 | Workbench UI / typed client absent                                            | **Critical**                                                                                                                                  | Yes                                                                                                                                     | No `apps/web/lib/time` · `components/time`                |
| G-06 | ADR for Kimai adapter approach not filed/accepted for this product            | **High**                                                                                                                                      | Yes (for adapter start)                                                                                                                 | ROADMAP requires ADR + Owner                              |
| G-07 | Product tests + Playwright cert absent                                        | **High**                                                                                                                                      | Yes (for release cert)                                                                                                                  | IMPLEMENTATION-READINESS Testing FAIL                     |
| G-08 | Search provider / index publication for Time absent                           | **Medium**                                                                                                                                    | No for minimal IR if scoped later                                                                                                       | Pack: Search future                                       |
| G-09 | Reporting hooks / exports absent                                              | **Medium**                                                                                                                                    | No for minimal IR if Phase 3                                                                                                            | CAPABILITIES planned                                      |
| G-10 | Approvals workflow absent                                                     | **Medium**                                                                                                                                    | No for minimal IR if Phase 2                                                                                                            | CAPABILITIES planned                                      |
| G-11 | Activities / tags / project linking model absent                              | **Medium**                                                                                                                                    | Partial — depends on Wave 1 Projects HTTP + Time domain design                                                                          | Strategy / backlog themes                                 |
| G-12 | Health / diagnostics / audit product views absent                             | **Medium**                                                                                                                                    | Soft for IR; required for Production honesty                                                                                            | Projects pattern                                          |
| G-13 | Provisioning flow for Time product enablement not defined/registered          | **Medium**                                                                                                                                    | Soft — platform provisioning exists                                                                                                     | ARCHITECTURE                                              |
| G-14 | Events (`time.*`) schemas / manifests absent                                  | **Medium**                                                                                                                                    | Soft for thin vertical                                                                                                                  | Pack: none on disk                                        |
| G-15 | Analytics / Metabase product integration                                      | **Low**                                                                                                                                       | No                                                                                                                                      | Analytics Concept; Metabase absent                        |
| G-16 | Host Kimai ops runbooks ≠ APZHUB connector config                             | **Low**                                                                                                                                       | No                                                                                                                                      | ENVIRONMENT.md coexistence only                           |

---

## Critical path (must close before Implementation Ready)

```text
Owner-approved Kimai adapter delivery (Integration SDK 1.0.0)
  → Platform TimeTrackingService + gateway HTTP
  → Module manifest + permissions
  → (then) mark Implementation Ready
  → Owner Approval of Workbench Product Release 1.0
```

Workbench-only delivery (Projects 1.1 pattern) is **impossible** today — there is no certified Time HTTP to consume.

---

## Non-gaps (platform ready)

| Capability                      | Status                    |
| ------------------------------- | ------------------------- |
| Platform Foundation CLOSED      | Available                 |
| Integration SDK 1.0.0 frozen    | Available for new adapter |
| BetterAuth / AuthZ framework    | Available                 |
| Workbench shell / Design System | Available                 |
| QA-002 PRODUCTION READY         | Held                      |
| Product Definition Pack         | Complete                  |

---

## Honesty

Host Kimai at `apztime.apzportal.apzor.com` does **not** close G-01. APZHUB products must call Platform Services via gateway; engines stay behind adapters.
