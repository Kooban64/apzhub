# Platform 1.4 Scope

## MUST

1. Durable Notification Runtime (persistent queue/retry/DLQ; restart recovery) under ADR-0071.
2. Capacity & resilience evidence pack for SSE, delivery workers, Event Bus consumers, DB growth on shared-host profile.
3. POPIA / compliance technical evidence pack for external delivery enablement (formal legal approval remains external gate).
4. Full monorepo regression + Playwright portfolio executed for Platform 1.4 certification with honest classification.
5. Platform 1.4 certification + remediation model (CERT / RR / re-cert) completed.

## SHOULD

1. Notification / realtime administration maturity (diagnostics, DLQ triage, policy visibility).
2. Operational runbooks: enablement, rollback, worker supervision, incident response.
3. Release automation / evidence tooling improvements for repeatable certification.
4. One interchangeable external transactional delivery provider **only after** durable runtime ADR + POPIA precondition.

## MAY

1. Limited notification preference improvements (quiet hours / digest) if MUST capacity allows.
2. Observe/Support operational hardening that does not change ownership.
3. Search operational diagnostics improvements without architecture reopen.

## WILL NOT

See [PLATFORM-1.4-EXPLICIT-EXCLUSIONS.md](./PLATFORM-1.4-EXPLICIT-EXCLUSIONS.md).

At minimum: Platform 2.0 · architecture replacement · Integration SDK changes · WebSockets · Email SoR / mailbox / inbound · Workflow Execute · FIN-001 · SMS/push/WhatsApp/Teams/Slack · Support chat · destructive migrations · implementation under ARCH-001.
