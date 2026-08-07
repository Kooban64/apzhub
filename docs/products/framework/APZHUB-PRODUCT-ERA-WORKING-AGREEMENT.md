# APZHUB — Product Era Working Agreement

| Field              | Value                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Status             | **IN FORCE**                                                                                                                          |
| Timestamp          | 20260806T193100Z                                                                                                                      |
| Operational mode   | **Operational Validation** **ACTIVE** — the platform teaches the roadmap                                                              |
| Standing directive | [APZHUB-PRODUCT-ERA-STANDING-ENGINEERING-DIRECTIVE.md](./APZHUB-PRODUCT-ERA-STANDING-ENGINEERING-DIRECTIVE.md) **IN FORCE** (amended) |
| Two-stream model   | [APZHUB-PRODUCT-ERA-TWO-STREAM-MODEL.md](./APZHUB-PRODUCT-ERA-TWO-STREAM-MODEL.md) **IN FORCE**                                       |
| Era                | APZHUB-PLATFORM-ERA-003 — Enterprise Product Realisation **ACTIVE**                                                                   |
| Architecture       | [ARCHITECTURE-CLOSURE-001](../apzhub-architecture-closure-001/OWNER-DECISION.md) **APPROVED** — governed asset, not workstream        |
| Kind               | Working agreement — **not** a new framework, Playbook, or methodology                                                                 |

## Purpose

Record how Product Board and Cursor work together now that the Enterprise Platform Baseline and architectural foundation are complete.

Governance, methodology, and portfolio structure are **deliberately stable**. Do not invent more of them by default.

**Only two work categories:** Capability Evolution · Product Learning.

## Two streams (corrected posture)

| Stream                               | Driver                                                                                     | Friction Register?                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------ |
| **A — Planned Capability Evolution** | [Capability Evolution Roadmap](./APZHUB-CAPABILITY-EVOLUTION-ROADMAP.md) — finish products | **Not required** (strategic; Owner Auth per programme) |
| **B — Product Learning**             | Pilot · usage · [Friction Register](../apzhub-product-board-001/) — improve products       | **Required** for reactive engineering                  |

> Roadmap builds products. Friction Register improves products. Neither replaces the other.

**Stream A agenda:** _Which approved capability wave creates the most value for the next release?_  
**Stream B agenda:** _Which accepted friction are we trying to eliminate?_ (doing nothing is valid when evidence is weak)

### Legitimate reasons to authorise engineering

Bring **one** of:

1. **A validated user frustration** (reactive / Stream B).
2. **A strategic business opportunity** (planned / Stream A + Owner Auth).
3. **Operational evidence that changes a Product Board decision** (portfolio evolution — e.g. Context maturity that revisits AI readiness).

Do not open programmes for momentum. Do not open AI because an integration exists.

Enterprise Context: CONTEXT-002 complete; CONTEXT-REVIEW-001 **ACCEPTED** — **MORE CONTEXT MATURITY REQUIRED**. AI not authorised until experience evidences trust and value.

## Role split

### Cursor owns

- Engineering
- Capability evolution (authorised)
- APZQEP releases
- Product implementation
- Defect correction
- Operational improvements
- Approved product evolution

### Product Board owns

- Product vision
- Business capability prioritisation
- Customer value
- Release investment decisions
- UX philosophy
- AI strategy
- Commercial direction
- Cross-product coherence

Product Board advisors help choose the next **planned** roadmap investment and evaluate **reactive** friction.  
They do not invent Cursor programmes. Legitimate engineering sources: Owner-Auth’d roadmap waves · accepted friction · strategic Owner decisions · production defects · security/maintenance.

### Advisor role (when evidence is brought)

Do **not** generate work to keep engineering busy.  
When presented with Product Learning summaries, Friction Register entries, pilot feedback, customer requests, commercial opportunities, or strategic partnerships, help answer only:

1. **Is this a real problem worth solving?**
2. **Is engineering the right solution?**
3. **What's the smallest valuable investment?**
4. **How do we measure whether it succeeded?**

Every engineering effort must stay tied to measurable value.

## Questions that changed

| Stop asking (default)                | Ask instead                                                                             |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| What's the next framework?           | Where is the friction for this user on this screen?                                     |
| What should we build?                | Our project managers spend too much time finding the information they need.             |
| How do we restructure the portfolio? | Support agents lose context on handover. Managers can't see delivery risk early enough. |

Success is no longer “building a platform.”  
Success is **products people actively choose to use.**

## Product Board focus (near term)

1. **User experience** — friction, flow, delight
2. **Enterprise capability evolution** — existing roadmap; evidence-gated investment
3. **AI integration** — enhancer of each product, never a separate destination
4. **Commercial differentiation** — unique value beyond underlying engines

Deliberately **not** the focus: new platform governance, methodology design, portfolio restructuring.

## Product Board Decision Filter (before any engineering Auth)

Only recommend an APZQEP / capability programme if all five pass:

1. **What is the user frustration?** — one sentence
2. **Who experiences it?** — role (Project Manager, Support Agent, …)
3. **What evidence supports it?** — pilot feedback, usage metrics, observation, measurable friction
4. **Can it be solved without engineering?** — process, training, configuration, docs, existing functionality
5. **If engineering is required, what is the smallest capability?** — one capability, one outcome, one success measure

## Stream B — one-page investment proposal

Every Stream B proposal fits on one page (Problem · Evidence · Outcome · Smallest capability · Success measure).  
If it cannot, do not build yet.

## Success measure (Product Era)

A capability evolution belongs in a release only if it improves at least one of:

1. Did a user complete their work **faster**?
2. Did a user make **fewer mistakes**?
3. Did a user need **less training**?
4. Did the platform help them make a **better decision**?

## Default Product Board agenda

**Planned (Stream A):**

> Which approved capability wave from the Capability Evolution Roadmap creates the most value for the next release?

**Reactive (Stream B):**

> Which accepted friction are we trying to eliminate?

If Stream A has no Owner-ready wave and Stream B has no accepted friction: **maintain and learn**. Not: invent a programme for momentum.

Everything else—governance, architecture, portfolio structure—remains the stable foundation beneath that conversation.

## Enterprise Context / AI posture

[APZHUB-PRODUCT-ERA-INVESTMENT-001-ENTERPRISE-CONTEXT.md](./APZHUB-PRODUCT-ERA-INVESTMENT-001-ENTERPRISE-CONTEXT.md)  
CONTEXT-002 **COMPLETE**. CONTEXT-REVIEW-001 **ACCEPTED** — **MORE CONTEXT MATURITY REQUIRED**.  
Operating mode: **Operational Validation** ([APZHUB-CURRENT-OPERATING-STATE.md](./APZHUB-CURRENT-OPERATING-STATE.md)).  
APZHUB-AI-001 and CONTEXT-003 are **not authorised**.

## Related (stable — do not expand casually)

| Artefact                | Path                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Era decision            | [../apzhub-platform-era-003/OWNER-DECISION.md](../apzhub-platform-era-003/OWNER-DECISION.md) |
| Capability roadmap      | [APZHUB-CAPABILITY-EVOLUTION-ROADMAP.md](./APZHUB-CAPABILITY-EVOLUTION-ROADMAP.md)           |
| Capability First        | [APZHUB-ENTERPRISE-CAPABILITY-FIRST.md](./APZHUB-ENTERPRISE-CAPABILITY-FIRST.md)             |
| Current operating state | [APZHUB-CURRENT-OPERATING-STATE.md](./APZHUB-CURRENT-OPERATING-STATE.md)                     |
