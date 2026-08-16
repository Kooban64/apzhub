# SPR-UX-STREAM-001 — Public marketplace → purchase → provisioning

> **Status:** **COMPLETE · CERTIFIED 100%** — 2026-08-16  
> **Authority:** Owner Stream 1 freeze — [UX-STREAM-001](../ux/UX-STREAM-001-public-commercial-journey.md)  
> **Evidence:** [PHASE-B-STREAM-1-GAP-MAP](./PHASE-B-STREAM-1-GAP-MAP.md)  
> **Commercial lock:** [SAAS-COMMERCIAL-MODEL](../strategy/commercial/SAAS-COMMERCIAL-MODEL.md)  
> **AuthN:** BetterAuth only  
> **Payments:** PayFast custom / onsite / subscriptions / tokenisation — **no raw card storage in APZ**  
> **Does not:** Touch legacy `apz-*` · Redesign authenticated QEP/PEN/PRD app UX (Streams 2–4) · Expose engine brands

## Owner gate

**Finish Stream 1 completely before authenticated QEP / PEN / PRD application experiences.**

Prior workbench polish (SPR-UX-001 U3–U6 Time/Support/Projects/Knowledge app remodel) is **deferred** until Stream 1 DoD is met. Shell production cutover (U0–U2) remains delivered and must stay healthy.

---

## Objective

Deliver one continuous public commercial journey:

Discover → pillars → marketplace → package builder → account → verify → organisation → checkout → PayFast (server-verified) → provision → admin welcome → invite / assign → entitlement-aware first login → settings billing expansion.

Visual bar: enterprise / Linear–Stripe–GitHub calm premium — one design language for QEP · PEN · PRD family.

---

## Ships (execution slices)

| ID    | Ship                                                          | Notes                                             |
| ----- | ------------------------------------------------------------- | ------------------------------------------------- |
| S1-00 | Spec freeze + gap map                                         | This guide + UX-STREAM-001                        |
| S1-01 | Design language tokens for public surface                     | Typography / radius / density per §3; tokens only |
| S1-02 | Global public header + mega-menu + mobile                     | §4                                                |
| S1-03 | Landing `/` hero · trust · pillars · platform · best-of-breed | §5–9                                              |
| S1-04 | Solutions + products catalogue routes                         | §45 conceptual; map to repo                       |
| S1-05 | Marketplace + product detail                                  | §10–12                                            |
| S1-06 | Package builder + seat metrics + summary                      | §13–15 — product-specific licence metrics         |
| S1-07 | Account boundary · verify · preserve package cart             | §16–17                                            |
| S1-08 | Organisation + workspace identity                             | §18–19 — no “APZHUB” customer wording             |
| S1-09 | Checkout UI + recurring consent copy                          | §20                                               |
| S1-10 | PayFast onsite/custom + ITN verify + processing/success/fail  | §21–24                                            |
| S1-11 | Provisioning progress + partial failure                       | §25–26                                            |
| S1-12 | Admin welcome · invite · roles · licence upsell               | §27–31                                            |
| S1-13 | Invite accept · entitlement home · settings billing           | §32–36                                            |
| S1-14 | Auth screen family · a11y · responsive commerce               | §37–44                                            |
| S1-15 | Stream 1 DoD dogfood + sandbox PayFast                        | §47                                               |

Exact sequencing may parallelise S1-01–S1-04 after S1-00; **payment activation (S1-10) requires sandbox evidence before live**.

---

## Repo gap snapshot (2026-08-16)

| Area                     | Today                                                                                                                     | Stream 1 need                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Marketing site           | `(marketing)/` pages (qa, pentest, productivity, pricing)                                                                 | Rebuild into continuous journey + Solutions mega-menu               |
| Marketplace              | Blueprint only ([APZHUB-MARKETPLACE-BLUEPRINT](../architecture/APZHUB-MARKETPLACE-BLUEPRINT.md)) — partner store deferred | **Customer capability marketplace** `/marketplace` + PRD à-la-carte |
| Package builder `/build` | Missing                                                                                                                   | Sticky summary commerce UX                                          |
| Checkout / PayFast       | Pricing checkout + `payfast-adapter` + ITN route exist                                                                    | Align to §20–24 (onsite, processing state, package persistence)     |
| Org provision / invite   | IAM commercial programme pieces                                                                                           | Full Stream 1 onboarding UI + licence-aware invite                  |
| Auth layout              | Split login exists                                                                                                        | Unify to §37 family across register/verify/reset                    |

Reuse platform services, catalogue, entitlements, billing — **do not invent a parallel commerce stack**.

---

## Critical rules (from §46)

Copied for sprint execution — non-negotiable:

1. Pillars only: APZQEP · APZPEN · APZPRD
2. Providers masked
3. Independent product entitlement
4. Org vs user entitlement
5. Per-product roles
6. Professional/provider access separate
7. No raw cards in APZ
8. Server-verified payment only
9. Commerce integrates into APZHUB architecture
10. No Production Ready product app redesign in this sprint

---

## Definition of Done

Per [UX-STREAM-001 §47](../ux/UX-STREAM-001-public-commercial-journey.md): end-to-end customer path with responsive UI, WCAG 2.2 AA, failure handling, security, audit — **not** “landing page exists.”

---

## Next stream (blocked)

**Stream 2 — APZQEP authenticated UI/UX** — Owner will supply screen-by-screen after Stream 1 freeze is acknowledged. Do not start until Owner pastes Stream 2 and authorises execution.
