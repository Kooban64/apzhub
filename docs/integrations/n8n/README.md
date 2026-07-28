# n8n Integration Foundation

> **Programme:** APZHUB-INTEGRATION-N8N-001  
> **Package:** `@apzhub/integration-n8n` **0.1.0**  
> **Recommendation:** **CERTIFIED_FOUNDATION**  
> **Status:** **Awaiting Acceptance**  
> **SDK:** `@apzhub/integration-sdk` **1.0.0** (Architecture Frozen)  
> **ADRs:** [ADR-0068](../../adr/ADR-0068-workflow-platform-first-class-capability.md) · [ADR-0069](../../adr/ADR-0069-n8n-workflow-engine-provider.md)

---

## Pack contents

| Document                                               | Purpose                |
| ------------------------------------------------------ | ---------------------- |
| [CERTIFICATION-REPORT.md](./CERTIFICATION-REPORT.md)   | Certification verdict  |
| [COMPATIBILITY-MATRIX.md](./COMPATIBILITY-MATRIX.md)   | Compatibility matrix   |
| [CAPABILITY-ASSESSMENT.md](./CAPABILITY-ASSESSMENT.md) | Capability assessment  |
| [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md)         | Known limitations      |
| [RELEASE-NOTES.md](./RELEASE-NOTES.md)                 | Release notes          |
| [OPERATIONAL-READINESS.md](./OPERATIONAL-READINESS.md) | Ops readiness          |
| [AUTHENTICATION.md](./AUTHENTICATION.md)               | Supported auth methods |

## Package

`integrations/n8n/` — `integration.yaml` · `N8nAdapter` · `N8nClient` · mock provider · tests

## Related

- Workflow Platform: [docs/platform/workflow/](../../platform/workflow/README.md)
- Information Model: [WORKFLOW-INFORMATION-MODEL](../../platform/workflow/WORKFLOW-INFORMATION-MODEL.md)
- Prior engineering wave: APZWORKFLOW-006 (read-only reference adapter baseline)

---

## STOP

Do not implement Workflow Contracts / Services / HTTP / Workbench / commercial APZ Workflow features without named Owner Approval.
