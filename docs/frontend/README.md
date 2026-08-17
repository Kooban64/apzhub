# Frontend UX specifications

| Field  | Value                                                               |
| ------ | ------------------------------------------------------------------- |
| Status | **ACTIVE** — literal screen specs for Cursor reproduction           |
| Scope  | Authenticated control-plane and workbench UI (not public marketing) |
| Start  | [Platform Admin](./platform-admin/README.md)                        |

## Purpose

Move from conceptual UX into **literal screen specifications** Cursor can reproduce: information architecture, shell chrome, secondary navigation, ASCII layouts, honesty rules, and mockup sequence.

## Index

| Area                                      | Document                                                                       | Status                      |
| ----------------------------------------- | ------------------------------------------------------------------------------ | --------------------------- |
| Platform Admin (commercial control plane) | [platform-admin/README.md](./platform-admin/README.md)                         | **LOCKED · IA**             |
| Shell + master menu                       | [platform-admin/00-shell-and-ia.md](./platform-admin/00-shell-and-ia.md)       | **LOCKED**                  |
| Visual standard                           | [platform-admin/00-visual-standard.md](./platform-admin/00-visual-standard.md) | **LOCKED**                  |
| Screen specs                              | [platform-admin/screens/](./platform-admin/screens/)                           | **LOCKED · Overview first** |
| Mockup sequence                           | [platform-admin/MOCKUP-SEQUENCE.md](./platform-admin/MOCKUP-SEQUENCE.md)       | **IN FORCE**                |

## Authority boundaries

- Foundation docs `001`–`029` and Owner UX freezes remain supreme on conflict.
- These specs govern **layout and IA** for Platform Admin reproduction. They do not authorise new sprints by themselves — Owner must approve implementation batches.
- Terminology: user-facing product names (Projects, Support, …); provider names (Plane, Zammad, …) only on privileged Providers/Diagnostics surfaces per Stream rules.

## Related

- [UX streams index](../ux/README.md)
- [OWNER UX programme order](../decisions/OWNER-UX-STREAMS-PROGRAMME-ORDER.md)
- [UX-STREAM-005](../ux/UX-STREAM-005-platform-shell-design-system.md) · [UX-STREAM-006](../ux/UX-STREAM-006-tenant-identity-rbac-administration.md)
- Operator consoles (legacy route map): [OPERATOR-CONSOLES-PROGRAMME](../operations/OPERATOR-CONSOLES-PROGRAMME.md)
