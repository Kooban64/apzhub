# Navigation Model — APZ-SUPPORT-NATIVE-001-N03

| Field     | Value            |
| --------- | ---------------- |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T042500Z |

## Primary navigation

Manifest-driven sidebar (unchanged ownership model):

| Item          | Route                              |
| ------------- | ---------------------------------- |
| Requests      | `/workspace/support/requests`      |
| Organisations | `/workspace/support/organizations` |
| Groups        | `/workspace/support/groups`        |
| People        | `/workspace/support/users`         |
| Search        | `/workspace/support/search`        |
| Analytics     | `/workspace/support/analytics`     |
| Help          | `/workspace/support/help`          |
| Settings      | `/workspace/support/settings`      |

Activity bar label remains short **Support**; view title is **APZ Support**.

## Breadcrumbs

`APZ Support → section → entity` on product pages via `PageShell`.

## Rules

- Never hardcode workspaces outside the Module Registry / manifests.
- Help and Settings are first-class product routes — not engine admin UIs.
