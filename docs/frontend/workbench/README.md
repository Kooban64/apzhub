# User Workbench (Slice 1)

**Status:** Slice 1 implemented — Global Shell + Home + capability integrations  
**Authority:** Effective product access (org ∩ user grant) — not catalogue alone  
**Not Admin:** Separate from Platform Admin and Organisation Admin chrome

## Scope delivered

- Global Workbench Shell (activity rail · context sidebar · main · inspector · bottom · status)
- Home / My Work attention layout
- Productivity product launcher (entitled only)
- Global Search (Ctrl+K), Quick Actions (Ctrl+Shift+A), Notifications drawer, Activity inspector
- Panel resize/collapse via `react-resizable-panels` (+ local autoSave)
- Personalisation session store already persists workbench layout regions
- Mobile bottom navigation

## Out of scope (do not start next without Owner)

APZPRD / APZQEP / APZPEN product screens · Source terminal · AI

## Routes (repository truth)

| Path                                                                                              | Notes                                        |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `/workspace` · `/workspace/home`                                                                  | My Work home                                 |
| `/workspace/my-work`                                                                              | Queue composition                            |
| `/workspace/projects` · `support` · `time` · `workflow` · `analytics` · `knowledge` · `documents` | PRD soft routes                              |
| `/workspace/qep` · `/workspace/source` · `/apzpen`                                                | Quality / Source / PEN (not Slice 1 screens) |
| `/workspace/search` · `notifications/*` · `activity` · `personalisation`                          | Platform capabilities                        |

Catch-all: `apps/web/app/(platform)/workspace/[[...segments]]/page.tsx`

## Tests

```bash
pnpm exec vitest run apps/web/lib/workbench/compose-workbench-rail.test.ts
pnpm test:e2e:workbench-slice1-shell
```

## Slice 1 stop report

|                 |                                                                                                                                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reused**      | DesktopShell · Global Search · Quick Actions · Notifications · Activity · Personalisation layout API · effective entitlements (`home-context` / product-access) · My Work composition                                 |
| **Built**       | `WorkbenchShellLayout` (resizable panels) · compact Workbench header · access-driven Productivity rail · My Work attention home · mobile bottom nav                                                                   |
| **Real Data**   | My Work queues · entitlements-driven rail · session tenant · notification/activity providers as already wired                                                                                                         |
| **Gaps**        | Bottom panel content (terminal/problems) Not configured · Time hours strip partial · Favourites/Recent sidebar stubs · Org display name still often tenant id · Inspector is Activity-focused until product selection |
| **Access**      | Rail/sidebar from effective product keys only — no grey unavailable products; PA role alone ≠ product access                                                                                                          |
| **Tests**       | `compose-workbench-rail.test.ts` · `pnpm test:e2e:workbench-slice1-shell` (3 passed)                                                                                                                                  |
| **Screenshots** | `docs/frontend/workbench/evidence/01`–`10`                                                                                                                                                                            |

**Stop.** Do not proceed into APZPRD / QEP / PEN / Source without Owner direction.
