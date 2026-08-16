# PHASE D — Gap Map (Stream 2 APZQEP)

| Field     | Value                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | **STREAM 2 COMPLETE · CERTIFIED 100%** — 2026-08-16                                                                                         |
| Authority | [OWNER-UX-STREAMS-PROGRAMME-ORDER](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md) **ACCEPTED** · Phase A–C complete · **Phase D CLOSED** |
| Spec      | [UX-STREAM-002](../ux/UX-STREAM-002-apzqep-quality-engineering-platform.md) · [SPR-UX-STREAM-002](./SPR-UX-STREAM-002-apzqep-ui-ux.md)      |
| Sibling   | [PHASE-D-STREAM-3-GAP-MAP](./PHASE-D-STREAM-3-GAP-MAP.md) · Shared Source track                                                             |

> Gap-map first. Preserve Cap A–F / SPR-201+ workbenches under `/workspace/qep/*`. No TCMS clone. Providers subordinate. No false green.

---

## KEEP / SHIPPED

| Area                     | Path / note                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| Home / Command Centre    | `/workspace/qep/home` · persona My Work                            |
| Requirements / baselines | Enterprise coverage KEEP                                           |
| Test specs / plans       | Full workbenches · **Q2-04 step-focus**                            |
| Evidence / Traceability  | Production-ready · **Quality Graph**                               |
| Verification             | Queue / team / dashboard                                           |
| Certification / RC       | Review for Certification CTAs                                      |
| Defects / Automation     | Flaky centre · justified `mark_flaky`                              |
| SCM / Source             | Admin overlays · Shared Source browse + file explorer · PR Quality |
| Domains                  | Security / Perf / A11y hub (UNKNOWN ≠ pass)                        |
| Admin                    | Entitlements · providers · Source connect · onboarding checklist   |

---

## Ship tracking (SPR-UX-STREAM-002) — ALL DONE

| ID    | Ship                                       | Status                                           |
| ----- | ------------------------------------------ | ------------------------------------------------ |
| Q2-00 | Spec freeze + gap map                      | **Done**                                         |
| Q2-01 | Shell · product switcher · project context | **KEEP**                                         |
| Q2-02 | Persona-aware Home + My Work               | **Done** (`/workspace/qep/my-work`)              |
| Q2-03 | Requirements · coverage · traceability     | **KEEP**                                         |
| Q2-04 | Test repository · plans · execution        | **Done** (step-focus + shortcuts + fail→defect)  |
| Q2-05 | Automation centre · flaky                  | **Done** (justified flaky + `/automation/flaky`) |
| Q2-06 | Shared Source · PR Quality                 | **Done** (Source + file explorer + PR Quality)   |
| Q2-07 | Defects · retest                           | **KEEP**                                         |
| Q2-08 | Evidence · Quality Graph                   | **Done** (`/workspace/qep/quality-graph`)        |
| Q2-09 | Security/Perf/A11y domains                 | **Done** (`/workspace/qep/domains`)              |
| Q2-10 | Release Control · cert pack                | **Done** (Review for Certification + cert packs) |
| Q2-11 | Insights · search · QA · notify            | **KEEP** platform                                |
| Q2-12 | Admin · providers · entitlements           | **Done** (hub + soft entitlement + onboarding)   |

### Live cert (2026-08-16)

Signature surfaces present:

```text
/workspace/qep/home · /workspace/qep/my-work
/workspace/qep/... execution step-focus
/workspace/qep/automation/flaky
/workspace/source (+ change detail / file explorer)
/workspace/qep/pr-quality · /workspace/qep/quality-graph · /workspace/qep/domains
/workspace/qep/administration (entitlements · onboarding)
```

Provider names remain subordinate. Shared Source is programme-owned (not a QEP-only browser).

---

## Risks (residual · accepted)

- Shared Source **editor / write / PR create** remain phased later (browse/search/history/diff/context shipped)
- Domain signals are attention hubs — Security deep work stays in APZPEN when entitled
- Live automation / secret-backed SCM credentials stay ops-runbook controlled
- Continuous excellence on KEEP workbenches (Q2-03/07/11) remains open polish, not Phase D blockers

---

## Next programme phase

Commercial Platform UX programme phases A–D **COMPLETE**. No Phase E without a new approved sprint guide.
