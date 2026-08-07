# APZ Law — Native UX Audit (Gap Register)

| Field       | Value                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Slice       | **APZ-LAW-NATIVE-001-N01**                                                                                              |
| Status      | **COMPLETE** (analysis only)                                                                                            |
| Timestamp   | 20260805T191100Z                                                                                                        |
| Method      | Static review of Law Platform Workbench UI, manifests, packages; compared to APPROVED mission                           |
| Engineering | **None**                                                                                                                |
| Mission     | [../../apzlaw/PRODUCT-MISSION.md](../../apzlaw/PRODUCT-MISSION.md) **APPROVED**                                         |
| Board       | [../../apzlaw/PRODUCT-BOARD-ENTERPRISE-GOVERNANCE.md](../../apzlaw/PRODUCT-BOARD-ENTERPRISE-GOVERNANCE.md) **IN FORCE** |
| Authority   | [OWNER-AUTHORISATION.md](./OWNER-AUTHORISATION.md)                                                                      |

## Objective

Determine whether APZ Law already behaves like the **enterprise governance product**.

**Central audit questions:**

1. Do users start with governance questions (GQ-*) — or firm administration (matters / clients / documents)?
2. Does governance appear where work is performed — or only inside an isolated Law workspace?
3. Are operational SoRs referenced — or claimed inside Law?

## Classification legend

| Class                 | Meaning                                    |
| --------------------- | ------------------------------------------ |
| **Already Compliant** | Meets Enterprise Governance contract today |
| **Native**            | APZHUB-owned; polish may be needed         |
| **Wrapper**           | Thin / incomplete                          |
| **Engine Leak Risk**  | Engine/adapter identity visible            |
| **Requires Redesign** | Must change for governance identity        |

## Scope inventory

Base: `/workspace/law/*` via `apps/law-platform` (dedicated Law Workbench).  
Manifests: `services/legal-platform/manifests/*/module.yaml`.  
Default entry: `/workspace/law/dashboard`.

| Surface                                                  | Present                                                     |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| Firm executive dashboard                                 | Yes — practice-first                                        |
| Clients / Matters / Documents / Calendar / Tasks / Time  | Yes                                                         |
| Trust Accounting / Billing / Reports / Administration    | Yes                                                         |
| Governance questions entry (GQ-*)                        | **No**                                                      |
| Obligations / Policies catalogue                         | **No**                                                      |
| Cross-product governance context (Projects, Workflow, …) | **No** (outbound)                                           |
| Product Help / Settings (governance)                     | **No** (Help = knowledge registry only; Admin = UX gallery) |

Activity Bar: **Law Platform** (`scale`). Commands: Open Dashboard, Clients, Matters, Documents, Trust, Billing, Legal Search, Administration, …

---

## Gap register

| ID    | Area                         | Current                                               | Target                                                                                            | Gap                              | Class             | Priority | Feeds     |
| ----- | ---------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------- | -------- | --------- |
| L-G01 | Product identity             | “Law Platform” / firm practice management             | **APZ Law** — Enterprise Governance                                                               | Practice-management framing      | Requires Redesign | Critical | N-02/N-03 |
| L-G02 | Entry mental model           | Executive firm overview → matters/clients             | Governance questions (GQ-01…05)                                                                   | Users start with firm admin      | Requires Redesign | Critical | N-03      |
| L-G03 | Vocabulary                   | Matters, Clients, Documents, Trust, Billing           | Obligations, Policies, Compliance, Artefacts, Reviews                                             | Admin vocabulary dominant        | Requires Redesign | Critical | N-02/N-03 |
| L-G04 | Governance questions         | GQ catalogue unused in UI                             | GQ-01…05 surfaced                                                                                 | Questions absent from chrome     | Requires Redesign | Critical | N-03      |
| L-G05 | Governance context           | Isolated Law workspace                                | Governance appears on Projects / Workflow / Documents / Support / APZQEP / Analytics by reference | No outbound context consumption  | Requires Redesign | Critical | N-03+     |
| L-G06 | Named OSS engines            | No Metabase/Plane/Zammad/Authentik in UI              | Keep zero brand                                                                                   | Compliant for third-party brands | Already Compliant | —        | —         |
| L-G07 | “Engine” wording             | Trust UI: “trust engine”, “in-memory trust engine”    | Invisible engines                                                                                 | Wording leak                     | Engine Leak Risk  | Medium   | N-02/N-03 |
| L-G08 | SoR — documents              | “Firm document register”, Upload Document             | Legal artefacts under governance; general docs → APZ Documents                                    | Law claims document library      | Requires Redesign | Critical | N-03      |
| L-G09 | SoR — time / tasks / billing | Firm registers in Law                                 | Reference Productivity Core; do not own operational SoRs                                          | Overlap with RI products         | Requires Redesign | High     | N-03      |
| L-G10 | Shell integration            | Dedicated `apps/law-platform` workbench               | Peer native product (acceptable pattern)                                                          | Compliant shell exists           | Already Compliant | —        | —         |
| L-G11 | Breadcrumbs                  | Present on many detail pages                          | Retain; align labels to governance                                                                | Partial                          | Native            | Medium   | N-03      |
| L-G12 | Help / Settings              | Knowledge registry; Admin = UX catalogue              | Product Help + Settings (governance)                                                              | Missing product chrome           | Requires Redesign | Medium   | N-03      |
| L-G13 | Onboarding                   | Dashboard welcome as Counsel/firm                     | Governance-first onboarding                                                                       | Practice onboarding              | Requires Redesign | Medium   | N-03      |
| L-G14 | Empty / loading / error      | Present (`LawEmptyState`, skeletons, `LawErrorState`) | Retain; retarget copy                                                                             | Compliant primitives             | Already Compliant | —        | —         |
| L-G15 | Docs dual track              | `docs/products/law/` practice vs `apzlaw/` governance | Mission pack authoritative                                                                        | Docs debt                        | Native            | Medium   | note      |
| L-G16 | Enterprise capability docs   | Mission APPROVED; principles IN FORCE                 | Remain authoritative                                                                              | Docs ahead of experience         | Already Compliant | —        | —         |
| L-G17 | Counsel substitution risk    | “Counsel” welcome; practice framing                   | Never legal advice                                                                                | Soft risk in copy                | Native            | Medium   | N-03      |
| L-G18 | Preventative value           | Product helps run a firm                              | Product prevents non-compliant work                                                               | Value model mismatch             | Requires Redesign | High     | N-03      |

---

## Area summaries

| Area                              | Result              | Detail                                                |
| --------------------------------- | ------------------- | ----------------------------------------------------- |
| Native Experience                 | **GAPS IDENTIFIED** | Shell yes; identity is firm practice / legal admin    |
| Governance Context                | **GAPS IDENTIFIED** | Isolated; no consume-by-reference in work products    |
| Engine Leakage                    | **GAPS IDENTIFIED** | OSS brands absent; “trust engine” wording present     |
| System of Record Boundaries       | **GAPS IDENTIFIED** | Document/time/matter ownership framing vs mission SoR |
| Enterprise Governance Alignment   | **PASS** (docs)     | Mission / Board / Layer docs ahead of UI              |
| Governance questions              | **GAPS IDENTIFIED** | No GQ path                                            |
| Relationship to Productivity Core | **GAPS IDENTIFIED** | Mission defines plug-in; UI does not                  |

## Verdict

APZ Law is **not yet** a native Enterprise Governance product. The dominant defect is **legal practice / firm-administration identity** — matters, clients, documents, trust, and billing as the mental model — contradicting Enterprise Governance, Governance Context, and the GQ-* question set.

This is a deeper identity gap than Analytics N-01’s dashboard-first problem: Law’s chrome teaches **repository / case / admin-first**, not **obligation / governance-first**.

N-01 records gaps only. No engineering in this slice.
