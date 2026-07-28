# APZOR Knowledge and Documentation Governance

> **Programme:** APZHUB-GOVERNANCE-001  
> **Date:** 2026-07-20  
> **Authority:** Knowledge Foundation · AI-MANIFEST

---

## Knowledge Management

| Knowledge class         | SoR                                      |
| ----------------------- | ---------------------------------------- |
| Platform status         | AI-MANIFEST · CURRENT-* · Owner register |
| Architecture            | docs 000–029 · ADRs · freezes            |
| Releases                | `docs/releases/**` evidence packs        |
| Operations              | `docs/operations/`                       |
| Enterprise governance   | `docs/governance/` EOM docs              |
| Commercial product mgmt | `docs/product-management/`               |

## Documentation governance rules

1. Repository-first — conversation never overrides disk.
2. Every Accepted programme updates registers and CHANGELOG.
3. Stale “Awaiting Acceptance” strings are PL-KL-12 debt — fix in packaging/ops hygiene.
4. User docs never expose engine brands as product names.
5. AI agents bootstrap from AI-MANIFEST only.

## Repository governance

| Concern                    | Rule                                                         |
| -------------------------- | ------------------------------------------------------------ |
| Secrets                    | Never commit                                                 |
| Main branch                | Quality gates (015)                                          |
| Programme IDs              | Named; do not reuse closed IDs casually without wave clarity |
| Dual PORTFOLIO-001 history | Disambiguate strategy vs Platform 1.0 cert in docs           |
