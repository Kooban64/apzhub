# APZPRD — Complete UI/UX Build Specification

## Stream 4 — Enterprise Productivity Platform

| Field              | Value                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document           | **UX-STREAM-004**                                                                                                                                                                                             |
| Status             | **FROZEN SPEC · EXECUTION ORDER PENDING** — 2026-08-16                                                                                                                                                        |
| Kind               | Everyday organisation work environment (not engineering workstation)                                                                                                                                          |
| Product promise    | **APZPRD shows people their work, not the software used to manage their work.**                                                                                                                               |
| Products           | Projects · Support · Time · Workflow · Analytics · Knowledge · Documents                                                                                                                                      |
| Shared chrome      | Search · Notifications · Activity · Quick Actions · Personalisation                                                                                                                                           |
| Providers (masked) | Plane · Zammad · Kimai · n8n · Metabase · Paperless-ngx                                                                                                                                                       |
| Shared source      | [UX-SHARED-SOURCE-WORKSPACE](./UX-SHARED-SOURCE-WORKSPACE.md) — linked for engineers; **not** default PRD UX                                                                                                  |
| Complements        | [APZPRD vision](../strategy/APZPRD-ENTERPRISE-PRODUCTIVITY-PLATFORM.md) · [SAAS-COMMERCIAL-MODEL](../strategy/commercial/SAAS-COMMERCIAL-MODEL.md)                                                            |
| Sibling streams    | [001](./UX-STREAM-001-public-commercial-journey.md) · [002](./UX-STREAM-002-apzqep-quality-engineering-platform.md) · [003](./UX-STREAM-003-apzpen-security-assurance.md) · Stream 5 Platform Shell (pending) |

### How PRD differs from QEP/PEN

QEP and PEN are **professional engineering workspaces**. APZPRD is the **everyday working environment**. Same interaction quality (keyboard, resizable panes where useful, command/search) — but ordinary employees must never feel they are operating seven enterprise systems.

---

## 1–2. Objective · Fundamental UX model

Unified productivity + Workbench chrome. Providers are implementation only.

```text
WHO IS THIS PERSON?
  → WHICH PRODUCTS ENTITLED?
  → WHAT CAN THEY DO IN EACH?
  → WHAT REQUIRES ATTENTION?
  → ASSEMBLE THEIR WORKSPACE
```

Two employees in one org can receive substantially different workspaces.

---

## 3–7. Shell · Entitlement-aware navigation

Groups: Home · My Work · WORK (Projects/Support/Time) · AUTOMATE (Workflow) · UNDERSTAND (Analytics/Knowledge/Documents).

**Never show inaccessible products disabled — remove them.**

Examples: Time-only · Support agent · Project manager · Operations manager.

---

## 8–12. Home · My Work · Cross-product objects

`/workspace/home` — **What needs my attention today?** Composed only from entitled products. Executive home is read-oriented.

`/workspace/my-work` — All | Tasks | Tickets | Approvals | Time | Workflow. Drawers for quick work without leaving My Work.

---

## 13–18. Search · Quick Actions · Notifications · Activity · Personalisation

Integrate Production Ready search (`Ctrl/Cmd+K`) with Cursor-like overlay. Quick Actions (`Ctrl/Cmd+Shift+A`) permission-filtered. One notification centre — no provider names. Unified activity stream. Personalisation: landing page (entitled only), theme, favourites, recent, saved filters.

---

## 19–25. APZ Projects

APZ surface — not Plane. Home summary · list/board/timeline · project detail tabs · compact board cards · task drawer · **Start Timer** with project/task prefilled · bidirectional Support relationships.

---

## 26–33. APZ Support

Agent queue vs **simple requester** experience (never expose agent queues to requesters). Ticket list with saved views. **Three-pane ticket workspace** (queue | conversation | context) — signature. Reply/internal note · knowledge suggestions · Create Task · Create Knowledge Article (human review before publish).

---

## 34–39. APZ Time

Employee home: today · running timer · week bars. Start Timer searches entitled work objects. **Global running timer** persists across product navigation. Week timesheet grid · manager team view · approve/return with reason. Competitive recording UX without Kimai branding.

---

## 40–45. APZ Workflow

User-facing: available workflows · start forms · my runs · approvals. **No n8n** for ordinary users. Designer / professional n8n access only with Professional Tools entitlement — be honest if advanced design still requires provider.

---

## 46–50. APZ Analytics

APZ dashboards/filters/drill-to-work — not Metabase for normal viewers. Analysts may get Models + Metabase under Professional Tools.

---

## 51–55. APZ Knowledge

Spaces · collections · articles · modern editor · revision history. **Contextual suggestions** in Support/Projects/Workflow.

---

## 56–60. APZ Documents

APZ explorer/preview/upload/metadata — not Paperless-ngx. Paperless for professional document admins only if required.

---

## 61–65. Cross-product UX

Related Work on every major object · universal preview drawer · favourites · recent · context switching (ticket → task → timer → knowledge panel) without opening providers.

---

## 66–82. Administration

`/admin`: Organisation · Users · Teams · Roles · Products · Provisioning · Integrations · Professional Tools · Billing · Security · Audit.

**User Inspector** (flagship): product roles + professional tools + provisioning status. Product assignment · effective permissions · access templates · teams · joiner/mover/leaver · licence conflict → Add Licence (Stream 1) · audit.

---

## 73–76. Professional Tools

Separate admin surface. Small user counts intentional. Grant with reason/expiry/audit. SSO/delegated launch. First-use boundary warning when leaving APZ chrome.

---

## 83–85. QEP / PEN / three-pillar switcher

Contextual Quality/Security cards when licensed — permission-aware open. Shared Search/Notify/Activity/Command/Identity/Personalisation across pillars.

---

## 86–91. Responsive

**Excellent mobile** (unlike QEP/PEN primary desktop): Home · My Work · Notifications · Time · Support · Approvals · Tasks · Knowledge. Messaging-oriented Support; fast timer. Tablet split panes.

---

## 92–100. Keyboard · Palette · Layout · Theme · Empty/Error · Freshness · A11y · Prefs vs policy

Shortcuts: search, quick actions, notifications, command palette. Persist layouts via personalisation. One theme system. Instructive empty states. Provider errors masked for users; honesty on stale data. WCAG 2.2 AA. Personalisation never overrides security policy.

---

## 101–105. UX rules

1. **Progressive complexity** — employee simple; manager more; specialist advanced.
2. **No provider leakage** except Admin → Providers / Professional Tools.
3. **Don't rebuild provider admin consoles** without reason.
4. **One object, many contexts.**
5. **Actions follow the user** (Start Timer, Create Task, Find Knowledge, …).

---

## 106. Signature experiences

1. Personal Home
2. My Work
3. Global Search
4. Quick Actions
5. Support Workspace (three-pane)
6. Time (effortless recording)
7. User Inspector
8. Cross-Product Relationships

---

## 107–110. Journeys

Employee · Manager · Administrator · Commercial expansion (Stream 1 add product → nav appears) — documented in Owner paste; implement without provider-conscious switching.

---

## 111. Source Workspace relationship

Normal PRD users do **not** need full Source Workspace. Projects may link repo/PR/QEP/PEN status; authorised engineers open **shared** Source Workspace — do not build another editor inside Projects.

---

## 112–113. Pillars fit · Final build instructions

```text
APZ → Identity/Org → QEP | PEN | PRD → Shared Platform → Capabilities → Providers
```

**Governing UX rule (verbatim):**

> Build APZPRD as one personalised enterprise work environment, not as a portal or application launcher. The user's navigation, home, work queues, search results, quick actions and notifications must be dynamically assembled from their organisation's subscriptions, their individual product entitlements, their role within each product and their effective permissions. Plane, Zammad, Kimai, Metabase, n8n and Paperless-ngx are replaceable providers and must remain transparent to normal users. Preserve specialist provider access as a separate Professional Tool entitlement rather than exposing backend products to everyone. Cross-product actions and relationships must allow users to complete ordinary work without consciously switching systems.

**Visual instruction (verbatim):**

> Use the same professional workspace philosophy established for APZQEP and APZPEN: fast keyboard navigation, resizable panes where they improve work, contextual right panels, persistent tabs where appropriate, command/search interfaces and information-dense layouts. Do not blindly copy Cursor's visual branding; adopt the interaction quality and workspace efficiency while retaining APZ's own design system.

---

## Next (Owner)

**Stream 5 — APZ Platform Shell & Design System** — shared navigation, typography, components, grids, tables, drawers, code workspace, command palette, status language, themes, reusable primitives — so Streams 1–4 do not diverge visually.
