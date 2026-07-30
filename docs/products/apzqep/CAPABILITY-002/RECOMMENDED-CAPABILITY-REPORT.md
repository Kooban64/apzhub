# Recommended Capability Report — APZQEP-CAPABILITY-002

## Recommendation

```text
APZQEP-CAPABILITY-002 = Evidence Management
```

Proposed Architecture programme id (when Owner authorises): **APZQEP-ARCH-016** (suggested; Owner may assign differently).

## Why Evidence Management (single choice)

1. **Strongest foundation for the remainder of APZQEP** — Coverage, Analytics, Certification packs, and trustworthy Reporting all need an Evidence SoR; TE already emits references that have nowhere authoritative to land.
2. **Highest immediate product leverage on what just shipped** — TE 1.0.1 Limited Availability still uses coarse baseline URI/actor policy; Evidence Management is the designed home for fine-grained ACL, retention, integrity, and chain of custody (ADR-0080, CERT-002 residuals, FREEZE/RELEASE notes).
3. **Customer / portfolio value** — Module catalogue marks Evidence (M09) as **MVP core**; regulated QE users experience execution without trustworthy evidence packs as incomplete.
4. **Engineering efficiency** — Boundaries are already decided (refs vs blobs); stub module `qep-evidence` exists; PermissionService/audit/search/Workbench patterns reusable; TE EvidenceAccessPort is a ready integration seam.
5. **Lifecycle Standard stays stable** — Capability can run the proven APZOR path with ≤10% governance tax; no Lifecycle Standard changes required.

## Why not Test Runs as #1

Test Runs are the Wave 2 **indicative #2** and remain an excellent **#2 programme**. They deliver visible campaign UX but do not close TE’s deferred SoR or unlock Analytics. WAVE-2-ROADMAP explicitly allows Owner sequencing by dependency, not fixed numbering.

## Ranked alternatives (for Owner context only)

| Rank | Capability              | Use if Owner prioritises…                        |
| ---- | ----------------------- | ------------------------------------------------ |
| 1    | **Evidence Management** | Foundation + TE completion + certification trust |
| 2    | Test Runs               | Campaign orchestration UX next                   |
| 3    | Defects                 | Daily defect workflow before evidence depth      |
| 4    | Test Suites             | Spec/plan organisation before Runs               |

## Explicit non-recommendations now

Reporting · Analytics · Dashboards · AI Assistance — premature without Evidence (+ richer Execution history).  
Requirements · Test Planning — already delivered.
