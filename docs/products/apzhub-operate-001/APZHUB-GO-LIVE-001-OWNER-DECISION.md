# Decision Pack — APZHUB-GO-LIVE-001

| Field      | Value                                                                |
| ---------- | -------------------------------------------------------------------- |
| Decision   | **APZHUB-GO-LIVE-001**                                               |
| Title      | Controlled Internal Pilot Authorisation                              |
| Status     | **AWAITING OWNER**                                                   |
| Timestamp  | 20260805T123000Z                                                     |
| Kind       | Owner / Product Board decision — not engineering                     |
| Assessment | [GO-LIVE-READINESS-ASSESSMENT.md](./GO-LIVE-READINESS-ASSESSMENT.md) |

## Board summary

| Decision Area             | Status                         |
| ------------------------- | ------------------------------ |
| Engineering               | ✅ READY                       |
| Architecture              | ✅ FROZEN                      |
| APZQEP Baseline           | ✅ CERTIFIED                   |
| Product Adoption          | ✅ 3 Reference Implementations |
| Unified Work Experience   | ✅ OPERATIONAL                 |
| Operational Documentation | ✅ COMPLETE                    |
| Rollback                  | ✅ READY                       |
| Health Checks             | ✅ PASS                        |
| Infrastructure            | ✅ READY                       |
| **Pilot Users**           | ⏳ OWNER                       |
| **Support Contacts**      | ⏳ OWNER                       |
| **Operational Sign-off**  | ⏳ OWNER                       |
| **Pilot Scope**           | ⏳ OWNER                       |
| **Go-Live Decision**      | ⏳ OWNER                       |

There are **no engineering actions** left for go-live.

## Signing guidance

Sign when operational readiness is **comfortable**—not when looking for one more improvement.

There is always one more document, feature, or refinement. Waiting for perfection delays the evidence the operating model depends on.

## Pilot scope (recommended conditions)

- Internal users only
- 5–8 representative users
- Clearly communicated as a **controlled pilot**

## Pilot objective

> **Does APZHUB become the place people naturally start their workday?**

Not “find bugs.” Not “ship features.”

## Success criteria

The pilot succeeds if:

- Users begin their day in **My Work**
- They complete meaningful work using APZHUB
- No critical operational blockers emerge
- Feedback produces **evidence** rather than opinions

## Exit criteria (Product Board — end of pilot)

Answer only three questions:

1. Is APZHUB usable as the organisation’s daily workspace?
2. What measurable operational friction did we observe?
3. What single investment would create the greatest improvement?

Only then decide whether to invest again.

## Questions to ask users (behaviour, not features)

Do **not** lead with “What features would you like?”

Ask:

- What were you trying to accomplish?
- What slowed you down?
- Where did you expect something different?
- What made you leave My Work?
- What felt natural?

## Recommended pilot size

**5–8 people**, deliberately small. Example composition:

| Seat | Name (Owner fills) | Role            |
| ---- | ------------------ | --------------- |
| 1    |                    | Owner           |
| 2    |                    | Project Manager |
| 3    |                    | Developer       |
| 4    |                    | QA Engineer     |
| 5    |                    | Support Agent   |
| 6    |                    | Manager         |
| 7    |                    | Administrator   |
| 8    |                    | (optional)      |

## Support contacts (Owner fills)

| Role                                   | Name | Channel |
| -------------------------------------- | ---- | ------- |
| Platform Administrator                 |      |         |
| Internal Support (APZ Support / named) |      |         |
| Escalation (Owner / Product Board)     |      |         |

## First Product Board meeting

Schedule **one week after pilot start**.

Agenda (only):

1. What did users do first?
2. What made them leave My Work?
3. What confused them?
4. What delighted them?
5. What operational friction did we observe?
6. Does any observation justify engineering?

If (6) is **no**, the platform is doing what it was designed to do.

## Backlog rule (protect the philosophy)

Do **not** create backlog from opinions.

Only from:

- observed behaviour,
- measured friction,
- repeated operational evidence,
- deliberate strategic decisions.

## Owner decision

```text
Decision:
APZHUB-GO-LIVE-001

Engineering further programmes for go-live:
NOT REQUIRED

Controlled internal pilot:
[ ] AUTHORISED    [ ] DEFERRED

Pilot start date:
____________

Pilot end / first Product Board date:
____________

Runtime note (development vs production-like):
[ ] Accepted for pilot    [ ] Ops will adjust config first

Signed (Owner / Product Board Chair):
____________

Date:
____________
```

## After authorisation

Cursor / engineering: **stand by** for true defects under APZQEP only.  
Product Board: **What did we learn?**  
Organisation: **live inside APZHUB.**
