# PHASE C — Gap Map (Stream 4 APZPRD)

| Field     | Value                                                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Status    | **STREAM 4 COMPLETE · CERTIFIED 100%** — 2026-08-16                                                                                                                                  |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) **ACCEPTED** · Phase A+B complete · **Phase C CLOSED**                                          |
| Spec      | [UX-STREAM-004](../ux/UX-STREAM-004-apzprd-enterprise-productivity.md) · [SPR-UX-STREAM-004](./SPR-UX-STREAM-004-apzprd-ui-ux.md)                                                    |
| DoD path  | My Work → Projects (list/board/timeline/drawer) → Support (three-pane / requester) → Time (timer · approve) → Workflow/Analytics/Knowledge/Docs → Org Professional Tools → Inspector |

> Gap-map existing implementation first. Preserve Phase A AuthZ/shell and Phase B commerce. No parallel productivity stack. Providers masked.

---

## KEEP / SHIPPED

| Area                                  | Path / note                                                                        |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| Support three-pane + Start Timer      | Agent workspace                                                                    |
| Support requester mode + product role | `isSupportRequesterOnly` · `product-support-requester`                             |
| Global timer                          | Shell chrome                                                                       |
| Projects list/board/timeline + drawer | Due-date timeline; Knowledge suggestions in drawer; Start Timer                    |
| My Work tabs                          | `/workspace/my-work`                                                               |
| Time approve/return + G-20            | Overlay ledger; approve/return → notification intents (`time`)                     |
| User Inspector                        | Expanded inspect + Professional Tools why-line                                     |
| Universal preview drawer              | Focus trap + restore (R4-09 quick win)                                             |
| Workflow My approvals                 | Home strip + approvals framing                                                     |
| Analytics APZ dashboards + drill      | Home strip; related products → workbench                                           |
| Knowledge contextual suggestions      | Home + Support + Projects drawer                                                   |
| Documents explorer + preview          | Metadata preview drawer                                                            |
| Professional Tools admin              | `/org/professional-tools` grant ledger (reason/expiry/revoke) — no provider launch |
| Portfolio / delivery timelines        | Existing KEEP under Projects portfolio                                             |

---

## Ship tracking (SPR-UX-STREAM-004) — ALL DONE

| ID    | Ship                                    | Status                                                          |
| ----- | --------------------------------------- | --------------------------------------------------------------- |
| R4-00 | Spec freeze + gap map                   | **Done**                                                        |
| R4-01 | Shell · Home · My Work                  | **Done**                                                        |
| R4-02 | Search · QA · Notify · Activity · Prefs | **KEEP**                                                        |
| R4-03 | Projects board/drawer/timer/timeline    | **Done**                                                        |
| R4-04 | Support three-pane · requester          | **Done**                                                        |
| R4-05 | Global timer · manager approve · G-20   | **Done**                                                        |
| R4-06 | Workflow · Analytics · Knowledge · Docs | **Done**                                                        |
| R4-07 | Related work · preview drawers          | **Done**                                                        |
| R4-08 | User Inspector · Professional Tools     | **Done** (billing KEEP; PT grant surface shipped)               |
| R4-09 | Mobile / a11y / freshness               | **Done for Stream 4** (drawer a11y); continuous excellence KEEP |

### Live cert (2026-08-16)

Unit: timesheet approvals (submittedBy), professional-tools ledger, analytics drill paths, staff product roles — **pass**.

Signature surfaces present in tree:

```text
/workspace/my-work
/workspace/projects (tasks list | board | timeline + drawer)
/workspace/support (three-pane agent · requester-simple)
/workspace/time (+ approval panel · G-20 intents when delivery enabled)
/workspace/workflow · /analytics · /knowledge · /documents
/org/professional-tools
```

Provider names remain masked on normal product surfaces. Overlay Time approval is **not** Kimai-native.

---

## Risks (residual · accepted)

- Dual OperatorShell vs DesktopShell residual from Phase A
- Time approval overlay ≠ Kimai SoR; notify best-effort when delivery flag off
- Professional Tools grants do **not** launch n8n/Metabase SSO in Stream 4 (honest boundary)
- Plane-native Gantt / issue timeline API absent — APZ due-date timeline + portfolio timelines cover Stream 4
- Full mobile tablet excellence remains continuous platform quality (R4-09 baseline met)

---

## Next programme phase

Phase C (Stream 4) **CLOSED**. Next Owner-authorised streams per [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) (e.g. Streams 2/3 QEP/PEN deep UX) require a new sprint guide.
