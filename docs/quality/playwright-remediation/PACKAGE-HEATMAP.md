# Package Heat Map

> **Programme:** APZHUB-QA-RECERT-001

---

## Failures by owning package / surface

| Package / surface                                              | Count | Notes |
| -------------------------------------------------------------- | ----: | ----- |
| `apps/web · platform-runtime · notification/activity packages` |    13 |       |
| `apps/web (Law routes) · pg`                                   |     7 |       |
| `apps/web /api/health · platform-runtime`                      |     6 |       |
| `apps/web shell · platform-runtime`                            |     6 |       |
| `packages/ui · apps/web login/support`                         |     4 |       |
| `testing/playwright/e2e`                                       |     3 |       |
| `apps/web metrics workbench`                                   |     2 |       |
| `apps/web testing workbench`                                   |     2 |       |
| `apps/web workflow`                                            |     2 |       |
| `testing/playwright · apps/web support`                        |     2 |       |
| `apps/web · administration HTTP client tests`                  |     1 |       |
| `testing/playwright · documents workbench`                     |     1 |       |
| `apps/web · identity HTTP client tests`                        |     1 |       |
| `apps/web · metrics HTTP client tests`                         |     1 |       |
| `apps/web · observe HTTP client tests`                         |     1 |       |
| `testing/playwright · search workbench`                        |     1 |       |
| `testing/playwright · TCMS workbench`                          |     1 |       |
| `apps/web · Better Auth`                                       |     1 |       |
| `testing/playwright · observe workbench`                       |     1 |       |

---

## Cross-cutting packages of interest

| Package                         | Why it appears                               |
| ------------------------------- | -------------------------------------------- |
| `apps/web`                      | Shell, health route, workbenches, Law routes |
| `testing/playwright/e2e`        | Defective helpers/selectors/API usage        |
| Design tokens / `packages/ui`   | Primary button contrast                      |
| Better Auth + platform DB/Redis | Health 503 + Invalid password                |
| `pg` import graph (Law)         | Client bundle `dns` resolution failure       |
