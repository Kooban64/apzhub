# APZHUB Platform 1.2.0 — Process Improvements

> **Programme:** APZHUB-POST-IMPLEMENTATION-001  
> **Date:** 2026-07-20  
> **Note:** Observations for future trains. **Not** an authorisation to implement.

---

## Governance effectiveness

| Practice                                    | Effectiveness | Observation                                     |
| ------------------------------------------- | ------------- | ----------------------------------------------- |
| Platform Delivery Standard                  | High          | Consistent pack shapes; STOP discipline         |
| Single-item engineering programmes          | High          | Clear Acceptance boundaries                     |
| Readiness before certification              | High          | Prevented premature packaging                   |
| Owner Acceptance register + AI-MANIFEST     | High          | Machine bootstrap stayed aligned when refreshed |
| Ops Framework ↔ Theme A mapping             | High          | Risk IDs tied to backlog                        |
| Enterprise Governance / Commercial Strategy | Held          | No unauthorised commercial SemVer / redesign    |

## Suggested process improvements (future)

1. **Acceptance closeout checklist** — When Owner Decision ACCEPTs, refresh AI-MANIFEST, CURRENT-*, OWNER-ACCEPTANCE-REGISTER, PORTFOLIO-RELEASE-REGISTER, and COMPLETION status in the same documentation turn.
2. **Explicit “live path” Acceptance Condition** — For publisher/adapter programmes, declare whether composition hooks / live drain are in or out before coding.
3. **Optional readiness exit for portfolio CI** — If Owner wants Playwright/Docker reaffirmation for certification, elevate R12-QA-01 (or equivalent) into readiness exit criteria at planning time.
4. **Wall-clock programme timestamps** — Record start/accept timestamps beyond evidence pack date for metrics.
5. **Hygiene backlog lane** — Separate pin-drift / root-SemVer / stub-reduction from capability P0 to avoid QUALITY-EVIDENCE “pre-existing FAIL” notes.
6. **PIR template permanence** — Promote this pack shape into Platform Delivery Standard / Release Management Standard as the default post-baseline review.

## What not to change based on this PIR

- Do not reopen Platform **1.2.0** baseline content.
- Do not treat P1 residual KL as certification defects.
- Do not interpret recommendations as Approval for 1.3 / STOP / Email / FIN / Execute.
