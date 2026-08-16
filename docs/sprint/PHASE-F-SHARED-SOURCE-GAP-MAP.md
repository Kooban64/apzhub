# PHASE F — Gap Map (Shared Source · Review/Merge/Admin)

| Field     | Value                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | **PHASE F COMPLETE · CERTIFIED 100%** — 2026-08-16                                                                                                       |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) · [SPR-UX-PHASE-F-SHARED-SOURCE](./SPR-UX-PHASE-F-SHARED-SOURCE.md) |
| Spec      | [UX-SHARED-SOURCE-WORKSPACE](../ux/UX-SHARED-SOURCE-WORKSPACE.md)                                                                                        |
| Prior     | Phase E write track **CERTIFIED 100%**                                                                                                                   |

> Shared Source phases 1–3 **COMPLETE**. Phase E leftovers absorbed.

---

## Ship tracking — ALL DONE

| ID  | Ship                              | Status                                                               |
| --- | --------------------------------- | -------------------------------------------------------------------- |
| F0  | Sprint + gap map                  | **Done**                                                             |
| F1  | GitLab content/write parity       | **Done** (offline workspace + live tree/file/branch/commit/MR/merge) |
| F2  | Nested tree · path/content search | **Done** (expandable tree · `/search`)                               |
| F3  | Review · merge                    | **Done** (`/repositories/:id/review` · merge API)                    |
| F4  | Repo Admin                        | **Done** (`/repositories/:id/admin` · sync/state)                    |
| F5  | Dense editor · certify 100%       | **Done** (line-number editor · programme closeout)                   |

### Live cert surfaces

```text
/workspace/source
/workspace/source/repositories/:id
/workspace/source/repositories/:id/review
/workspace/source/repositories/:id/admin
/api/v1/source/repositories/:id/{search,pull-requests,pull-requests/:n/merge}
```

---

## Residual (none for Source track DoD)

- Monaco vendor IDE not adopted — dense line-number editor satisfies locked editor surface without a new dependency
- Live compare/diff on GitLab may be thinner than offline; offline CE is honest and complete

---

## Programme

Shared Source Workspace phases **(1) browse (2) write (3) review/admin** are **COMPLETE · CERTIFIED 100%**.
