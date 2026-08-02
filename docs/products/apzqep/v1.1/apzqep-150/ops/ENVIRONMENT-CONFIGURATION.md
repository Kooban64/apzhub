# APZQEP Environment Configuration

Authoritative host coexistence: repository root `ENVIRONMENT.md`.

| Service   | Typical host port (coexistence) |
| --------- | ------------------------------- |
| Web (dev) | per ENVIRONMENT.md              |
| Caddy     | 3080 / 3443                     |
| Postgres  | 54334                           |
| Redis     | 6380                            |

Do not collide with legacy `apz-stack` ports.
