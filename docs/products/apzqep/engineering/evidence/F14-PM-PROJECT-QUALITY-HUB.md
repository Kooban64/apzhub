# F14 — PM Project Quality Hub (Portfolio)

| Field       | Value                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| Status      | **IMPLEMENTED** 2026-08-10                                                             |
| Bar         | Create/list quality project · attach SCM repo ids · token health · project QEP insight |
| Maps to     | [QUALITY-OPERATING-LOOP.md](../../QUALITY-OPERATING-LOOP.md) · WF-01                   |
| Not claimed | Browser PAT; Plane project SoR sync; durable Postgres project store; F15 QA Gate       |

## Pattern

```text
PM creates quality project
  → attaches RegisteredRepository.repositoryId[] (SCM remains SoR)
  → sees token configured/missing (server secrets only)
  → insight: changes · dispatches · defects(soft) · latest cert
  → deep-links Early Check / Journey per change
```

## Surfaces

| Piece        | Path                                                           |
| ------------ | -------------------------------------------------------------- |
| UI           | `/workspace/qep/portfolio`                                     |
| Module       | `modules/qep-portfolio` (active)                               |
| List/Create  | `GET\|POST /api/v1/qep/portfolio/projects`                     |
| Insight      | `GET /api/v1/qep/portfolio/projects/{projectId}`               |
| Attach repos | `POST /api/v1/qep/portfolio/projects/{projectId}/repositories` |

## Permissions

- `qep.portfolio.read` / `qep.portfolio.operate` (also in operator/reader catalogues)

## Explicit outs

- Accepting GitHub PAT from the browser
- Full Plane/APZ Projects sync as quality SoR
- F15 QA Gate packaging

## Proof

1. Units: `quality-project-store.test.ts`
2. Module status active; workspace router wired
3. Handler policy: no client PAT fields; no certification mutation
