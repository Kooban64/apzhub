# APS-002 — Finite Platform Service Inventory

| Field               | Value                                                                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document            | **APS-002**                                                                                                                                                                                          |
| Status              | **ACCEPTED** — contractual scope                                                                                                                                                                     |
| Timestamp           | 20260808T233000Z                                                                                                                                                                                     |
| Owner Decision      | [OWNER-DECISION-APS-002.md](./OWNER-DECISION-APS-002.md)                                                                                                                                             |
| Prerequisite        | [OWNER-ACCEPT-APS-001.md](./OWNER-ACCEPT-APS-001.md)                                                                                                                                                 |
| Derived from        | [APS-001-PLATFORM-SERVICES-ASSESSMENT.md](./APS-001-PLATFORM-SERVICES-ASSESSMENT.md)                                                                                                                 |
| Programme objective | **Certify and rationalise the Platform Service Layer while preserving the immutable Architecture Constitution and maintaining complete backwards compatibility with all Production Ready products.** |
| Engineering         | **AUTHORISED** — [APS-003](./APS-003-PLATFORM-SERVICE-ENGINEERING.md)                                                                                                                                |

---

## Rules

1. **Two-Consumer Rule**
2. **Platform intentionally smaller than Products** (Constitution)
3. **No expansion by usefulness**
4. **Ownership defects over missing capabilities**
5. **Machinery ≠ Service**
6. **AI/RAG out** — Programme 003

---

## Authoritative inventory (7)

| ID           | Service                 | Primary evidence                           | Action class                |
| ------------ | ----------------------- | ------------------------------------------ | --------------------------- |
| **APS-S-01** | **APS-Search**          | APE-Search · `@apzhub/search-orchestrator` | Certify                     |
| **APS-S-02** | **APS-Notifications**   | APE-Notify · ENF + `notification-*`        | Certify + ownership hygiene |
| **APS-S-03** | **APS-Command**         | APE-Command · `@apzhub/command-framework`  | Certify + ownership hygiene |
| **APS-S-04** | **APS-Activity**        | APE-Activity · shell-owned                 | Certify                     |
| **APS-S-05** | **APS-Personalisation** | `@apzhub/platform-personalisation`         | Consolidate / Certify       |
| **APS-S-06** | **APS-Realtime**        | APE-Realtime                               | Certify                     |
| **APS-S-07** | **APS-Audit**           | APE-Audit facade                           | Certify facade              |

---

## Explicitly excluded

### Platform machinery

APE Registry · Workbench · Navigation · Event infrastructure · Integration SDK · Identity / Authorization control plane · Configuration machinery

### Product capabilities

Support Inbox · Product dashboards · Product reporting · Product workflows

### Deferred (Programme 003)

AI Gateway · RAG · Semantic Search · Knowledge Graph · Recommendations · Agents · Predictions

### Removed candidates

Universal Inbox · Presence · Distinct Navigation Service

### Reclassify (not inventory)

Single-consumer `platform-*` (automation, orchestration, scm, quality-intelligence, dashboard, visualization) · TCMS platform-quality/release · QEP parallel notify/command (anomalies to correct)

---

## Ownership anomaly register (engineering scope)

| Anomaly                          | Target                             |
| -------------------------------- | ---------------------------------- |
| `@apzhub/qep-notification`       | Align to APS-Notifications         |
| `@apzhub/qep-command`            | Align to APS-Command               |
| Single-consumer `platform-*`     | Reclassify or earn second consumer |
| Domain audit vs APE-Audit facade | Keep split; certify facade only    |
