# Engineering documentation

Cross-cutting engineering methodology and standards (not product/capability packs).

## Engineering Slice Standard (APZHUB-ENG-001) — **IN FORCE / FROZEN**

Permanent day-to-day slice delivery model. Future Owner prompts stay short; process is inherited.  
**Freeze:** [ADR-0092](../adr/ADR-0092-engineering-slice-standard-freeze.md) — changes require Owner approval.

| Document                                                         | Purpose                                        |
| ---------------------------------------------------------------- | ---------------------------------------------- |
| [ENGINEERING-SLICE-STANDARD.md](./ENGINEERING-SLICE-STANDARD.md) | Slice lifecycle (inspect → certify → clean)    |
| [ENGINEERING-SLICE-TEMPLATE.md](./ENGINEERING-SLICE-TEMPLATE.md) | Short Owner prompt + expanded fields           |
| [ENGINEERING-CHECKLIST.md](./ENGINEERING-CHECKLIST.md)           | Executable completion checklist                |
| [SLICE-CERTIFICATION.md](./SLICE-CERTIFICATION.md)               | PASS / FAIL / Conditional PASS / Blocked       |
| [AI-ENGINEERING-WORKFLOW.md](./AI-ENGINEERING-WORKFLOW.md)       | AI engineer operating rules for slices         |
| [S01-REFERENCE-PATTERN.md](./S01-REFERENCE-PATTERN.md)           | APZQEP-120-S01 as the reference implementation |

Does **not** replace [APZHUB Engineering Standard](../governance/APZHUB-ENGINEERING-STANDARD.md), [Lifecycle Standard](../governance/APZHUB-LIFECYCLE-STANDARD.md), or [AI Operational Framework](../governance/APZHUB-AI-OPERATIONAL-FRAMEWORK.md) — those remain portfolio authority.

---

## Portfolio Engineering Standards (APZHUB-ENG-002) — **DESIGNED**

Promote proven APZQEP Engineering Framework assets into APZHUB portfolio standards. APZQEP remains reference implementation.

| Document                                                                   | Purpose                                         |
| -------------------------------------------------------------------------- | ----------------------------------------------- |
| [APZHUB-ENG-002/README.md](./APZHUB-ENG-002/README.md)                     | Programme face                                  |
| [APZHUB-ENG-002/PROMOTION-MATRIX.md](./APZHUB-ENG-002/PROMOTION-MATRIX.md) | Promote / keep / share / never-duplicate matrix |
| [APZHUB-ENG-002/PROGRAMME-DESIGN.md](./APZHUB-ENG-002/PROGRAMME-DESIGN.md) | Phased execution design (Owner-gated)           |

**Status:** Designed — promotion matrix **ACCEPTED**; execution deferred to the next governance session. APZQEP-ENG-001 is **COMPLETE** (Framework in maintenance).

Reference source: [APZQEP Engineering Framework v1.0](../products/apzqep/engineering/APZQEP-ENGINEERING-FRAMEWORK.md).

---

## Other packs

| Pack                                                            | Purpose                                                                                                                                | Status                           |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| [lifecycle-standard/v1.0/](./lifecycle-standard/v1.0/README.md) | **APZ Engineering Lifecycle Standard v1.0** (APZQEP-LIFECYCLE-001) — product-agnostic ARCH→ES→Waves→ECR→CERT→FREEZE→RELEASE→GA/EOL     | **IMPLEMENTED / AWAITING OWNER** |
| [oes/](./oes/README.md)                                         | **APZOR OES** — OES-000 / 001 / 002 (**FROZEN 1.0.0**) · product OES catalogue                                                         | Governance trilogy **FROZEN**    |
| [platform-delivery/](./platform-delivery/README.md)             | **APZHUB Platform Delivery Standard** (APZHUB-ENGINEERING-001) — mandatory lifecycle for platform capabilities and commercial products | **ACCEPTED / CLOSED**            |

## Platform 1.3 programmes (index)

| Programme                                                                                                | Status                                        |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [platform-1.3-eng-001/](./platform-1.3-eng-001/README.md) … [eng-004/](./platform-1.3-eng-004/README.md) | **ACCEPTED**                                  |
| [platform-1.3-cert-001/](./platform-1.3-cert-001/README.md)                                              | **HISTORICAL** (NOT READY FOR PRODUCTION)     |
| [platform-1.3-rr-001/](./platform-1.3-rr-001/README.md)                                                  | **ACCEPTED**                                  |
| [platform-1.3-cert-002/](./platform-1.3-cert-002/README.md)                                              | **ACCEPTED** · Platform 1.3 **CLOSED** · PRWL |

## Platform 1.4 programmes (index)

| Programme                                                         | Status                                                                              |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| [platform-1.4-eng-001a/](./platform-1.4-eng-001a/README.md)       | **ACCEPTED**                                                                        |
| [platform-1.4-eng-001b/](./platform-1.4-eng-001b/README.md)       | Phased P0–P2 **ACCEPTED**; P3 **AWAITING OWNER PHASE 3 ACCEPTANCE**; P4 **BLOCKED** |
| [platform-1.4-eng-001b-p2/](./platform-1.4-eng-001b-p2/README.md) | **ACCEPTED / CLOSED**                                                               |
| [platform-1.4-eng-001b-p3/](./platform-1.4-eng-001b-p3/README.md) | **ACCEPTED**                                                                        |
| [platform-1.4-eng-001b-p4/](./platform-1.4-eng-001b-p4/README.md) | **IMPLEMENTED / AWAITING OWNER PHASE 4 ACCEPTANCE**                                 |
| [platform-1.4-eng-001b-p5/](./platform-1.4-eng-001b-p5/README.md) | **PROPOSED / BLOCKED**                                                              |

## Related

- [ENGINEERING-HANDBOOK](../foundation/ENGINEERING-HANDBOOK.md)
- [AI-ENGINEERING-STANDARDS](../foundation/AI-ENGINEERING-STANDARDS.md)
- [AI-WORKFLOW](../foundation/AI-WORKFLOW.md)
- [Governance Engineering Handbook](../governance/APZHUB-Engineering-Handbook.md)
- [REPOSITORY-GUIDE](../foundation/REPOSITORY-GUIDE.md)
- [OWNER-ACCEPTANCE-REGISTER](../foundation/OWNER-ACCEPTANCE-REGISTER.md)
