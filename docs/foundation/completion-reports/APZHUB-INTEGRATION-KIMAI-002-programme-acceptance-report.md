# APZHUB-INTEGRATION-KIMAI-002 — Programme Acceptance Report

> **Programme:** APZHUB-INTEGRATION-KIMAI-002  
> **Title:** Kimai Domain Services Expansion  
> **Status:** **ACCEPTED / CLOSED**  
> **Certification:** [CERTIFICATION-REPORT](../../integrations/kimai/CERTIFICATION-REPORT.md) — **CERTIFIED_DOMAIN**  
> **Package:** `@apzhub/integration-kimai` **0.2.0**

---

## Owner decision

**ACCEPTED.**

Kimai Integration is **CERTIFIED_DOMAIN**.

Acceptance means:

1. Kimai CE domain APIs (timesheets/activities/customers/projects/tags) are certified for platform use.
2. Platform Time production path uses `domainMode: "kimai"` without foundation-only CRUD fallback.
3. APZ Time product / Workbench remain separate programmes (see APZHUB-TIME-READINESS-002).

## Validation (retained)

| Check                                     | Result |
| ----------------------------------------- | ------ |
| Integration SDK **1.0.0** unchanged       | PASS   |
| Time HTTP unchanged                       | PASS   |
| No APZ Time / Workbench in this programme | PASS   |
| Quality evidence                          | PASS   |

## Closed

Programme **CLOSED**. Next Time readiness work: APZHUB-TIME-READINESS-002.
