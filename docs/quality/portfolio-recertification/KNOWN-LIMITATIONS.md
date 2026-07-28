# APZHUB-QA-CERT-001 — Known Limitations (Certification Snapshot)

> **Programme:** APZHUB-QA-CERT-001  
> **Baseline:** Platform **1.2.0**  
> **Date:** 2026-07-21  
> **Authority:** Platform KL register + this certification run

---

## Binding limitations (unchanged product posture)

See [Platform 1.2.0 Known Limitations](../../releases/platform/1.2.0/KNOWN-LIMITATIONS.md) — PL12-KL-01…06 and product KLs remain in force.

## Certification-run limitations (this programme)

1. **Portfolio Playwright not green** — 19 hard fails · 30 flaky after full remediation engineering.
2. **Repository Vitest / lint / typecheck not green** — pre-existing and/or adjacent debt; not fixed (engineering forbidden).
3. **Law Trust** — fails under monorepo `test:e2e`; dedicated `test:e2e:law` not re-run as a substitute for main-suite honesty.
4. **Support inbox visual** — baseline not part of RG-VISUAL member set; still failing in full suite.
5. **RG-AUTH-SHELL UI residuals** — historically noted; still visible as spr/Support auth/shell instability.

## Residual analysis (follow-on)

Full classification and new remediation groups: [APZHUB-QA-RECERT-002](../residual-analysis/README.md).

## Honesty rule

Do not treat remediation engineering closure as portfolio green certification.
