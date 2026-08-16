# PHASE E — Gap Map (Shared Source Workspace · write track)

| Field     | Value                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | Living — Phase E **ACTIVE**                                                                                                                              |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) · [SPR-UX-PHASE-E-SHARED-SOURCE](./SPR-UX-PHASE-E-SHARED-SOURCE.md) |
| Spec      | [UX-SHARED-SOURCE-WORKSPACE](../ux/UX-SHARED-SOURCE-WORKSPACE.md)                                                                                        |
| Prior     | Phase D Q2-06 / P3-02 browse + path explorer **CERTIFIED**                                                                                               |

> Gap-map first. Preserve `/workspace/source` Phase-1 browse. Extend provider contract + APIs; do not fork product browsers. Review/Merge/Repo Admin = later.

---

## KEEP (from Phase D)

| Area             | Path / note                                            |
| ---------------- | ------------------------------------------------------ |
| Source home      | `/workspace/source` repositories + recent changes      |
| Repo change list | `/workspace/source/repositories/:id`                   |
| Change detail    | Path-only file explorer + QEP/PEN overlay links        |
| QEP SCM admin    | Register / sync / providers under `/workspace/qep/scm` |
| PR Quality       | Quality overlay — not Source ownership                 |

---

## Ship tracking

| ID  | Ship                                         | Status                                                   |
| --- | -------------------------------------------- | -------------------------------------------------------- |
| E0  | Sprint + gap map                             | **Done**                                                 |
| E1  | Tree · file open · read editor · content API | **Done** (`/api/v1/source/.../tree                       | file` · repo workspace) |
| E2  | Branches · commits · diff                    | **Done** (branch select · history · diff viewer)         |
| E3  | `source.write` · edit buffer · commit        | **Done** (gate + dirty buffer + commit)                  |
| E4  | Create branch · adapter commit/push          | **Done** (offline CE + live GitHub Contents API)         |
| E5  | Create pull request                          | **Done** (“change request” chrome · adapter PR create)   |
| E6  | Panes · tabs · keyboard · overlay polish     | Later (3-pane shell shipped; tabs/keyboard polish later) |

---

## Risks

- Do not overload `qep.scm.operate` as git write
- Live GitHub write requires server PAT — offline CE must remain usable
- Diff/search depth may lag editor; document honesty if partial
- Phase 3 Review/Merge out of scope
