# Kimai Integration — Compatibility Matrix

> **Programme:** APZHUB-INTEGRATION-KIMAI-002  
> **Package:** `@apzhub/integration-kimai` **0.2.0**  
> **SDK:** `@apzhub/integration-sdk` **1.0.0** (unchanged)

| Dimension              | Supported                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| Kimai CE edition       | Community                                                                                |
| Version range          | **2.13.0** – **2.x**                                                                     |
| Auth                   | Bearer API token (preferred) · Legacy `X-AUTH-USER` / `X-AUTH-TOKEN`                     |
| Foundation             | `/api/ping` · `/api/version`                                                             |
| Domain                 | `/api/timesheets` · `/api/activities` · `/api/customers` · `/api/projects` · `/api/tags` |
| Search                 | CE `term` query where supported; tag search may be client-side                           |
| Explicitly unsupported | Approvals · Reporting UI · Analytics · Workbench · APZ Time product                      |

Runtime matrix is also produced by `buildKimaiCompatibilityMatrix` / adapter operational report.
