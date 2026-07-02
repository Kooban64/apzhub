# APZHUB security quick reference

Derived lookup for [013](./013-security-architecture-zero-trust-framework.md).

> **Document Version:** 1.0 · **Classification:** Core Architecture · **Status:** Approved Foundation Standard  
> For full layers, testing, incident readiness, future services, and acceptance criteria, read the complete document.

## Zero Trust philosophy

Nothing trusted automatically. Every request must prove **identity · permission · integrity · intent · context** — every time.

## Core principles

Never trust · always verify · least privilege · defence in depth · secure by default · fail securely · audit everything · encrypt sensitive data · validate every input · never assume internal systems are trusted

## Security layers (defence in depth)

```
Desktop Client → Gateway → Auth → Authz → Business Validation → Platform Services
    → Connectors → Backend Engines → Audit → Monitoring → Logging
```

## Identity verification (every request)

Authenticated user · active session · platform identity · org context · module permission · policy compliance — **never assumed**

## Authorisation (before execution)

Platform roles · permission sets · business policies · object ownership · department · org · context rules — **backend permissions never replace platform authz**

## Least privilege

Users · services · connectors · background workers — minimum required permissions; workers use dedicated service identities; superadmin = explicit tier, not bypass

## Sessions ([007](./007-identity-authentication-authorisation-rbac-architecture.md))

HttpOnly · Secure · SameSite · rotation · sliding expiry · revocation · device awareness · concurrent limits · continuous monitoring

## Secrets — never

In source code · in logs · in repos · unencrypted

Includes: API keys, tokens, connector creds, DB passwords, certs, encryption keys — use secrets manager + env ([004](./004-technology-stack-repository-standards-development-environment.md)); connector DB stores **references** only ([011](./011-platform-data-architecture-database-design-principles.md))

## Encryption

Secrets · sensitive config · auth tokens · PII where appropriate · **TLS mandatory** (Caddy/Nginx 004)

## Every API endpoint ([010](./010-api-gateway-integration-communication-standards.md))

Auth · permission validation · input validation · rate limiting · audit · logging · correlation ID · no backend exposure

## Input / output

**Validate early:** length, format, schema, business rules, permissions, relationships

**Protect output:** sanitise · hide internal IDs · no stack traces · no leakage · translate backend errors · permission errors don't leak hidden resources (005)

## Web protections

CSRF on state-changing requests (central tokens) · XSS prevention (stored/reflected/DOM) · output encoding · SQL via prepared statements/ORM — never dynamic SQL from user input

## Files ([010](./010-api-gateway-integration-communication-standards.md))

Upload: validate type/size · malware scan (future) · isolated storage · audit — downloads require permission; central platform handling; S3-compatible (004)

## Connector security

Dedicated creds · health · rotation · secure storage · audit · retry controls · never expose backend creds · circuit breakers (010) · per-engine SSO config (007)

## Worker security ([012](./012-event-driven-architecture-background-processing-workflow-framework.md))

Dedicated identity · scoped permissions · audit · secure secrets · limited network — no admin unless explicitly required

## Audit (immutable)

Login/logout/failures · permission changes · session revocation · secret rotation · connector/provisioning failures · admin override — platform-owned ([011](./011-platform-data-architecture-database-design-principles.md))

## Monitoring

Auth failures · permission violations · connector failures · unexpected errors · rate limit hits · suspicious activity · privilege escalation

## Rate limiting (configurable)

Auth · public APIs · connector APIs · background jobs · search · uploads — Redis-backed (004, 010)

## Security headers

Central via reverse proxy + application — **modules must not implement their own**

## Dependencies ([004](./004-technology-stack-repository-standards-development-environment.md))

Reviewed · version controlled · updated · vulnerability scanned · remove unused — pnpm lock committed

## Security logs

Timestamp · identity · correlation ID · action · module · outcome · IP (where appropriate) — **no secrets in logs**

## Secure defaults

New features default: **private · least privilege · audited · validated · secure** — broaden access explicitly

## Incident readiness

Investigation · correlation · recovery · revocation · forensics · connector isolation — correlation IDs + DLQ (010, 012)

## Future security integrations (via connectors/modules)

Greenbone · Faraday · MobSF · Wazuh · OpenVAS · dependency/secret/container scanners — no architectural redesign (008)

## Self-hosted first

Security must not depend on proprietary SaaS; OSS self-hosted default; optional commercial via connectors only — never mandatory (008 §23)

## Testing (continuous)

Unit · integration · permission · auth · Playwright security flows · dependency scan · SAST · DAST · pentest (future)

## Acceptance (summary)

Every request auth+authz · platform permissions govern access · secrets managed · immutable audit · connector least privilege · worker identities · monitoring visibility · self-hosted OSS without mandatory proprietary deps
