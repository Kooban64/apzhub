# PHASE C — Gap Map (Stream 4 APZPRD)

| Field     | Value                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | Living — accompanies Phase C code                                                                                                           |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) **ACCEPTED** · Phase A+B complete · **Phase C ACTIVE** |
| Spec      | [UX-STREAM-004](../ux/UX-STREAM-004-apzprd-enterprise-productivity.md) · [SPR-UX-STREAM-004](./SPR-UX-STREAM-004-apzprd-ui-ux.md)           |
| Proofs    | (1) Support three-pane + global timer · (2) Projects drawer/board + Start Timer · (3) My Work tabs `/workspace/my-work`                     |

> Gap-map existing implementation first. Preserve Phase A AuthZ/shell and Phase B commerce. No parallel productivity stack. Providers masked.

---

## KEEP (from Phase A / B / PRWL + Phase C shipped)

| Area                           | Path                                                        | Note                      |
| ------------------------------ | ----------------------------------------------------------- | ------------------------- |
| AuthN / AuthZ                  | `packages/auth`, `packages/platform-authorization`          | Sole engines              |
| Entitlement shell chrome       | `workbench-header-chrome`, `product-switcher`, DesktopShell | Filtered nav              |
| Search · Quick Actions         | `packages/workspace` global dialogs                         | Production Ready          |
| Activity · Personalisation     | unified-activity · personalisation centre                   | Production Ready          |
| Support three-pane             | `support-queue-pane` + frame `data-layout=three-pane`       | Phase C vertical 1        |
| Global timer                   | `global-time-timer` in workbench                            | Persists across products  |
| Projects list / board / drawer | `projects-tasks-view` + board + drawer + Start Timer        | Phase C vertical 2        |
| My Work queues                 | `/workspace/my-work` + tab filters                          | Phase C vertical 3        |
| Commerce expansion             | Stream 1 catalogue + provision                              | Add product → nav appears |
| Thin Inspect access            | `effective-access-inspector` + org members                  | Seed for User Inspector   |

---

## PARTIAL

| Gap                          | Action                                    |
| ---------------------------- | ----------------------------------------- |
| Home attention               | Role home KEEP; deepen live metrics later |
| Support requester UX         | Hide agent queues for requesters          |
| Time manager approve         | Approve/return with reason                |
| Projects timeline            | Board shipped; full timeline later        |
| Notifications product events | Wire Time G-20 etc.                       |
| User Inspector               | Expand thin Inspect into flagship         |
| Cross-product Related Work   | Universal preview drawer                  |

---

## MISSING (remaining)

1. Requester-simple Support experience
2. Manager Time approve/return with reason
3. Projects timeline signature
4. Full User Inspector (Pro Tools, joiner/mover/leaver, licence → Add Licence)
5. Professional Tools admin surface
6. Universal preview drawer primitive

---

## Ship tracking (SPR-UX-STREAM-004)

| ID    | Ship                                    | Status                                         |
| ----- | --------------------------------------- | ---------------------------------------------- |
| R4-00 | Spec freeze + gap map                   | **Done**                                       |
| R4-01 | Entitlement shell · Home · My Work      | **Partial → Done for My Work tabs**            |
| R4-02 | Search · QA · Notify · Activity · Prefs | KEEP (notify wiring later)                     |
| R4-03 | Projects board/drawer/timer             | **Done** (board + drawer + Start Timer)        |
| R4-04 | Support three-pane · requester          | **Partial** — three-pane done; requester later |
| R4-05 | Global timer · manager approve          | **Partial** — global timer done; approve later |
| R4-06 | Workflow · Analytics · Knowledge · Docs | Later polish                                   |
| R4-07 | Related work · preview drawers          | Later                                          |
| R4-08 | User Inspector · billing bridge         | Later (thin KEEP)                              |
| R4-09 | Mobile / a11y / freshness               | Continuous                                     |

### Certified slices

```text
1) Support Agent → three-pane ticket → Start Timer → global timer
2) Projects Tasks → Board/List → task drawer → Start Timer
3) Home → My Work (/workspace/my-work) → All|Tasks|Tickets|Approvals|Time tabs
```

---

## Risks

- Dual OperatorShell vs DesktopShell residual from Phase A
- Over-rebuilding provider admin consoles (forbidden)
- Treating PRD as seven app launchers instead of assembled workspace
