# Certification Independence — Established Practice

| Field               | Value                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| Status              | **ESTABLISHED THROUGH PRACTICE**                                               |
| Authority           | Owner Directive (APZQEP-CERT-050D authorisation, 2026-07-27)                   |
| Governing standards | Document 000 · OES-000 · OES-001 · OES-002                                     |
| Absorption          | Candidate for next Owner-authorised revision of OES-000 / OES-002              |
| Applies from        | APZQEP-CERT-050D onward (and retrospectively as practice for prior CERT packs) |

---

## Principle

> **Certification SHALL remain an independent assurance activity and SHALL NOT perform engineering.**

## Normative implications

1. A Certification (CERT) programme evaluates the capability **as delivered**.
2. CERT programmes **MUST NOT** implement features, fix defects by changing behaviour, refactor for improvement, or redesign architecture.
3. Allowed CERT packaging activities (not engineering): evidence gathering, review records, SemVer / module metadata alignment for the recommended baseline, documentation of findings, release-evidence assembly.
4. If certification discovers deficiencies:
   - Record findings in the CERT pack.
   - Outcome is **FAIL** or **CONDITIONAL PASS** as appropriate.
   - Remediation is undertaken under a **new Engineering (ENG) programme**, not inside the CERT programme.
   - A subsequent CERT review evaluates the remediated capability.
5. Version Promotion and Freeze remain Owner Decisions after (or as part of accepting) a successful CERT programme — they do not authorise silent engineering.

## Rationale

Separation preserves the integrity and independence of the APZOR governance lifecycle: engineering builds; certification assures; remediation re-enters engineering under fresh authorisation.

## STOP

Do not amend FROZEN OES-000 / OES-001 / OES-002 ad hoc. This practice note is authoritative for CERT programme conduct until absorbed by formal OES revision.
