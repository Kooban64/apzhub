# Certification Levels — Established Practice

| Field | Value |
| ----- | ----- |
| Status | **ESTABLISHED THROUGH PRACTICE** |
| Authority | Owner Governance Observation (APZQEP-CERT-060A Decision, 2026-07-27) |
| Governing standards | Document 000 · OES-000 · OES-001 · OES-002 |
| Absorption | Candidate for next Owner-authorised revision of OES-000 / OES-002 |
| Related | [OES-CERTIFICATION-INDEPENDENCE.md](./OES-CERTIFICATION-INDEPENDENCE.md) |

---

## Principle

Certification scope must match delivery maturity. Do **not** use capability-level production language for a Domain-only (or other single-layer) package.

## Three certification levels

| Certification Level | Purpose | Example |
| ------------------- | ------- | ------- |
| **Component Certification** | Individual layer (Domain, Infrastructure, or Workbench) | **APZQEP-CERT-060A** — Domain · **DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS** · **APZQEP-CERT-060B** — Infrastructure · **INFRASTRUCTURE_PRODUCTION_READY_WITH_LIMITATIONS** · **APZQEP-CERT-070A** — Workbench · **WORKBENCH_PRODUCTION_READY_WITH_LIMITATIONS** (CERTIFIED / APPROVED / CLOSED) · SemVer may remain pre-1.0.0 |
| **Capability Certification** | Complete capability comprising all required layers | **APZQEP-CERT-050D** — Test Specifications · class **PRODUCTION_READY_WITH_LIMITATIONS** · typically **1.0.0** · **APZQEP-CERT-080A** — Test Plans · **CERTIFIED / APPROVED / CLOSED** · class **PRODUCTION_READY_WITH_LIMITATIONS** · `@apzhub/qep-test-plans` **1.0.0 CERTIFIED** (Owner Certification Decision recorded; Freeze **FROZEN / APPROVED / CLOSED** under **APZQEP-FREEZE-080A** — `@apzhub/qep-test-plans` **1.0.0 CERTIFIED / FROZEN / BASELINE ESTABLISHED**) |
| **Platform Certification** | Integrated APZQEP release containing multiple certified capabilities | Future platform / portfolio release programmes |

## Normative implications

1. Component Certification **MUST** use a classification that names the layer (e.g. `DOMAIN_PRODUCTION_READY_WITH_LIMITATIONS`).  
2. Component Certification **MUST NOT** imply Capability Production Ready, Capability Freeze, or silent **1.0.0** promotion.  
3. Capability Certification remains the gate for capability **1.0.0** and Owner Freeze eligibility.  
4. Platform Certification remains a separate Owner programme above individual capabilities.  
5. All levels remain subject to certification independence (CERT evaluates; CERT does not engineer).

## Rationale

Layered certification reflects staged delivery, keeps SemVer aligned with maturity, and preserves credibility of the certification process.

## STOP

Do not amend FROZEN OES-000 / OES-001 / OES-002 ad hoc. This practice note is authoritative until absorbed by formal OES revision.
