# SPR-APZPEN-005 — GitHub PR security, customer portal, PDF, AI assist

> **Status:** **DELIVERED** — 2026-08-14  
> **Depends on:** [SPR-APZPEN-004](./SPR-APZPEN-004-ce-product-complete.md)  
> **Pillar:** [APZPEN Vision](../strategy/APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)

---

## Goal

Ship the deferred commercial differentiators as **governed MVPs** — not scanner UIs:

1. **GitHub PR security position** (PAT/webhook-ready; App install later)
2. **Customer portal** (engagement-scoped grants)
3. **Branded PDF packs** (Typst when available; embedded PDF fallback)
4. **Bounded AI Security Intelligence** (offline assist — never auto-certify)

## Delivered

| Area            | Surface                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------- |
| PR security     | `lib/apzpen/github-pr-security.ts` · `/apzpen/code` · `GET/POST /api/v1/apzpen/github` · webhook ingress |
| Customer portal | `/portal` · grant tokens · read findings · request retest · download reports                             |
| PDF             | Typst template + `tryCompileApzpenPdf` · `format=pdf` on reports API                                     |
| AI assist       | Offline rules · `/apzpen/intelligence` · `POST /api/v1/apzpen/intelligence`                              |

## Safety / non-goals

- Never autonomous attack
- Never auto-certify from AI or scanners
- No mandatory commercial GitHub Advanced Security / Burp / Snyk
- Live GitHub App JWT install flow remains follow-on (PAT + HMAC webhook ready)
- Customer portal requires grant token — no anonymous engagement browse

## Test command

```bash
pnpm exec vitest run apps/web/lib/apzpen
```
