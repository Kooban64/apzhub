# PCv2-01 — Content Security Policy Audit

> **Story:** PRH-002  
> **Date:** 2026-07-08  
> **Scope:** `apps/web`, `apps/law-platform`, Platform packages  
> **Authority:** [ADR-0046](../adr/ADR-0046-production-readiness-bootstrap-consolidation.md) · [PRH-002 Completion Report](../sprint/PRH-002-completion-report.md)

---

## Executive summary

APZHUB uses **Next.js 16 App Router** with **no application-authored `dangerouslySetInnerHTML`**, **no `eval()`**, and **no third-party analytics**. The dominant CSP requirements are **framework-generated inline scripts/styles** and **development HMR WebSocket connections**.

| Category | Finding |
|----------|---------|
| Inline scripts | **Required** — Next.js runtime hydration (framework) |
| `unsafe-eval` | **Temporary** — Next.js dev tooling / bundler (production bundle minimised) |
| `unsafe-inline` (styles) | **Required** — Tailwind + React inline styles (minimal) |
| External CDNs | **None** in application code |
| Analytics | **None** |
| iframes | **None** (frame-ancestors denied) |
| Workers | **None** (worker-src self+blob reserved) |

---

## Audit methodology

1. Static analysis: `rg` across `apps/` and `packages/` for CSP-sensitive patterns.
2. Dependency review: `next.config.ts`, middleware, security headers, Swagger UI.
3. Runtime classification against PRH-002 categories: Required / Temporary / Legacy / Can remove.

---

## apps/web

| Source | Type | Classification | Notes |
|--------|------|----------------|-------|
| Next.js `/_next/static/*` scripts | script | **Required** | Framework hydration bundles |
| Next.js inline bootstrap scripts | script inline | **Required** | Injected by Next.js; no app `__html` usage |
| `swagger-ui-react` (`/docs`) | script/style | **Temporary** | Self-hosted bundle; same-origin `connect-src` |
| `swagger-ui-react/swagger-ui.css` | style | **Required** | Bundled CSS import |
| Tailwind / `@apzhub/theme` | style | **Required** | Compiled CSS via `globals.css` |
| Context menu positioning (`packages/ui`) | style inline | **Required** | Single `style={{ top, left }}` — React |
| `img-src data: blob:` | image | **Required** | UI previews / canvas patterns |
| `font-src data:` | font | **Required** | Inlined font data (if emitted by bundler) |
| Auth API `connect-src 'self'` | connect | **Required** | `/api/auth`, `/api/platform`, `/api/law` |
| Dev HMR `ws:` / `localhost` | connect | **Temporary** | Development only; removed in production policy |
| `eval` / `new Function` | script | **Legacy (framework)** | Next.js toolchain; retained as Temporary |
| External origins | — | **Can remove** | None found in app sources |
| Analytics | — | **Can remove** | Not present |
| iframes | frame | **Can remove** | No embeds; `frame-ancestors 'none'` |
| Web Workers | worker | **Can remove** | Not used |

---

## apps/law-platform

| Source | Type | Classification | Notes |
|--------|------|----------------|-------|
| Next.js `/_next/static/*` | script | **Required** | Same as web |
| Next.js inline scripts | script inline | **Required** | Framework |
| Tailwind / theme CSS | style | **Required** | `globals.css` imports |
| Law REST APIs | connect | **Required** | `/api/law/v1/*` same-origin |
| Platform bootstrap APIs | connect | **Required** | Shared platform layer |
| Dev HMR WebSocket | connect | **Temporary** | Development profile only |
| Swagger UI | — | **Can remove** | Not used on law-platform |
| Analytics | — | **Can remove** | Not present |
| iframes | — | **Can remove** | Not used |
| Workers | — | **Can remove** | Not used |

---

## Platform packages

| Package | CSP-relevant usage | Classification |
|---------|-------------------|----------------|
| `@apzhub/platform-security` | CSP policy builder, violation ingestion | **Required** |
| `@apzhub/platform-bootstrap` | No client CSP surface | N/A |
| `@apzhub/ui` | Inline style for context menu position | **Required** |
| `@apzhub/theme` | CSS `@import` tokens | **Required** |
| Framework packages (command, knowledge, event, activity) | No direct DOM script injection | N/A |
| `@apzhub/config` | Server-only DB (`pg`) — not browser | N/A |

---

## Directive inventory (stable enforced policy)

| Directive | Value | Classification |
|-----------|-------|----------------|
| `default-src` | `'self'` | **Required** |
| `script-src` | `'self' 'unsafe-inline' 'unsafe-eval'` | **Temporary** (framework) |
| `style-src` | `'self' 'unsafe-inline'` | **Required** / **Temporary** |
| `img-src` | `'self' data: blob:` | **Required** |
| `font-src` | `'self' data:` | **Required** |
| `connect-src` | `'self'` (prod) / localhost+ws (dev) | **Required** |
| `object-src` | `'none'` | **Can remove** risk (plugin hardening) |
| `base-uri` | `'self'` | **Required** |
| `form-action` | `'self'` | **Required** |
| `frame-ancestors` | `'none'` | **Required** |
| `worker-src` | `'self' blob:` | **Temporary** (reserved) |
| `report-uri` | `/api/platform/v1/security/csp-report` | **Required** |

---

## Progressive enforcement outcome (PRH-002)

| Phase | Action | Status |
|-------|--------|--------|
| 1 | This audit | ✅ Complete |
| 2 | Report-Only (dev) + violation endpoint | ✅ Complete |
| 3 | Added `object-src 'none'`, removed unnecessary external origins | ✅ Complete |
| 4 | Production **enforced** stable policy (single header, all directives) | ✅ Complete |

**Production:** `Content-Security-Policy` enforced via `CspPolicyService`.  
**Development:** `Content-Security-Policy-Report-Only` to preserve HMR stability.

---

## Future tightening (post PRH-002)

| Item | Target story | Notes |
|------|--------------|-------|
| Remove `unsafe-eval` | Future | Requires Next.js nonce middleware |
| Remove `unsafe-inline` scripts | Future | Nonce/hash CSP migration |
| Swagger UI isolation | Future | Separate docs origin or sandbox |
| `worker-src` minimisation | Future | When workers introduced (PCv2-02) |

---

## References

- [CSP Violation Reporting](./CSP-Violation-Reporting.md)
- [Platform Security Reference Architecture](../architecture/APZHUB-Platform-Security-Reference-Architecture.md)
- `packages/platform-security/src/csp-policy-service.ts`
