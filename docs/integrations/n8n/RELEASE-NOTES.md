# n8n Integration — Release Notes

> **Package:** `@apzhub/integration-n8n`  
> **Version:** **0.1.0**  
> **Programme:** APZHUB-INTEGRATION-N8N-001  
> **Date:** 2026-07-19

---

## 0.1.0 — Integration Foundation

### Added / certified

- `N8nAdapter` via Integration SDK **1.0.0**
- Public `N8nClient` facade (no REST client / vendor DTO leakage)
- Connection management · auth (API key / PAT / basic) · health · diagnostics
- Version detection (headers / healthz / API capability fallback)
- Capability detection · registration · mock provider
- Error translation · metrics · structured logging
- Canonical metadata mappers aligned to Workflow Information Model
- Unit + mock + boundary tests (**22**)
- Certification pack under `docs/integrations/n8n/`

### Not included

- Workflow Contracts / Services / HTTP / Workbench
- Execute · schedule · HITL · credential runtime secrets
- OAuth
- Multi-provider engines
