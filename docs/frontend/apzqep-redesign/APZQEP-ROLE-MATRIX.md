# APZQEP role matrix — Phase 0 (repository truth)

Presentation authority: [APZQEP-UX-AUTHORITY.md](./APZQEP-UX-AUTHORITY.md).

This matrix records **what exists today** versus **what the redesign requires**. It does not create new IAM. Role remains a UX composition over effective permissions; APIs stay authoritative.

## Specified APZQEP product roles (authority)

| Role              | Specified landing      | Specified purpose                                     |
| ----------------- | ---------------------- | ----------------------------------------------------- |
| QEP Master        | Quality Command Centre | Complete APZQEP authority (not Platform/Tenant Admin) |
| QEP Administrator | QEP Administration     | Product administration inside APZQEP                  |
| Quality Lead      | Quality Command Centre | Attention-first release posture                       |
| QA Engineer       | My Work                | Assigned quality work                                 |
| Tester            | My Testing             | Execution-first                                       |
| Developer         | Quality Feedback       | Defect / fix / retest                                 |
| Release Owner     | Release Decision       | Readiness / gates / certification                     |
| Auditor           | Assurance Review       | Traceability / evidence / audit (read)                |
| Viewer            | Quality Overview       | Read-only overview                                    |

These are **not** APZHUB platform roles (`platform_admin`, `org_admin`, finance, support, compliance).

## Existing durable IAM (repository)

| Existing role | ID / slug                        | Product | Permission posture                                                                                          |
| ------------- | -------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| QEP Operator  | `role-qep-operator`              | qep     | Broad write: plans, execution, evidence, suites, defects, certification decide, SCM operate, `source.write` |
| QEP Reader    | `role-qep-reader` / `qep-reader` | qep     | Read across QEP domains; includes `source.read`                                                             |
| QEP Engineer  | `product-qep-engineer`           | qep     | Reader + lean write: plan create/update, execution create/execute, evidence create                          |

Resource scopes already exist and are independent of product role:

- `qep.application:`
- `qep.project:`
- `qep.repository:`
- `source.read` / `source.write` (independent of QEP entitlement)

## Mapping (Phase 0 — composition only)

| Specified role    | Closest existing role                                                                       | Gap                                                                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QEP Master        | No equivalent. Closest: Operator **plus** admin/audit keys, **minus** Platform/Tenant Admin | **UX composition** over full QEP permission set. Must **not** include `source.write` by default (authority forbids silent Source write). Operator currently includes `source.write` — strip for Master UX unless independently granted |
| QEP Administrator | Partial: `qep.administration.read` / `qep.administration.operate`                           | Existing admin **deep-links Org IAM**; no QEP People & Access SoR                                                                                                                                                                      |
| Quality Lead      | Operator (readiness + flows + certification read)                                           | No dedicated landing composition                                                                                                                                                                                                       |
| QA Engineer       | QEP Engineer                                                                                | Lean write; missing many domain writes Engineer would need for full QA work                                                                                                                                                            |
| Tester            | No dedicated role                                                                           | Would compose from `qep.execution.execute` + `qep.execution_workspace.execute` + defects/evidence create                                                                                                                               |
| Developer         | No dedicated QEP role                                                                       | Defects + SCM read + Source (if independently granted)                                                                                                                                                                                 |
| Release Owner     | Partial: `qep.release_readiness.read` + `qep.certification.decide`                          | No dedicated role; certification decide is on Operator                                                                                                                                                                                 |
| Auditor           | Partial: Reader + `qep.audit.read` + evidence read                                          | Reader also has `source.read` — Auditor Source access must remain independent                                                                                                                                                          |
| Viewer            | QEP Reader                                                                                  | Reader is broader than a “Quality Overview” landing                                                                                                                                                                                    |

## Phase 1 rule

Phase 1 implements **QEP Master navigation composition** from effective QEP permissions. It does **not** add nine durable product roles to IAM.

Durable role catalogue expansion is **not** a numbered Phase 8. If later authorised as bounded refinement, new product-role rows would be an IAM extension on the existing PermissionService — not a new identity system. See [APZQEP-PROGRAMME-CLOSURE.md](./APZQEP-PROGRAMME-CLOSURE.md).

## Independence rules (must preserve)

| Rule                           | Repository truth                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| QEP entitlement ≠ Source       | `source.read` / `qep.scm.read` are separate. Sidebar already hides Source unless `hasSourceAccess` |
| QEP Master ≠ Platform Admin    | Operator/Engineer are product-scoped; platform-admin is a separate shell                           |
| QEP Admin ≠ Org Admin          | `qep-administration-views` deep-links `/org/members` — must not duplicate                          |
| Permissions remain server-side | `withPlatformApiAuth` + `requireQepPermission` / domain `requirePermission`                        |
