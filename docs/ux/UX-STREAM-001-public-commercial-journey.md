# APZ Commercial Platform — UI/UX Build Specification

## Stream 1 — Public Website → Marketplace → Purchase → Provisioning

| Field               | Value                                                                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document            | **UX-STREAM-001**                                                                                                                                                                                                               |
| Status              | **FROZEN — OWNER AUTHORITY** — 2026-08-16                                                                                                                                                                                       |
| Kind                | Complete public commercial journey specification                                                                                                                                                                                |
| Scope               | Discover → marketplace → package → account → PayFast → provision → invite → workspace                                                                                                                                           |
| Explicitly deferred | Authenticated QEP / PEN / PRD **application** UI/UX (Streams 2–4)                                                                                                                                                               |
| Complements         | [SAAS-COMMERCIAL-MODEL](../strategy/commercial/SAAS-COMMERCIAL-MODEL.md) · [IAM Commercial Programme](../architecture/APZHUB-IAM-COMMERCIAL-PROGRAMME.md) · [PayFast adapter](../../apps/web/lib/commercial/payfast-adapter.ts) |
| Execution           | [SPR-UX-STREAM-001](../sprint/SPR-UX-STREAM-001-public-marketplace-purchase-provisioning.md)                                                                                                                                    |

**Owner freeze:** Finish Stream 1 completely before touching authenticated QEP/PEN/PRD application experiences.

**PayFast (current capabilities — do not assume):** custom API integration, onsite payments, subscriptions, tokenisation; PayFast stores card/token; APZ never stores raw card data. Sandbox before live. Server-side ITN signature/source/amount verification before subscription activation.

---

## 1. Objective

Build the complete public commercial experience for the APZ software portfolio.

This is **not a prototype** and is not a collection of marketing pages.

It must provide a continuous customer journey:

```text
Discover APZ
      ↓
Understand the 3 disciplines
      ↓
Explore capabilities/products
      ↓
Choose what the organisation needs
      ↓
Configure users/licences
      ↓
See transparent pricing
      ↓
Create organisation/account
      ↓
Checkout
      ↓
PayFast
      ↓
Subscription created
      ↓
Organisation provisioned
      ↓
Administrator onboarding
      ↓
Invite users
      ↓
Enter workspace
```

The customer should experience this as **one continuous APZ platform**, not three unrelated websites.

---

## 2. Overall Visual Direction

The experience must communicate:

**Enterprise · Modern · Technical · Trustworthy · Calm · Premium**

Do **not** create:

- giant gradients everywhere;
- excessive rounded cards;
- cartoon illustrations;
- floating glassmorphism;
- crypto-style design;
- cyberpunk styling for PEN;
- generic AI-generated SaaS layouts;
- enormous amounts of empty whitespace;
- excessive animations;
- three completely different visual systems.

QEP, PEN and PRD belong to the same family.

Think more: **Linear / Stripe / GitHub / modern Microsoft enterprise product**  
and less: **startup landing-page template**.

The product should feel credible enough for a bank, government department or major enterprise.

---

## 3. APZ Design Language

Use one APZ design system across everything ([006](../006-design-system-ui-component-architecture.md), [022](../022-presentation-engine-theme-framework-branding-architecture.md), [028](../028-ui-component-sdk-design-system-sdk-component-manifest-specification.md)).

### Typography

Strong, clean sans-serif typography.

Hierarchy:

```text
Display       52–64px desktop
H1            40–48px
H2            30–36px
H3            22–26px
Body          15–17px
Small         13–14px
Metadata      12px
```

Do not use oversized 80–100px marketing headings.

### Shape

Moderately rounded controls. Cards approximately 8–12px radius. Buttons approximately 6–8px. Do not turn every interface element into a pill.

### Density

| Surface                   | Density           |
| ------------------------- | ----------------- |
| Marketing pages           | comfortable       |
| Application / marketplace | medium            |
| Administration            | information dense |

### Icons

One consistent icon family (Lucide). Do not mix icon styles.

---

## 4. Global Public Header

Desktop header:

```text
APZ
Solutions      Products      Marketplace      Pricing      Resources
                                   Sign in     Get Started
```

`Solutions` mega-menu:

```text
QUALITY ASSURANCE
APZQEP
Quality engineering, testing and release assurance

SECURITY ASSURANCE
APZPEN
Penetration testing and continuous security assurance

PRODUCTIVITY
APZPRD
Projects, support, time, workflow, analytics and knowledge
```

- **Products** — individual capability catalogue
- **Marketplace** — product marketplace
- **Pricing** — commercial comparison
- **Sign In** — authentication
- **Get Started** — purchase / onboarding

### Mobile

Hamburger navigation. Do not simply compress desktop navigation. Primary CTA remains visible.

---

## 5. Landing Page `/`

Sell the **business outcome**, not individual OSS technology.

### Hero

**Left — headline**

### One platform for better software, stronger security and more productive teams.

Supporting copy:

> Quality engineering, security assurance and enterprise productivity — connected through one platform and available independently or together.

Primary CTA: **Explore Products**  
Secondary: **View Solutions**

**Right — visual**

Polished conceptual APZ workspace UI (not a stock photograph), showing:

```text
Quality
92% Release Ready

Security
3 Risks Require Attention

Productivity
8 Items Need Attention
```

---

## 6. Trust Strip

Immediately below hero:

```text
Quality Engineering    Security Assurance    Productivity
One Identity    One Platform    Modular Licensing
```

Do not invent customer logos. Until real references exist, do not display fake logos or fake testimonials.

---

## 7. Three Commercial Pillars

Large three-column section.

### Quality Assurance — APZQEP

> Understand whether software is genuinely ready to release.

Highlights: Quality Engineering · Test Management · Automation · Source & GitHub Integration · Evidence · Release Certification

CTA: **Explore Quality**

### Security Assurance — APZPEN

> Discover, manage and prove application security.

Highlights: Penetration Testing · Application Security · Source Security · Vulnerability Management · Remediation · Security Certification

CTA: **Explore Security**

### Productivity — APZPRD

> Give every person one workspace for their work.

Highlights: Projects · Support · Time · Workflow · Analytics · Knowledge

CTA: **Explore Productivity**

---

## 8. Platform Story

```text
                 YOUR ORGANISATION
                       │
        ┌──────────────┼──────────────┐
       QEP            PEN            PRD
        └──────────────┼──────────────┘
                 APZ PLATFORM
       Identity · Search · Notifications
       Activity · Audit · Administration
```

> Start with one product. Add others when you need them. Your identity, organisation and administration remain the same.

---

## 9. Best-of-Breed Story

Heading: **Specialist technology. One experience.**

```text
Source Code        Testing        Security
Git providers      Automation     Security tools
        ↓               ↓              ↓
                 APZ Platform
                       ↓
            One governed experience
```

Do not make Plane, Kimai, Zammad, etc. the hero. Those are implementation providers.

---

## 10. Product Marketplace

Route: `/marketplace`

Header: **Build your APZ platform**

Subtitle: > Choose only the capabilities your organisation needs. Add more at any time.

Tabs: **All | Quality | Security | Productivity**

---

## 11. Marketplace Cards

Cards represent purchasable capabilities.

### Pillar cards

- **APZQEP** — Quality Engineering Platform — `From R___ / user / month` — View Details · Add
- **APZPEN** — Security Assurance Platform — pricing metric may differ — View Details · Contact / Add

### APZPRD — individual products (not all-or-nothing)

Projects · Support · Time · Workflow · Analytics · Knowledge · Documents (where commercially included)

A customer does **not** need to buy APZPRD in its entirety.

---

## 12. Product Detail Page

Example: `/marketplace/product/time` (or repository-conformant equivalent)

Structure: product name · value line · sticky **Add to Package** · What it does · Included capabilities · Who it's for · Works with · Licensing · Screenshots · FAQ

---

## 13. Package Builder

Route: `/build`

Desktop: catalogue (left) + sticky **YOUR PACKAGE** summary (right) → Continue

---

## 14. Seat Configuration

Product-specific licence metrics (not assume everything is per-seat).

Examples:

- Time: users
- Support: agents vs requesters
- Workflow (later): designers vs users

---

## 15. Package Summary

Always show line items, subtotal, VAT, total, billed monthly/annual where supported. Annual discount configurable (not hard-coded).

---

## 16. Account Boundary

Only after the customer has built the package require an account. Do not force registration before products and pricing.

Continue → Create account (work email, name, password, Terms/Privacy) · Already have an account? Sign in

Social auth later — not mandatory for initial release.

---

## 17. Email Verification

Check email · Resend · Change email · After verification return to **exact checkout state**. Never lose the configured package because authentication occurred.

---

## 18. Organisation Setup

Organisation name * · Country * · Company registration · VAT · Industry · Size · Website

Billing country affects tax. Do not ask for unnecessary information.

---

## 19. Workspace Identity

Create workspace · slug `acme.apz_____.com` · availability validates immediately

Explain team access. Do **not** expose APZHUB terminology.

---

## 20. Checkout

Route: `/checkout`

Billing details + order summary + payment method (Card / PayFast) + recurring billing authorisation (amount / frequency / duration or applicable terms per PayFast requirements) · **Subscribe & Pay**

---

## 21. PayFast Architecture

Use PayFast custom integration. Prefer **Onsite Payments** where merchant config supports it.

```text
APZ Checkout
     │
PayFast secure payment component
     │
Card / Payment details
     │
PayFast
     │
Token / Subscription
     │
APZ Billing
```

**APZ must not collect/store raw card details itself.**

---

## 22. Payment Processing State

After Subscribe & Pay: **Processing payment...** — never immediate Success. Server verifies independently (signature, source, amount). Subscription activation only after **verified server-side** confirmation.

---

## 23. Payment Success

Calm success (no confetti). Show products/seats. **Continue Setup**

---

## 24. Payment Failure

Explain failure · no subscription activated · package and organisation preserved · Try Again · Choose Another Method · Contact Support

---

## 25. Provisioning Screen

**Preparing your workspace** — actual backend progress steps (organisation, admin, each product, workspace). Do not fake progress timers.

---

## 26. Provisioning Failure

Partial success allowed. Customer can enter workspace. Ops receives failure. No restart of checkout.

---

## 27. First-Time Administrator Welcome

Welcome · setup steps · **Get Started** · **Skip for now** — never trap in a wizard.

---

## 28–31. Invite Team

Email + products · CSV bulk · product roles at invite · licence awareness / clean upgrade when seats insufficient · invite confirmation

---

## 32. Invited User Experience

`/invite/{secure-token}` · accept · existing account sign-in or new password

---

## 33. First Login (entitlement-aware home)

Not a product catalogue. Entitlement-filtered home + nav (only Mary's products). Quick actions for her work.

---

## 34–36. Post-purchase commerce

Settings → Products & Billing · expand products without new org · subscription management via PayFast-supported mechanisms · cancellation without dark patterns · audit

---

## 37–39. Authentication Screens

One consistent auth layout (split desktop / compact mobile). Forgot password generic response. Reset with interactive requirements.

---

## 40. Responsive Behaviour

All public commerce flows fully usable on mobile. Package summary → collapsible sticky footer. Never squeeze desktop two-column checkout into a tiny viewport.

---

## 41. Accessibility

**WCAG 2.2 AA** minimum: keyboard, focus, labels, semantics, SR announcements for price changes, no colour-only status, contrast, dialogs, reduced-motion, logical focus.

---

## 42–44. Loading · Empty · Error

Skeletons for browse surfaces; explicit progress for transactions. Empty states instruct next action. Errors: what happened · what was preserved · what to do.

---

## 45. URL Architecture (conceptual)

```text
/
 /solutions
 /solutions/quality
 /solutions/security
 /solutions/productivity
 /products
 /products/qep | pen | projects | support | time | workflow | analytics | knowledge
 /marketplace
 /marketplace/[product]
 /pricing
 /build
 /checkout
 /auth/login | register | verify | forgot-password | reset-password
 /onboarding
 /onboarding/organisation | team
 /workspace
 /settings/products | billing | users
```

Exact names may conform to existing repository conventions rather than forcing unnecessary rewrites.

---

## 46. Critical Build Rules (non-negotiable)

1. Do not invent additional products beyond **APZQEP · APZPEN · APZPRD**.
2. Do not expose provider products as primary customer experience.
3. Do not assume every customer buys everything — independently entitleable.
4. Org entitlement ≠ user entitlement.
5. Product roles are independent.
6. Professional/provider access is a separate elevated entitlement.
7. Do not store raw payment-card information in APZ.
8. Never activate subscription from browser return alone — server verify.
9. Never sacrifice existing APZHUB architecture — commerce integrates into the platform.
10. Do not redesign existing Production Ready products during this work — their app UI is Streams 2–4.

---

## 47. Definition of Done

Not complete because a landing page exists. Complete when a new customer can genuinely:

```text
VISIT → DISCOVER → COMPARE → SELECT → CONFIGURE → PRICE →
REGISTER → VERIFY → CREATE ORGANISATION → CHECKOUT → PAY →
VERIFY PAYMENT → CREATE SUBSCRIPTION → PROVISION →
INVITE TEAM → ASSIGN PRODUCTS → LOGIN → WORK
```

with responsive UI, accessibility, failure handling, security and audit throughout.

**That is Stream 1.**

PayFast: build against current custom integration/API; sandbox before live; ITN security verification required.

### External references (Owner-verified)

- [PayFast Custom Integration](https://payfast.io/integration/custom-integration/)
- [PayFast Onsite Payments](https://payfast.io/features/on-site-payments/)
- [PayFast Subscriptions](https://payfast.io/features/subscriptions/)
- [PayFast General Terms](https://payfast.io/legal/general-terms-conditions/)
- [PayFast ITN / submit solution](https://payfast.io/integration/submit-your-solution/)
