# Canonical Time HTTP API

> **Programme:** APZHUB-TIME-HTTP-001 — **ACCEPTED / CLOSED**  
> **Surface:** `/api/v1/time/*`  
> **OpenAPI:** [APZHUB-Platform-OpenAPI-v1.yaml](../../specs/APZHUB-Platform-OpenAPI-v1.yaml) **1.10.0**

## Documents

| Document                | Path                                                                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP API Certification  | [HTTP-API-CERTIFICATION.md](./HTTP-API-CERTIFICATION.md)                                                                                                                           |
| Compatibility Statement | [COMPATIBILITY-STATEMENT.md](./COMPATIBILITY-STATEMENT.md)                                                                                                                         |
| Quality Evidence        | [QUALITY-EVIDENCE.md](./QUALITY-EVIDENCE.md)                                                                                                                                       |
| Completion Report       | [../../sprint/APZHUB-TIME-HTTP-001-completion-report.md](../../sprint/APZHUB-TIME-HTTP-001-completion-report.md)                                                                   |
| Acceptance Report       | [../../foundation/completion-reports/APZHUB-TIME-HTTP-001-programme-acceptance-report.md](../../foundation/completion-reports/APZHUB-TIME-HTTP-001-programme-acceptance-report.md) |

## Architecture

```
Client → /api/v1/time/* → withPlatformApiAuth → gateway.time.* → Time Platform Services → Kimai Integration
```

No direct Kimai access from HTTP handlers.
