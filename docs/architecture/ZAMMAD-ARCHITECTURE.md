# Zammad Architecture — Discovery (OSS-102-01)

> **Purpose:** Authoritative discovery of the Zammad engine for APZHUB Support integration  
> **Audience:** Platform engineers, integration authors, AI agents  
> **Authoritative references:** [REFERENCE-ADAPTER-STANDARD](./REFERENCE-ADAPTER-STANDARD.md) · [002 — Terminology](../002-product-naming-positioning-terminology-standard.md) · [026 — Integration SDK](../026-integration-sdk-adapter-framework-integration-manifest-specification.md) · [Official Zammad API](https://docs.zammad.org/en/latest/api/intro.html)  
> **Status:** Discovery complete — **no implementation**  
> **Last updated:** 2026-07-10  
> **Milestone:** OSS-102-01

---

## 1. Product positioning

| Layer               | Name                                           |
| ------------------- | ---------------------------------------------- |
| User-facing product | **Support**                                    |
| Platform Service    | `SupportService`                               |
| Adapter (internal)  | `ZammadAdapter` / `@apzhub/integration-zammad` |
| Engine              | Zammad Community Edition (self-hosted first)   |

Zammad branding, group names as backend roles, and raw engine IDs must never appear in standard UI.

---

## 2. API surface overview

Zammad exposes a **REST/JSON API** at `/api/v1/*`. Official documentation states the REST API covers operations available in the UI.

| Concern          | Finding                                                                     |
| ---------------- | --------------------------------------------------------------------------- |
| Primary protocol | REST + JSON                                                                 |
| Base path        | `/api/v1`                                                                   |
| Content-Type     | `application/json` **required** (otherwise HTML responses)                  |
| Pagination       | Supported on list endpoints                                                 |
| Expand           | `?expand=true` resolves related IDs to names                                |
| Full payload     | `?full=true` returns large asset graphs + counts                            |
| Search           | Dedicated `*/search?query=` on tickets, users, organizations, roles, etc.   |
| GraphQL          | **Not offered** as a first-party Zammad API — do not design against GraphQL |
| Official clients | Ruby, PHP (optional); APZHUB will use Integration SDK HTTP client only      |

**APZHUB decision:** REST-only adapter. No GraphQL dependency.

---

## 3. Authentication

Zammad supports three API authentication methods:

### 3.1 HTTP Basic Auth

```http
Authorization: Basic base64(username:password)
```

**APZHUB stance:** Discouraged for production connectors. Prefer tokens. May be used only for bootstrap diagnostics if explicitly configured.

### 3.2 HTTP Token Authentication (preferred)

```http
Authorization: Token token={access_token}
```

- Users create access tokens in preferences (`/api/v1/user_access_token`).
- Tokens can be scoped to permission sets (e.g. `ticket.agent`, `admin.organization`).
- Token secret returned **once** at creation — store in platform secret refs, never in logs.
- Token auth may be disabled by instance policy.

**APZHUB default:** Service account + scoped API token via Integration SDK `AuthenticationProvider`.

### 3.3 OAuth2 Bearer

```http
Authorization: Bearer {oauth_access_token}
```

- Intended for third-party applications.
- Useful for future SSO-bridged agent contexts; **not required** for Wave 2 service-account integration.

### 3.4 Sessions

- Browser sessions (cookie/CSRF) power the Zammad UI; not the primary integration path.
- Unauthenticated user creation via CSRF is documented as possible but out of scope — APZHUB will not use CSRF session flows for the adapter.
- Adapter connection lifecycle follows SDK ConnectionManager (acquire / release / health), not Zammad UI sessions.

### 3.5 On-behalf-of actions

Zammad supports acting on behalf of another user for selected operations (e.g. ticket create with `customer_id`, articles with `origin_by_id`). APZHUB must:

- Keep impersonation explicit in Platform Service audit
- Never expose Zammad user IDs to clients
- Map platform user → Zammad user via EntityMappingStore

---

## 4. Core domain resources (REST)

| Resource                  | Typical endpoints                                            | Notes                                                          |
| ------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| **Users**                 | `/api/v1/users`, `/users/me`, `/users/search`                | Agents & customers; role/group assignment permission-sensitive |
| **Organizations**         | `/api/v1/organizations`, search                              | Customer companies; domain matching                            |
| **Groups**                | `/api/v1/groups`                                             | Ticket queues / routing units                                  |
| **Roles**                 | `/api/v1/roles`, search                                      | Permission bundles (`admin`, `ticket.agent`, …)                |
| **Tickets**               | `/api/v1/tickets`, `/tickets/search`                         | Primary work item; group-scoped visibility                     |
| **Articles**              | `/api/v1/ticket_articles`, `/ticket_articles/by_ticket/{id}` | Conversation entries on a ticket                               |
| **Attachments**           | `/api/v1/ticket_attachment/{ticket}/{article}/{attachment}`  | Binary download; create via article payload (base64)           |
| **Tags**                  | `/api/v1/tags`, `/tags/add`, `/tags/remove`, `/tag_list`     | Ticket-scoped + admin catalogue                                |
| **Ticket states**         | `/api/v1/ticket_states`                                      | Workflow states; mutation discouraged via API                  |
| **Ticket priorities**     | `/api/v1/ticket_priorities`                                  | Priority catalogue                                             |
| **Overviews**             | `/api/v1/overviews`, ticket overview views                   | Saved agent views / filters                                    |
| **SLAs**                  | Admin UI + related objects; calendars `/api/v1/calendars`    | Escalation timing; CE includes SLA                             |
| **Triggers**              | Admin automation (API coverage varies)                       | Condition → action automation                                  |
| **Macros**                | Agent one-click multi-actions                                | Manual automation shortcuts                                    |
| **Webhooks**              | Admin webhooks (outbound)                                    | Fired from triggers/schedulers                                 |
| **History / auditing**    | Ticket history via UI/API history endpoints                  | Change trail on tickets                                        |
| **Permissions**           | Role + group permission matrix                               | Enforced server-side on every call                             |
| **Knowledge base**        | `/api/v1/knowledge_base*`                                    | FAQ/answers — optional Wave 2+                                 |
| **Online notifications**  | Notification endpoints                                       | Prefer platform Attention Engine later                         |
| **CTI / chat / channels** | Channel-specific article types                               | Optional; not Wave 2 core                                      |

---

## 5. Tickets & articles (detail)

### Tickets

- CRUD: `GET/POST /tickets`, `GET/PUT/DELETE /tickets/{id}`
- Create may embed first **article**
- Update may append a new article in the same payload
- Visibility depends on **group permissions** and agent vs customer role
- Delete requires `admin` and is destructive (articles + attachments)
- Search: Elasticsearch-backed when configured (`/tickets/search`)

### Articles

- Types include: `email`, `phone`, `web`, `note`, `sms`, `chat`, channel-specific types
- `internal: true|false` controls customer visibility (email still sends if type is email)
- `sender`: `Agent` | `Customer` | `System`
- `content_type`: `text/html` | `text/plain`
- Attachments: base64 in create payload; download via attachment endpoint
- Time accounting: optional `time_unit` on articles

---

## 6. Organizations, groups, roles, users

| Concept      | Behaviour relevant to APZHUB                          |
| ------------ | ----------------------------------------------------- |
| Organization | Groups customers; shared ticket visibility options    |
| Group        | Primary routing / ACL boundary for tickets            |
| Role         | Named permission sets; never expose raw names in UI   |
| User         | May be agent and/or customer; organization membership |

**Role translation (007):** APZHUB permissions → service mapping → Zammad roles/groups. Backend role names stay adapter-internal.

---

## 7. Tags, states, priorities

| Object      | API posture                                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| Tags        | Add/remove on tickets; admin tag catalogue                                                |
| States      | List for mapping; create/update via API **not recommended** (prefer UI / controlled seed) |
| Priorities  | Catalogue list; map to APZHUB priority enum                                               |
| State types | Affect escalation behaviour; no public list endpoint — instance-specific                  |

---

## 8. SLA, triggers, macros, overviews

| Capability      | CE availability | Adapter posture (Wave 2)                                                 |
| --------------- | --------------- | ------------------------------------------------------------------------ |
| SLA + calendars | Available in CE | Read/report optional; configure in Zammad admin                          |
| Triggers        | CE              | Out of adapter write-path initially; document as engine-owned automation |
| Schedulers      | CE              | Same — engine-owned                                                      |
| Macros          | CE              | Optional later (execute macro via API if stable)                         |
| Overviews       | CE              | Optional read for agent views; APZHUB may replace with native filters    |

---

## 9. Search, history, auditing

| Concern     | Zammad                                | APZHUB                                                                                       |
| ----------- | ------------------------------------- | -------------------------------------------------------------------------------------------- |
| Search      | `/tickets/search`, `/users/search`, … | Platform Search Service indexes derived events; adapter may expose search for sync/bootstrap |
| History     | Ticket history trail                  | Map to Activity entries; platform Activity Stream owns UX                                    |
| Auditing    | Engine audit + APZHUB audit           | Platform Services emit immutable audit; never rely on Zammad alone                           |
| Permissions | Enforced by Zammad on API calls       | APZHUB authz is authoritative for client; adapter uses least-privilege token                 |

---

## 10. Webhooks & events

### Outbound webhooks (Zammad → APZHUB)

- Configured in Zammad admin; fired by triggers/schedulers
- Custom JSON payloads; HMAC possible depending on version/config
- **APZHUB Wave 2:** design event translator + verify signatures; **HTTP ingress remains a later platform milestone** (same pattern as Plane — adapter can validate/translate before ingress exists)

### Inbound events (conceptual)

- No first-class “event bus subscribe” API — webhooks + polling/sync are the integration patterns
- Adapter should provide: webhook payload validation, canonical event translation, incremental sync cursors

---

## 11. GraphQL

**Finding:** Official Zammad documentation documents **REST only**. Third-party mentions of GraphQL are not an APZHUB dependency.

**Decision:** Unsupported. No GraphQL client in `@apzhub/integration-zammad`.

---

## 12. Limitations (engine)

1. Ticket visibility is group/ACL heavy — service account design is critical.
2. State mutation via API discouraged; prefer catalogue sync + map.
3. Destructive ticket delete is irreversible.
4. `internal` articles can still send email if type is email.
5. `full=true` search responses are large — avoid in hot paths.
6. Token auth may be disabled per instance.
7. Some admin automations have weaker/less-documented API coverage than tickets/users.
8. Attachment upload via base64 increases payload size — need size limits in Platform Service.
9. Elasticsearch strongly recommended for search quality.
10. No first-party GraphQL.

---

## 13. Version compatibility (planned pin)

| Field               | Recommendation (discovery)                                  |
| ------------------- | ----------------------------------------------------------- |
| Target edition      | **Community Edition** self-hosted                           |
| Planned min version | **6.3.x** (confirm at OSS-102-02 against deployed instance) |
| Planned max         | Same major line until contract tests say otherwise          |
| Upgrade policy      | Pin in `integration.yaml`; re-certify on major bumps        |

Exact min/max must be locked in OSS-102-02 after environment inventory (`ENVIRONMENT.md` / host coexistence).

---

## 14. Community vs Enterprise

| Topic                                         | Community Edition (APZHUB default) | Hosted / commercial packaging     |
| --------------------------------------------- | ---------------------------------- | --------------------------------- |
| Core ticketing, articles, users, orgs, groups | Full                               | Full                              |
| REST API                                      | Full                               | Full                              |
| SLA / triggers / macros / webhooks            | Available in CE                    | Often marketed in hosted tiers    |
| Knowledge base                                | CE                                 | CE / hosted                       |
| Branding / multi-instance / managed ops       | Self-managed                       | Hosted Enterprise differentiators |
| Mandatory EE APIs                             | **None for Wave 2 core**           | Avoid EE-only features            |

**APZHUB rule:** Self-hosted CE first; no mandatory Enterprise Edition dependencies (004/008).

---

## 15. Security notes for adapter design

- Secrets only in platform secret references
- Never log tokens, passwords, article bodies with PII beyond policy, or attachment bytes
- Translate Zammad errors via VendorErrorMapper — no raw engine errors to clients
- Least-privilege token: prefer `ticket.agent` + needed admin scopes, not blanket `admin`
- TLS mandatory to Zammad base URL

---

## 16. Related documents

- [ZAMMAD-MAPPING.md](./ZAMMAD-MAPPING.md)
- [ZAMMAD-CAPABILITY-MATRIX.md](./ZAMMAD-CAPABILITY-MATRIX.md)
- [ZAMMAD-IMPLEMENTATION-PLAN.md](./ZAMMAD-IMPLEMENTATION-PLAN.md)
- [ZAMMAD-TEST-PLAN.md](./ZAMMAD-TEST-PLAN.md)
- [OSS-102-01 Completion Report](../sprint/OSS-102-01-completion-report.md)
