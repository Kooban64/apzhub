# APZPEN — Enterprise later options (parked)

> **Status:** **PARKED — LATER OPTION** — 2026-08-14  
> **CE programme:** **COMPLETE** through [SPR-APZPEN-014](../sprint/SPR-APZPEN-014-deferred-closeout.md)  
> **Pillar vision:** [APZPEN Enterprise Security Assurance](./APZPEN-ENTERPRISE-SECURITY-ASSURANCE-PLATFORM.md)  
> **Portfolio priority:** **APZQEP** (full swing) — APZPEN enterprise work is **not** the active build track

## Unpark notice (2026-08-15)

Owner [OWNER-FULL-PRODUCT-BAR-OPTION-3](../decisions/OWNER-FULL-PRODUCT-BAR-OPTION-3.md) authorised **Greenbone + Faraday** (Kali runner only) under [SPR-APZPEN-ENT-001](../sprint/SPR-APZPEN-ENT-001-greenbone-faraday-path.md) — **COMPLETE · DELIVERED**.  
[SPR-FULL-002](../sprint/SPR-FULL-002-post-option-3-hardening.md) hardened GMP pull + Faraday export path — still **within** that authorised slice; it did **not** open items **1–5**.

## Park reaffirmation (2026-08-15 — post adopt)

After [SPR-ADOPT-002](../sprint/SPR-ADOPT-002-commercial-pillar-operator-dogfood.md) dogfood (CE engagement + artefact honesty path):

| Still parked                                                               | Still out of scope without new Owner sprint                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Items **1–5** below (SBOM, WORM, extra SCMs, legal-hold, multi-host locks) | New APZPEN mega-features · enterprise vapourware stubs · Cap reopen |

**No further APZPEN enterprise build** until resume criteria below are met. Next portfolio slice is **platform polish**, not APZPEN unpark.

---

## Intent

APZPEN Community / CE product is **done enough to operate and sell as security assurance**.  
The items below are **optional enterprise depth** — resume only when a customer deal, audit bar, or Owner directive requires them. Prefer **self-hosted OSS + thin APZHUB connectors** over building engines.

## Parked enterprise options

| #   | Option                            | CE-complete approach (when resumed)                                                           | Do **not** rebuild        |
| --- | --------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------- |
| 1   | Full SBOM / dependency graph      | Connector to Dependency-Track / Syft / Grype / Guac; APZHUB owns correlation UX + permissions | A new SBOM product        |
| 2   | WORM / crypto certification chain | Object Lock (MinIO/S3) + KMS/Sigstore; extend today’s append-only cert ledger                 | Custom WORM filesystem    |
| 3   | Additional SCMs                   | Adapters for Azure DevOps, Bitbucket, Gitea, Forgejo (GitHub + GitLab already live)           | Fork SCM platforms        |
| 4   | Legal-hold / retention            | Policy in APZHUB + vault/object-store lifecycle; export for e-discovery if needed             | Full RM/e-discovery suite |
| 5   | Multi-host worker locks           | Redis/Postgres leases or job runner on existing tick worker                                   | Custom distributed OS     |

## Host / ops note (2026-08-14)

- EC2 root volume expanded to **400 GB** (~50% free after resize) — Greenbone feeds/DB have room to grow.
- **Greenbone** remains the preferred deep vulnerability-scanner engine for APZPEN ingest; keep running.
- Local Ollama/OpenProject AI volumes removed; APZPEN AI assist uses platform/OpenAI paths already shipped.

## Resume criteria (any one)

1. Paying customer requires a named bar (e.g. Object Lock WORM, ADO SCM, SBOM inventory).
2. Owner opens an **SPR-APZPEN-ENT-*** sprint guide.
3. APZQEP competitive programme reaches a natural pause and portfolio rebalances.

## Explicit non-goals while parked

- No new APZPEN mega-features without a sprint guide.
- No enterprise vapourware stubs in CE UI.
- Documentation and environment inventory remain allowed at any time.

---

**Bottom line:** APZPEN CE is closed. Enterprise depth is a **menu for later**, not the current programme.
