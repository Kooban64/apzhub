# APZHUB Persona Catalogue

> **Programme:** APZHUB-PRODUCT-MANAGEMENT-001  
> **Classification:** DOCUMENTATION ONLY  
> **Evidence:** Product Portfolio primary users · product Definition Packs  
> **Date:** 2026-07-19

---

## Purpose

Canonical commercial personas for positioning, GTM, and feature prioritisation. Complements engineering user stories; does not replace them.

---

## Cross-cutting personas

| ID        | Persona                | Goals                                      | Primary products                             |
| --------- | ---------------------- | ------------------------------------------ | -------------------------------------------- |
| P-EXEC    | Executive Sponsor      | Reduce tool sprawl; one operating platform | Analytics (future) · Law · Suite overview    |
| P-IT      | Platform Administrator | Secure deploy, IAM, health, upgrades       | Administration · Config · Observe · Identity |
| P-PO      | Product / Ops Lead     | Module adoption, process standards         | All suite                                    |
| P-PARTNER | Partner / MSP          | Deliver & support APZHUB for clients       | Partner edition · all                        |

---

## Suite personas

| ID      | Persona                | Goals                                   | Products                       |
| ------- | ---------------------- | --------------------------------------- | ------------------------------ |
| P-PM    | Project Manager        | Plan work, track delivery               | Projects                       |
| P-ENG   | Engineer / Contributor | Tasks, status, time                     | Projects · Time                |
| P-FIN   | Finance / Utilisation  | Billable time, cost signals             | Time · (Law billing adjacency) |
| P-AGENT | Support Agent          | Resolve requests, knowledge             | Support                        |
| P-CUST  | External Requester     | Submit / track requests (where enabled) | Support                        |
| P-KM    | Knowledge Worker       | Find & version documents                | Documents                      |
| P-AUTO  | Automation Builder     | Govern workflows                        | Workflow                       |
| P-QA    | Quality Engineer       | Test plans, certification evidence      | APZ TCMS                       |

---

## Law Platform personas

| ID      | Persona             | Goals                             | Products                        |
| ------- | ------------------- | --------------------------------- | ------------------------------- |
| P-LAW   | Lawyer / Fee Earner | Matters, clients, time, documents | Law · Time · Documents          |
| P-PARA  | Paralegal           | Matter ops, docs, tasks           | Law · Documents · Projects      |
| P-PRAC  | Practice Manager    | Utilisation, process, reporting   | Law · Time · Analytics (future) |
| P-TRUST | Trust Accountant    | Trust accounting controls         | Law (Trust)                     |

---

## Persona × product (summary)

| Persona | Projects | Time | Support | Documents | Analytics | Workflow | TCMS | Law |
| ------- | -------- | ---- | ------- | --------- | --------- | -------- | ---- | --- |
| P-PM    | ●        | ○    |         | ○         | ○         |          |      |     |
| P-ENG   | ●        | ●    |         | ○         |           |          | ○    |     |
| P-AGENT |          |      | ●       | ○         |           |          |      |     |
| P-KM    | ○        |      | ○       | ●         |           |          |      | ○   |
| P-LAW   | ○        | ●    |         | ●         |           |          |      | ●   |
| P-IT    | ○        | ○    | ○       | ○         | ○         | ○        | ○    | ○   |
| P-QA    |          |      |         |           |           |          | ●    |     |

● primary · ○ secondary

---

## Related

- [CUSTOMER-JOURNEY.md](./CUSTOMER-JOURNEY.md)
- [COMMERCIAL-PRODUCT-CATALOGUE.md](./COMMERCIAL-PRODUCT-CATALOGUE.md)
- TCMS personas (engineering): [APZHUB-APZ-TCMS-User-Personas](../product/APZHUB-APZ-TCMS-User-Personas.md) where present
