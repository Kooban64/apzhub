# PCS-001 — Strategy Review

> **Milestone:** PCS-001 — Platform Core Strategy  
> **Date:** 2026-07-08  
> **Type:** Strategic review — planning only  
> **Reviewer:** PCS-001 certification process

---

## Review scope

This review assesses the nine PCS-001 strategy deliverables against:

- PC-001 Platform Core Certification
- M16 Engineering Review
- M8-01–M8-06 completion state
- Law Platform + Trust Accounting delivery
- Foundation documents 000–029
- FIN-001 deferral verdict

---

## Overall assessment

The PCS-001 strategy suite is **coherent, aligned with certified architecture, and actionable**. It correctly prioritises Platform Core v2 hardening before OSS productivity integrations and product expansion. Strategic stop conditions (no FIN extraction, no Banking, no implementation in PCS-001) are preserved.

**Strategy quality rating:** **Very Good (8.5/10)**

---

## Strengths

| # | Strength | Evidence |
|---|----------|----------|
| S1 | **Clear platform/product boundary** | Product Portfolio Strategy; Document 003 alignment |
| S2 | **Self-hosted first preserved** | Platform Core Strategy; OSS CE mandate |
| S3 | **Phased commercial model** | Commercial Roadmap tiers match PC-001 assessment |
| S4 | **OSS integration discipline** | Per-engine auth/authz/provisioning/diagnostics/replacement |
| S5 | **Build vs buy clarity** | Never-outsource list protects moat |
| S6 | **v2 rationale well grounded** | Directly addresses PC-001 observations |
| S7 | **AI governed by design** | No module LLM calls; permission-filtered RAG |
| S8 | **Engineering roadmap realistic** | PCv2-01 first; OSS gated; product stops explicit |
| S9 | **Financial Engine defer respected** | FIN-001 preconditions referenced |
| S10 | **Five-year vision without overcommit** | v3 bridge acknowledges unknowns |

---

## Risks

| # | Risk | Severity | Mitigation in strategy |
|---|------|----------|------------------------|
| R1 | PCv2 delayed by product pressure | High | Explicit sequencing; owner gates |
| R2 | OSS integration complexity underestimated | Medium | One engine per sprint; integration.yaml mandate |
| R3 | Law + platform competing for capacity | Medium | 50/25 allocation guidance |
| R4 | Commercial SaaS before hardening | High | Tier gates tied to PCv2 phases |
| R5 | AI scope creep into modules | Medium | AI governance; architecture checker |
| R6 | Financial extraction premature | High | FIN-001 defer; preconditions listed |
| R7 | Marketplace too early | Low | Year 4 placement; v3 dependency |
| R8 | Multi-product divergence | Medium | Platform Core consumption rule |

---

## Missing capabilities (identified)

| Capability | Gap | Recommended phase |
|------------|-----|-------------------|
| **Email delivery** | No SMTP notification channel | PCv2+ / ENF extension |
| **File storage service** | S3-compatible referenced but not platform service | PCv2 or OSS Phase 1 |
| **Webhook platform** | Mentioned in gateway; not detailed | PCv2-09 |
| **Backup/restore automation** | DR manual only | PCv2-06 |
| **Mobile clients** | Explicitly out of scope; no strategy | Future product decision |
| **Multi-language/i18n** | Foundation silent | Product or PCv3 |
| **Platform SDK publish** | Internal only today | E-40 engineering roadmap |
| **Customer status page** | SaaS tier needs | PCv2-03/Commercial |

None block PCS-001 approval; document for PCv2 sprint guides.

---

## Recommended sequencing

> **Superseded by owner approval:** See [PCS-001 Owner Approval](../strategy/PCS-001-owner-approval.md).

```text
1. PCv2-01 Production SaaS Hardening (authorized)
2. PCv2-02 Outbox Workers
3. M17 CI/CD & E2E Automation
4. OSS Wave 1 (Plane)
5. OSS Wave 2 (Kimai) → Wave 3 (Paperless) → Waves 4–9
6. Law Trust Phase 2 + billing (parallel where resourced)
7. PCv2-04/07/09 enterprise phases
8. FIN extraction decision (not approved now)
```

**Do not parallelise:** PCv2-01 with OSS integrations or FIN extraction.

---

## Alignment check

| Source document | Alignment |
|-----------------|-----------|
| PC-001 Certification | ✅ Consistent — v2 addresses observations |
| M16 Engineering Review | ✅ VERY GOOD rating preserved |
| Document 001 Vision | ✅ Not a portal; OSS engines invisible |
| Document 007 IAM | ✅ BetterAuth + platform permissions |
| Document 008 Modules | ✅ Module→Service→Connector |
| FIN-001 | ✅ Defer extraction respected |
| PC-001 stop condition | ✅ No implementation in PCS-001 |

---

## Strategy verdict

# OWNER APPROVED (2026-07-08)

PCS-001 strategy is **ratified** with sequencing amendments documented in [PCS-001 Owner Approval](../strategy/PCS-001-owner-approval.md).

**PCv2-01 Production SaaS Hardening** is authorized. OSS integrations begin after PCv2-02 and M17.

**Do not begin** Financial Engine extraction, Banking, Exchange, or OSS Wave 1 until respective gates are met.

---

## References

- [Platform Core Strategy](./APZHUB-Platform-Core-Strategy.md)
- [PCS-001 Completion Report](../sprint/PCS-001-completion-report.md)
- [PC-001 Certification](./APZHUB-Platform-Core-Certification.md)
