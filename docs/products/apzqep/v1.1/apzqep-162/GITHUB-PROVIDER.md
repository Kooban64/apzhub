# GitHub Provider — APZQEP-162

| Field        | Value                                         |
| ------------ | --------------------------------------------- |
| Provider id  | `github`                                      |
| Status       | **active**                                    |
| Package path | `packages/platform-scm/src/providers/github/` |
| Modes        | Offline (default) · Live PAT                  |

## Capabilities (Wave 2)

- PAT authentication (live)
- Offline connection simulation (default)
- Repository registration / synchronisation
- Branch / commit / pull request discovery
- Webhook receiver + HMAC SHA-256 verification (`x-hub-signature-256`)
- Provider health / connection testing
- Repository metadata

## Explicit non-goals

- GitHub Actions orchestration
- GitHub Copilot
- GitHub Projects
- Release deployment
- Live remote webhook create (ops/manual path documented; offline registers locally)

## Configuration

| Variable                           | Default                  | Purpose                      |
| ---------------------------------- | ------------------------ | ---------------------------- |
| `APZHUB_SCM_GITHUB_LIVE`           | unset / false            | Enable live `api.github.com` |
| `APZHUB_SCM_GITHUB_WEBHOOK_SECRET` | `dev-scm-webhook-secret` | Webhook HMAC secret          |

## Offline seed

Offline mode seeds `apzor/apzhub` for demos and CI without network access.

## Architecture note

GitHub is **Provider #1**, not the platform. The SCM Engine never imports this module — only bootstrap/registry does.
