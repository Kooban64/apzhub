# APZHUB Support — User Guide

> **Purpose:** Ops-facing guide for the Support workspace in APZHUB  
> **Audience:** Support agents, team leads, platform operators  
> **Product name:** Support (never expose backend engine names in the UI)  
> **Architecture:** [APZHUB Support Module UI](../architecture/APZHUB-Support-Module-UI.md)  
> **Status:** Delivered with OSS-110-13 — formal UI certification pending OSS-110-14  
> **Last updated:** 2026-07-11

---

## What Support is

Support is the APZHUB helpdesk workspace. You manage requests (tickets), conversation notes and customer replies, organisations, groups, and users, and you can search and review analytics — all inside the APZHUB workbench.

You always work through APZHUB. You do not open a separate backend console for day-to-day agent work.

---

## Opening Support

1. Sign in to APZHUB.
2. In the **Activity Bar**, select **Support** (life-buoy icon).
3. The sidebar shows: **Requests**, **Organizations**, **Groups**, **Users**, **Search**, **Analytics**.

You only see items your permissions allow. If an action is missing, ask an administrator — the server enforces permissions even if a control is somehow visible.

---

## Requests inbox

Path: `/workspace/support` or `/workspace/support/requests`

- Browse open and filtered requests.
- Click a row to open detail.
- Use **Create** (when permitted) to open `/workspace/support/requests/new`.

---

## Request detail

Path: `/workspace/support/requests/{id}`

You will see:

- Request metadata (status, priority, assignee, customer).
- **Conversation** — chronological articles labelled Internal, Public, or System.
- **Commands** — close, reopen, change state/priority, assign owner, change customer (permission-gated).
- Two separate composers (see below).

Article bodies are shown as **plain text**. HTML from email/web is stripped for safety — formatting may look simpler than the original mail client.

---

## Internal notes vs customer replies

| Composer | Who can see it | Use when |
| --- | --- | --- |
| **Internal note** | Agents only — not customers | Private agent discussion |
| **Customer reply** | Customer-visible | Official response to the customer |

**Rules:**

- Use the **Internal note** form for private comments. Visibility is fixed to internal; you cannot make a note public from that form.
- Use the **Customer reply** form for anything the customer should see. A warning reminds you the reply is customer-visible.
- Choose a **channel** (email, phone, web, chat, sms, fax) on customer replies when prompted.

Mixing these up can expose private content — treat the warning seriously.

---

## Attachments

APZHUB currently shows **attachment metadata only** (filename, type, size). Binary download/upload is **not available**. If you need the file contents, use your organisation’s approved process outside this UI until binary support is delivered.

---

## Organizations, groups, and users

| Sidebar | Typical tasks |
| --- | --- |
| Organizations | List, create, update, archive |
| Groups | List, create, update |
| Users | Browse Support user directory |

Exact create/update/archive controls depend on your permissions.

---

## Search

Path: `/workspace/support/search`

Enter a query to search Support entities exposed by the platform search API. Results are permission-filtered on the server.

---

## Analytics

Path: `/workspace/support/analytics`

Review snapshot metrics for the Support capability.

**Important:** Any **overdue** figure is a **heuristic estimate**, not an SLA measurement. Do not use it as contractual SLA evidence.

---

## Errors and availability

- **Forbidden (403):** You lack permission — contact an admin.
- **Unavailable / upstream errors:** The Support backend may be unreachable; retry later or escalate to platform ops. Messages will not expose internal engine details.

---

## What is not included yet

- Real-time push updates (refresh/refetch only)
- In-app Support notification centre for ticket events
- Binary attachment transfer
- Formal UI accessibility certification (planned OSS-110-14)

---

## Getting help

- Architecture & permissions detail: [APZHUB Support Module UI](../architecture/APZHUB-Support-Module-UI.md)
- API contract: [APZHUB Support HTTP API](../architecture/APZHUB-Support-HTTP-API.md)
- Milestone status: [CURRENT-MILESTONE](../foundation/CURRENT-MILESTONE.md)
