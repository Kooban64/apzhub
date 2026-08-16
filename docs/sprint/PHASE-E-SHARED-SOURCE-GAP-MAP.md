# PHASE E — Gap Map (Shared Source Workspace · write track)

| Field     | Value                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | **PHASE E COMPLETE · CERTIFIED 100%** — 2026-08-16                                                                                                       |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) · [SPR-UX-PHASE-E-SHARED-SOURCE](./SPR-UX-PHASE-E-SHARED-SOURCE.md) |
| Spec      | [UX-SHARED-SOURCE-WORKSPACE](../ux/UX-SHARED-SOURCE-WORKSPACE.md)                                                                                        |
| Prior     | Phase D Q2-06 / P3-02 browse + path explorer **CERTIFIED**                                                                                               |

> Gap-map first. Preserve `/workspace/source` Phase-1 browse. Extend provider contract + APIs; do not fork product browsers. Review/Merge/Repo Admin = later.

---

## KEEP / SHIPPED

| Area           | Path / note                                                           |
| -------------- | --------------------------------------------------------------------- |
| Source home    | `/workspace/source` repositories + recent changes                     |
| Repo workspace | Tree · tabs · editor · branch/commit/PR · keyboard · context overlays |
| Change detail  | Path explorer + link into repository workspace                        |
| QEP SCM admin  | Register / sync / providers under `/workspace/qep/scm`                |
| APIs           | `/api/v1/source/*` content + write                                    |
| Permissions    | `source.read` · `source.write` (operate may write in CE)              |

---

## Ship tracking — ALL DONE

| ID  | Ship                                         | Status                                                   |
| --- | -------------------------------------------- | -------------------------------------------------------- |
| E0  | Sprint + gap map                             | **Done**                                                 |
| E1  | Tree · file open · read editor · content API | **Done**                                                 |
| E2  | Branches · commits · diff                    | **Done**                                                 |
| E3  | `source.write` · edit buffer · commit        | **Done**                                                 |
| E4  | Create branch · adapter commit/push          | **Done**                                                 |
| E5  | Create pull request                          | **Done**                                                 |
| E6  | Panes · tabs · keyboard · overlay polish     | **Done** (tabs · j/k/Enter · Ctrl+Tab/W · 3-pane chrome) |

### Live cert (2026-08-16)

```text
/workspace/source
/workspace/source/repositories/:id  (tabs · tree · editor · context)
/api/v1/source/capabilities
/api/v1/source/repositories/:id/{tree,file,branches,commits,diff,commit,pull-requests}
```

Unit: `editor-tabs.test.ts` · `source-phase-e.test.ts` (offline workspace).

---

## Risks (residual · accepted)

- Phase F closed remaining Source phase-3 leftovers (Review/Merge/Admin · GitLab parity · nested tree · search · dense editor)
- Monaco vendor IDE not required — line-number editor satisfies locked editor surface

---

## Next programme phase

Absorbed by [PHASE-F-SHARED-SOURCE-GAP-MAP](./PHASE-F-SHARED-SOURCE-GAP-MAP.md) — Shared Source track **CERTIFIED 100%**.
