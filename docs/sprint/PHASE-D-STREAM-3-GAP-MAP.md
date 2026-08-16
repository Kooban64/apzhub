# PHASE D — Gap Map (Stream 3 APZPEN)

| Field     | Value                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | Living — Phase D **ACTIVE**                                                                                                                 |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) **ACCEPTED** · Phase A–C complete · **Phase D ACTIVE** |
| Spec      | [UX-STREAM-003](../ux/UX-STREAM-003-apzpen-security-assurance.md) · [SPR-UX-STREAM-003](./SPR-UX-STREAM-003-apzpen-ui-ux.md)                |
| Sibling   | [PHASE-D-STREAM-2-GAP-MAP](./PHASE-D-STREAM-2-GAP-MAP.md) · Shared Source track                                                             |

> Gap-map first. Preserve `/apzpen/*` OperatorShell. No Kali-in-browser. No scanner aggregator UX. Providers subordinate.

---

## KEEP

| Area                 | Path / note                                  |
| -------------------- | -------------------------------------------- |
| Home / My Work       | `/apzpen` · `/apzpen/my-work` (thin queues)  |
| Engagements          | List + detail (RoE, scope, dispatch, ingest) |
| Findings list        | Normalised table + operator controls         |
| Remediation / Retest | Side-by-side workbench (**P3-07 Done**)      |
| Evidence / Assets    | Thin inventory                               |
| Certification        | Partial posture/ledger                       |
| Customer portal      | Partial KEEP                                 |

---

## Ship tracking (SPR-UX-STREAM-003)

| ID    | Ship                                        | Status                                        |
| ----- | ------------------------------------------- | --------------------------------------------- |
| P3-00 | Spec freeze + gap map                       | **Done**                                      |
| P3-01 | Shell · home · personas · assets            | KEEP · polish later                           |
| P3-02 | Shared Source consumer (security overlay)   | **Phase-1 Done** (link → `/workspace/source`) |
| P3-03 | Engagements · scope · RoE · authorisation   | KEEP                                          |
| P3-04 | Engagement Workbench                        | **Done** (tabbed workbench)                   |
| P3-05 | Tools centre · normalised findings          | KEEP ingest                                   |
| P3-06 | Finding Detail · evidence · HTTP viewer     | **Done** (`/apzpen/findings/[id]`)            |
| P3-07 | Remediation · PR · retest · risk acceptance | **Done** (queue + side panel)                 |
| P3-08 | Assurance · certification · reports         | Later polish                                  |
| P3-09 | QEP/PRD bridges · search · entitlements     | KEEP platform                                 |

---

## Risks

- No hacker aesthetic / terminal-only UX
- Finding detail links already pointed to `/apzpen/findings/[id]` — page must exist
- Professional tool identity only inside evidence, not primary chrome
