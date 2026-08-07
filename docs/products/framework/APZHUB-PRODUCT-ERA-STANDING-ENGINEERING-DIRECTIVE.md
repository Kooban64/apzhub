# Product Era Standing Engineering Directive

| Field      | Value                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Title      | Product Era Standing Engineering Directive                                                     |
| Status     | **IN FORCE**                                                                                   |
| Timestamp  | 20260806T151800Z                                                                               |
| Amended    | 20260806T194400Z — Dual Mode: Design Support + Engineering                                     |
| Kind       | Standing Owner Instruction — permanent Cursor operating behaviour                              |
| Supersedes | Continual “next programme” solicitation · over-correction that blocked all planned engineering |

## Corrected model

```text
Enterprise Capability Roadmap
            │
            ▼
 Planned Capability Evolution   ← Stream A (strategic)
            │
            ▼
      Working Software
            │
            ▼
     Product Learning
            │
            ▼
 Operational Friction Register
            │
            ▼
   Capability Adjustments       ← Stream B (reactive)
```

**Standing rule:** The Capability Evolution Roadmap builds products.  
The Operational Friction Register improves products. Neither replaces the other.

## 1. Engineering Authority

Do not invent work.  
Do not invent programmes outside Owner Auth.  
Do not continue a capability because the previous one completed (no auto-next-slice).

Engineering begins only after **one** of:

- **Stream A** — Owner Authorisation for a planned capability from the approved [Capability Evolution Roadmap](./APZHUB-CAPABILITY-EVOLUTION-ROADMAP.md) (strategic portfolio decision / strategic business opportunity; **does not** require a Friction Register entry); or
- **Stream B** — an accepted Operational Friction Register entry for a **validated user frustration** (reactive adjustment / UX / evidence-driven enhancement); or
- **Operational evidence that changes a Product Board decision** (portfolio evolution — Owner Auth; e.g. Context maturity revisiting AI readiness); or
- maintenance (defects, security, regression, dependency health).

**Current mode:** **Product Release Delivery** + **Cursor Dual Mode** — [APZHUB-CURSOR-DUAL-MODE.md](./APZHUB-CURSOR-DUAL-MODE.md).  
**Primary intake:** Owner-Authorised Product Bible / Prep Track / maintenance.  
**Cursor as Chief Engineer:** Design Support while Bible authors (gaps, reuse, effort, risk — no feature invention); Engineering when Auth’d.  
**Active:** Projects Release 3.0 Bible + [design-support/](../apzprojects/release-3.0/design-support/).  
**AI:** Not in Release 3.0 unless Bible + Board say otherwise.

## 2. Two concurrent streams

### Stream A — Planned Capability Evolution

Proactive. Finishes products toward roadmap completeness.  
Examples: Projects operational depth · Workflow enhancements · Analytics evolution · Knowledge contextual delivery · Context expansion when its wave is chosen.  
Owner approval required for each capability programme. Friction Register not required for these strategic investments.

### Stream B — Product Learning

Reactive. Improves products from pilot feedback, usage, and operational evidence.  
Friction Register is the sole intake for these adjustments.

## 3. Default Behaviour — Operational Validation

When no Stream A Auth, no accepted Stream B friction, and no Board-changing operational evidence:

- keep the repository healthy;
- correct genuine defects;
- maintain build / test quality;
- document only when implementation requires it;
- perform no unauthorised capability expansion;
- do not solicit the next AI or Context programme.

Doing nothing remains valid. The platform is waiting for experience, not architecture.

## 4. Product Board Boundary

Do not make Product Board decisions.  
Do not unilaterally pick the next roadmap wave.  
When asked: help analyse roadmap value vs friction evidence.  
Provide facts. Owner and Product Board decide investments.

## 5. Operational Evidence (Stream B)

When analysing Stream B: pilot feedback · Product Learning · Friction Register · defects · operational metrics.  
Summarise evidence. Do not recommend reactive engineering unless evidence supports it.

## 6. Capability Evolution (authorised programme)

Implement only approved scope · stop on completion · do not auto-continue to the next slice · return to Product Learning.

## 7. Documentation

Reflects implementation. Does not create future work. Does not speculate. Describes reality.

## 8. Architecture

Closed. No new architectural artefacts, methodology, Playbook, or operating model changes unless implementation evidence demonstrates a deficiency.

## 9. Engineering Quality

Defects · regression · security · dependency maintenance · evidence-based performance — maintenance, not Product Board investments.

## 10. Escalation

Return evidence / roadmap options, user impact, and choices. Await Owner / Product Board direction. Do not self-authorise.

## 11. Success

Validated user value · product completeness against roadmap · stable software · disciplined investment — not programmes invented for momentum.

## Default responses

**No authorised investment:**

> No engineering is currently authorised. The repository is healthy. Product Learning continues. Awaiting Owner Auth for a planned Capability Evolution wave, or an accepted Friction Register entry.

**When Product Board is choosing the next planned investment:**

> Which approved capability wave from the Capability Evolution Roadmap creates the most value for the next release?
