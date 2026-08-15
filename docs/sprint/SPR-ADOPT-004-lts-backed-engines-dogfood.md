# SPR-ADOPT-004 — LTS-backed commercial engines dogfood

> **Status:** **COMPLETE · DELIVERED** — 2026-08-15  
> **Depends on:** SPR-OPS-LTS-\* fleet · [SPR-ADOPT-003](./SPR-ADOPT-003-wired-engines-dogfood.md)  
> **AuthN:** BetterAuth only  
> **Does not:** Touch legacy `apz-*` / Authentik · Deprecate older platform · Paperless Documents adapter

## Intent

Prove APZHUB is useful on **APZHUB-owned LTS engines** before any consideration of stopping the older stack. Legacy listeners stay up and untouched.

## Rule (Owner)

> We cannot touch the existing running stack until we are certain we have built a solid product and it is confirmed working.

This sprint is that confirmation gate for the five adapter-backed commercial surfaces.

## Acceptance

1. BetterAuth session for `dev@apzhub.local`.
2. Health + at least one list path succeed for Projects, Support, Time, Analytics, Workflow against **1908x / 19678** (not legacy ports).
3. `authentikUsed: false` on Projects health.
4. Legacy ports `18081–18085` / `15678` still respond (read-only probe only).
5. No docker restart/reconfigure of `apz-*` or Authentik.

## Result

**10/10 checks PASS** — see [adopt-004 evidence](../products/adopt-004/README.md).

## Still not product-complete

- Paperless LTS is infra-only ([ADR-0095](../adr/ADR-0095-paperless-ngx-documents-dms-provider.md) Proposed).
- Native Documents SoR is separate from Paperless.
- Legacy deprecation remains **blocked** until Owner accepts product-solid confirmation beyond this dogfood (broader UX/E2E as needed).
