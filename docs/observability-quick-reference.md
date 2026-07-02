# APZHUB observability quick reference

Derived lookup for [014](./014-observability-monitoring-telemetry-health-framework.md).

> **Document Version:** 1.0 · **Classification:** Core Platform Architecture · **Status:** Approved Foundation Standard  
> For full hierarchy, dashboards, self-healing, testing, and acceptance criteria, read the complete document.

## Philosophy

Every important action observable · every failure traceable · every request measurable · every service reports health · **no silent components**

## Four pillars

**Metrics · Logs · Traces · Health**

## Health hierarchy

```
Platform → Workspace → Module → Platform Service → Connector → Backend Engine → Infrastructure
```

Each level contributes to overall platform health score.

## Platform health components

Authentication · PostgreSQL · Redis cache · search · notifications · background workers · configuration · storage · API gateway · platform services

## Module health (self-report)

Status · availability · dependencies · connector status · response time · configuration · version · last synchronisation

## Connector health states

Connected · disconnected · degraded · synchronising · auth failure · version mismatch · config error · rate limited · offline — diagnostic info required (008 lifecycle)

## Backend health (via services — masked from standard users)

Availability · API status · version · latency · auth · queue status · resource usage — **no implementation details in user UI** (002)

## Metrics to collect

Requests · latency · errors · retries · queue length · cache · DB queries · connector calls · provisioning · authentication · business workflows — structured (009, 010)

## Structured logs

Timestamp · correlation ID · module · service · connector · identity · operation · execution time · outcome

Levels: Debug · Information · Warning · Error · Critical — **no secrets** (013)

## Distributed tracing (correlation ID)

Spans: gateway → platform services → background jobs → connectors → backend engines → notifications → audit → search (010, 012)

## Telemetry (platform-owned)

Performance · usage · reliability · capacity · connector behaviour · background processing · security events · AI usage (future)

## Dashboards (Administration Workspace)

Platform overview · modules · connectors · infrastructure · security · jobs · queues · auth · storage · database · search — **actionable APZHUB views**, not raw engine dashboards for users

## Alerting

Critical · high · medium · low · informational — actionable, minimal noise

**Sources:** connector/auth/provisioning failure · queue growth · worker failure · high latency · storage/DB capacity · search failure · security events

## Activity timeline (admin/ops)

System · connector · module events · provisioning · config changes · security events · background jobs — distinct from user Activity Feed (011)

## Performance monitoring

API latency · DB · connectors · workers · search · cache · rendering · queue processing — retain historical trends

## Capacity monitoring

CPU · memory · disk · DB connections · cache · queue capacity · storage · worker utilisation — proactive planning

## Background worker monitoring (012)

Running/waiting/failed jobs · retries · DLQ · execution time · worker availability — continuous reporting

## Search monitoring

Index status · latency · growth · re-index · failures · health — platform capability; async index updates

## Security monitoring (013)

Failed logins · permission changes · suspicious activity · secret access · connector auth · privilege escalation · session revocation

## AI monitoring (future-ready)

Requests · latency · model availability · queue size · failures · prompt execution · token usage · costs

## Self-healing (future, auditable)

Connector restart · retry jobs · reconnect · refresh tokens · rebuild search · recover queues

## Historical analysis

Performance · usage · errors · availability · capacity · security · connector health — long-term retention

## Administration Workspace (026)

Platform/connector/module health · queues · workers · alerts · audit · logs · metrics · tracing · configuration — **one operational console** — permission/superadmin gated (005, 007)

## Self-hosted OSS tooling (behind connectors)

Prometheus · Grafana · Loki · Alertmanager · Wazuh · OpenTelemetry · future engines — implementation details; optional enterprise via connectors only — never mandatory (008)

## Testing

Unit · integration · connector · alert · health · performance · failure simulation — observability must be observable

## Acceptance (summary)

All services report health · all connectors expose status · correlated logs/metrics/traces · single admin workspace for diagnosis · historical trends · OSS self-hosted integration · extensible via connectors without redesign
