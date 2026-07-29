# Owner Governance

| Item     | Value                    |
| -------- | ------------------------ |
| Document | Owner Governance         |
| Version  | **1.0.0**                |
| Parent   | [README.md](./README.md) |

**Normative language:** **SHALL** / **MUST** = mandatory; **SHOULD** = strong recommendation; **MAY** = optional.

---

## 1. Purpose

Owner governance is the sole source of programme authority. Agents and engineers implement; Owners authorise, accept, baseline, close, accept risk, and govern release.

---

## 2. Authorisation

1. Every programme stage **SHALL** begin only under an explicit Owner Directive / Instruction naming the programme identifier and authorised scope ([PROGRAMME-LIFECYCLE.md](./PROGRAMME-LIFECYCLE.md)).
2. Recommendation-only identifiers **SHALL NOT** be treated as authorised.
3. Authorisation for Wave N **SHALL NOT** imply authorisation for Wave N+1.
4. Soft Owner language (Acknowledge, Recognise, Confirmed, Noted) **SHALL NOT** authorise Engineering, waive gates, or accept risk.

Required authorisation verbs **SHOULD** include: **AUTHORISE**, **ACCEPT**, **APPROVE**, **BASELINE**, **CLOSE**, **WAIVE** (with conditions), **REJECT**, **RETURN FOR REVISION**.

---

## 3. Acceptance

1. Acceptance **SHALL** be recorded in an Owner Acceptance artefact for the programme stage.
2. Acceptance **MUST** reference evidence (reports, evidence JSON, baselines).
3. Partial acceptance **MAY** be recorded with conditions; conditions **SHALL** be tracked to closure.
4. Agents **SHALL NOT** mark programmes ACCEPTED without Owner record.

---

## 4. Baselining

1. Architecture, ES, Certification, Freeze, and Release baselines **SHALL** be Owner-declared.
2. A baseline **MUST** identify version, package/capability identity, and evidence location.
3. Frozen / certified baselines **SHALL NOT** be modified except via Owner-authorised change programmes.
4. Lifecycle Standard itself **SHALL** be baselined only by Owner Acceptance of APZQEP-LIFECYCLE-001 (or successor).

---

## 5. Closure

1. Programme closure **SHALL** require Owner Decision that deliverables are complete for that programme type.
2. Closure **MUST NOT** erase residual risks or known limitations; those transfer to registers ([risk-management/README.md](./risk-management/README.md)).
3. Closed programmes **MAY** spawn successor programmes only by new Owner Directive.

---

## 6. Risk acceptance

1. Residual risks blocking unrestricted GA **SHALL** be explicitly accepted, deferred, or remediated before the relevant Owner Decision.
2. Risk acceptance **MUST** name: risk id, impact, mitigation/waiver, accepting Owner Decision, and expiry/review date if conditional.
3. Silent risk acceptance is forbidden.

---

## 7. Release governance

| Decision            | Owner controls                          |
| ------------------- | --------------------------------------- |
| Certification class | Pass / fail / class assignment          |
| Freeze              | Freeze Acceptance / return              |
| Release             | Production Release Decision             |
| Availability        | Limited Availability vs unrestricted GA |
| EOL                 | Sunset declaration                      |

Release **SHALL NOT** proceed without Freeze Acceptance (or Owner-recorded exception). GA **SHALL NOT** be inferred from Limited Availability approval.

Detail: [release/README.md](./release/README.md), [freeze/README.md](./freeze/README.md), [certification/README.md](./certification/README.md).

---

## 8. Escalation outcomes

| Owner outcome       | Effect                                                      |
| ------------------- | ----------------------------------------------------------- |
| ACCEPTED / APPROVED | Stage complete; next stage **MAY** be separately authorised |
| RETURN FOR REVISION | Same programme id remediates under stated conditions        |
| REJECTED            | Stop; Owner directs remediation programme                   |
| WAIVED              | Proceed only under recorded conditions                      |

---

## STOP

```text
OWNER GOVERNANCE
AUTHORISE · ACCEPT · BASELINE · CLOSE
RISK EXPLICIT · RELEASE OWNER-CONTROLLED
```
