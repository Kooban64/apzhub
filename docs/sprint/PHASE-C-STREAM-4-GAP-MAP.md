# PHASE C — Gap Map (Stream 4 APZPRD)

| Field     | Value                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | Living — accompanies Phase C code                                                                                                           |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) **ACCEPTED** · Phase A+B complete · **Phase C ACTIVE** |
| Spec      | [UX-STREAM-004](../ux/UX-STREAM-004-apzprd-enterprise-productivity.md) · [SPR-UX-STREAM-004](./SPR-UX-STREAM-004-apzprd-ui-ux.md)           |
| Proofs    | Support three-pane + requester · Global timer · Projects board/drawer · My Work · Time approve · Inspector · Preview · R4-06 polish         |

> Gap-map existing implementation first. Preserve Phase A AuthZ/shell and Phase B commerce. No parallel productivity stack. Providers masked.

---

## KEEP / SHIPPED

| Area                                  | Note                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Support three-pane + Start Timer      | Agent workspace                                                                                    |
| Support requester mode                | `isSupportAgent` / `isSupportRequesterOnly` — hides queue, agent filters, internal notes, commands |
| Support requester product role        | Slim `product-support-requester` seeded (no assign/transition/groups/users)                        |
| Global timer                          | Shell chrome                                                                                       |
| Projects board / drawer / Start Timer | Uses `UniversalPreviewDrawer`                                                                      |
| My Work tabs                          | `/workspace/my-work`                                                                               |
| Time approve/return                   | APZ overlay ledger + detail panel (reason required to return)                                      |
| User Inspector                        | Expanded: provision status, org products, product role hints, why lines                            |
| Universal preview drawer              | `components/preview/universal-preview-drawer.tsx`                                                  |
| Workflow My approvals                 | Home strip + approvals page framing                                                                |
| Analytics APZ dashboards + drill      | Home dashboards strip; related products → workbench links                                          |
| Knowledge contextual suggestions      | Home + Support request context pane                                                                |
| Documents explorer + preview          | Library framed as Document explorer; metadata preview drawer                                       |

---

## PARTIAL / LATER

| Gap                          | Action                                                      |
| ---------------------------- | ----------------------------------------------------------- |
| Time approve in engine       | Overlay only; Kimai remains SoR for entries                 |
| Notifications product events | Wire Time G-20 later                                        |
| Professional Tools admin     | Separate entitlement surface                                |
| Projects timeline            | Board shipped; timeline later                               |
| Knowledge → Projects drawer  | Support consumer shipped; Projects mount optional follow-on |

---

## Ship tracking (SPR-UX-STREAM-004)

| ID    | Ship                                    | Status                                      |
| ----- | --------------------------------------- | ------------------------------------------- |
| R4-00 | Spec freeze + gap map                   | **Done**                                    |
| R4-01 | Shell · Home · My Work                  | **Done** (My Work tabs)                     |
| R4-02 | Search · QA · Notify · Activity · Prefs | KEEP                                        |
| R4-03 | Projects board/drawer/timer             | **Done**                                    |
| R4-04 | Support three-pane · requester          | **Done**                                    |
| R4-05 | Global timer · manager approve          | **Done**                                    |
| R4-06 | Workflow · Analytics · Knowledge · Docs | **Done** (signature polish)                 |
| R4-07 | Related work · preview drawers          | **Done** (universal drawer primitive)       |
| R4-08 | User Inspector · billing bridge         | **Done** (inspector expanded; billing KEEP) |
| R4-09 | Mobile / a11y / freshness               | Continuous                                  |

---

## Risks

- Dual OperatorShell vs DesktopShell residual from Phase A
- Approval overlay must not be mistaken for Kimai-native approval
- Requester role must never include agent permissions (`support.*` / assign / transition)
