# APZ QEP — Decision Principles

> **Programme:** APZQEP-CONSTITUTION-001  
> **Purpose:** How to decide when trade-offs arise — binding guidance for Definition, Architecture, Engineering

## Decision order

When options conflict, prefer in this order:

1. **Constitution & Vision**
2. **Safety / security / audit integrity**
3. **SoR integrity & human accountability**
4. **Enterprise trust (tenancy, retention, self-hosted)**
5. **Category focus (QE differentiators)**
6. **Platform standards & extensibility**
7. **User experience clarity**
8. **Delivery speed**
9. **Feature breadth / competitor parity**

Speed never outranks Constitution, security, or SoR integrity.

## Recurring trade-off rules

| Trade-off                                  | Prefer                                       |
| ------------------------------------------ | -------------------------------------------- |
| Convenience vs governance                  | Governance                                   |
| Flashy AI vs explainable AI                | Explainable, gated AI                        |
| Jira-native depth vs independent SoR       | Independent QEP SoR (+ optional sync)        |
| Build runner vs ingest results             | Ingest results                               |
| Silent automation vs auditable automation  | Auditable                                    |
| Shortcut layering vs Platform-first        | Platform-first                               |
| Delete history vs retain                   | Retain (policy-governed)                     |
| Single vendor AI vs abstraction            | Abstraction                                  |
| Clone competitor feature vs differentiator | Differentiator (if table stakes already met) |

## Definition entry checklist (post-Constitution)

Before accepting a Definition statement:

- [ ] Aligns with Vision
- [ ] Aligns with Constitution articles
- [ ] Maps to accepted Requirements
- [ ] Respects Product Guardrails (not ALM/CI/device/runner)
- [ ] Respects AI & Certification Constitutions
- [ ] Preserves QEP as SoR
- [ ] Notes Platform freeze interactions honestly

## Escalation

Unresolved conflicts with the Constitution → Owner Decision. Teams shall not “interpret away” constitutional constraints.
