# OWNER — UX Streams Programme Order & Pre-Build Amendments

| Field    | Value                                                              |
| -------- | ------------------------------------------------------------------ |
| Decision | **OWNER DECISION — ACCEPTED** — 2026-08-16                         |
| Purpose  | Governing implementation order for the APZ commercial UX programme |
| Specs    | [docs/ux/README.md](../ux/README.md) · Streams 1–6 frozen          |

> **OWNER DECISION — ACCEPTED**
>
> `OWNER-UX-STREAMS-PROGRAMME-ORDER` is accepted as the governing implementation order for the APZ commercial UX programme.
>
> Streams 1–6 remain frozen in scope. This decision governs how they are implemented, integrated and certified.
>
> **Engineering:** Phase A–G product/Shell/Source tracks **CERTIFIED 100%**. Phase G (Streams 5∥6 horizontal) closed — ([SPR-UX-PHASE-G-STREAMS-5-6-HORIZONTAL](../sprint/SPR-UX-PHASE-G-STREAMS-5-6-HORIZONTAL.md) · [PHASE-G-STREAMS-5-6-HORIZONTAL-GAP-MAP](../sprint/PHASE-G-STREAMS-5-6-HORIZONTAL-GAP-MAP.md)).
>
> **Engineering 2026-08-16:** Phase G certified — entitlement hard-mode · shell policy · Support queue scopes · Playwright smoke.

---

## 1. Execution sequence (IN FORCE)

```text
PHASE A — PLATFORM FOUNDATION          ← AUTHORISED NOW
Stream 5 ∥ Stream 6
Shell / Design System + Tenant / Identity / RBAC / Administration
        ↓
PHASE B — COMMERCIAL JOURNEY
Stream 1
Landing → Marketplace → Plans → Checkout → PayFast
→ Registration → Tenant Creation → Provisioning → Login
        ↓
PHASE C — PRODUCTIVITY
Stream 4
APZPRD
        ↓
PHASE D — ASSURANCE WORKBENCHES     ← COMPLETE · CERTIFIED 100%
Stream 2 ∥ Stream 3
APZQEP + APZPEN
        ↓
COMMERCIAL PLATFORM UX COMPLETE     ← PHASES A–D CLOSED
        ↓
PHASE E — SHARED SOURCE WRITE       ← COMPLETE · CERTIFIED 100%
Edit / Branch / Commit / Push / PR
        ↓
PHASE F — SHARED SOURCE REVIEW      ← COMPLETE · CERTIFIED 100%
Review / Merge / Repo Admin (+ leftovers)
        ↓
PHASE G — SHELL / RBAC HORIZONTAL   ← COMPLETE · CERTIFIED 100%
Streams 5 ∥ 6 debt close (entitlements · shell policy · queue scopes)
```

**Stream 1 freeze interpretation:** Finish Stream 1 before authenticated QEP/PEN/PRD **product deep UX**. Foundation (5+6) precedes or underpins Stream 1.

---

## 2. Accepted implementation controls

| Control                                         | Rule                                                                                                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reuse IAM**                                   | Mandatory gap-map first. Extend BetterAuth, PermissionService, catalogue, control-plane. **No parallel identity/RBAC system.**                             |
| **Signature-first**                             | Production depth on screens users live in. **User Inspector** is a Stream 6 signature.                                                                     |
| **Source Workspace phased**                     | One shared surface: (1) Browse/Search/History/Diff/Context → (2) Edit/Branch/Commit/Push/PR → (3) Review/Merge/Repo Admin. No separate QEP + PEN browsers. |
| **Global honesty**                              | No fake health/provision/metrics; configurable commerce; no provider leakage to normal users.                                                              |
| **Vertical proof before horizontal completion** | Phase A must not become months of component-library or IAM-docs. Establish foundation, then **prove** via complete APZOR reference-tenant journeys.        |

---

## 3. Vertical proof (Phase A early)

Prove early (before horizontal completion of all Shell/RBAC screens):

```text
APZOR tenant
  → Create Support Agent
  → Org function: Customer Support
  → Assign APZPRD: Support/Agent/queue · Time/Employee · Knowledge/Contributor
  → Provision
  → Login
  → Shell = ONLY authorised capabilities
  → Home reflects Support work
  → Search / Notifications / Activity / Quick Actions respect same effective access
```

Then prove: Developer · Finance · Compliance · Executive · QA · Security/Pentester.

---

## 4. Shared Source track

Phased throughout A–D as [UX-SHARED-SOURCE-WORKSPACE](../ux/UX-SHARED-SOURCE-WORKSPACE.md).

---

## 5. Engineering stance from this point

> Gap-map existing implementation first, preserve what is already correct, then build the first vertical APZOR reference-tenant journey. Documentation accompanies the code; it does not precede the work.
