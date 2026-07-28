# APZHUB-ENG-0008 — Implementation Summary

> **Programme:** APZHUB-ENG-0008  
> **Title:** Implement RG-A11Y-CONTRAST Remediation  
> **Classification:** ENGINEERING  
> **Lifecycle:** Continuous Product Delivery  
> **Baseline:** Platform **1.2.0** (packaging unchanged)  
> **Date:** 2026-07-21  
> **Status:** **ACCEPTED / CLOSED** (Owner Decision with APZHUB-ENG-0009)

---

## Authorised remediation group

| Group                | Result                                              |
| -------------------- | --------------------------------------------------- |
| **RG-A11Y-CONTRAST** | **Resolved** — 4/4 member Playwright axe tests PASS |

---

## Root causes fixed

1. **Primary button computed contrast (inventory 2.66)** — Token `--color-primary-foreground` was already `#ffffff` (≈6.7:1 on `#1d4ed8`), but Tailwind did not emit `text-[var(--color-primary-foreground)]` from `packages/ui`. Buttons inherited body/Card `--color-foreground` (`#0f172a`) on primary background → axe 2.66.
2. **Theme CSS contract** — `packages/theme/src/styles.css` now forces `color: var(--color-primary-foreground)` on primary-background buttons.
3. **Monorepo Tailwind scan** — `apps/web/app/globals.css` adds `@source` for `packages/ui/src` so UI token utilities are generated.
4. **Status-bar success/warning text AA** — After primary was applied, Support axe exposed `--color-success` `#16a34a` on white (3.29). Light tokens updated: success `#15803d` (≈5.0:1), warning `#b45309` (≈5.0:1) for StatusBar chrome on the same surfaces.

---

## Repository impact

| Area                            | Change                                                          |
| ------------------------------- | --------------------------------------------------------------- |
| `packages/theme/src/tokens.css` | Document AA primary pairs; success/warning light tokens ≥ 4.5:1 |
| `packages/theme/src/styles.css` | Primary-button colour contract                                  |
| `apps/web/app/globals.css`      | `@source` for `packages/ui/src`                                 |

---

## Architecture / SemVer

- **Architecture impact:** Design System / Presentation only — token + CSS emission; no Platform Service, Integration SDK, or DB changes.
- **SemVer impact:** None (no package version bumps).
- **Public APIs / DB:** Unchanged.
- **Platform 1.2.0 packaging:** Unchanged.

---

## Out of scope (not modified)

RG-MOCK-FETCH · RG-PW-API · RG-SELECTORS · product workbench residuals · Email SoR · FIN-001 · Workflow Execute · Release 1.3 · ENG-0009

---

## Recommendation

# READY FOR OWNER ACCEPTANCE
