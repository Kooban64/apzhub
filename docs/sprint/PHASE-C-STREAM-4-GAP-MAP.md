# PHASE C — Gap Map (Stream 4 APZPRD)

| Field       | Value                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Status      | Living — accompanies Phase C code                                                                                                           |
| Authority   | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) **ACCEPTED** · Phase A+B complete · **Phase C ACTIVE** |
| Spec        | [UX-STREAM-004](../ux/UX-STREAM-004-apzprd-enterprise-productivity.md) · [SPR-UX-STREAM-004](./SPR-UX-STREAM-004-apzprd-ui-ux.md)           |
| First proof | **Support Agent + Time Employee:** Home → Support three-pane → Start Timer from ticket → global timer → Search/QA respect AuthZ             |

> Gap-map existing implementation first. Preserve Phase A AuthZ/shell and Phase B commerce. No parallel productivity stack. Providers masked.

---

## KEEP (from Phase A / B / PRWL)

| Area                        | Path                                                          | Note                      |
| --------------------------- | ------------------------------------------------------------- | ------------------------- |
| AuthN / AuthZ               | `packages/auth`, `packages/platform-authorization`            | Sole engines              |
| Entitlement shell chrome    | `workbench-header-chrome`, `product-switcher`, DesktopShell   | Filtered nav              |
| Search · Quick Actions      | `packages/workspace` global dialogs                           | Production Ready          |
| Activity · Personalisation  | unified-activity · personalisation centre                     | Production Ready          |
| Support inbox / detail      | `support-inbox-view`, `support-request-detail-view`           | Agent foundation          |
| Time dashboard · week grid  | `time-dashboard-view`, `time-week-grid`, `time-recording-bar` | Bar not yet global        |
| Projects list / tasks       | `projects-*`                                                  | No board/drawer yet       |
| Workflow · Analytics · Docs | workbench modules                                             | PRWL surfaces             |
| Commerce expansion          | Stream 1 catalogue + provision                                | Add product → nav appears |
| Thin Inspect access         | `effective-access-inspector` + org members                    | Seed for User Inspector   |

---

## PARTIAL

| Gap                        | Action                                                                |
| -------------------------- | --------------------------------------------------------------------- |
| Home / My Work             | Deepen attention composition; add `/workspace/my-work` tabs           |
| Support two-pane frame     | Upgrade to **three-pane** (queue \| conversation \| context)          |
| Time recording bar         | Mount **global** running timer in shell; Start Timer from ticket/task |
| Projects tasks             | Task drawer + Start Timer + board                                     |
| Notifications              | Wire product events (Time G-20 etc.) into Attention Centre            |
| User Inspector             | Expand thin Inspect into flagship admin surface                       |
| Cross-product Related Work | Universal preview drawer + orchestrated context switch                |

---

## MISSING (after KEEP/PARTIAL)

1. Requester-simple Support experience (hide agent queues)
2. Manager Time approve/return with reason
3. Projects kanban/board + timeline signature
4. Full User Inspector (Pro Tools, joiner/mover/leaver, licence → Add Licence)
5. Professional Tools admin surface
6. Universal preview drawer primitive as Stream 4 signature

---

## Ship tracking (SPR-UX-STREAM-004)

| ID    | Ship                                    | Status                                                |
| ----- | --------------------------------------- | ----------------------------------------------------- |
| R4-00 | Spec freeze + gap map                   | **Done** (this doc)                                   |
| R4-01 | Entitlement shell · Home · My Work      | Partial → first vertical deepen                       |
| R4-02 | Search · QA · Notify · Activity · Prefs | KEEP (notify wiring later)                            |
| R4-03 | Projects board/drawer/timer             | Later vertical                                        |
| R4-04 | Support three-pane · requester          | **In progress** — three-pane + Start Timer shipped    |
| R4-05 | Global timer · manager approve          | **In progress** — global timer shipped; approve later |
| R4-06 | Workflow · Analytics · Knowledge · Docs | Later polish                                          |
| R4-07 | Related work · preview drawers          | Later                                                 |
| R4-08 | User Inspector · billing bridge         | Later (thin KEEP)                                     |
| R4-09 | Mobile / a11y / freshness               | Continuous                                            |

### First vertical — target cert

```text
Support Agent (APZOR)
  → Login → entitlement shell
  → Home attention
  → Support three-pane ticket workspace
  → Start Timer (ticket context)
  → Global timer persists across nav
  → Search / Quick Actions respect same access
```

---

## Risks

- Dual OperatorShell vs DesktopShell residual from Phase A
- Over-rebuilding provider admin consoles (forbidden)
- Treating PRD as seven app launchers instead of assembled workspace
