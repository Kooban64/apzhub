# Kimai Integration

> **Package:** `@apzhub/integration-kimai` **0.2.0**  
> **Programmes:** APZHUB-INTEGRATION-KIMAI-001 (foundation) · **APZHUB-INTEGRATION-KIMAI-002** (domain)  
> **SDK:** `@apzhub/integration-sdk` **1.0.0**  
> **Status:** Domain expansion **ACCEPTED / CLOSED** — **CERTIFIED_DOMAIN**

## Documents

| Document              | Path                                                   |
| --------------------- | ------------------------------------------------------ |
| Certification         | [CERTIFICATION-REPORT.md](./CERTIFICATION-REPORT.md)   |
| Compatibility Matrix  | [COMPATIBILITY-MATRIX.md](./COMPATIBILITY-MATRIX.md)   |
| Capability Assessment | [CAPABILITY-ASSESSMENT.md](./CAPABILITY-ASSESSMENT.md) |
| Operational Readiness | [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md) |
| Feature Detection     | [FEATURE-DETECTION.md](./FEATURE-DETECTION.md)         |

## Scope

- Foundation: auth, health, version, diagnostics, compatibility, readiness, certification
- Domain CE: timesheets, activities, customers, projects, tags (+ search where available)
- **Not** APZ Time Workbench / product UI

## Architecture

```text
Time HTTP → gateway.time.* → Time Platform Services → Kimai adapter.core → Kimai CE
```
