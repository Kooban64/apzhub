# SPR-ADOPT-003 — Evidence

| Field        | Value                                    |
| ------------ | ---------------------------------------- |
| Date         | 2026-08-15                               |
| Actor        | BetterAuth `dev@apzhub.local`            |
| Platform URL | `http://127.0.0.1:3300`                  |
| Constraint   | Do not mutate legacy `apz-*` / Authentik |

## Session

- Sign-in email/password via `/api/auth/sign-in/email` succeeded.
- `/api/auth/get-session` returned session + user for `dev@apzhub.local`.
- Projects health reports `authentikUsed: false`, `authN: betterauth`, `engineAuth: adapter_api_key`.

## Engine-backed API samples (counts / honesty)

| Surface   | Probe                              | Outcome                             |
| --------- | ---------------------------------- | ----------------------------------- |
| Projects  | `/api/v1/projects`                 | 200 · 18 items                      |
| Projects  | `/api/v1/projects/health`          | 200 · Plane configured · liveListOk |
| Support   | `/api/v1/support-requests?limit=5` | 200 · 5 items                       |
| Time      | `/api/v1/time/customers`           | 200 · 7 items                       |
| Time      | `/api/v1/time/readiness`           | 200 · ready                         |
| Analytics | `/api/v1/analytics/dashboards`     | 200 · 7 items                       |
| Analytics | `/api/v1/analytics/health`         | 200 · metabase auth valid           |
| Workflow  | `/api/v1/workflows/health`         | 200 · engineConfigured + n8n true   |
| Workflow  | `/api/v1/workflows/engine/health`  | 200 · healthy                       |

## Workspace shells

All returned HTTP 200 for authenticated session: `/workspace/projects`, `/workspace/support`, `/workspace/time`, `/workspace/analytics`, `/workspace/workflow`.

## Coexistence note

APIs currently use host coexistence engine ports (documented in `ENVIRONMENT.md`) for temporary dogfood. Owner direction: leave those running instances alone; future cutover is APZHUB-owned LTS equivalents + deprecate the older platform.
