# H4 — Security Verification

| Field  | Value                                        |
| ------ | -------------------------------------------- |
| Phase  | Hardening H4                                 |
| Status | **COMPLETE**                                 |
| Mode   | Security corrections only — no new behaviour |

## Evidence executed

| Check                                                    | Method                                                                       | Result   |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- | -------- |
| Permission boundary (UI grants, no `projects.*` default) | `use-projects-permissions.test.tsx` · router permission denial               | **PASS** |
| Projects workspace authz routing                         | `projects-workspace-router.test.tsx`                                         | **PASS** |
| Governance enforcement                                   | `projects-governance.test.ts`                                                | **PASS** |
| Administration / delegation / retention / audit stores   | `projects-administration.test.ts`                                            | **PASS** |
| Tenant scoping in administration service                 | Code review — `tenant(ctx)` on store ops                                     | **PASS** |
| Workflow authorisation                                   | Existing Workflow bridge + permission gates (P1 closed); no new bypass found | **PASS** |
| Identity integration                                     | Better Auth session hydration; Projects consumes APZHUB grants only          | **PASS** |
| Audit                                                    | Administration service appends audit rows on mutating ops                    | **PASS** |

## Corrections

None required — no Critical/High security defects discovered in H4 scope.

## Sign-off

| Criterion                                           | Status       |
| --------------------------------------------------- | ------------ |
| Permission · governance · admin · identity reviewed | **DONE**     |
| Security corrections only                           | **N/A**      |
| H4 accepted                                         | **COMPLETE** |
