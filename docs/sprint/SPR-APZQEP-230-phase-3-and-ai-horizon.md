# SPR-APZQEP-230 — Phase 3 continuous signals + AI horizon

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Parent:** [SPR-FULL-001](./SPR-FULL-001-full-product-bar-option-3.md) Wave B  
> **Authority:** [OWNER-FULL-PRODUCT-BAR-OPTION-3](../decisions/OWNER-FULL-PRODUCT-BAR-OPTION-3.md)  
> **Starts:** Owner pull-forward after Wave A  
> **Does not:** Auto-certify · Cap reopen · replacing human GO

## Outcome

Phase 3 continuous verification/cert **signals** plus AI Quality Workspace / MCP depth under human gates — completing the Owner “truly that bar” definition beyond Wave A.

## Ships (when started)

| ID    | Ship                            | Approach                                                        |
| ----- | ------------------------------- | --------------------------------------------------------------- |
| 230-A | Continuous verification signals | Event-driven freshness of verification/evidence without auto GO |
| 230-B | Continuous cert signals         | Advisory expiry/drift on cert packs; human re-approve           |
| 230-C | AI Workspace ON                 | Governed drafts; acceptance; never certifies                    |
| 230-D | MCP gated write                 | Entitled developer/agent tools with audit                       |

## Acceptance

1. Continuous modes never bypass human certification.
2. AI/MCP default-deny except entitled tenants; full audit.
3. Wave A tracks remain green (no regression of Phase 2 / bridge / APZPEN engines).

## Delivery record

| ID        | Ship                            | Progress (2026-08-15)                                                                                                                                                                                                   |
| --------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **230-A** | Continuous verification signals | Ledger `qep-continuous-verification/signals.json`; API `GET\|POST /api/v1/qep/continuous-verification/signals`; Automation home panel; perms `qep.continuous_verification.*`; never certifies                           |
| **230-B** | Continuous cert signals         | Ledger `qep-continuous-cert/signals.json`; API `GET\|POST /api/v1/qep/continuous-cert/signals` (create\|acknowledge\|escalate); RC home panel; perms `qep.continuous_cert.*`; escalate = re-cert **request** only       |
| **230-C** | AI Workspace ON                 | M17 already active (SPR-203); horizon banner + Learning / Verification Design / MCP deep links; live LLM still `APZHUB_QEP_AI_ASSIST` default-deny                                                                      |
| **230-D** | MCP gated write                 | M18 `active` / catalogue `enabled`; tool catalogue + proposal ledger; API `GET\|POST /api/v1/qep/mcp`; JSON-RPC `POST /api/v1/qep/mcp/rpc`; UI `/workspace/qep/mcp-dx`; perms `qep.mcp-dx.*`; `assertMcpNeverCertifies` |

**Follow-on residual ships (2026-08-15):**

- Auto-emit continuous verification heartbeats from automation enqueue/run + CI ingest.
- Auto-emit continuous cert **freshness** signals when an RC is evaluated (advisory only).
- MCP JSON-RPC HTTP transport (`tools/list`, `tools/call` → gated write proposals).

**Still deferred (not programme blockers):** full MCP SDK/stdio server; production Greenbone GMP client; Faraday live stack; `@apzhub/platform-services` package extraction.
