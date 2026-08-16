# PHASE D — Gap Map (Stream 2 APZQEP)

| Field     | Value                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | Living — Phase D **ACTIVE**                                                                                                                 |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) **ACCEPTED** · Phase A–C complete · **Phase D ACTIVE** |
| Spec      | [UX-STREAM-002](../ux/UX-STREAM-002-apzqep-quality-engineering-platform.md) · [SPR-UX-STREAM-002](./SPR-UX-STREAM-002-apzqep-ui-ux.md)      |
| Sibling   | [PHASE-D-STREAM-3-GAP-MAP](./PHASE-D-STREAM-3-GAP-MAP.md) · Shared Source track                                                             |

> Gap-map first. Preserve Cap A–F / SPR-201+ workbenches under `/workspace/qep/*`. No TCMS clone. Providers subordinate. No false green.

---

## KEEP

| Area                     | Path / note                                                    |
| ------------------------ | -------------------------------------------------------------- |
| Home / Command Centre    | `/workspace/qep/home` · `qep-home-views.tsx`                   |
| Requirements / baselines | `qep-requirements-views` · enterprise coverage                 |
| Test specs / plans       | Full workbenches                                               |
| Execution / suites       | API-complete; **Q2-04 step-focus Done**                        |
| Evidence / Traceability  | Production-ready centres                                       |
| Verification             | Queue / team / dashboard                                       |
| Certification / RC       | **Q2-10 polish Done** (Review for Certification CTAs)          |
| Defects / Automation     | KEEP · **Q2-05 flaky centre Done**                             |
| SCM                      | KEEP admin · **PR Quality Done** (`/workspace/qep/pr-quality`) |

---

## Ship tracking (SPR-UX-STREAM-002)

| ID    | Ship                                       | Status                                           |
| ----- | ------------------------------------------ | ------------------------------------------------ |
| Q2-00 | Spec freeze + gap map                      | **Done**                                         |
| Q2-01 | Shell · product switcher · project context | KEEP                                             |
| Q2-02 | Persona-aware Home + My Work               | **Done** (`/workspace/qep/my-work`)              |
| Q2-03 | Requirements · coverage · traceability     | KEEP (polish later)                              |
| Q2-04 | Test repository · plans · execution        | **Done** (step-focus + shortcuts + fail→defect)  |
| Q2-05 | Automation centre · flaky                  | **Done** (justified flaky + `/automation/flaky`) |
| Q2-06 | Shared Source · PR Quality                 | **Done** (Source browse + PR Quality View)       |
| Q2-07 | Defects · retest                           | KEEP                                             |
| Q2-08 | Evidence · Quality Graph                   | Later graph                                      |
| Q2-09 | Security/Perf/A11y domains                 | Later                                            |
| Q2-10 | Release Control · cert pack                | **Done** (Review for Certification + cert packs) |
| Q2-11 | Insights · search · QA · notify            | KEEP platform                                    |
| Q2-12 | Admin · providers · entitlements           | Later                                            |

---

## Risks

- Do not invent GitHub/TestRail branding on primary nav
- Shared Source Workspace is programme-wide — do not fork a QEP-only browser
- Certification must remain evidence-traceable (no fake green)
