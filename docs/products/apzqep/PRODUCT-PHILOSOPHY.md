# APZ QEP — Product Philosophy

> **Programme:** APZQEP-TRANSITION-001  
> **North-star map:** [QUALITY-ECOSYSTEM-MAP.md](./QUALITY-ECOSYSTEM-MAP.md) · **Flagship path:** [FLAGSHIP-PROGRAMME.md](./FLAGSHIP-PROGRAMME.md) (F0–F6).

## Principles

### 0. Quality Operating System (not a better TCMS)

APZQEP orchestrates the engineering quality ecosystem. It owns requirements, verification, evidence, certification, and intelligence. It consumes GitHub, Playwright, SonarQube, ZAP, k6, axe, and peers via a provider layer — it does not try to replace those engines or stop at “test case management.”

### 1. Quality Engineering rather than Test Management

APZ QEP governs quality across the delivery lifecycle. Test management is a subset of verification management within Quality Engineering.

### 2. Verification rather than Test Cases

The primary work unit is **verification**, not only a classical test case.

Verification may be:

| Mode            | Meaning                                                  |
| --------------- | -------------------------------------------------------- |
| **Manual**      | Human-executed verification procedures                   |
| **Automated**   | Runner/CI-produced results linked into QEP               |
| **AI Assisted** | AI-drafted or AI-reviewed verification — human-governed  |
| **Continuous**  | Ongoing verification signals from pipelines and monitors |

Classical test cases remain a first-class form of verification procedure — they do not define the product’s ceiling.

### 3. APZ QEP is the System of Record

- APZ QEP owns quality SoR data (plans, verifications, evidence metadata, certification states, defects, traceability).
- **AI systems are assistants.** They never become the source of truth.
- AI must not auto-certify or silently mutate certification state.

### 4. Traceability is mandatory

Every verification shall be traceable to one or more **approved requirements** (or explicitly justified exception with audit).

### 5. Certification readiness is a core capability

Release/certification readiness — evidence completeness, gates, human sign-off — is central to QEP, not an add-on report.

## Implications for terminology

| Prefer                   | Avoid as product identity  |
| ------------------------ | -------------------------- |
| Quality Engineering      | “Just a TCMS”              |
| Verification             | Test-case-only framing     |
| Evidence & certification | Checkbox testing           |
| AI assistant             | AI as SoR / auto-certifier |
| APZ QEP                  | Engine brands (Kiwi, etc.) |
