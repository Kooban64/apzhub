# QEP — Enable live GitHub SCM heartbeat

| Field     | Value                                |
| --------- | ------------------------------------ |
| Programme | SPR-APZQEP-210 · 210-E               |
| Priority  | P2                                   |
| Related   | `APZHUB_SCM_GITHUB_LIVE`, server PAT |

## Symptom

SCM change events only appear from offline fixtures / on-demand sync; GitHub webhook or live API path inactive.

## Preconditions

- Server-only GitHub PAT with least privilege (`credentialsSource=server_secrets`).
- Webhook HMAC secret configured for ingress if using webhooks.

## Steps

1. Configure PAT via platform secret ref (never paste into console UI).
2. Set `APZHUB_SCM_GITHUB_LIVE=true`.
3. Restart web.
4. Trigger a commit or workflow_run; confirm change event in `/workspace/qep/scm`.
5. Confirm Integration Centre health for Source Control.

## Rollback

Set `APZHUB_SCM_GITHUB_LIVE=false` and restart. Offline path remains available for demos.

## Honesty

Users see **Source Control**, not GitHub branding. Scheduled poller may still be on-demand only.
