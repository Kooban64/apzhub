# APZREPORT-003 — Architecture, Dependency & Boundary Audit

**Date:** 2026-07-13  
**Verdict:** **PASS** — zero violations  
**Certification:** APZREPORT-003  
**Automated scan:** `scripts/apzreport-003-reporting-vertical-audit.mjs`

---

## Dependency direction (verified)

```text
Consumers (Workbench / TCMS UI / future products)
  → Typed Client (apps/web/lib/reporting)
    → HTTP (/api/v1/reporting + handlers/reporting.ts)
      → Gateway (platform-services gateway.reporting)
        → RequestPipeline + Authorization (platformReportingOps → report.*)
          → PlatformReportingServiceImpl
            → Reporting Core (via first-consumer ports / createPlatformReportingService)
              → Reporting Contracts
                → Output Providers
```

No reverse dependencies observed (contracts ← core ← services ← HTTP ← client ← UI).

---

## Forbidden import matrix

| Rule                                                                                         | Result   |
| -------------------------------------------------------------------------------------------- | -------- |
| Workbench never imports reporting-core / contracts / platform-services / gateway / handlers  | **PASS** |
| Typed client never imports reporting-core / contracts / testing-services / platform-services | **PASS** |
| HTTP handlers never import reporting-core / testing-services / output providers              | **PASS** |
| Gateway reporting impl never imports output provider internals                               | **PASS** |
| reporting-core never imports testing-* / apps / Plane / Zammad                               | **PASS** |
| reporting-contracts never imports reporting-core / testing-* / apps                          | **PASS** |
| No product engine leakage (Plane/Zammad/Kimai imports) in contracts/core                     | **PASS** |

Automated scan: **VIOLATIONS=0**.

---

## Observations (limitations — not violations)

| Observation                                                                           | Classification     |
| ------------------------------------------------------------------------------------- | ------------------ |
| `gateway.reporting` composed only when Testing first-consumer ports are present       | **LIMITATION**     |
| `PlatformReportingServiceImpl` delegates through TCMS `domain.reporting.reporting`    | **LIMITATION**     |
| `handleRenderReport` exists without a public `/reporting/render` route / OpenAPI path | **TECHNICAL DEBT** |
| Soft TCMS naming in contracts comments / legacy permission aliases                    | **ACCEPTED**       |

---

## Layering checks

| Check                                                      | Result   |
| ---------------------------------------------------------- | -------- |
| No engine bypass from HTTP/UI                              | **PASS** |
| RequestPipeline wraps `platformReporting` ops              | **PASS** |
| Authz maps to `platform_reporting` + `report.*`            | **PASS** |
| Product templates remain product-owned (TCMS builtins)     | **PASS** |
| Platform packages remain product-neutral at contracts/core | **PASS** |

---

## Related

[Vertical Certification](../architecture/APZHUB-Platform-Reporting-Vertical-Certification.md) · [APZREPORT-003 Completion Report](../sprint/APZREPORT-003-completion-report.md)
