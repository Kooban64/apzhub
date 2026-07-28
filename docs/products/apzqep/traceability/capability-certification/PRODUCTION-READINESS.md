# Traceability Production Readiness

## Verdict

**PRODUCTION READY WITH LIMITATIONS** for the authorised APZ QEP Traceability capability baseline (`@apzhub/qep-traceability` **1.0.0**), pending Owner Acceptance of **APZQEP-TRACE-001**.

## Preconditions to operate

1. Platform 1.4 certified runtime (auth, gateway, PostgreSQL, Redis as applicable).
2. Apply QEP Traceability migrations **0079** and **0080** in order (after Requirements migrations through **0078** where co-deployed).
3. Deploy `@apzhub/qep-traceability` **1.0.0**, module `qep-traceability` **1.0.0**, and `apps/web` Workbench surfaces.
4. Grant required `qep.traceability.*` permissions (view/create/modify/validate/approve/retire/supersede/history/taxonomy as needed).
5. Confirm search publication hooks for entity `trace_link`.
6. Confirm Requirements **1.0.0** (frozen) available where Trace Links pin Requirements endpoints.

## Go / No-go checklist

| Check            | Go criteria                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------- |
| Migrations       | 0079 + 0080 applied without error; RLS active                                             |
| Health           | Platform + QEP health endpoints OK                                                        |
| AuthZ            | View-only user cannot mutate; lifecycle permissions gate transitions                      |
| Workbench        | Open Explorer, Matrix, Inspector, History, Taxonomy under `/workspace/qep/traceability/*` |
| Smoke            | Create draft Trace Link → validate → approve path; history appends                        |
| availableActions | UI reflects server DTO; no client-invented transitions                                    |
| Search           | Projection lag acceptable; detail reload from SoR                                         |
| Isolation        | Tenant A cannot read/mutate Tenant B Trace Links                                          |

## Qualifications

See [KNOWN-LIMITATIONS.md](./KNOWN-LIMITATIONS.md). Limitations are intentional scope boundaries unless noted as operational constraints (e.g. search eventual consistency, Playwright smoke depth, permissive endpoint resolver for unimplemented domains).

## Related reviews

- [OPERATIONAL-READINESS-REVIEW.md](./OPERATIONAL-READINESS-REVIEW.md)
- [SECURITY-REVIEW.md](./SECURITY-REVIEW.md)
- [PERFORMANCE-REVIEW.md](./PERFORMANCE-REVIEW.md)
