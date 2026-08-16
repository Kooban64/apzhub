# PHASE D — Gap Map (Stream 3 APZPEN)

| Field     | Value                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | **STREAM 3 COMPLETE · CERTIFIED 100%** — 2026-08-16                                                                                         |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) **ACCEPTED** · Phase A–C complete · **Phase D CLOSED** |
| Spec      | [UX-STREAM-003](../ux/UX-STREAM-003-apzpen-security-assurance.md) · [SPR-UX-STREAM-003](./SPR-UX-STREAM-003-apzpen-ui-ux.md)                |
| Sibling   | [PHASE-D-STREAM-2-GAP-MAP](./PHASE-D-STREAM-2-GAP-MAP.md) · Shared Source track                                                             |

> Gap-map first. Preserve `/apzpen/*` OperatorShell. No Kali-in-browser. No scanner aggregator UX. Providers subordinate.

---

## KEEP / SHIPPED

| Area                 | Path / note                                                       |
| -------------------- | ----------------------------------------------------------------- |
| Home / My Work       | Persona attention · queues · Assurance / Source / risk acceptance |
| Engagements          | List + detail · **tabbed Engagement Workbench**                   |
| Findings             | List + **structured finding detail**                              |
| Remediation / Retest | Side-by-side · formal risk acceptance · remediation change link   |
| Evidence / Assets    | Thin inventory KEEP                                               |
| Assurance            | ASSURED / WITH CONDITIONS / NOT ASSURED vocabulary                |
| Shared Source        | Security consumer + file explorer                                 |
| Customer portal      | Partial KEEP                                                      |

---

## Ship tracking (SPR-UX-STREAM-003) — ALL DONE

| ID    | Ship                                        | Status                                                          |
| ----- | ------------------------------------------- | --------------------------------------------------------------- |
| P3-00 | Spec freeze + gap map                       | **Done**                                                        |
| P3-01 | Shell · home · personas · assets            | **Done** (home persona attention + queue polish)                |
| P3-02 | Shared Source consumer (security overlay)   | **Done** (Source file explorer + overlays)                      |
| P3-03 | Engagements · scope · RoE · authorisation   | **KEEP**                                                        |
| P3-04 | Engagement Workbench                        | **Done** (tabbed workbench)                                     |
| P3-05 | Tools centre · normalised findings          | **KEEP** ingest                                                 |
| P3-06 | Finding Detail · evidence · HTTP viewer     | **Done** (`/apzpen/findings/[id]`)                              |
| P3-07 | Remediation · PR · retest · risk acceptance | **Done** (side panel · `/apzpen/risk-acceptance` · change link) |
| P3-08 | Assurance · certification · reports         | **Done** (ASSURED vocabulary · domain strip · packs)            |
| P3-09 | QEP/PRD bridges · search · entitlements     | **KEEP** platform                                               |

### Live cert (2026-08-16)

Signature surfaces present:

```text
/apzpen (Security Assurance home)
/apzpen/my-work · /apzpen/engagements (workbench tabs)
/apzpen/findings/[id]
/apzpen/remediation · /apzpen/retests · /apzpen/risk-acceptance
/apzpen/certification (Assurance Centre)
/workspace/source (shared consumer)
```

Silent Accept Risk blocked — formal acceptance required. Provider/tool identity stays inside evidence, not primary chrome.

---

## Risks (residual · accepted)

- Assets inventory remains thin (honest boundary)
- Customer portal partial KEEP
- Shared Source write/edit later (same programme phasing as Stream 2)
- Platform bridges (P3-09) continuous — not Phase D blockers

---

## Next programme phase

Commercial Platform UX programme phases A–D **COMPLETE**. No Phase E without a new approved sprint guide.
