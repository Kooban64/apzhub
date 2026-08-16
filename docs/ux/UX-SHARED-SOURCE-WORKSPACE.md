# APZ Shared Source Workspace

| Field        | Value                                                                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document     | **UX-SHARED-SOURCE-WORKSPACE**                                                                                                                                                                       |
| Status       | **LOCKED OWNER REQUIREMENT** — 2026-08-16                                                                                                                                                            |
| Consumers    | APZQEP ([UX-STREAM-002](./UX-STREAM-002-apzqep-quality-engineering-platform.md)) · APZPEN ([UX-STREAM-003](./UX-STREAM-003-apzpen-security-assurance.md)) · future professional products as entitled |
| Architecture | One platform capability — Integration SDK / Source adapters underneath; **never duplicate per product**                                                                                              |

## Cursor-quality UI/UX benchmark (locked)

Professional workspaces across QEP and PEN must include:

- resizable panes
- tree explorers
- tabs
- keyboard-first navigation
- command palette
- contextual sidebars
- dense professional layout
- ability to stay in one environment while working

## Provider neutrality

UX talks about **APZ repositories**, not GitHub-as-product.

Initial provider may be GitHub. Later: GitLab, Bitbucket, self-hosted Git, other authorised Git-compatible sources. Do not force users into the provider’s native UI for common browse/edit/commit/PR flows.

## Capability surface

```text
Repository Explorer · File Explorer · Code Editor · Tabs
Search · Symbol Search · Branch Selector · Diff Viewer
Commit History · Blame · PR Viewer
Source Editing · Git Changes · Commit · Branch · PR Creation
Context Panel · Resizable Panels · Keyboard Navigation · Command Palette
```

Write operations (edit / branch / commit / PR) require explicit permission. Read without write remains valid for auditors and many roles.

## Product overlays (not ownership)

| Product    | Context panel overlays                                                     |
| ---------- | -------------------------------------------------------------------------- |
| **APZQEP** | Requirements · Tests · Coverage · Defects · Quality evidence · Release     |
| **APZPEN** | Findings · SAST · Dependencies · Secrets · Security evidence · Remediation |

## Critical build instruction (verbatim)

> Do not build a separate code browser for APZQEP and another code browser for APZPEN. Build or consume the shared APZ Source Workspace. It must provide a Cursor-inspired professional source experience with resizable explorer, editor, contextual panel, tabs, search, branch/diff/history and permission-controlled Git write operations. Source providers must remain interchangeable. APZQEP overlays Quality context. APZPEN overlays Security context. Neither product owns source infrastructure.

## Strengthening vs earlier QEP wording

Source access is **not merely read-only quality context**. For users with appropriate permission, QEP (and PEN) provide the **full source workspace** through APZ UI. Repository may be GitHub initially; UX remains provider-neutral.
