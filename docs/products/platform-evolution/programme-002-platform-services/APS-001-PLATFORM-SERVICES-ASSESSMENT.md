# APS-001 — Platform Services Assessment

| Field       | Value                                                   |
| ----------- | ------------------------------------------------------- |
| Document    | **APS-001**                                             |
| Status      | **COMPLETE** (Assessment only)                          |
| Era         | [Evolution Era](../../APZHUB-EVOLUTION-ERA.md) **OPEN** |
| Timestamp   | 20260808T231500Z                                        |
| Authority   | Owner Question 1 — current state in the repository      |
| Engineering | **Not authorised**                                      |
| Inventory   | **Not derived** — deferred to APS-002                   |

---

## Scope

Answer **only** what exists today:

1. Existing platform capabilities (real code / APIs / manifests)
2. Ownership
3. Consumer analysis
4. Classification (four buckets)

**Out of scope:** engineering proposals, finite inventory, redesign, AI, preconceived service lists.

**Assessment rule applied (Constitution):**

> A capability belongs in the platform only if at least two Production Ready products genuinely consume it, **or** the Constitution explicitly declares it to be a platform responsibility.

Evidence bases:

- Live APE catalogue: `apps/web/lib/platform-engines/ape-catalogue.ts` · `GET /api/v1/platform/engines`
- Consumption map: [../engines/CONSUMPTION-MAP.md](../engines/CONSUMPTION-MAP.md)
- Packages under `packages/*`, services under `services/*`, APIs under `apps/web/app/api/**`
- Hypotheses (candidates only): [APS-HYPOTHESES.md](./APS-HYPOTHESES.md)

---

## 1. Existing platform capabilities (what is real)

### 1.1 Certified APE engines (Foundation catalogue — code + HTTP)

| Capability       | Package evidence                                          | Maturity (catalogue) | HTTP / surface                                  |
| ---------------- | --------------------------------------------------------- | -------------------- | ----------------------------------------------- |
| APE-Registry     | `@apzhub/platform-runtime`                                | mature               | Registry / workbench hydration                  |
| APE-Search       | `@apzhub/search-orchestrator` (+ `search-*`)              | mature               | `/api/v1/search/**`                             |
| APE-Notify       | `@apzhub/event-notification-framework` + `notification-*` | mature               | `/api/v1/notifications/**` (incl. inbox routes) |
| APE-Activity     | `@apzhub/activity-timeline-framework`                     | substantial          | Shell / workbench                               |
| APE-Audit        | `@apzhub/platform-audit`                                  | partial              | `/api/v1/platform/audit`                        |
| APE-Command      | `@apzhub/command-framework`                               | substantial          | Shell UCP                                       |
| APE-Events       | `@apzhub/platform-event-bus` (+ outbox/processing)        | mature               | `/api/v1/platform/events/**`                    |
| APE-Integration  | `@apzhub/integration-sdk`                                 | mature               | `integrations/*/integration.yaml`               |
| APE-Config       | `@apzhub/configuration-*`                                 | mature               | `/api/v1/configuration/**`                      |
| APE-Flags        | `@apzhub/platform-governance`                             | substantial          | `/api/platform/v1/feature-flags`                |
| APE-Realtime     | inside `@apzhub/platform-services` realtime               | substantial          | `/api/v1/realtime/**`                           |
| APE-AI / APE-RAG | _(none)_                                                  | deferred             | Programme 003                                   |

### 1.2 Adjacent shared platform capabilities (real, not always APE-named)

| Capability                                               | Package / API evidence                                                                                   | Notes                                              |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Personalisation (preferences, favorites, recent, layout) | `@apzhub/platform-personalisation` · `/api/platform/v1/{preferences,favorites,recent,personalisation/*}` | Shared shell/personalisation                       |
| Identity / tenancy                                       | `@apzhub/platform-identity` + `identity-*`                                                               | Platform control plane                             |
| Authorization                                            | `@apzhub/platform-authorization`                                                                         | Platform control plane                             |
| Security headers / traffic                               | `@apzhub/platform-security`                                                                              | Platform control plane                             |
| Workbench / module registry surfaces                     | `@apzhub/workbench-framework`                                                                            | Shell navigation mechanism                         |
| Knowledge discovery (palette/search UX)                  | `@apzhub/knowledge-discovery-framework`                                                                  | Shell-adjacent; not RAG                            |
| Umbrella composition                                     | `@apzhub/platform-services`                                                                              | Large composition host — mix of product + platform |

### 1.3 Hypotheses checked against the repository

| Hypothesis             | Real today?                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| H-Search               | **Yes** — APE-Search                                                                                                                |
| H-Notify               | **Yes** — APE-Notify                                                                                                                |
| H-Activity             | **Yes** — APE-Activity (shell-heavy)                                                                                                |
| H-Command              | **Yes** — APE-Command                                                                                                               |
| H-Prefs                | **Yes** — platform-personalisation (+ configuration engine for config)                                                              |
| H-Favorites / H-Recent | **Yes** — personalisation APIs                                                                                                      |
| H-Inbox                | **Partial** — notification inbox routes exist; **no** separate Universal Inbox service. Support “inbox” is a **product work queue** |
| H-Nav                  | **Mechanism exists** — workbench + registry; **no** distinct Cross-Product Navigation service package                               |
| H-Presence             | **No** — no presence package, service, or API                                                                                       |

### 1.4 Explicit non-capabilities / stubs

| Item                             | Finding                                     |
| -------------------------------- | ------------------------------------------- |
| `packages/notifications/`        | Empty stub — not a capability               |
| Presence & Collaboration         | Absent                                      |
| Distinct Universal Inbox product | Absent (inbox is a Notify delivery surface) |
| APE-AI / APE-RAG                 | Deferred — no foundation packages           |

---

## 2. Ownership

| Capability                                                                              | Current owner                                    | Duplicated?                                                                                      | Clarity                                             |
| --------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Search                                                                                  | **APE** (`search-*` + orchestrator)              | Product **adapters** + Search **UI modules** (expected adapters; UI is product surface)          | Clear APE ownership                                 |
| Notify                                                                                  | **APE** (ENF + notification-\*)                  | **Yes risk:** `@apzhub/qep-notification` parallel stack; `workflow-notifications` product module | APE clear; QEP parallel unclear/defect risk         |
| Activity                                                                                | **APE** (shell-owned)                            | Product activity type registration only                                                          | Clear APE; weak product adoption                    |
| Audit                                                                                   | **APE facade** + **domain SoRs**                 | Domain audit APIs remain authoritative; facade merges                                            | Intentional split — clarify in inventory            |
| Command                                                                                 | **APE**                                          | **Yes risk:** `@apzhub/qep-command`                                                              | APE clear; QEP parallel defect risk                 |
| Events / Outbox                                                                         | **APE / platform**                               | No alternate bus                                                                                 | Clear                                               |
| Integration                                                                             | **APE** (SDK) + product adapters                 | No                                                                                               | Clear                                               |
| Config / Flags                                                                          | **APE**                                          | No                                                                                               | Clear                                               |
| Realtime                                                                                | **APE** (flag-gated)                             | Support also exposes SSE stream surfaces                                                         | Mostly clear                                        |
| Personalisation                                                                         | **Platform** (`platform-personalisation`)        | No alternate prefs SoR found                                                                     | Clear                                               |
| Registry / Workbench nav                                                                | **Platform** (runtime + workbench)               | No separate Nav service                                                                          | Clear as shell mechanism                            |
| Identity / Authz / Security                                                             | **Platform**                                     | No                                                                                               | Clear                                               |
| QEP automation / orchestration / scm / quality-intelligence / dashboard / visualization | Named `platform-*` but **QEP-skewed call sites** | Product-elevated naming                                                                          | **Unclear** — name says platform; consumers say QEP |
| TCMS `platform-quality` / `platform-release` / governance TCMS paths                    | Testing / certification domain                   | N/A                                                                                              | Product / certification — not cross-portfolio UX    |
| Support work-queue “inbox”                                                              | **APZ Support**                                  | Terminological clash with notification inbox                                                     | Product-owned                                       |
| Knowledge product memory                                                                | **APZ Knowledge**                                | Distinct from knowledge-discovery-framework                                                      | Product-owned                                       |
| Presence                                                                                | _(none)_                                         | —                                                                                                | N/A                                                 |

**Most important APS-001 finding:** several capabilities are **already APE-owned**, but a minority are **duplicated inside QEP**, and several `platform-*` packages are **platform-named with single-product consumption**.

---

## 3. Consumer analysis

Using Production Ready portfolio products + shell. ● = consumes today (consumption map / wiring evidence). ○ = gap / indirect.

| Capability                        | Consumers today                                                          | Should consume (platform intent)               | Should not                                             |
| --------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------ |
| APE-Registry                      | All 7 + shell                                                            | All products + shell                           | Providers as owners                                    |
| APE-Search                        | Projects, QEP, Support, Knowledge, Time, shell (Workflow/Analytics weak) | All products that expose discoverable entities | Provider-native search UIs as SoR                      |
| APE-Notify                        | Projects, QEP, Workflow, Support, shell (Analytics/Knowledge/Time weak)  | Products that emit user-attention events       | Parallel product notification stacks                   |
| APE-Activity                      | Shell primarily                                                          | Products registering activity types over time  | Per-product activity platforms                         |
| APE-Audit                         | Shell / facade; domains retain SoRs                                      | Cross-product audit query consumers            | Replacing domain SoRs                                  |
| APE-Command                       | Shell + all products (registration)                                      | All products                                   | Parallel command platforms (QEP)                       |
| APE-Events                        | Broad platform + products                                                | Publishers via services                        | Modules notifying directly                             |
| APE-Integration                   | Products with engines                                                    | Products with external engines                 | Modules calling engines directly                       |
| APE-Config                        | Broad                                                                    | All                                            | Secrets in product code                                |
| APE-Flags                         | Shell / governance                                                       | Products needing flags                         | Ad-hoc env toggles as long-term UX                     |
| APE-Realtime                      | Support + shell                                                          | Products with live streams when justified      | Always-on presence without need                        |
| Personalisation                   | Shell (+ law app mirror)                                                 | Cross-product prefs/favorites/recent           | Product-local preference SoRs for shell behaviour      |
| Notification Inbox                | Notify surface                                                           | Users via Notify                               | Separate Universal Inbox product (unless later proven) |
| Support Inbox                     | Support only                                                             | Support agents                                 | Platform Universal Inbox                               |
| Presence                          | Nobody                                                                   | _(none today)_                                 | Invented before consumers                              |
| QEP `platform-*` elevated engines | QEP-primary                                                              | Only if ≥2 PR products genuinely need them     | Assumed portfolio platform by rename alone             |

---

## 4. Classification

Every discovered capability is placed in **exactly one** bucket for APS-001. This is **classification**, not an accepted inventory.

### A — Platform Service (belongs shared — Constitution and/or ≥2 PR consumers)

| Capability                                       | Basis                                                     |
| ------------------------------------------------ | --------------------------------------------------------- |
| Search                                           | Constitution + multi-product                              |
| Notifications (incl. notification inbox surface) | Constitution + multi-product                              |
| Activity                                         | Constitution (shell + declared APE)                       |
| Command                                          | Constitution + multi-product                              |
| Events                                           | Constitution                                              |
| Integration (adapter engine)                     | Constitution                                              |
| Configuration                                    | Constitution                                              |
| Feature Flags                                    | Constitution                                              |
| Realtime                                         | Constitution (Support + shell today; declared APE)        |
| Audit (unified facade)                           | Constitution (ADR-PE-0001 / APE-Audit)                    |
| Registry                                         | Constitution                                              |
| Personalisation (preferences, favorites, recent) | Multi-app shared APIs + shell; platform-owned prefs model |
| Identity / Authorization / Security              | Explicit platform control-plane responsibilities          |

### B — Product Capability (must remain inside a product)

| Capability                                                                                              | Owner                              |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Support work-queue inbox                                                                                | APZ Support                        |
| Domain audit SoRs (identity, notification delivery, search publication, QEP evidence, certification, …) | Owning domain                      |
| Product Search / Notifications workbench **views**                                                      | Owning product (presentation only) |
| APZ Knowledge organisational memory                                                                     | APZ Knowledge                      |
| QEP test/evidence/requirements domain services                                                          | APZQEP                             |
| TCMS quality / release gateway services                                                                 | Testing / certification            |
| Workflow product notification **views**                                                                 | APZ Workflow                       |

### C — Future Intelligence (Programme 003)

| Capability | Notes                            |
| ---------- | -------------------------------- |
| APE-AI     | Catalogue deferred — no packages |
| APE-RAG    | Catalogue deferred — no packages |

### D — Implementation Detail (internal; not a distinct platform capability)

| Item                                           | Why                                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| Search product adapters (`search-projects`, …) | Adapter pattern under APE-Search — not separate services                           |
| Outbox / processing packages                   | Machinery of APE-Events                                                            |
| Workbench / navigation manifests               | Shell mechanism of Registry — not H-Nav as a new service                           |
| Empty `packages/notifications/`                | Dead stub                                                                          |
| `platform-services` umbrella packaging         | Composition host, not a user-facing service identity                               |
| Knowledge-discovery-framework                  | Shell UX helper for Command/Search — not a separate APS identity pending inventory |

### E — Present in name, fails Two-Consumer Rule today (do **not** treat as Platform Service yet)

| Item                                                                                                             | Finding                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `@apzhub/platform-automation` / `orchestration` / `scm` / `quality-intelligence` / `dashboard` / `visualization` | Platform-named; QEP-primary consumption — **exclude from Platform Service class until ≥2 PR products genuinely consume** |
| Presence                                                                                                         | Does not exist — **not** a platform service                                                                              |
| Distinct Universal Inbox                                                                                         | Does not exist as separate capability — inbox remains Notify surface unless inventory later proves otherwise             |
| QEP parallel notify/command stacks                                                                               | Product-local duplication risk — **not** additional platform services                                                    |

---

## Hypothesis disposition (informational only)

| ID                               | Disposition for APS-002 consideration                                              |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| H-Search                         | Confirm as existing Platform Capability (APE-Search)                               |
| H-Notify                         | Confirm (APE-Notify); inbox is surface, not new service                            |
| H-Activity                       | Confirm (APE-Activity); note consumption gaps                                      |
| H-Command                        | Confirm (APE-Command); note QEP duplicate risk                                     |
| H-Prefs / H-Favorites / H-Recent | Confirm under Personalisation                                                      |
| H-Inbox                          | Reject as distinct service **unless** APS-002 finds two-product need beyond Notify |
| H-Nav                            | Reject as distinct service — covered by Registry/Workbench                         |
| H-Presence                       | Reject for now — no code, no consumers                                             |

---

## Ownership tension summary (primary APS-001 output)

1. **True shared engines already exist** — Assessment shrinks the _new_ invention space; it does not invent Search/Notify/Command from zero.
2. **Duplication is the defect class** — especially QEP notification/command parallels.
3. **Rename ≠ platform** — several `platform-*` packages fail the Two-Consumer Rule.
4. **Terminology collisions** — “inbox” means Notify surface vs Support work queue; must not become two platform services by naming alone.
5. **AI stays out** — Future Intelligence only.

---

## Conclusion

```text
Platform Services Assessment

Classification:
A – Existing Platform Capabilities Identified

Recommendation:
Derive finite Platform Service inventory (APS-002)

Engineering:
Not authorised.
```

---

## Explicit non-outputs

- No APS-002 inventory rows accepted
- No engineering execution
- No redesign of Production Ready products
- No AI / RAG scope
- No preconceived ten-service list treated as truth

---

## Next gated step

**APS-002 — Finite Platform Service Inventory** — Owner Accept required before any Engineering Execution.

Applies Two-Consumer Rule + Constitution declarations to produce a **smaller, reusable** finite set.
