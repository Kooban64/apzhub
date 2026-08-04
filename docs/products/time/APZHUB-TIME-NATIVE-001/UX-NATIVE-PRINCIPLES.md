# UX Native Principles — APZ Time

| Field     | Value                  |
| --------- | ---------------------- |
| Programme | APZHUB-TIME-NATIVE-001 |
| Status    | **STARTED**            |
| Timestamp | 20260804T193500Z       |
| Priority  | **1 — Native UX**      |

## Hard rules

1. **APZHUB brand only** — no Kimai marks, names, or “powered by” copy.
2. **APZHUB URLs only** — no redirects to engine hosts in the user journey.
3. **APZHUB terminology** — timesheets, entries, projects, approvals — never
   Kimai entity names in UI copy.
4. **APZHUB authentication only** — silent session; no engine login screen.
5. **APZHUB roles only** — never expose backend role names.
6. **Shell compliance** — Header, Activity Bar, Sidebar, Workspace, Status Bar
   per Desktop Framework; Time registers as a module, not a separate app skin.
7. **Parity of polish** — Time must not feel like an embedded third-party UI.

## Verification

Any user-facing string, link, or auth challenge containing engine identity =
**FAIL** for Platform Experience / Third-Party Visibility.
