# APZ QEP — Product Definition Decision Register

> **Programme:** APZQEP-DEF-002 (expansion of APZQEP-DEF-001)  
> **Type:** Product Definition decisions — **not ADRs**

| ID | Decision | Reason | Authoritative source | Requirements supported | Alternatives considered | Consequences | Future review |
| -- | -------- | ------ | -------------------- | ---------------------- | ----------------------- | ------------ | ------------- |
| DEF-D-001 | Verification is primary concept; test procedure is a form | Avoid TCMS identity | Vision; Constitution | FR-006+; BR-016 | Keep “test case” as product noun | UI/glossary use Verification | If market language forces dual labels |
| DEF-D-002 | Manual verification first-class in MVP | Constitution + Owner DEF brief | Constitution; Discovery | FR-006/012; MVP | AI-first MVP | Engineering must polish manual sessions | Never remove without Owner |
| DEF-D-003 | Maturity L1–L7 with L7 = continuous cert signals | Owner DEF brief extends REQ MM | Owner DEF; Cert Constitution | MM-*; FR-018/042 | Keep L1–L6 only | Roadmap language uses L7 | ARCH may refine signals |
| DEF-D-004 | 22 modules as product areas including Home & MCP | Owner module list | Owner DEF | FR set | Merge Home into shell-only | Module catalogue baseline | Module splits in ARCH ok if behaviour preserved |
| DEF-D-005 | AI default OFF; not required for MVP | AI Constitution | AIR-021; Constitution | AIR-* | AI ON in MVP | Commercial AI add-on later | Owner AI programme |
| DEF-D-006 | MCP preferred; no autonomous certify tools | MCP Constitution/Discovery | IR-019; AIR-022 | FR-041 | IDE-only proprietary plugins | ARCH designs MCP server later | Protocol successors |
| DEF-D-007 | Certification outcomes include “Approved with qualifications” | Owner DEF + Platform cert language | Cert Constitution; CERT-001 analogy | FR-018 | Binary approve/reject only | Ops qualifications recorded | Policy templates |
| DEF-D-008 | QEP is not ALM/CI/runner/device cloud | Product Guardrails | Boundaries; Discovery | BR-006; IR exclusions | Jira-plugin strategy | Integrations optional only | Permanent unless Owner amends |
| DEF-D-009 | Pack path `product-definition/` | Owner deliverable path | Owner DEF | n/a | PRODUCTS-003 `definition/` only | Both referenced; this pack authoritative for QEP | None |
| DEF-D-010 | Release Manager primary certifier with configurable co-approvers | Accountability | Cert Constitution; personas | FR-037; SR-008 | Executive-only certify | SoD via co-approvers | Tenant policy |
| DEF-D-011 | APZQEP-DEF-002 expands depth without changing DEF-001 decisions | Owner DEF-002 programme scope | Owner DEF-002 brief | All REQ (depth only) | Redesign modules/decisions during expansion | Personas, workflows, models, UX/IA/nav at enterprise clarity; baseline 1.0.0-def (expanded) | None unless Owner directs redesign |

## DEF-002 note

DEF-D-001 through DEF-D-010 remain authoritative from APZQEP-DEF-001. DEF-D-011 records that depth expansion is additive — no product decision was altered, reversed, or superseded during DEF-002.
