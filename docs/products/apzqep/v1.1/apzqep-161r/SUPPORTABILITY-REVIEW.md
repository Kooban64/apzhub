# Supportability Review — APZQEP-161R

| Field     | Value            |
| --------- | ---------------- |
| Programme | APZQEP-161R      |
| Verdict   | **PASS**         |
| Timestamp | 20260803T152830Z |

## Checklist

| Item                    | State                                                                 | Result |
| ----------------------- | --------------------------------------------------------------------- | ------ |
| Operational handbook    | APZQEP-OPS-001 exists; automation addendum = this pack + Quick Start  | PASS   |
| Support guide           | Troubleshooting captured below + INSTALLATION-REVIEW                  | PASS   |
| Runbook                 | Quick Start + Demo Script serve as first-run runbooks                 | PASS   |
| Incident process        | Inherit APZQEP-OPS-001 / production incident process                  | PASS   |
| Known limitations       | Documented in COMPLETION (161) + this pack                            | PASS   |
| Recovery                | Cancel execution; restart clears in-memory — document clearly         | PASS   |
| Configuration guidance  | `APZHUB_AUTOMATION_LIVE`, dry-run options                             | PASS   |
| Troubleshooting         | See below                                                             | PASS   |
| Logging / observability | Domain events + correlation ids; structured platform logging residual | PASS   |
| Version compatibility   | Packages `0.1.0`; Playwright peer optional                            | PASS   |
| Operational ownership   | Product ops-led (OPS-001); automation module M07 enabled              | PASS   |

## Known limitations (support must communicate)

1. Default dry-run — not a live browser unless env enabled.
2. Process-local execution store.
3. Artifact URIs are in-memory references in Wave 1.
4. Placeholder providers always refuse run.
5. No GitHub/CI trigger yet (Wave 2).

## First-line troubleshooting

| Symptom                    | Likely cause                        | Action                              |
| -------------------------- | ----------------------------------- | ----------------------------------- |
| Placeholder provider error | Non-Playwright provider selected    | Use `playwright` only in Wave 1     |
| No history after restart   | In-memory store                     | Expected; re-run dry-run            |
| “Is Playwright running?”   | Dry-run default                     | Explain dry-run; optional live flag |
| Live import failure        | Playwright not installed            | Install peer or stay on dry-run     |
| API 400 VALIDATION_FAILED  | Missing provider/target/correlation | See API-GUIDE                       |
