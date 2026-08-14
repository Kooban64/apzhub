# SPR-APZPEN-006 — OpenAI intelligence, GitHub App JWT, branded PDF

> **Status:** **DELIVERED** — 2026-08-14  
> **Depends on:** [SPR-APZPEN-005](./SPR-APZPEN-005-github-portal-pdf-ai.md)  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)

---

## Goal

Close the remaining deferred commercial slices:

1. **OpenAI-backed Security Intelligence** (`.secrets/openai`) — assist only; never auto-certify
2. **GitHub App JWT install token** (`.secrets/github-app`) with **PAT fallback** (`.secrets/git`) + live PR sync
3. **Branded Typst PDF** assurance packs (local `tooling/bin/typst`)

## Secrets (gitignored — never commit)

| File                  | Keys                                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `.secrets/openai`     | raw `sk-…` or `OPENAI_API_KEY=`                                                                                         |
| `.secrets/git`        | PAT (`ghp_` / `github_pat_`) — fallback SCM auth                                                                        |
| `.secrets/github-app` | `GITHUB_APP_ID`, `GITHUB_APP_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY` (PEM) · optional `APZPEN_GITHUB_WEBHOOK_SECRET` |

## Safety

- Keys never logged, returned in API JSON, or written under `docs/`
- AI output is advisory; `autoCertify` always `false`
- GitHub App private key loaded fill-only into env via `ensureLocalSecretsLoaded`
- Scans / PR sync only against engagement-scoped repositories

## Surfaces

| Area         | Path                                                                  |
| ------------ | --------------------------------------------------------------------- |
| Intelligence | `POST /api/v1/apzpen/intelligence` · mode `openai` \| `offline_rules` |
| GitHub sync  | `POST /api/v1/apzpen/github` action `sync_prs`                        |
| App status   | `GET /api/v1/apzpen/github?status=1`                                  |
| PDF          | `format=pdf` (Typst branded template)                                 |

## Test

```bash
pnpm exec vitest run apps/web/lib/apzpen packages/config/src/secrets
```
