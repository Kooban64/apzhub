# SPR-FULL-001 — Full product bar (Option 3 · parallel tracks)

> **Status:** **PROGRAMME COMPLETE · DELIVERED** — 2026-08-15  
> **Authority:** [OWNER-FULL-PRODUCT-BAR-OPTION-3](../decisions/OWNER-FULL-PRODUCT-BAR-OPTION-3.md) **SATISFIED**  
> **Model:** Three Wave A tracks in parallel + Wave B Phase 3 / AI  
> **Does not:** Cap reopen · Kali UI module · auto-certify · Authentik AuthN

## Outcome

Deliver Owner-defined **100% (not MVP)**: Phase 2 QEP + APZPEN Greenbone/Faraday + QEP↔APZPEN bridge; then Phase 3 + AI when Wave A is accepted (or Owner pull-forward).

## Programme acceptance (Option 3)

| Wave  | Tracks                              | Status                   |
| ----- | ----------------------------------- | ------------------------ |
| **A** | 220 · ENT-001 · BRIDGE-001          | **COMPLETE · DELIVERED** |
| **B** | 230 (continuous signals · AI · MCP) | **COMPLETE · DELIVERED** |

**Owner “100% developed product (not MVP)” bar:** **MET** — 2026-08-15.

Post-bar hardening (optional; **not** Option 3 acceptance criteria): full MCP SDK/stdio server; live Greenbone GMP API client; Faraday production host bring-up; formal `@apzhub/platform-services` package extraction.

## Tracks (Wave A — parallel)

| Track                   | Guide                                                                | Status                   |
| ----------------------- | -------------------------------------------------------------------- | ------------------------ |
| **A1** QEP Phase 2      | [SPR-APZQEP-220](./SPR-APZQEP-220-phase-2-product-completion.md)     | **COMPLETE · DELIVERED** |
| **A2** APZPEN engines   | [SPR-APZPEN-ENT-001](./SPR-APZPEN-ENT-001-greenbone-faraday-path.md) | **COMPLETE · DELIVERED** |
| **A3** Assurance bridge | [SPR-BRIDGE-001](./SPR-BRIDGE-001-qep-apzpen-assurance-bridge.md)    | **COMPLETE · DELIVERED** |

## Wave B (Phase 3 + AI)

| Track               | Guide                                                        | Status                   |
| ------------------- | ------------------------------------------------------------ | ------------------------ |
| **B1** Phase 3 + AI | [SPR-APZQEP-230](./SPR-APZQEP-230-phase-3-and-ai-horizon.md) | **COMPLETE · DELIVERED** |

## Parallel rules

1. Tracks must not block each other on shared Cap kernels.
2. Bridge consumes APZPEN **contracts** (findings/assurance summary) — never Faraday/Greenbone clients from QEP modules.
3. APZPEN owns adapters; QEP owns readiness/cert presentation of bridged signals.
4. CI / quality gates still apply per track (015).

## Programme done when

- [x] Wave A acceptance criteria on all three guides met and recorded.
- [x] Wave B started (Owner pull-forward) and acceptance met.
- [x] Docs / PRODUCT-STATUS honesty updated (full-bar Option 3 **COMPLETE**).

## Delivery record (Wave A first ships — 2026-08-15)

| Track             | First ships landed                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **A1 220**        | M16 Learning KB active (API + UI); Risk owner/evidenceRef/accept                            |
| **A2 ENT-001**    | Greenbone + Faraday integration packages (normalize + health); catalogue/health/ingest wire |
| **A3 BRIDGE-001** | Four-state `status`; dual entitlement; deep-link gating; bridge-read audit; `service.yaml`  |

## Delivery record (Wave A second ships — 2026-08-15)

| Track             | Second ships landed                                                                    |
| ----------------- | -------------------------------------------------------------------------------------- |
| **A1 220**        | Integration Centre enable/disable + last-sync; QI advisory banner                      |
| **A2 ENT-001**    | Engagement ingest preselect `?tool=greenbone\|faraday`; Providers VA ingest deep-links |
| **A3 BRIDGE-001** | Compose extracted to `security-assurance-bridge-service.ts`; thin HTTP handler         |

## Delivery record (Wave A third ships — 2026-08-15)

| Track             | Third ships landed                                                             |
| ----------------- | ------------------------------------------------------------------------------ |
| **A1 220**        | Automation mapping governance ledger (owner / flaky / stale) + UI              |
| **A2 ENT-001**    | Greenbone `ingest_ready`; artefact list/helper; GMP deferred (script + ingest) |
| **A3 BRIDGE-001** | VA freshness (`vaFreshness`) on assurance summary via APZPEN health probe      |

## Delivery record (Wave A fourth ships + closeout — 2026-08-15)

| Track             | Fourth ships / closeout                                                                 |
| ----------------- | --------------------------------------------------------------------------------------- |
| **A1 220**        | **COMPLETE** — QI commercial gate via H4 `requireProductAccess`; advisory banner        |
| **A2 ENT-001**    | Faraday artefact path + optional compose scaffold docs; **COMPLETE** (GMP API deferred) |
| **A3 BRIDGE-001** | **COMPLETE** — service compose in apps/web; formal platform-services package residual   |

**Wave A acceptance:** met for Owner Option 3 bar.  
**Deferred residuals (not Wave A blockers):** live Greenbone GMP API client; production Faraday stack; `@apzhub/platform-services` package move.

## Delivery record (Wave B — SPR-APZQEP-230 — 2026-08-15)

| Ship      | Landed                                                                                |
| --------- | ------------------------------------------------------------------------------------- |
| **230-A** | Continuous verification freshness ledger + Automation UI                              |
| **230-B** | Continuous cert expiry/drift/freshness ledger + RC UI (acknowledge / request re-cert) |
| **230-C** | AI Workspace horizon ON (banner + deep links; live LLM still flag-gated)              |
| **230-D** | MCP DX un-stubbed — tool catalogue + gated-write proposals + audit                    |

**Wave B acceptance:** met — continuous/AI/MCP never bypass human certification.  
**Follow-on (same day):** automation/CI → CV heartbeats; RC evaluate → cert freshness; MCP JSON-RPC HTTP transport.

## Option 3 closeout

**PROGRAMME COMPLETE** — Waves A + B delivered and acceptance recorded.  
Optional post-bar hardening (MCP SDK/stdio, GMP live client, Faraday host bring-up, platform-services package) is **outside** Option 3 scope unless Owner opens a new sprint.
