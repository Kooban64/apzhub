# APZQEP — Operator user guide (full product bar)

| Field     | Value                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| Audience  | QA leads · QE engineers · Release managers · Automation operators                                                 |
| Product   | APZQEP (Quality Engineering Platform)                                                                             |
| Authority | [SPR-DOCS-001](../../../sprint/SPR-DOCS-001-commercial-pillar-operator-guides.md)                                 |
| Related   | [1.1 User Guide](../release-1.1/guides/USER-GUIDE.md) · [USER-WORKFLOWS](../product-definition/USER-WORKFLOWS.md) |

**Rule:** Humans certify. Automation, QI, AI, MCP, and security bridge signals are **advisory** — they never set GO/NO-GO by themselves.

## 1. Getting started

1. Sign in to APZHUB (BetterAuth — one login).
2. Confirm your org is entitled to **Quality (QEP)** (commercial soft-gate).
3. Open **Quality** from the Activity Bar (only modules you have permission to see appear).
4. Start from **Home** or **Release Readiness** for release confidence; use Caps for day-to-day verification work.

## 2. Where to work (map)

| Need                                   | Go to                                        | Path                                                                                 |
| -------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------ |
| Release confidence                     | Home / Release Readiness / Release Candidate | `/workspace/qep`, `/workspace/qep/release-readiness`, `/workspace/qep/certification` |
| Requirements → verification → evidence | Caps A–F modules                             | `/workspace/qep/requirements`, `…/verification`, `…/evidence`, …                     |
| Automation runs & mapping governance   | Automation                                   | `/workspace/qep/automation`                                                          |
| SCM changes                            | Source Control                               | `/workspace/qep/scm`                                                                 |
| Trends & advice                        | Quality Intelligence                         | `/workspace/qep/quality-intelligence`                                                |
| Learning articles                      | Learning                                     | `/workspace/qep/learning`                                                            |
| Connectors enable/sync                 | Integration Centre                           | `/workspace/qep/integrations`                                                        |
| Risk register                          | Risk                                         | `/workspace/qep/risk`                                                                |
| Governed AI assist                     | AI Quality Workspace                         | `/workspace/qep/ai-workspace`                                                        |
| MCP / DX proposals                     | MCP and Developer Experience                 | `/workspace/qep/mcp-dx`                                                              |
| Continuous verification freshness      | Automation → Continuous verification signals | `/workspace/qep/automation`                                                          |
| Continuous cert advisory               | Release Candidate home                       | `/workspace/qep/certification`                                                       |

## 3. Core release path (every release)

1. **SCM** — sync or select a change event.
2. **Automation / Evidence** — ingest or run providers linked to that change.
3. **Release Candidate** — Open RC for change → review domain tiles + security assurance panel.
4. **Human decision** — record GO / NO-GO with rationale (certifier + co-approver rules apply).
5. Never treat QI banners, AI suggestions, MCP proposals, or APZPEN severity as certification.

### Security assurance on readiness / RC

- Panel shows APZPEN posture when your org is entitled to **both** QEP and APZPEN (or bootstrap CE).
- Statuses: `healthy` · `degraded` · `unavailable` · `not_entitled`.
- Deep link to APZPEN only when entitled.
- Scanners **do not** flip QEP certification.

## 4. Phase 2 surfaces (how to use)

### Learning (Knowledge)

1. Open **Learning**.
2. Create a draft article → publish when ready.
3. Link from verification design / learning work as needed.
4. Permissions: `qep.knowledge.read` / `qep.knowledge.operate`.

### Integration Centre

1. Open **Integrations**.
2. Enable/disable connectors and record last sync (platform metadata — Cap runners unchanged).
3. Permissions: `qep.integrations.read` / `qep.integrations.operate`.

### Automation mapping governance

1. Open **Automation**.
2. In **Mapping governance**, upsert provider + external key; mark flaky/stale; set owner.
3. This does **not** run tests — it tracks governance metadata.

### Quality Intelligence

- Use for trends and explainable advice only.
- Product entitlement applies; never auto-certifies.

### Risk

- Create risks with optional owner / evidence ref.
- Use **Accept** when accepting residual risk (audited human action).

## 5. Phase 3 — continuous signals

### Continuous verification (freshness)

- On **Automation**, record heartbeats (source + subjectRef) or rely on auto-emit when automation/CI ingest runs.
- Statuses: `fresh` · `stale` · `acknowledged`.
- Acknowledge stale signals; they **do not** certify.

### Continuous certification (advisory)

- On **Release Candidate** home, record expiry/drift/freshness signals against an evaluation id.
- **Acknowledge** or **Request re-cert** (escalate) — humans still open RC and decide.
- RC evaluate also emits an advisory freshness signal automatically.

## 6. AI Quality Workspace

1. Open **AI Quality Workspace**.
2. Choose mode (coverage gaps, failure explain, test draft, suite recommend).
3. Create session → **Accept** or **Reject** each suggestion.
4. Live LLM only if ops set `APZHUB_QEP_AI_ASSIST=true` (default off — deterministic assist still works).
5. AI cannot certify or set GO/NO-GO.

## 7. MCP and Developer Experience

### In APZHUB UI

1. Open **MCP and Developer Experience**.
2. Review tool catalogue (read + gated write).
3. Submit a gated-write proposal → human **Accept** / **Reject**.

### HTTP (developers)

- `GET/POST /api/v1/qep/mcp` — catalogue and proposals.
- `POST /api/v1/qep/mcp/rpc` — JSON-RPC `tools/list` / `tools/call`.

### Optional IDE stdio (ops appendix)

- Package `@apzhub/qep-mcp-server` — see §9. Not required for normal QE work.

## 8. Permissions cheat-sheet

| Area                     | Typical read                                              | Typical operate            |
| ------------------------ | --------------------------------------------------------- | -------------------------- |
| Home / readiness         | `qep.home.read`, `qep.release_readiness.read`             | —                          |
| Certification            | `qep.certification.read`                                  | `qep.certification.decide` |
| Automation / CV          | `qep.automation.read`, `qep.continuous_verification.read` | `.operate`                 |
| Continuous cert          | `qep.continuous_cert.read`                                | `.operate`                 |
| AI                       | `qep.ai_workspace.read`                                   | `.operate`                 |
| MCP                      | `qep.mcp-dx.read`                                         | `.operate`                 |
| Knowledge / Integrations | `qep.knowledge.*`, `qep.integrations.*`                   | matching `.operate`        |

## 9. Ops appendix (optional host enablement)

| Feature                 | When you need it          | How                                          |
| ----------------------- | ------------------------- | -------------------------------------------- |
| Live LLM assist         | Real model suggestions    | `APZHUB_QEP_AI_ASSIST=true` + server secret  |
| MCP stdio for IDE       | Cursor/agent over stdin   | `pnpm --filter @apzhub/qep-mcp-server start` |
| Live automation browser | Real Playwright artefacts | `APZHUB_AUTOMATION_LIVE=true`                |

These are **not** required to use APZQEP day-to-day.

## 10. What “done” looks like for a release

- [ ] Change linked and evidence/automation present
- [ ] RC evaluated; domains understood
- [ ] Security assurance reviewed (or honestly `not_entitled` / `unavailable`)
- [ ] Continuous signals acknowledged if stale/drift
- [ ] Human GO/NO-GO recorded with rationale
- [ ] No reliance on AI/MCP/scanner auto-approve
