# APZHUB OSS vs Native Capability Decision Model

**Milestone:** OSS-002  
**Status:** Authoritative decision framework  
**Authority:** [Build vs Buy Strategy](../strategy/APZHUB-Build-vs-Buy-Strategy.md) · [Capability Abstraction Standard](./APZHUB-Capability-Abstraction-Standard.md)

---

## Purpose

Provide a repeatable framework for deciding when to integrate OSS, build a native APZHUB capability, purchase commercial software, or defer.

Both OSS-backed and native capabilities must present identically to users via the [Capability Abstraction Standard](./APZHUB-Capability-Abstraction-Standard.md).

---

## Decision outcomes

| Outcome | When | User experience |
|---------|------|-----------------|
| **Integrate OSS** | Mature CE engine; domain not differentiator; adapter cost ≪ build | APZHUB capability name; engine hidden |
| **Build native** | Core differentiator; no suitable OSS; must own SoR; UX is the product | APZHUB capability; platform PostgreSQL SoR |
| **Commercial purchase** | OSS gap; compliance cert; time-to-market; budget approved | Same abstraction — commercial adapter |
| **Defer** | Dependency unmet; scope unclear; cost exceeds value at gate | Not in portfolio until re-evaluated |

---

## Decision matrix

Score each dimension **Low / Medium / High** impact on the decision.

| Dimension | Favours OSS | Favours native | Favours commercial | Favours defer |
|-----------|-------------|----------------|-------------------|---------------|
| **Differentiation** | Commodity domain | Strategic product | Certified niche | Unknown value |
| **Time to market** | Need capability in < 6 months | Can invest 6+ months | Need < 3 months + budget | No deadline pressure |
| **SoR ownership** | Engine can own domain data | Platform must own data | Vendor SoR acceptable | — |
| **UX coherence** | Engine UI fully hidden | Custom UX required | Embed-only acceptable | — |
| **Platform integration depth** | Shallow sync sufficient | Deep Playwright/AI/events | API-only integration | — |
| **Operational cost** | Team can run CE engine | Prefer single stack | Vendor SLA needed | No ops capacity |
| **License risk** | Permissive OSS / CE | N/A | Budget for license | License unclear |
| **Exit flexibility** | Good export APIs | Full control | Contract terms | — |
| **Team expertise** | Adapter patterns known | Domain expertise in-house | Vendor support | Gap in skills |

**Rule of thumb:**

- **3+ High native scores** → Build native
- **3+ High OSS scores** → Integrate OSS
- **Compliance/cert blocker** → Commercial or defer
- **Split scores** → Prototype adapter spike; re-evaluate at gate

---

## Worked examples (APZHUB portfolio)

| Capability | Decision | Rationale |
|------------|----------|-----------|
| Projects | Integrate OSS (Plane) | Mature PM; years to build |
| Documents | Integrate OSS (Paperless) | OCR/tagging complex |
| Time Tracking | Integrate OSS (Kimai) | Commodity; billing via service |
| Support | Integrate OSS (Zammad) | Standard ticketing |
| Analytics | Integrate OSS (Metabase) | BI engine not differentiator |
| Automation | Integrate OSS (n8n) | Workflow engine standard |
| **Quality Engineering** | **Build native** | Playwright-first; AI-native; platform SoR; commercial potential — see below |
| Observability | Integrate OSS (G/P/L) | Industry standard; operator tier |
| Security Ops | Integrate OSS (G/M/F) | Specialised scanners; admin tier |
| Law Platform | Build native | Vertical differentiator |
| Workbench / Platform Core | Build native | Core identity |

---

## Quality Engineering — first native capability example

**Prior decision (OSS-001):** Integrate Kiwi TCMS for Wave 5 Testing.

**OSS-002 decision:** **Replace with native APZHUB Quality Engineering Platform.**

| Factor | Kiwi TCMS (OSS) | Native Quality Engineering |
|--------|-----------------|---------------------------|
| Differentiation | Low — commodity TMS | **High** — Playwright-first, AI-native |
| Platform integration | Adapter sync; XML-RPC legacy | **Deep** — events, gates, M17 CI |
| UX coherence | Separate TMS mental model | **Unified** APZHUB quality workspace |
| SoR | Split (Kiwi DB + platform) | **Platform PostgreSQL** authoritative |
| Commercial potential | None | **Future product** tier |
| Playwright alignment | Ingest results only | **First-class** execution engine |

**Verdict:** Build native. Kiwi TCMS **deferred / superseded** for Wave 5.

See [Quality Engineering Platform Strategy](../strategy/APZHUB-Quality-Engineering-Platform-Strategy.md).

---

## Decision process (mandatory)

1. **Classify** capability type in portfolio strategy
2. **Score** decision matrix with architecture review
3. **Document** in capability catalog or strategy doc
4. **Owner approval** before sprint guide (OSS-1xx or QE-xxx)
5. **Manifest first** — regardless of OSS or native path
6. **Re-evaluate** at major milestone or if engine/license changes

---

## When native still uses an adapter boundary

Native capabilities may integrate **external execution engines** (e.g. Playwright runner workers) behind the Capability Service — these are **workers/connectors**, not user-facing OSS products. Users still see only Quality Engineering.

```text
Quality Engineering Module
        ↓
QualityEngineeringService
        ↓
Execution Worker Boundary  (Playwright runner — not a user-facing product)
```

---

## Related

- [Build vs Buy Strategy](../strategy/APZHUB-Build-vs-Buy-Strategy.md)
- [Capability Abstraction Standard](./APZHUB-Capability-Abstraction-Standard.md)
- [Quality Engineering Backlog](../backlog/APZHUB-Quality-Engineering-Backlog.md)
