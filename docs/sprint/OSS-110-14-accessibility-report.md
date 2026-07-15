# OSS-110-14 Accessibility Report — Support Module UI

> **Milestone:** OSS-110-14 — Support Module UI Certification & Production Readiness  
> **Date:** 2026-07-11  
> **Verdict:** **PASS**  
> **Suite:** `testing/playwright/e2e/oss-110-14-support-accessibility.spec.ts`  
> **Master:** [SUPPORT-UI-CERTIFICATION.md](../architecture/SUPPORT-UI-CERTIFICATION.md)

---

## Scope

Automated accessibility certification for Support workbench surfaces using **@axe-core/playwright**, plus a keyboard reachability check on the inbox.

**Gate:** No **critical** or **serious** axe violations on certified pages (mocked `/api/v1`).

---

## Surfaces certified

| Surface | Route | Gate |
|---------|-------|------|
| Inbox | `/workspace/support/requests` | axe critical/serious clean |
| Request detail | `/workspace/support/requests/{sreq_…}` | axe critical/serious clean |
| Search | `/workspace/support/search` | axe critical/serious clean |
| Analytics | `/workspace/support/analytics` | axe critical/serious clean |
| Organizations | `/workspace/support/organizations` | axe critical/serious clean |
| Keyboard | Inbox create / status filter | Tab reaches meaningful control |

---

## Method

1. Sign in via Support UI cert helpers.
2. Mock Support `/api/v1` responses (no live Zammad).
3. Navigate to each surface; wait for Support page/testids.
4. Run `AxeBuilder.analyze()`; filter violations to `impact === "critical" || "serious"`.
5. Assert filtered list is empty.
6. Keyboard: Tab until Create or Status filter receives focus (≤40 tabs).

---

## Results

| Check | Result |
|-------|--------|
| Inbox axe | ✅ PASS |
| Detail axe | ✅ PASS |
| Search axe | ✅ PASS |
| Analytics axe | ✅ PASS |
| Organizations axe | ✅ PASS |
| Keyboard Tab reach | ✅ PASS |
| **Suite contribution** | **6 tests** (part of Playwright **23 passed** total) |

---

## Certification defect corrections (a11y-related)

| Defect | Correction | Notes |
|--------|------------|-------|
| Label / control association | `Input` uses `React.useId()` when `id`/`name` absent | Shared `@apzhub/ui` — label `htmlFor` matches control |
| Visibility badge contrast | `VisibilityBadge` uses foreground/border tokens | Avoids low-contrast badge text |

These are certification defect corrections only — not new Support features.

---

## Limitations

- axe moderate/minor findings (if any) are outside the OSS-110-14 hard gate.
- Certification is against **mocked** API fixtures, not live engine content.
- Full WCAG AA programme audit beyond Support surfaces is out of scope.
- Server-side authz remains authoritative; UI permission helpers are not an a11y substitute for access control.

---

## Companion

- Functional / suite total: Playwright `oss-110-14-support*` — **23 passed**
- Visual: [OSS-110-14-visual-regression-report.md](./OSS-110-14-visual-regression-report.md)
- Responsive: [OSS-110-14-responsive-report.md](./OSS-110-14-responsive-report.md)
