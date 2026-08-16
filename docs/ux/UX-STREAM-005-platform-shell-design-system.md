# APZ Platform Shell & Design System

## Stream 5 — Complete Shared UI/UX Specification

| Field                 | Value                                                                                                                                                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document              | **UX-STREAM-005**                                                                                                                                                                                                                                    |
| Status                | **FROZEN SPEC · EXECUTION ORDER PENDING** — 2026-08-16                                                                                                                                                                                               |
| Kind                  | Shared authenticated shell, navigation, workspace primitives, design language                                                                                                                                                                        |
| Rule                  | Products supply business experience; **platform supplies the shell**                                                                                                                                                                                 |
| Complements           | Streams [001](./UX-STREAM-001-public-commercial-journey.md)–[004](./UX-STREAM-004-apzprd-enterprise-productivity.md) · [Source Workspace](./UX-SHARED-SOURCE-WORKSPACE.md) · [Stream 6 RBAC](./UX-STREAM-006-tenant-identity-rbac-administration.md) |
| Critical tenancy rule | See Stream 6 — **APZOR is an ordinary tenant**, not platform super-tenant                                                                                                                                                                            |

---

## 1. Objective

One recognisable APZ experience across Quality · Security · Productivity.

Shared: Identity · Organisation context · Navigation · Product switcher · Search · Notifications · Activity · Quick Actions · Personalisation · Help · Account · Administration framework · Design language · Workspace primitives.

---

## 2. Commercial vs Authenticated

```text
PUBLIC APZ  →  Authentication  →  APZ PLATFORM
```

Do **not** carry marketing navigation into the authenticated workbench.

---

## 3–9. Authenticated shell · Org · Product switcher · Examples

Header: `APZ | Org ▼ | Product ▼ | Search | Actions | 🔔 | User`

Shell persists; product navigation changes.

Organisation context identifies tenant; multi-tenant users switch without leakage.

**APZOR example:** appears as `APZOR (Pty) Ltd` like any customer — nothing special because it is APZOR. Staff provisioned via same subscription/entitlement/role model.

Product switcher: only entitled products. Tenant entitlement ≠ user entitlement (developer vs support agent vs executive examples).

---

## 10. Navigation construction

```text
Tenant Subscription → Product Configuration → Membership → Product Assignment
  → Product Role → Effective Permissions → Professional Tools → VISIBLE NAVIGATION
```

Never hardcode menus from job title alone.

---

## 11–13. Sidebar · Context nav · Breadcrumbs

Expanded / collapsed / user-resized. Contextual project/object nav with clear back. Breadcrumbs only when hierarchy helps.

---

## 14–17. Tabs · Resizable panes · Context panel · Drawers

Professional tabs (QEP/PEN/Support). Reusable three-pane primitive (Explorer | Main | Context) — not every screen. Consistent right context panels. Drawers for quick work; **Open Full View** when complex.

---

## 18–22. Search · Quick Actions · Command Palette · Notifications · Running work

`Ctrl/Cmd+K` · `Ctrl/Cmd+Shift+A` · `Ctrl/Cmd+Shift+P` — all permission-filtered. Notification preview. Global running timer persists across product switches.

---

## 23–28. Status · Tables · Cards · Forms · Dialogs · Destructive

Shared status vocabulary where semantics overlap; product-specific statuses allowed. Excellent tables for operational queues; cards for summaries/marketplace. Proper forms; dialogs for decisions only; proportional destructive confirmation.

---

## 29–31. Product identity · Visual direction · Cursor inspiration

APZ master identity; Quality/Security/Productivity labels. Restrained enterprise design; strong typography; dense where needed; excellent dark mode. Copy Cursor **interaction principles**, not branding.

Avoid excessive gradients, huge cards, cartoons, over-rounding, animation, per-product design languages.

---

## 32–33. Responsive · Mobile shell

Desktop full; tablet two-pane; mobile task-oriented. Never illegible three-pane shrink. Mobile bottom nav + authorised `+` quick actions.

---

## 34–38. Account · Help · A11y · Loading · Errors

Account menu with org switch / sign out; admin separate when authorised. Context-aware help. WCAG 2.2 AA. Skeletons over full-screen spinners. User vs admin diagnostic error detail (provider names only in admin diagnostics).

---

## 39. Definition of Done — Platform Shell

> A user can move between every product they are authorised for without feeling they have entered another company's software or another authentication domain.
