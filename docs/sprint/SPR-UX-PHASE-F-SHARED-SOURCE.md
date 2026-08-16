# SPR-UX-PHASE-F — Shared Source Review · Merge · Admin (leftovers closeout)

> **Status:** **COMPLETE · CERTIFIED 100%** — 2026-08-16  
> **Authority:** [UX-SHARED-SOURCE-WORKSPACE](../ux/UX-SHARED-SOURCE-WORKSPACE.md) · [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md)  
> **Gap map:** [PHASE-F-SHARED-SOURCE-GAP-MAP](./PHASE-F-SHARED-SOURCE-GAP-MAP.md)  
> **Depends on:** Phase E **COMPLETE · CERTIFIED 100%**  
> **Does not:** Fork QEP/PEN browsers · Provider product chrome · Kali / scanner UX

## Intent

Close Shared Source **phase 3** and Phase E residuals so the Source track is claimable at **100%**:

```text
(1) Browse / Diff / Context     ← Phase D/E
(2) Edit / Branch / Commit / PR ← Phase E
(3) Review / Merge / Repo Admin ← THIS SPRINT
```

Also clear: GitLab content/write parity · nested tree · in-workspace search · dense editor chrome (line numbers; Monaco not required).

## Signature ships

| ID  | Ship                                                            |
| --- | --------------------------------------------------------------- |
| F0  | Sprint + gap map                                                |
| F1  | GitLab content/write parity (offline + live where practical)    |
| F2  | Nested tree drill-down + path/content search                    |
| F3  | Review centre — list change requests · detail · merge           |
| F4  | Repo Admin — registration state · sync · health                 |
| F5  | Dense editor chrome (line numbers · search hits) · certify 100% |

## Definition of Done

- All F1–F5 Done; Phase E residuals closed or absorbed.
- Review/Merge/Admin reachable under `/workspace/source` without leaving APZ.
- GitHub + GitLab offline CE support content/write/merge.
- Provider names subordinate; `source.write` gates merge/write.
- Docs + programme order **CERTIFIED 100%** for Shared Source phases 1–3.
