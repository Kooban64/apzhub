# SPR-UX-PHASE-E — Shared Source Workspace (write track)

> **Status:** **COMPLETE · CERTIFIED 100%** — 2026-08-16  
> **Authority:** [UX-SHARED-SOURCE-WORKSPACE](../ux/UX-SHARED-SOURCE-WORKSPACE.md) · [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md)  
> **Gap map:** [PHASE-E-SHARED-SOURCE-GAP-MAP](./PHASE-E-SHARED-SOURCE-GAP-MAP.md)  
> **Depends on:** Phase A–D **COMPLETE · CERTIFIED 100%**  
> **Does not:** Fork QEP/PEN browsers · Expose GitHub product chrome · Ship Review/Merge/Repo Admin (phase 3) · Kali / scanner UX

## Intent

Advance the locked Shared Source track from phase-1 browse into **Cursor-quality read depth + permission-gated write**:

```text
(1) Browse / Search / History / Diff / Context   ← Phase D baseline + Phase E deepen
(2) Edit / Branch / Commit / Push / PR           ← THIS SPRINT
(3) Review / Merge / Repo Admin                  ← later sprint
```

One platform surface under `/workspace/source`. QEP and PEN remain overlay consumers only.

## Signature ships

| ID  | Ship                                                               |
| --- | ------------------------------------------------------------------ |
| E0  | Sprint guide + gap map + programme registry                        |
| E1  | Repository tree · open file · read editor pane · content API       |
| E2  | Branch selector · commit history · unified diff viewer             |
| E3  | `source.write` permission · dirty edit buffer · save → commit      |
| E4  | Create branch · commit/push via adapter (offline CE + live GitHub) |
| E5  | Create pull request (provider-neutral; no GitHub product branding) |
| E6  | Workspace chrome polish — panes · tabs · keyboard open · overlays  |

## Architecture rules

- **Platform Service / Integration SDK** owns Source — modules never call providers.
- Prefer `/api/v1/source/*` for workspace content/write; reuse registered SCM repos from the existing engine.
- New permission **`source.write`** gates mutate ops. Read stays `qep.scm.read` / `source.read`.
- `qep.scm.operate` is **not** git write (register/sync only).
- Providers subordinate; offline CE demo content allowed and must be honest.
- No separate QEP Source or PEN Source browsers.

## Definition of Done

- Gap map ships E1–E6 Done or KEEP with accepted residuals documented.
- User with read can open files, switch branches, view history/diff.
- User with `source.write` can edit, create branch, commit, open PR via APZ UI.
- Readers without write see read-only editor (no silent write).
- Provider names absent from primary chrome.
- Unit tests cover offline tree/content/commit/PR paths.
- Docs registry + programme order updated; stop before Review/Merge phase 3.
