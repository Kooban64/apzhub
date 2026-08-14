# SPR-APZPEN-007 — Product completion (UI/UX + functional close)

> **Status:** **DELIVERED** — 2026-08-14  
> **Depends on:** SPR-APZPEN-001…006, SPR-COMM-001/002  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)

## Goal

Close APZPEN to a **fully usable Security Assurance product** for operators + customer portal.

## Delivered

| Item          | Notes                                                                         |
| ------------- | ----------------------------------------------------------------------------- |
| Access        | Product entitlement + permission catalogue; bootstrap only when no perms/subs |
| Shell         | Org admin/member with `pentest` entitlement can open `/apzpen`                |
| Source → sync | Bindings upsert repository scope; GitHub sync prefers bindings                |
| Scope UI      | Kind selector (web/api/repo/mobile/…)                                         |
| Demo repo     | `demo-financial/banking-portal`                                               |
| Findings      | List actions: remediate, retest, FP, accept, close; assign + evidence APIs    |
| Assessment    | `set_assessment_position` on engagement                                       |
| Portal        | Assign, evidence upload, report kind PDF, certification status, grant revoke  |
| Tests         | `apps/web/lib/apzpen` — 41 passing                                            |

## Non-goals (next programme)

Security Graph depth · immutable certification ledger · non-GitHub SCM · PostgreSQL SoR

Vision IA queues (Remediation / Retests / Evidence / Certification) delivered in [SPR-APZPEN-008](./SPR-APZPEN-008-workflow-surfaces-e2e.md).
