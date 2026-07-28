# Lessons Learned — APZQEP-PORTFOLIO-001

Patterns that emerged from practice across the First Capability Wave and are worth carrying, deliberately, into any future capability delivery. None of these are new decisions — each is drawn from an existing pack or practice note, cited below.

## 1. Layered certification scales cleanly

Component Certification (Domain / Infrastructure / Workbench) followed by Capability Certification, followed by a separate Owner Freeze Decision, proved itself on Test Plans — the only capability with a genuinely multi-layer delivery shape. Simpler capabilities (Requirements, Traceability, Verification) certified and froze in a single combined step, which is equally valid: **the certification level should match delivery maturity, not the other way around.** See [OES-CERTIFICATION-LEVELS.md](../../../../engineering/oes/OES-CERTIFICATION-LEVELS.md).

## 2. The `availableActions` invariant is the right contract shape for lifecycle UI

Across Test Plans (and by extension, the pattern any future execution/workflow-bearing capability should reuse), the rule that **the server, not the client, is the sole authority for which actions are available** proved itself repeatedly in certification reviews (Domain → Infrastructure → Workbench contract integrity checks). This kept the Workbench honest — no client-side fabrication of actions the backend would reject.

## 3. Certification independence must be actively protected, not assumed

Every CERT programme in the Wave evaluated the capability **as delivered** and recorded findings rather than quietly fixing them. Where deficiencies were found, remediation happened under a **new** ENG programme, never inside the CERT pack itself. This discipline is what makes the certification record trustworthy. See [OES-CERTIFICATION-INDEPENDENCE.md](../../../../engineering/oes/OES-CERTIFICATION-INDEPENDENCE.md).

## 4. Engineering Completion Review (ECR) before Owner Acceptance catches problems earlier

Every capability's Engineering programmes ran an ECR before the Owner Acceptance gate, not after. This meant Owner Acceptance decisions were made against an already-reviewed, evidenced state rather than a first draft — visible in the ECR-PASS / ECR-PASS-WITH-CONDITIONS evidence trail preceding each Owner Acceptance across the Wave.

## 5. Freeze is a decision, not a certification side-effect

Test Specifications and Test Plans both demonstrated that **Certification and Freeze should be separate Owner Decisions**, even when they happen close together in time. Certification answers "is this correct, as delivered?"; Freeze answers "is this now the production baseline, with no further change except through a new programme?" Collapsing the two (as Requirements, Traceability, and Verification did, out of pragmatism) works for simpler capabilities, but the separated pattern is the one to carry forward as capabilities grow in complexity.

## 6. Honest, recorded limitations are more valuable than manufactured completeness

Every capability shipped with a Known Limitations page, and every certification explicitly reasoned about whether recorded limitations were "expected / scope-defining" versus "blocking." No capability's PRODUCTION_READY_WITH_LIMITATIONS classification was achieved by hiding gaps — it was achieved by naming them precisely and explaining why they do not block. See [KNOWN-LIMITATIONS-REGISTER.md](./KNOWN-LIMITATIONS-REGISTER.md).

## 7. Test Plans is the orchestration reference for everything that follows

Test Plans is the only capability in the Wave with a genuine execution/workflow lifecycle (Draft → Submitted → Approved/Rejected → Ready → In Execution → Completed → Archived, plus Cancel/Clone/Supersede/Assign/Schedule) and the only one delivered with full layered component certification. Every Wave 2 candidate (Test Execution, Test Runs, Test Suites, Evidence, Defects, Coverage & Analytics, Reporting, AI-Assisted Testing) is expected to be an **orchestration-shaped capability similar to Test Plans, not a document-shaped capability like Requirements** — so Test Plans, not Requirements or Traceability, is the pattern to study first when a Wave 2 Architecture programme is eventually authorised.

## STOP

These lessons describe patterns already demonstrated in closed programmes. Adopting them for a future capability still requires that capability's own, separately authorised Architecture programme — this document does not itself authorise anything.
