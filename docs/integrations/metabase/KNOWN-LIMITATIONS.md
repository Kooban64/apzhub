# Metabase Integration — Known Limitations

> **Programme:** APZHUB-INTEGRATION-METABASE-001  
> **Package:** `@apzhub/integration-metabase` **0.1.0**

1. **Foundation only** — no Analytics Platform Services, contracts, HTTP APIs, Workbench, or APZ Analytics product.
2. **Embed tokens** — detection of embedding enablement only; issuance is planned, not implemented.
3. **Collections** — read-only metadata catalogue; no write/archive operations.
4. **Dashboards / cards / datasets** — not exposed in this foundation.
5. **Custom SQL / report designer** — unsupported by design (product/service layer later).
6. **OAuth / SAML** — not implemented; use API key or session credentials via SecretProvider.
7. **Enterprise Edition APIs** — not required; CE/self-hosted first.
8. **Engine branding** — must remain hidden from standard users; adapter is platform-internal.
