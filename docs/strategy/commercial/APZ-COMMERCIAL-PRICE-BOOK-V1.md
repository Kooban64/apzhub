# APZ Commercial Price Book v1.0

> **Status:** OWNER RECOMMENDED — pending formal draft entry & publish  
> **Date:** 2026-08-18  
> **Authority:** Owner commercial decision  
> **Engineering:** Do **not** seed, hard-code, or publish until Owner issues the short activation instruction  
> **Gate:** [OWNER-COMMERCIAL-PRICING-DECISION-GATE](../decisions/OWNER-COMMERCIAL-PRICING-DECISION-GATE.md)

All prices are **exclusive of applicable taxes**.

---

## Monthly list prices

| Product / seat          | Global USD /mo | Africa USD /mo | South Africa ZAR /mo |
| ----------------------- | -------------: | -------------: | -------------------: |
| APZPRD Projects         |            $10 |             $6 |              **R99** |
| APZPRD Support — Agent  |            $22 |            $12 |             **R199** |
| APZPRD Time             |             $8 |             $4 |              **R69** |
| APZPRD Workflow         |            $10 |             $6 |              **R99** |
| APZPRD Analytics        |            $12 |             $7 |             **R119** |
| APZPRD Knowledge        |             $7 |             $4 |              **R69** |
| APZPRD Documents        |             $7 |             $4 |              **R69** |
| **APZPRD Complete**     |        **$29** |        **$15** |             **R249** |
| **APZQEP Engineer**     |        **$35** |        **$18** |             **R299** |
| APZQEP Collaborator     |            $10 |             $5 |              **R79** |
| **APZPEN Practitioner** |        **$69** |        **$35** |             **R599** |
| APZPEN Collaborator     |            $12 |             $6 |              **R99** |

---

## Annual pricing

**Rule:** Annual = **10 × monthly** (two months free ≈ 16.7% commitment discount).

| Product              | Global /yr | Africa /yr | South Africa /yr |
| -------------------- | ---------: | ---------: | ---------------: |
| Projects             |       $100 |        $60 |         **R990** |
| Support Agent        |       $220 |       $120 |       **R1,990** |
| Time                 |        $80 |        $40 |         **R690** |
| Workflow             |       $100 |        $60 |         **R990** |
| Analytics            |       $120 |        $70 |       **R1,190** |
| Knowledge            |        $70 |        $40 |         **R690** |
| Documents            |        $70 |        $40 |         **R690** |
| **APZPRD Complete**  |   **$290** |   **$150** |       **R2,490** |
| **QEP Engineer**     |   **$350** |   **$180** |       **R2,990** |
| QEP Collaborator     |       $100 |        $50 |         **R790** |
| **PEN Practitioner** |   **$690** |   **$350** |       **R5,990** |
| PEN Collaborator     |       $120 |        $60 |         **R990** |

---

## Policies

| Policy                  | Decision                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| Trial                   | 14 days per discipline (APZPRD / APZQEP / APZPEN); no card required to start; **one trial per organisation**    |
| PEN tools in trial      | Third-party professional-tool credentials/licenses are **not** included via APZ trial                           |
| Minimum seats           | Modules / Complete / Engineer / Practitioner: **1**; Collaborator requires ≥1 paid Engineer or Practitioner     |
| Platform fee            | **None at launch** — Team platform included with any paid product                                               |
| Business plan surcharge | Catalogue may retain; **do not aggressively market** as R249 add-on at launch                                   |
| Enterprise              | Contact Sales (SSO/SCIM, governance, SLA, dedicated support, deployment, advanced audit, custom integrations)   |
| Africa                  | Enter **explicit Africa USD prices** — not a blanket −50%                                                       |
| Non-ZA Africa           | Default to Africa USD book until country books exist                                                            |
| ZA VAT                  | Publish **ex VAT**; configure ZA rule at **15%** when Owner activates tax (do not activate without instruction) |
| Launch promotions       | No permanent % off list; optional Founding Customer 20% first year (annual, new only, dated, non-stackable)     |

### Locked product boundaries

```text
APZ Platform          included with any purchased discipline
Professional pentest  NOT included in APZPEN SaaS
Professional Tools    independently entitled
Source Workspace      independently entitled
Org subscription      does NOT auto-grant users
```

### Illustrative ZA totals (engine-owned; do not hard-code)

| Product             | Ex VAT | + 15% VAT |
| ------------------- | -----: | --------: |
| APZPRD Complete     |   R249 |   R286.35 |
| APZQEP Engineer     |   R299 |   R343.85 |
| APZPEN Practitioner |   R599 |   R688.85 |

---

## Owner values (machine-ready)

```text
GLOBAL — USD / MONTH
APZPRD Projects             10
APZPRD Support Agent        22
APZPRD Time                  8
APZPRD Workflow             10
APZPRD Analytics            12
APZPRD Knowledge             7
APZPRD Documents             7
APZPRD Complete             29
APZQEP Engineer             35
APZQEP Collaborator         10
APZPEN Practitioner         69
APZPEN Collaborator         12

AFRICA — USD / MONTH
APZPRD Projects              6
APZPRD Support Agent        12
APZPRD Time                  4
APZPRD Workflow              6
APZPRD Analytics             7
APZPRD Knowledge             4
APZPRD Documents             4
APZPRD Complete             15
APZQEP Engineer             18
APZQEP Collaborator          5
APZPEN Practitioner         35
APZPEN Collaborator          6

SOUTH AFRICA — ZAR / MONTH, EX VAT
APZPRD Projects             99
APZPRD Support Agent       199
APZPRD Time                 69
APZPRD Workflow             99
APZPRD Analytics           119
APZPRD Knowledge            69
APZPRD Documents            69
APZPRD Complete            249
APZQEP Engineer            299
APZQEP Collaborator         79
APZPEN Practitioner        599
APZPEN Collaborator         99

ANNUAL = 10 × MONTHLY
```

---

## Next engineering operation (only when Owner authorises)

```text
Owner price book
      ↓
validate catalogue mapping
      ↓
enter as DRAFT (GLOBAL / AFRICA / SOUTH_AFRICA)
      ↓
configure ZA VAT 15% as DRAFT (publish tax only on Owner instruction)
      ↓
preview representative baskets
      ↓
STOP before PUBLISH — Owner inspects Platform Admin
```

Do not redesign the pricing system. Do not publish without Owner confirmation after draft inspection.
