# RB-002 Remediation — APZQEP-152

| Field           | Value              |
| --------------- | ------------------ |
| Programme       | APZQEP-152         |
| Artefact        | RB-002-REMEDIATION |
| Timestamp       | 20260803T064000Z   |
| Release Blocker | RB-002             |
| Related         | HR-001             |

---

## Defect (discovery)

Cap A–F HTTP `actorFromContext` treated empty `serviceContext.permissions` as a cue to inject Cap write grants (LIMITED_AVAILABILITY). Because gateway Cap paths always built `permissions: []`, every authenticated tenant user received Cap write.

APZQEP-150: ISSUES-REGISTER RB-002; KL-002 / KL-003.

## Remediation — elevation removed

1. `withPlatformApiAuth` calls `resolveSessionAuthorization` and passes grants into `buildServiceRequestContext`.
2. All **six** Cap handlers pass `context.serviceContext.permissions` only — no append of Cap write sets.
3. Domain services fail closed on missing permissions.

## Remediation — HR-001 system-reporting removed

Cap F `qualityFactsPort.collect` no longer uses a privileged `system-reporting` actor with Cap E admin grants.

Facts are derived from Cap A–E **repositories** under the caller’s Cap F authority (`enterprise-reporting-runtime.ts`).

## Supporting controls

| Control    | Change                                                                               |
| ---------- | ------------------------------------------------------------------------------------ |
| Roles      | Seed `qep-operator` / `qep-reader`; Cap catalogue registered                         |
| Provision  | `tenant-member` has **no** Cap grants; `APZQEP_QEP_AUTO_ASSIGN_OPERATOR` opt-in only |
| Tenant RLS | `runWithTenantContext` + `applyPostgresTenantSession` on Cap TX path                 |

## Closure status

```text
Engineering remediation: IMPLEMENTED
RB-002 formal certification: PENDING (programme ENGINEERING IN PROGRESS)
Production GO: NOT AUTHORISED
After close: re-run APZQEP-150
```
