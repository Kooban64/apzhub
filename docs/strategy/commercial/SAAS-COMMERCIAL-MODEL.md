# APZOR SaaS Commercial Model — Tenants, Suites, Modules, Roles

> **Status:** **LOCKED — OWNER ACCEPTED** — 2026-08-14  
> **Parent:** [APZOR Commercial Pillars](../APZOR-COMMERCIAL-PILLARS.md)  
> **Complements:** [APZPRD Vision](../APZPRD-ENTERPRISE-PRODUCTIVITY-PLATFORM.md) · [APZQEP](../APZQEP-ENTERPRISE-QUALITY-ENGINEERING-PLATFORM.md) · [APZPEN](../APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md) · [IAM Commercial Programme](../../architecture/APZHUB-IAM-COMMERCIAL-PROGRAMME.md)  
> **Supersedes (where conflicting):** “sell the portal” / all-or-nothing productivity suite packaging  
> **Does not authorise:** unbounded engineering — named sprint guides still required for large slices  
> **Owner confirmation:** multi-pillar expand = same tenant + additive subscription lines; tenant SoR on APZHUB Postgres; engines masked

---

## 1. The one sentence

**Customers buy sellable solutions (and compositions inside them). APZHUB is never sold. Engines are never sold. Users never see engines.**

```text
Tenant (Org or Individual)
  └─ buys ──► Commercial Offerings (what appears on the invoice)
                 ├─ APZPRD packages (composable modules)
                 ├─ APZQEP (discipline pillar)
                 ├─ APZPEN (discipline pillar)
                 ├─ APZLaw (practice / governance product — optional)
                 └─ future: APZSign, …
                       │
                       ▼
                 Entitlements open modules in the workbench
                       │
                       ▼
                 Product roles (per module) shape what they can do
                       │
                       ▼
                 APZHUB platform services + masked adapters + engines
```

---

## 2. Four commercial layers (lock this)

| Layer  | Name                    | Who sees it        | What it controls                                                                        |
| ------ | ----------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| **L0** | **APZHUB**              | APZOR only         | Identity, tenancy, gateway, entitlements engine, audit, search, notifications, consoles |
| **L1** | **Commercial offering** | Buyer / invoice    | What was purchased (suite, package, add-on)                                             |
| **L2** | **Product module**      | End user (branded) | Projects, Time, Support, Documents, Analytics, Workflow, QEP, PEN, Law, Knowledge, …    |
| **L3** | **Capability + role**   | End user (actions) | `time.entry.approve`, `projects.manage`, `apzpen.certify`, …                            |

**Rules**

1. **Charge at L1** (offerings / seats / packages).
2. **Enforce at L2 + L3** (entitlement then permission).
3. **Never charge for L0** as a customer SKU named “APZHUB”.
4. **Never expose L-engines** (Plane, Zammad, Kimai, ZAP, …) in UX or invoices.

**Product entitlement ≠ product permission** (already locked in APZPRD vision). Both must pass.

---

## 3. Tenant shapes

| Tenant           | Buys                                 | Typical entry                            |
| ---------------- | ------------------------------------ | ---------------------------------------- |
| **Organisation** | Business / Custom plans + seat packs | Admin activates offerings; assigns users |
| **Individual**   | Individual plan + optional add-ons   | Self-serve; limited APZPRD modules first |

Same `platform_tenant` machinery. Commercial difference is **plan kind + billing account kind**, not a second platform.

---

## 4. What customers buy (catalogue architecture)

### 4.1 Discipline pillars (usually whole-product)

These answer one executive question. Sell as **pillars**, not as a pile of scanner tools.

| Offering   | Executive question                | Charge unit (recommended)                    |
| ---------- | --------------------------------- | -------------------------------------------- |
| **APZQEP** | Can we release with confidence?   | Org seats + optional runner/volume tiers     |
| **APZPEN** | Can we demonstrate we are secure? | Engagement packs **and/or** continuous seats |

Optional **capability add-ons** inside a pillar (later): e.g. APZPEN Mobile (MobSF), APZPEN Continuous GitHub — not day-one fragmentation.

### 4.2 APZPRD — composable (this is the hard one)

**Do not** force “buy all of Productivity”.  
**Do not** sell “Plane seats”.  
**Do** sell **APZ-branded modules** and **named packages**.

#### Atomic sellable modules (APZPRD)

| Module (SKU family) | Masked engine (internal) |
| ------------------- | ------------------------ |
| Projects            | Plane                    |
| Time                | Kimai                    |
| Support             | Zammad                   |
| Documents           | Paperless-ngx            |
| Analytics           | Metabase                 |
| Workflow            | n8n                      |
| Knowledge*          | Native / search-backed   |

\*Knowledge is special — see §5.

#### Named packages (what Sales quotes)

| Package SKU           | Includes                                              | ICP                                |
| --------------------- | ----------------------------------------------------- | ---------------------------------- |
| **APZPRD Time**       | Time (+ Knowledge lite)                               | Professional services / timesheets |
| **APZPRD Service**    | Support + Knowledge                                   | Service desks                      |
| **APZPRD Delivery**   | Projects + Time + Knowledge + Analytics               | Delivery orgs                      |
| **APZPRD Operations** | Support + Projects + Workflow + Analytics + Knowledge | Ops-heavy SMEs                     |
| **APZPRD Workspace**  | Full APZPRD module set                                | Enterprise productivity            |
| **À la carte**        | Any subset of modules                                 | Expansion / land-and-expand        |

**Pricing recommendation**

- **Base:** seat × entitled module (or package discount vs sum of modules).
- **Package discount:** 15–35% vs à la carte so packages win, but modules remain buyable.
- **Org floor:** small platform ops fee can be **embedded in package price** (not a separate “APZHUB” line).
- **Individual:** 1–2 modules max on self-serve (Time and/or Documents); upsell to org.

### 4.3 Future products (same pattern)

| Offering    | Layer                          | Notes                                                                                |
| ----------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| **APZSign** | New commercial offering        | Independent SKU; may bundle with Documents / Law                                     |
| **APZLaw**  | Commercial offering (practice) | Not “internal only forever” — sell to legal practices; internally also used by APZOR |
| Other       | Add as L1 offerings            | Same entitlement machinery                                                           |

---

## 5. Platform-shared vs sellable: Knowledge & Law

| Capability                                    | Commercial stance                                                                                 | Why                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Search / notifications / audit / identity** | **Included** with any paid offering                                                               | Platform table stakes — not SKUs                                               |
| **APZ Knowledge**                             | **Included lite** with any APZPRD package; **full Knowledge** as module or with Service/Workspace | Users expect search/knowledge with work; don’t double-charge for “open search” |
| **APZLaw**                                    | **Sellable product** (Law Practice Pack / Enterprise governance)                                  | Distinct buyer + compliance narrative; may include Time + Documents adjacency  |
| **Operator consoles** (`/console` `/ops` …)   | **APZOR / MSP only** (or Enterprise ops add-on later)                                             | Not end-customer workbench                                                     |

**Internal governance** (APZOR using Law + Knowledge on APZHUB) is dogfooding — same products, `APZOR` tenant free-all entitlement.

---

## 6. The entitlement stack (implementation target)

```text
1. Tenant subscription
      which L1 offerings / packages are active
2. Tenant module entitlements
      which L2 modules are unlocked for that tenant
3. User product grants
      which of those modules this user may enter
4. Product roles / capabilities
      what they can do inside each module
5. (Rare) Professional Tool Access
      audited escape hatch to a provider UI
```

### Worked example

Org buys **APZPRD Delivery** + **APZPEN**.

| User                       | Modules visible                      | Roles                                         |
| -------------------------- | ------------------------------------ | --------------------------------------------- |
| Alice (PM)                 | Projects, Time, Knowledge, Analytics | projects.manager, time.user, analytics.viewer |
| Bob (Dev)                  | Projects, Knowledge                  | projects.member                               |
| Carol (Security)           | APZPEN (+ Knowledge if granted)      | apzpen.test                                   |
| Dave (Finance on platform) | none of APZPRD                       | `/finance` operator persona only              |

Alice never sees Support or ZAP. Carol never sees Projects unless also granted. Nobody sees Kimai/Plane/Zammad.

---

## 7. Who controls what — APZHUB vs APZPRD

| Concern                               | Controlled at                                     | Notes                         |
| ------------------------------------- | ------------------------------------------------- | ----------------------------- |
| Can tenant exist / pay / be suspended | **APZHUB** commercial + IAM                       | Platform                      |
| Which offerings tenant bought         | **APZHUB** entitlements                           | Catalogue                     |
| Which modules appear in Activity Bar  | **APZHUB** entitlement → shell                    | Dynamic nav                   |
| Role inside Projects / Time / Support | **Product (APZPRD module)** via PermissionService | Per-product roles             |
| Cross-product “what do I do today?”   | **APZPRD workbench** on APZHUB shell              | Assembly, not launcher        |
| Certify engagement                    | **APZPEN** product permission                     | Not platform admin by default |

**Answer to “control everything at APZPRD or APZHUB?”**

- **Commercial truth + tenancy + catalogue + cross-cutting IAM:** APZHUB.
- **Workspace assembly + productivity UX for entitled modules:** APZPRD product experience.
- **Never** put commercial SKUs inside Plane/Zammad.
- **Never** hardcode module lists in the shell — entitlements drive registration.

---

## 8. Recommended go-to-market packaging (phase)

### Phase A — Land (now → first external sales)

| SKU             | Contents                                |
| --------------- | --------------------------------------- |
| Individual      | Time _or_ Documents                     |
| APZPRD Time     | Time + Knowledge lite                   |
| APZPRD Service  | Support + Knowledge                     |
| APZPRD Delivery | Projects + Time + Knowledge + Analytics |
| APZPEN Starter  | Security Assurance core                 |
| APZQEP Starter  | Quality Engineering core                |

### Phase B — Expand

| SKU                    | Contents                           |
| ---------------------- | ---------------------------------- |
| À la carte modules     | Any APZPRD module                  |
| APZPRD Workspace       | Full productivity                  |
| APZPEN Continuous      | + GitHub App / scheduled assurance |
| APZQEP + APZPEN Bundle | Release + security (discounted)    |
| Law Practice Pack      | APZLaw + Time + Documents          |

### Phase C — Later

APZSign · Government packs · MSP partner editions · usage tiers for runners/storage.

---

## 9. Pricing principles (no hard numbers in-repo)

1. **Seat-based** for human work products (APZPRD, QEP, PEN continuous).
2. **Pack / engagement** options for APZPEN managed pentest services.
3. **Package < sum(modules)** so composition wins.
4. **Pillars independently purchasable** — never force QEP+PEN+PRD.
5. **No engine pass-through pricing** on the invoice.
6. **Trials** at package level (14–30 days), not per-engine.
7. **APZOR tenant:** all offerings free (dogfood).

---

## 10. UX consequences (non-negotiable)

- Activity Bar / sidebar / commands: **only entitled + permitted**.
- Home: **work queue**, not product tiles for everything.
- Providers masked; Professional Tools menu rare + audited.
- Org admin sees **Subscriptions & grants** (`/org`).
- Platform operator sees **catalogue, limits, customers** (`/console`).

---

## 11. Mapping to today’s code (honest)

| Concept                                                          | Today                      | Target                                                                |
| ---------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------- |
| Suites `qa` / `pentest` / `productivity`                         | Exists in `catalogue.ts`   | Keep suites; add **package SKUs** under productivity                  |
| Product keys `projects`,`time`,`support`,`documents`,`analytics` | Exists                     | Add `workflow`, clarify `knowledge`, keep `qep`/`pentest`             |
| Plans individual/business/custom                                 | Exists                     | Business plan becomes **container**; packages attach as subscriptions |
| User product grants                                              | File-backed product-access | Keep model; harden enforcement                                        |
| APZPEN RBAC                                                      | Soft bootstrap             | Enforce entitlement + `apzpen.*`                                      |
| Tenant switch                                                    | Missing                    | Required for multi-org users                                          |

---

## 12. Decision record (proposed lock)

| #   | Decision                                                                   |
| --- | -------------------------------------------------------------------------- |
| D1  | APZHUB is never a customer SKU                                             |
| D2  | Sell APZQEP, APZPEN, APZPRD packages (+ Law, later Sign)                   |
| D3  | APZPRD is **composable modules + named packages**, not all-or-nothing      |
| D4  | Charge at offering/package/seat; enforce module entitlement + product role |
| D5  | Knowledge lite included with APZPRD; full Knowledge optional/bundled       |
| D6  | Law is sellable; also used internally by APZOR                             |
| D7  | Engines always masked from customers and invoices                          |
| D8  | Same identity when multiple pillars licensed; never force unused pillars   |

---

## 13. Next engineering (requires sprint guide)

1. Extend catalogue: packages + `workflow` + `knowledge` product keys.
2. Entitlement middleware: shell + APIs refuse non-entitled modules.
3. Org admin: assign package → modules → user grants → product roles.
4. Tenant switch API/UI.
5. Align marketing hosts (APZQA / APZPenTest / Workspace) to this model.

**Revision:** 1.0.0 · 2026-08-14
