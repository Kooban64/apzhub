# APZPEN — Operator user guide

| Field     | Value                                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Audience  | Security ops · Pen-test leads · Assurance reviewers                                                                                      |
| Product   | APZPEN (Security Assurance & Pen Testing)                                                                                                |
| Authority | [SPR-DOCS-001](../../../sprint/SPR-DOCS-001-commercial-pillar-operator-guides.md)                                                        |
| Related   | [ENT-001](../../../sprint/SPR-APZPEN-ENT-001-greenbone-faraday-path.md) · [APZTOOLS layout](../../../operations/APZTOOLS-HOST-LAYOUT.md) |

**Rules**

- APZPEN owns security assurance SoR. QEP **consumes** summaries via the bridge — pillars stay separate.
- **Never auto-certify** a release from scanner severity.
- Kali is a **runner image only** — not a product UI module.
- Engine brands (Greenbone / Faraday) are masked in normal operator UX where catalogue copy applies.

## 1. Getting started

1. Sign in to APZHUB (BetterAuth).
2. Confirm entitlement to **Security Assurance / pentest**.
3. Open the **APZPEN** workspace (Activity Bar / product shell as entitled).
4. Create or open an **engagement** — this is your assurance container.

## 2. Day-to-day engagement loop

| Step | What you do                      | Notes                                                 |
| ---- | -------------------------------- | ----------------------------------------------------- |
| 1    | Scope + Rules of Engagement      | Approve RoE before live testing where policy requires |
| 2    | Assets / targets                 | Keep identifiers accurate for reporting               |
| 3    | Ingest findings                  | Manual, provider ingest, or artefact path             |
| 4    | Triage → remediate → retest      | Queues and finding detail                             |
| 5    | Evidence + certification ledger  | Assurance evidence — not QEP GO                       |
| 6    | Reports / portal (when entitled) | Customer-facing as configured                         |

QEP Release Readiness may show a **security assurance** panel linked to your engagement when dual-entitled — that panel is read-only advice for release managers.

## 3. Vulnerability / pen-test ingest (primary path)

### Artefact path (authorised default)

Works without live GMP API or Faraday UI.

1. Export findings as simplified JSON.
2. Place files under:

   - Greenbone: `~/apztools/security/out/greenbone/` (or `$APZTOOLS_ROOT/...`)
   - Faraday: `~/apztools/security/out/faraday/`

   Typical names: `greenbone-findings.json`, `*-findings.json`, `faraday-findings.json`, `vulns.json`.

3. In APZHUB:
   - List artefacts: Providers → Greenbone/Faraday artefacts APIs / UI deep-links.
   - Ingest into an engagement (`toolId` greenbone or faraday), or enable path ingest env flags for operators.

4. Review findings in the engagement — assign, remediate, retest as usual.

### Provider catalogue honesty

| Provider  | Typical status | Meaning                                             |
| --------- | -------------- | --------------------------------------------------- |
| Greenbone | `ingest_ready` | Operator scan → artefact → ingest; not a QEP module |
| Faraday   | `ingest_ready` | Same artefact pattern                               |
| Kali      | runner only    | No shell module                                     |

## 4. Optional live Greenbone GMP (ops)

Only if your host has a Greenbone manager and secrets configured.

1. Set `GREENBONE_GMP_HOST`, `GREENBONE_GMP_USER`, `GREENBONE_GMP_PASSWORD` (optional port).
2. Set `APZPEN_GREENBONE_GMP_PULL=true`.
3. Call `POST /api/v1/apzpen/providers/greenbone/gmp/pull` (permissioned).
4. Result writes a simplified JSON under the Greenbone out dir — **you still ingest** into an engagement.
5. Pull never certifies QEP or APZPEN.

UI health probe may use `GREENBONE_UI_URL` (default localhost:9392).

## 5. Optional Faraday stack (ops)

1. Prefer official Faraday CE compose, or:

   ```bash
   cd infrastructure/docker/clusters/faraday
   cp .env.example .env   # local secrets only
   docker compose -p apzqep-faraday --profile faraday up -d
   ```

2. Set `FARADAY_URL` (and optional `FARADAY_API_TOKEN`, `FARADAY_WORKSPACE`).
3. Export vulns → `out/faraday/` **or** use REST helper `fetchFaradayVulns` → write artefact → ingest.
4. Default compose **without** `--profile faraday` does nothing (safe).

## 6. Bridge to Quality (what QEP sees)

- QEP Home / Readiness / RC show assurance **summary** (open criticals, posture, optional VA freshness).
- QEP modules must not call Greenbone/Faraday clients directly.
- If QEP users lack APZPEN entitlement, status is honestly `not_entitled`.

## 7. Permissions (typical)

| Mode                      | Examples                                                                      |
| ------------------------- | ----------------------------------------------------------------------------- |
| Read                      | View engagements, findings, artefacts                                         |
| Write                     | Ingest, assign, evidence upload                                               |
| Manage / certify (APZPEN) | Engagement lifecycle, assurance certification ledger — **not** QEP release GO |

Exact keys are permission-gated in the shell; if a nav item is missing, you are not entitled or lack grants.

## 8. Checklist — “assurance ready to advise release”

- [ ] Engagement scoped; RoE approved if required
- [ ] Findings ingested (artefact or provider)
- [ ] Critical/high triaged or accepted with record
- [ ] Evidence attached for material items
- [ ] QEP bridge shows expected posture (or honest unavailable)
- [ ] No claim that scanners certified the release
