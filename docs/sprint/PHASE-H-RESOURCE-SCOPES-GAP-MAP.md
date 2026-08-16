# PHASE H — Gap Map (Projects & Source resource scopes)

| Field     | Value                                                                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status    | **COMPLETE · CERTIFIED 100%** — 2026-08-16                                                                                                                   |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) · [SPR-UX-PHASE-H-RESOURCE-SCOPES](./SPR-UX-PHASE-H-RESOURCE-SCOPES.md) |
| Prior     | [PHASE-G-STREAMS-5-6-HORIZONTAL-GAP-MAP](./PHASE-G-STREAMS-5-6-HORIZONTAL-GAP-MAP.md) — Support queues done; Projects/repos closed here                      |

> Gap-map first. Same AuthZ permission strings — no parallel scope system.

---

## Ship tracking

| ID  | Ship                                    | Status               |
| --- | --------------------------------------- | -------------------- |
| H0  | Sprint + registry                       | **Done**             |
| H1  | Projects `projects.project:{id}` scopes | **Done**             |
| H2  | Source `source.repo:{id}` scopes        | **Done**             |
| H3  | Projects readiness route (ADOPT-003 F1) | **Done**             |
| H4  | Unit cert + closeout                    | **Done · CERTIFIED** |

### Notes

- Shared helper: `apps/web/lib/authz/resource-scope.ts`
- Unrestricted when no scoped grants (backward compatible)
- Wildcards: `projects.*` · `source.*` · `qep.*` · `*`
- Unit: `resource-scope.test.ts` · `project-scope.test.ts` · `repo-scope.test.ts`

## Certification

| Check                     | Evidence                                     |
| ------------------------- | -------------------------------------------- |
| Projects list/get scoped  | `handlers/projects.ts` + project-scope tests |
| Source/SCM repo scoped    | `source-workspace.ts` · `qep-scm.ts` + tests |
| Readiness path fixed (F1) | `app/api/v1/projects/readiness/route.ts`     |

**Verdict:** Phase H **CERTIFIED 100%**. Stream 6 resource-scope residual (Support → Projects → Source) closed for programme order.
