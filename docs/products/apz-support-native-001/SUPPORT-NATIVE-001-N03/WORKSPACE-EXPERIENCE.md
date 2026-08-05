# Workspace Experience — APZ-SUPPORT-NATIVE-001-N03

| Field     | Value            |
| --------- | ---------------- |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T042500Z |

## Product framing

Users experience **APZHUB → APZ Support**. Presentation is owned by the Support workspace UI; business state remains on Support platform services.

## Composition

| Element                 | Implementation                                                                   |
| ----------------------- | -------------------------------------------------------------------------------- |
| Page chrome             | `PageShell` — product name **APZ Support**, breadcrumbs, title, actions          |
| Workspace frame         | `SupportWorkspaceFrame` — primary column + optional context panel                |
| Responsive behaviour    | Context panel stacks below content on small screens; sticky aside on `lg+`       |
| Workspace state         | Session/local preferences (`apzhub.support.*`) for last request + onboarding tip |
| Empty / loading / error | Shared states with APZ Support copy                                              |

## Requests home

`/workspace/support` / `/requests` presents:

- Dismissible getting-started tip
- Filters and request list
- Quick actions in context panel
- Strong empty-state CTA when permitted

No adapter-console concepts on the home surface.
