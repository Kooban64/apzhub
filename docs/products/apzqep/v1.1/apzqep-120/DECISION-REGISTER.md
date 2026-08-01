# Decision Register — APZQEP-120

Owner / Product Board decisions required before or during implementation. Planning does **not** silently decide commercial/compliance/infra choices.

---

## D-001 — Evidence storage technology (ADR-0088)

| Field          | Value                                                                        |
| -------------- | ---------------------------------------------------------------------------- |
| Status         | **REQUIRED**                                                                 |
| Blocks         | S03–S04 (hard), S05–S06 (soft)                                               |
| Question       | Which durable blob provider for Evidence StoragePort?                        |
| Recommendation | S3-compatible (MinIO/self-hosted) for OSS-first alignment with stack **004** |
| Alternatives   | Local filesystem (dev-only risk); cloud S3; Azure Blob                       |
| Consequences   | Credentials, backup, residency, adapter code path                            |
| Deadline       | Before authorising S03                                                       |

## D-002 — Retention periods & deletion policy

| Field          | Value                                                                          |
| -------------- | ------------------------------------------------------------------------------ |
| Status         | **REQUIRED**                                                                   |
| Blocks         | S06 policy constants                                                           |
| Question       | Default retention per classification; legal hold behaviour                     |
| Recommendation | Configurable defaults; deny hard-delete under hold; soft-delete + GC job later |
| Alternatives   | Infinite retain (cost); short retain (compliance risk)                         |
| Deadline       | Before R2 cert                                                                 |

## D-003 — Maximum evidence file size

| Field          | Value                                                                                 |
| -------------- | ------------------------------------------------------------------------------------- |
| Status         | **REQUIRED**                                                                          |
| Blocks         | S04 enforcement values                                                                |
| Question       | Max upload size (and multipart threshold)                                             |
| Recommendation | Start conservative (e.g. 50–100 MiB) pending ops capacity — **Owner must set number** |
| Alternatives   | 1 MiB (too low for screenshots video); unlimited (abuse)                              |
| Deadline       | Before S04 implementation                                                             |

## D-004 — Notification channels for v1.1 foundation

| Field          | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| Status         | **REQUIRED**                                                      |
| Blocks         | S13 email scope                                                   |
| Question       | In-app only vs in-app+email for 120                               |
| Recommendation | In-app mandatory foundation; email optional behind flag           |
| Alternatives   | Email-mandatory; defer all notify to later (conflicts 111 intent) |
| Deadline       | Before S13                                                        |

## D-005 — Scale / SLO assumptions

| Field          | Value                                                             |
| -------------- | ----------------------------------------------------------------- |
| Status         | **REQUIRED** (or accept TBD baselines)                            |
| Blocks         | S18 numeric targets                                               |
| Question       | Concurrent executions, evidence volume/day, p95 API latency goals |
| Recommendation | Document current LA assumptions; defer hard SLOs to ops review    |
| Alternatives   | Invent targets (forbidden without Owner)                          |
| Deadline       | Before S18 cert claims                                            |

## D-006 — Release packaging & feature-flag strategy

| Field          | Value                                                                      |
| -------------- | -------------------------------------------------------------------------- |
| Status         | **REQUIRED**                                                               |
| Blocks         | R2–R4 packaging                                                            |
| Question       | Confirm incremental R0–R4 vs alternate packaging; who enables durable flag |
| Recommendation | Adopt [RELEASE-STRATEGY.md](./RELEASE-STRATEGY.md) as written              |
| Alternatives   | Single programme-end release (higher risk)                                 |
| Deadline       | At Board approval of this plan                                             |

---

## Non-decisions (already settled)

- APZQEP-111 architecture bands 120–180 — **approved**.
- Reuse platform event bus / outbox / ENF / search — **mandatory**.
- No Suites/Runs/Defects in 120 — **settled by programme boundary**.
