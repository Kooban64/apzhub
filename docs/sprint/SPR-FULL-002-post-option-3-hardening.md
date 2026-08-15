# SPR-FULL-002 — Post–Option 3 hardening

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Parent:** [SPR-FULL-001](./SPR-FULL-001-full-product-bar-option-3.md) (**PROGRAMME COMPLETE**)  
> **Authority:** [OWNER-POST-OPTION-3-HARDENING](../decisions/OWNER-POST-OPTION-3-HARDENING.md)  
> **Does not:** Cap reopen · auto-certify · Kali UI module · Option 3 re-open

## Outcome

Close the four **post–Option 3** residuals that were explicitly outside the Owner “100% (not MVP)” bar:

1. Formal `@apzhub/platform-services` security-assurance export
2. Greenbone **GMP** client (CE) for live result pull → artefact path
3. Faraday **production path** (compose + REST export → artefact ingest)
4. MCP **stdio** server (IDE/agent transport; gated write; never certifies)

## Ships

| ID         | Ship                      | Approach                                                                          |
| ---------- | ------------------------- | --------------------------------------------------------------------------------- |
| FULL-002-A | Platform Services package | `./security-assurance` export on `@apzhub/platform-services`; apps/web re-exports |
| FULL-002-B | Greenbone GMP client      | TLS/XML GMP authenticate + get_results → seeds / artefact; env-gated pull API     |
| FULL-002-C | Faraday production path   | Owner-ready compose profile + REST `fetchFaradayVulns` → artefact                 |
| FULL-002-D | MCP stdio server          | `@apzhub/qep-mcp-server` newline JSON-RPC MCP subset over stdio                   |

## Acceptance

1. Option 3 remains **COMPLETE** — this sprint does not reopen FULL-001 acceptance.
2. QEP never imports Greenbone/Faraday clients for bridge reads.
3. GMP / Faraday pulls never auto-certify.
4. MCP stdio never exposes certify tools.
5. Tests cover pure package + GMP parse + MCP protocol smoke + Faraday export normalize.

## Delivery record

| ID             | Landed                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **FULL-002-A** | `@apzhub/platform-services/security-assurance` + root re-exports; `apzpen-security-bridge.ts` adapts commercial/APZPEN shapes        |
| **FULL-002-B** | `integrations/greenbone/src/gmp-client.ts`; `POST /api/v1/apzpen/providers/greenbone/gmp/pull` when `APZPEN_GREENBONE_GMP_PULL=true` |
| **FULL-002-C** | Faraday compose postgres/redis/faraday profile + `.env.example`; `fetchFaradayVulns` / `toFaradayArtefact`                           |
| **FULL-002-D** | `packages/qep-mcp-server` — `initialize` / `tools/list` / `tools/call`; bin `apzhub-qep-mcp`                                         |
