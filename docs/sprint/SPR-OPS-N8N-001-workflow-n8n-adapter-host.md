# SPR-OPS-N8N-001 — Workflow n8n adapter host enablement

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** [SPR-OPS-METABASE-001](./SPR-OPS-METABASE-001-analytics-metabase-adapter-host.md) pattern · Workflow HTTP foundation · `integrations/n8n`  
> **AuthN:** BetterAuth only — n8n API key server-side only  
> **Does not:** Authentik retire · Cap reopen · commit secrets · change n8n CE containers · unlock unrestricted execute

## Outcome

Make Workflow engine health/list **ops-enableable** on the coexistence host: `.secrets/n8n` loader + runbook + `APZHUB_WORKFLOW_ENABLED` / `APZHUB_WORKFLOW_ENGINE_ENABLED`.

## Ships

| ID  | Ship                                | Landed                                                                        |
| --- | ----------------------------------- | ----------------------------------------------------------------------------- |
| N1  | `.secrets/n8n` fill-only loader     | `load-local-secrets.ts` → `APZHUB_WORKFLOW_ENGINE_API_KEY`                    |
| N2  | Host env + `{host}/api/v1` base URL | Matches n8n public API                                                        |
| N3  | Demo grants include Workflow        | `pkg.apzprd.operations` + `workflow` product key                              |
| N4  | Bootstrap secrets load + connect    | Kimai-style `ensureLocalSecretsLoaded` + `autoInitialise` + `adapter.connect` |
| N5  | Host enablement runbook             | [workflow-n8n-adapter.md](../operations/runbooks/workflow-n8n-adapter.md)     |

## Acceptance

1. Without `.secrets/n8n`, behaviour unchanged (disabled honesty).
2. With secrets file + flags true, key is applied when unset in process env.
3. Docs never include a live API key.
4. Authentik untouched.
5. Host verified: Workflow platform + engine health/workflows succeed for an entitled BetterAuth user.

## Operator follow-up (this host)

Use the live n8n Settings → API key. Prefer `.secrets/n8n` over putting the key in `.env`.
