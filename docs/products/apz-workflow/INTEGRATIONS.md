# APZ Workflow — Planned Integrations (Release 1.0)

> **Programme:** APZ-WORKFLOW-001  
> **Classification:** DOCUMENTATION ONLY  
> **Date:** 2026-07-19  
> **Rule:** Planned integrations are **not** authorised by this document. Path remains Module → Platform Service → Connector → Engine.

---

## Primary provider

| Provider | Role                                | Disk today                                                                 |
| -------- | ----------------------------------- | -------------------------------------------------------------------------- |
| **n8n**  | Primary Release 1.0 engine provider | `@apzhub/integration-n8n` **0.1.0** Reference Adapter (read-only metadata) |

Brand masking: user-facing name is **APZ Workflow** — never n8n in standard UI.

---

## Future providers (post-1.0)

Temporal · Camunda · Flowable · Azure Logic Apps · Power Automate · others — require separate Owner Approval + Integration SDK adapters.

---

## Cross-product integrations (planned for Release 1.0 intent)

| Product / capability | Planned Workflow use                              | Notes                                                   |
| -------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| **Projects**         | Triggers / actions on project lifecycle           | Via Platform Services — never Plane client from modules |
| **Support**          | Ticket-related automations · escalations          | Via Support Platform Services                           |
| **Time**             | Time-entry / timesheet-adjacent automations       | Via Time Platform Services                              |
| **Documents**        | Document lifecycle hooks                          | Via Documents services                                  |
| **Analytics**        | Operational dashboards over run metrics (consume) | Analytics is separate product; no BI redesign           |
| **Identity**         | Actors · roles · approval assignees               | Platform IAM / AuthZ                                    |
| **Notifications**    | Run/approval/schedule alerts                      | Platform Notification Framework only                    |
| **Email**            | Notification/delivery channel                     | Platform-owned SMTP path                                |
| **Calendar**         | Schedule windows · reminders                      | Platform/calendar adjacency — no inventing engines      |

---

## External systems (later)

Future external systems integrate only through **Integration SDK** adapters and Platform Services. Modules never call external systems directly.

---

## Portfolio strategy cross-link

- [PORTFOLIO-INTEGRATION-STRATEGY](../PORTFOLIO-INTEGRATION-STRATEGY.md) (APZHUB-PORTFOLIO-001)
- Portfolio Definition Pack: [workflow/INTEGRATIONS.md](../workflow/INTEGRATIONS.md)

---

## Honesty

Cross-product automation is **planned**. On disk today: Workflow SoR + read-only n8n discovery. Do not claim live execute integrations as shipped.
