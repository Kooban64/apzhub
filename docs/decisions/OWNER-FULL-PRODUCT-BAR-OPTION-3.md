# Owner decision — Full product bar (Phase 2 + APZPEN engines + bridge; Phase 3 + AI follow-on)

| Field     | Value                                                                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status    | **SATISFIED · PROGRAMME COMPLETE**                                                                                                                                                                       |
| Date      | 2026-08-15                                                                                                                                                                                               |
| Completed | 2026-08-15                                                                                                                                                                                               |
| Authority | Owner                                                                                                                                                                                                    |
| Option    | **3 — parallel tracks**                                                                                                                                                                                  |
| Related   | [PRODUCT-CAPABILITIES](../products/apzqep/product-definition/PRODUCT-CAPABILITIES.md) · [APZPEN later](../strategy/APZPEN-ENTERPRISE-LATER-OPTIONS.md) · [F11](../products/apzqep/FLAGSHIP-PROGRAMME.md) |
| Delivery  | [SPR-FULL-001](../sprint/SPR-FULL-001-full-product-bar-option-3.md) **PROGRAMME COMPLETE**                                                                                                               |

## Decision

Owner defines **“100% developed product (not MVP)”** as the following **two waves**:

### Wave A — Full product bar (authorised now · Option 3)

Run **in parallel**:

1. **APZQEP Phase 2 complete** — Quality Intelligence, Knowledge, Automation/Risk/Integration depth per product definition (not Cap reopen, not V1.1 SoR redesign).
2. **APZPEN Greenbone + Faraday path** — engines under **APZPEN** (Security Ops / assurance SoR). Kali = **runner/lab image only** — never a product UI module in QEP or APZPEN shell.
3. **QEP ↔ APZPEN bridge** — thin assurance → readiness/evidence path so release confidence can consume security posture without merging pillars.

### Wave B — Maturity + AI bar (authorised as follow-on)

After Wave A acceptance (or Owner pull-forward):

4. **APZQEP Phase 3** — continuous verification / continuous cert **signals** (never auto-certify).
5. **AI horizon** — AI Quality Workspace ON under human gates; MCP gated write depth.

## Pillar ownership (locked)

| Concern                        | Owner pillar                          |
| ------------------------------ | ------------------------------------- |
| Quality lifecycle & release GO | **APZQEP**                            |
| Security assurance & scanners  | **APZPEN**                            |
| Greenbone / Faraday / ZAP pack | **APZPEN** providers                  |
| Kali                           | **APZPEN** runner image only          |
| Cross-release security signals | **Bridge** (QEP consumes; APZPEN SoR) |

QEP remains broader than software unit testing (process, requirements, manual verification, evidence, readiness, certification, audit). Security **tools** are not QEP modules.

## Programme authority

| Track          | Sprint programme                                                                    |
| -------------- | ----------------------------------------------------------------------------------- |
| Umbrella       | [SPR-FULL-001](../sprint/SPR-FULL-001-full-product-bar-option-3.md)                 |
| QEP Phase 2    | [SPR-APZQEP-220](../sprint/SPR-APZQEP-220-phase-2-product-completion.md)            |
| APZPEN engines | [SPR-APZPEN-ENT-001](../sprint/SPR-APZPEN-ENT-001-greenbone-faraday-path.md)        |
| Bridge         | [SPR-BRIDGE-001](../sprint/SPR-BRIDGE-001-qep-apzpen-assurance-bridge.md)           |
| Wave B         | [SPR-APZQEP-230](../sprint/SPR-APZQEP-230-phase-3-and-ai-horizon.md) — **COMPLETE** |

## Acceptance record

| Wave requirement                                                       | Result  |
| ---------------------------------------------------------------------- | ------- |
| Phase 2 QI · Knowledge · Automation/Risk/Integration depth (220)       | **MET** |
| APZPEN Greenbone + Faraday path; Kali runner only (ENT-001)            | **MET** |
| QEP ↔ APZPEN assurance bridge (BRIDGE-001)                             | **MET** |
| Phase 3 continuous verification/cert signals; never auto-certify (230) | **MET** |
| AI Workspace ON under human gates; MCP gated write (230)               | **MET** |

**Verdict:** Owner Option 3 **“100% developed product (not MVP)”** bar is **COMPLETE** as of 2026-08-15.

## Non-goals

- Reopening Caps A–F kernels or V1.1 SoR redesign
- Kali / Greenbone / Faraday as **QEP** UI modules
- Auto GO/NO-GO from scanners or AI
- Authentik as APZHUB AuthN (BetterAuth remains sole AuthN)
- Unbounded “everything in one sprint”

## Resume / supersession

This decision **unparks** APZPEN Greenbone/Faraday work from [APZPEN-ENTERPRISE-LATER-OPTIONS](../strategy/APZPEN-ENTERPRISE-LATER-OPTIONS.md) **only** for the ENT-001 scope. Other parked enterprise options (WORM, SBOM graph, legal-hold, …) remain parked unless separately authorised.
