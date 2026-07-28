# Platform 1.4 Success Criteria

Measurable criteria tied to the release theme:

1. Production notification delivery path uses **durable** queue/retry/DLQ; process restart does not lose in-flight intents (automated restart-recovery test PASS).
2. Capacity evidence pack published with measured concurrent SSE connections, queue depth bounds, worker throughput, and DB growth observations for the shared-host profile.
3. POPIA/compliance technical evidence pack filed; external provider remains disabled until formal compliance approval recorded.
4. Full monorepo regression executed; result PASS or PRWL-classified with remediation trail.
5. Playwright portfolio executed; result PASS or PRWL-classified with remediation trail.
6. If external transactional provider is in accepted scope: adapter certified interchangeable; products do not call provider; Email SoR still absent.
7. Deny-by-default flags retained for SSE and delivery enablement.
8. Complete Owner acceptance trail for ARCH → ADR → ENG → CERT.
9. Final certification recommendation recorded with honest limitations.
10. Email SoR · Workflow Execute · FIN-001 · WebSockets remain gated/excluded as applicable.
