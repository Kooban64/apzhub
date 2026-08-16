# SPR-UX-PHASE-H — Projects & Source resource scopes

> **Status:** **COMPLETE · CERTIFIED 100%** — 2026-08-16  
> **Authority:** [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) · Stream 6 freeze · Phase G residual  
> **Gap map:** [PHASE-H-RESOURCE-SCOPES-GAP-MAP](./PHASE-H-RESOURCE-SCOPES-GAP-MAP.md)  
> **Depends on:** Phase G Support queue scopes certified  
> **Does not:** Full Operator/Desktop chrome unify · New Owner ADR · Parked APZPEN

## Intent

Extend Phase G Support `support.queue:{id}` pattern to:

| Domain   | Grant key                      |
| -------- | ------------------------------ |
| Projects | `projects.project:{projectId}` |
| Source   | `source.repo:{repositoryId}`   |

Also close ADOPT-003 **F1** — dedicated `GET /api/v1/projects/readiness`.

## Signature ships

| ID  | Ship                                             |
| --- | ------------------------------------------------ |
| H0  | Sprint + gap map + programme note                |
| H1  | Shared `resource-scope` + Projects list/get gate |
| H2  | Source/SCM repo list/get + workspace write gates |
| H3  | Projects readiness route (F1)                    |
| H4  | Unit tests + closeout when DoD met               |

## Definition of Done

- Scoped grants constrain Projects list/get
- Scoped grants constrain Source/SCM repository access
- `/api/v1/projects/readiness` does not collide with `[projectId]`
- Gap map CERTIFIED when H1–H3 Done
