# APZHUB-INTEGRATION-N8N-001 — Programme Acceptance Report

> **Programme:** APZHUB-INTEGRATION-N8N-001  
> **Title:** n8n Integration Foundation  
> **Classification:** PRODUCTION CODE  
> **Status:** **ACCEPTED / CLOSED**  
> **Recommendation:** **CERTIFIED_FOUNDATION**  
> **Package:** `@apzhub/integration-n8n` **0.1.0**  
> **Owner Acceptance:** 2026-07-19 — Owner Decision authorising APZHUB-PLATFORM-WORKFLOW-003 (n8n Integration Foundation is CERTIFIED)  
> **Certification:** [CERTIFICATION-REPORT](../../integrations/n8n/CERTIFICATION-REPORT.md)  
> **Completion:** [APZHUB-INTEGRATION-N8N-001-completion-report.md](../../sprint/APZHUB-INTEGRATION-N8N-001-completion-report.md)

---

## Owner decision

**ACCEPT** APZHUB-INTEGRATION-N8N-001.

Acceptance means:

1. `@apzhub/integration-n8n` **0.1.0** is **CERTIFIED_FOUNDATION** for Workflow Platform consumption.
2. Read-only metadata discovery is the certified scope — execute/schedule/HITL remain Owner-gated.
3. Workflow Platform Contracts proceed under **APZHUB-PLATFORM-WORKFLOW-003** (separate programme).
4. Integration SDK **1.0.0** remains frozen / unchanged.
5. Repository remains Operational Delivery · Architecture Frozen (SDK) · QA-002 PRODUCTION READY.

## Validation

| Check                                                             | Result |
| ----------------------------------------------------------------- | ------ |
| TypeScript / Lint / Tests (**22**)                                | PASS   |
| Architecture boundary (no DTO leak / no platform-services import) | PASS   |
| Documentation pack                                                | PASS   |
| No Workflow product surfaces                                      | PASS   |

## Recommendation

# CERTIFIED_FOUNDATION

## STOP

Accepted. Workflow Platform Contracts continue under APZHUB-PLATFORM-WORKFLOW-003.

Await explicit Owner Acceptance.
