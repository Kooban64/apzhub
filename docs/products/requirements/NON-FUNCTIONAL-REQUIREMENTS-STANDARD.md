# Non-Functional Requirements Standard

> **Programme:** APZHUB-PRODUCTS-004

## Purpose

Ensure non-functional qualities are explicit before Definition.

## Categories (mandatory consideration)

| Category        | Definition expectation                                              |
| --------------- | ------------------------------------------------------------------- |
| Performance     | Latency/throughput targets or “measure in Architecture” with intent |
| Availability    | Uptime / degradation expectations                                   |
| Security        | Authn/Authz/Zero Trust alignment with Platform                      |
| Scalability     | Growth assumptions                                                  |
| Accessibility   | WCAG AA target for UI                                               |
| Compliance      | Links to regulatory section                                         |
| Audit           | Privileged/mutating auditability                                    |
| Monitoring      | Health, metrics, logs, traces intent                                |
| Maintainability | Operability, docs, upgrade expectations                             |

## Writing rules

1. Use IDs `NFR-###`.
2. Prefer measurable criteria; if TBD, state how Architecture will quantify.
3. Environmental qualifications (e.g. build `NODE_ENV`) are not product NFRs — reference Platform OQs where relevant.
4. Do not invent infrastructure that contradicts self-hosted / Platform 1.4 freezes.

## Quality checks

- [ ] Each NFR has priority, risk, acceptance criteria
- [ ] Security NFRs do not propose frontend-only controls
- [ ] Observability NFRs align with Platform pillars
