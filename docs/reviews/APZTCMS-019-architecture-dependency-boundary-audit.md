# APZTCMS-019 — Architecture, Dependency & Boundary Audit

**Date:** 2026-07-12  
**Verdict:** **PASS** — zero violations  
**Certification:** APZTCMS-019

---

## Dependency direction (verified)

```text
Workbench (apps/web/components/testing, lib/testing)
  → Typed Client (createHttpPipelineClient / pipeline-api)
    → HTTP (/api/v1/testing/pipelines + handlers/testing-pipelines.ts)
      → Gateway (platform-services gateway.testing)
        → RequestPipeline + Authorization
          → Platform Services (SoR pipelines + live Pipeline*ServiceImpl)
            → ProviderResolver → GitHub*Provider
              → Adapter public API (GitHubActionsCoreServices)
                → Integration SDK (createHttpIntegrationClient + mapping)
                  → Canonical models (testing-contracts)
```

No reverse dependencies observed.

---

## Forbidden import matrix

| Rule                                                                                        | Result   |
| ------------------------------------------------------------------------------------------- | -------- |
| UI never imports platform-services, providers, adapters, SDK, testing-services, persistence | **PASS** |
| HTTP handlers never import adapters, providers, SDK, testing-services, persistence          | **PASS** |
| Gateway never imports adapter internals                                                     | **PASS** |
| Platform `services/testing` never imports GitHub REST DTOs / RestClient                     | **PASS** |
| Providers call `adapter.core` only — no `internal/`                                         | **PASS** |
| Adapter never imports `@apzhub/platform-services`                                           | **PASS** |
| No GitHub DTO leakage outside adapter package                                               | **PASS** |

Automated scan: **VIOLATIONS=0**.

---

## Layering checks

| Check                                                       | Result   |
| ----------------------------------------------------------- | -------- |
| No adapter bypass from HTTP/UI                              | **PASS** |
| Live reads via ProviderResolver                             | **PASS** |
| SoR import/link via domain pipelines                        | **PASS** |
| RequestPipeline wraps all gateway facets                    | **PASS** |
| Shared HTTP transport (no direct fetch in adapter services) | **PASS** |
| Mapping Provider Framework used in adapter                  | **PASS** |

---

## Related

[GitHub Vertical Certification](../architecture/APZHUB-APZ-TCMS-GitHub-Vertical-Certification.md) · [APZTCMS-019 Completion Report](../sprint/APZTCMS-019-completion-report.md)
