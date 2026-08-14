# APZQEP Quality Operating Loop — PM / Dev / QA

| Field          | Value                                                                                                     |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Status         | **AUTHORITATIVE BLUEPRINT** 2026-08-10                                                                    |
| Product        | APZQEP Quality Operating System                                                                           |
| Complements    | [FLAGSHIP-PROGRAMME.md](./FLAGSHIP-PROGRAMME.md) · [QUALITY-ECOSYSTEM-MAP.md](./QUALITY-ECOSYSTEM-MAP.md) |
| Non-negotiable | Early Check ≠ Certification · AI never auto-certifies · no Kiwi/Tuskr SoR                                 |

## Destination

One loop inside APZHUB — not ten dashboards:

```text
PM registers quality project + GitHub repo (server PAT)
        ↓
Dev Early Check (spot code / security / Playwright) → AI Fix Pack
        ↓
QA Gate (suites, human confirm, stories in native Specs)
        ↓
Fix Direction Pack (+ optional Plane / Zammad work items)
        ↓
RC evaluate → human GO / NO-GO
        ↓
PM project insight (always on)
```

## Two quality modes (same spine)

| Mode            | Persona      | Purpose                                                                        | Flagship                                |
| --------------- | ------------ | ------------------------------------------------------------------------------ | --------------------------------------- |
| **Early Check** | Developer    | Cheap, frequent spot checks **outside** the AI IDE; structured feed back to AI | **F13**                                 |
| **QA Gate**     | QA / Release | Suites, human confirm, RC score, GO/NO-GO                                      | F2–F8, F4/F5, **F15**                   |
| **Insight**     | PM           | Project health from QEP’s point of view                                        | Journey/RC today; **F14** Portfolio hub |

Early Check **never** certifies a release. Report publish (F12) **never** equals GO/NO-GO.

## Test cases live in QEP

**Kiwi TCMS and Tuskr are out** as systems of record and as mandatory adapters.

Authoritative library:

```text
Test Specifications → Suites → Plans → Verification / Execution
```

Classical “test case” = one verification procedure form inside QEP. Playwright / Vitest / scanners remain **providers** that produce governed evidence.

## PAT and project registration

- **PM** creates a quality project and attaches GitHub repository id(s) (**F14**).
- **PAT** stays server-side (`.secrets` / `APZHUB_SCM_GITHUB_TOKEN`). Never entered in the browser.
- PM UI shows token **configured / missing** health only.

## Plane / Kimai / Zammad

| Product              | Role vs QEP                                                                   |
| -------------------- | ----------------------------------------------------------------------------- |
| APZ Projects (Plane) | Optional **work-item sink** for fix directions (**F16** via `ProjectService`) |
| APZ Support (Zammad) | Optional tickets for customer/ops incidents                                   |
| APZ Time (Kimai)     | Optional effort later — not on Early Check critical path                      |

QEP owns quality evidence and defects. Modules never call engine clients.

## Persona playbook

1. **PM** — Create quality project → attach repo → confirm token healthy → watch insight.
2. **Dev** — Open Early Check → Run packs → download **AI Fix Pack** → fix in Cursor → re-run → push.
3. **QA** — Open Journey Gate → required checks → suites / human confirm → accept F7 stories into Specs → Fix Direction Pack → RC → human GO/NO-GO.
4. **PM** — Sees Early Check frequency, open P0/P1, gate status, cert decision — without opening scanner chrome.

## Flagship map (F13–F16)

| Phase      | Intent                                      | Status                                                                                                                 |
| ---------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **F13**    | Developer Early Check + AI Fix Pack         | **IMPLEMENTED** 2026-08-10                                                                                             |
| **F14**    | PM Project Quality Hub (Portfolio)          | **IMPLEMENTED** 2026-08-10                                                                                             |
| **F15**    | QA Gate Loop (+ pen-test for QA)            | **IMPLEMENTED** 2026-08-10                                                                                             |
| **F16**    | Defect → Plane/Support work items           | **IMPLEMENTED** 2026-08-10                                                                                             |
| **Harden** | File-backed ledgers + operating-loop nav/UI | **IMPLEMENTED** 2026-08-10 — [HARDENING-F13-F16-LEDGERS-UI.md](./engineering/evidence/HARDENING-F13-F16-LEDGERS-UI.md) |

## Architecture

```text
Client → Gateway → QEP services (Evidence / Specs / Defects / Certification)
                ↘ Verification Dispatch → runners / GHA / clusters
Optional: Defect → ProjectService | SupportService → connectors → engines
```

## Explicit outs

- Tuskr / Kiwi as SoR
- Kali or Faraday as QEP UI modules
- Browser GitHub PATs
- Auto-certify from Early Check or report publish
