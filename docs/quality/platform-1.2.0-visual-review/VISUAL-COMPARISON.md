# APZHUB-QA-CERT-004 — Visual Comparison

> **Asset:** `support-analytics.png` → committed as `support-analytics-chromium-linux.png`  
> **Spec:** `testing/playwright/e2e/oss-110-14-support-visual.spec.ts`  
> **Viewport:** 1280×800 · `fullPage: true` · `maxDiffPixelRatio: 0.02`

---

## Artefacts

| Role                      | Path                                                                                             | Dimensions    |
| ------------------------- | ------------------------------------------------------------------------------------------------ | ------------- |
| Expected (before)         | [evidence/expected-before-home-placeholder.png](./evidence/expected-before-home-placeholder.png) | **1280×928**  |
| Actual (CERT-003 failure) | [evidence/actual-support-analytics.png](./evidence/actual-support-analytics.png)                 | **1280×1064** |
| Diff (before update)      | [evidence/diff-before-update.png](./evidence/diff-before-update.png)                             | 1280×1064     |
| Baseline (after update)   | [evidence/baseline-after-update.png](./evidence/baseline-after-update.png)                       | **1280×1064** |

---

## Expected screenshot (committed baseline before update)

**Content identified:** APZHUB **Home** workspace placeholder — **not** Support Analytics.

Observed UI elements:

- Activity-bar **H** active (Home)
- Main heading **Home**
- Subtitle `/workspace/home — manifest-driven view placeholder.`
- Empty workspace content
- Standard shell: header, Activity panel, status bar

**Conclusion:** The approved baseline file did not depict `/workspace/support/analytics`.

---

## Actual screenshot (CERT-003 / current render)

**Content identified:** Support **Analytics** intelligence page (correct route).

Observed UI elements:

- Activity-bar **S** active; sidebar **Analytics** active
- Eyebrow **SUPPORT** · heading **Analytics**
- Caption: `Support intelligence snapshot · captured Jan 2, 2026, 12:00 AM`
- Stat cards: Total 12 · Open 4 · Pending 2 · Closed 6 · New 1 · Unassigned 1 · Overdue 3 (+ SLA disclaimer)
- Distribution sections: By priority / state / organization / group / owner
- Shell chrome unchanged (header, Activity empty state, status bar)

Matches `SupportAnalyticsView` + Support mock payload in `support-ui-cert-helpers.ts`.

---

## Observed differences (exhaustive)

| #   | Difference                                                                         | Classification                                                                             |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | **Page identity:** Home placeholder vs Support Analytics                           | Incorrect baseline (wrong page captured previously)                                        |
| 2   | **Height:** 928px → 1064px (+136px full-page)                                      | Content length of Analytics (cards + five distribution sections) vs short Home placeholder |
| 3   | **Activity-bar focus:** H → S                                                      | Correct route activation for Support                                                       |
| 4   | **Sidebar:** absent/Home items → Support nav with Analytics selected               | Correct Support module chrome                                                              |
| 5   | **Main title/body:** “Home” + placeholder text → Analytics title + intelligence UI | Correct product surface                                                                    |
| 6   | **Metric cards & distributions:** absent → present with mock values                | Expected Analytics content                                                                 |
| 7   | Diff heat-map red across most text                                                 | Side-effect of global layout/content replacement + height mismatch (not font-only drift)   |

### Ruled out as primary cause

| Candidate                                                      | Evidence                                                 |
| -------------------------------------------------------------- | -------------------------------------------------------- |
| Viewport change                                                | Spec still sets 1280×800                                 |
| Browser-only font AA                                           | Wrong **page** in expected baseline, not AA-level noise  |
| Missing Analytics functionality                                | Actual render shows full Analytics UI                    |
| Broken Analytics rendering                                     | Actual matches component structure and mock data         |
| Intentional product redesign since last green Analytics visual | Baseline never held Analytics content (Home placeholder) |

### Shared chrome (not blockers)

Toolbar letter “T” strip and a floating activity-bar pill appear in the Support Analytics render; they are shell chrome present in the correct page capture and are accepted into the new baseline with the full Analytics surface.
