# Owner Decision Templates — APZ Engineering Lifecycle Standard v1.0

| Field     | Value                                                                                        |
| --------- | -------------------------------------------------------------------------------------------- |
| Standard  | APZ Engineering Lifecycle Standard **v1.0**                                                  |
| Purpose   | Narrow, reusable Owner Decision forms for common gate types                                  |
| Companion | Generic [../templates/OWNER-DECISION.md](../templates/OWNER-DECISION.md)                     |
| Evidence  | Acceptance JSON per [../templates/EVIDENCE-PACK.json.md](../templates/EVIDENCE-PACK.json.md) |

---

## When to use which form

| Template                                                                 | Use when                                                                            |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| [TEMPLATE-ACCEPTANCE.md](./TEMPLATE-ACCEPTANCE.md)                       | Accept / return / reject a completed stage pack (Architecture, ES, Wave, ECR, etc.) |
| [TEMPLATE-AUTHORISATION.md](./TEMPLATE-AUTHORISATION.md)                 | Authorise commencement of a named programme / Wave                                  |
| [TEMPLATE-RISK-ACCEPTANCE.md](./TEMPLATE-RISK-ACCEPTANCE.md)             | Explicitly accept residual risks (often with CONDITIONAL outcomes)                  |
| [TEMPLATE-AVAILABILITY-DECISION.md](./TEMPLATE-AVAILABILITY-DECISION.md) | Decide limited vs general availability at Release (or post-Release)                 |

For complex decisions spanning multiple effects (version + freeze + conditions), prefer the full [OWNER-DECISION.md](../templates/OWNER-DECISION.md) and attach these forms as annexes if helpful.

---

## Rules

1. Owner Decisions are the only authority that baseline / close programmes.
2. Agents **SHALL NOT** invent Owner Acceptance.
3. Every Decision **SHOULD** have a corresponding `*-ACCEPTANCE.json` evidence file.
4. Decisions **SHALL** state what they do **not** authorise.
5. Risk acceptance never grants security permissions or bypasses authz.

---

## Filing location

Store completed decisions inside the programme pack (e.g. `OWNER-ACCEPTANCE.md`) and pointer from Standing Programme Record / Owner Acceptance Register per product practice.

---

## STOP

```text
OWNER DECISION TEMPLATES
LIFECYCLE STANDARD v1.0
AGENTS DO NOT SELF-ACCEPT
```
