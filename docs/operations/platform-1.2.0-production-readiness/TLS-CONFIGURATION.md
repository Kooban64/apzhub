# TLS Configuration — Platform 1.2.0

> **Programme:** APZHUB-OPS-002 · **Action:** A2

## Modes

| Mode                       | File                                         | When                                           |
| -------------------------- | -------------------------------------------- | ---------------------------------------------- |
| **Internal** (default)     | `infrastructure/caddy/Caddyfile.prod`        | Shared host / staging; Caddy local CA on :3443 |
| **Public ACME**            | `infrastructure/caddy/Caddyfile.prod.public` | Dedicated host with public DNS + 80/443        |
| **Host nginx termination** | Host sites-enabled → `http://127.0.0.1:3080` | Current ENVIRONMENT.md pattern                 |

## HTTP → HTTPS

Both Caddyfiles redirect `http://{$APZHUB_HOSTNAME}` → HTTPS permanently.

## Security headers (edge)

- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy`
- `Permissions-Policy`
- Application also applies `@apzhub/platform-security` headers.

## Certificates

- Internal mode: no public certificates required (repository policy satisfied).
- Public mode: Caddy obtains Let's Encrypt certs when DNS + ports allow; set `APZHUB_ACME_EMAIL`.
- Live public certificates are **not** committed to the repository.

## Coexistence note

Do not bind APZHUB Caddy to host **80/443** on the shared EC2 without Owner Approval — host nginx already owns public TLS.
