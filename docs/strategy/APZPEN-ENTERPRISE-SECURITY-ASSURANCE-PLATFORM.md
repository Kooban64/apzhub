# APZPEN — Enterprise Security Assurance & Penetration Testing Platform

> **Status:** **OWNER-DIRECTED PILLAR VISION** — 2026-08-13  
> **Commercial pillar:** APZPEN (illustrative external: APZ Security)  
> **Executive question:** _Can we demonstrate that this system is secure?_  
> **Parent strategy:** [APZOR-COMMERCIAL-PILLARS](./APZOR-COMMERCIAL-PILLARS.md)  
> **Sibling:** [APZQEP](./APZQEP-ENTERPRISE-QUALITY-ENGINEERING-PLATFORM.md) — release confidence vs security assurance  
> **Does not authorise:** unbounded implementation — named sprint guides required

---

## Positioning (locked)

> **APZPEN is an Enterprise Security Assurance and Penetration Testing Platform that connects applications, assets, source code, automated security tools, professional penetration testing, vulnerabilities, remediation, retesting and evidence into one governed security system — enabling organisations to understand, prove and continuously improve their security posture.**

**APZPEN must never be understood as a vulnerability scanner or a prettier ZAP/Greenbone dashboard.**

Traditional pentest:

`Scope → Consultant → PDF → Spreadsheet → Retest → Another PDF`

APZPEN:

`Asset → Scope → Code → Automated Security → Human Testing → Finding → Evidence → Remediation → PR → Retest → Certification → Continuous Assurance`

The PDF is an **output**, not the security system.

---

## Core principle

> Use the best security tool for each discipline and make APZPEN the system that orchestrates, correlates, governs and evidences the complete security-assurance process.

APZPEN owns the **security model**, **Security Graph**, **engagements**, **findings**, **risk**, **evidence**, and **certification**.  
Providers are replaceable.

---

## Lifecycle

**Asset → Scope → Source → Discover → Test → Find → Evidence → Risk → Remediate → Retest → Certify → Monitor**

Penetration testing is a major capability — not the whole product.

---

## Provider catalogue (expand continuously)

| Discipline               | Example providers                       |
| ------------------------ | --------------------------------------- |
| Source                   | GitHub, GitLab, Bitbucket, Azure DevOps |
| SAST                     | CodeQL, Semgrep, SonarQube              |
| DAST                     | OWASP ZAP, Burp Suite                   |
| SCA                      | Snyk, Dependabot, OSV-Scanner           |
| Secrets                  | Gitleaks, TruffleHog                    |
| Containers               | Trivy, Grype                            |
| SBOM                     | Syft                                    |
| IaC                      | Checkov, tfsec                          |
| Cloud posture            | Prowler, ScoutSuite                     |
| Web / API                | ZAP, Burp, Nuclei, Schemathesis         |
| Network discovery        | Nmap                                    |
| Vulnerability assessment | Nuclei, OpenVAS / **Greenbone**         |
| TLS                      | testssl.sh                              |
| Mobile                   | MobSF                                   |
| Kubernetes               | Trivy, kube-bench                       |

Make **as many security disciplines** available as practical over time — orchestration and evidence, not reinventing scanners.

---

## Engagements and Rules of Engagement

No pentest begins without authorised scope.

Manage: customer, application, engagement, scope, RoE, window, testers, environments, allowed/restricted techniques, exclusions, emergency contacts, approvals, dates.

**Allowed / Restricted** (e.g. no destructive DoS, no unauthorised data extraction) are first-class and always visible to testers.

### Scheduling

Engagements and automated assurance must support:

- **Once-off** assessments
- **Scheduled / frequent** runs
- **On-demand** scans and retests

Customer-issued requests drive assessments, findings workflow, and security certification — not ad-hoc internal busywork presented as customer work.

---

## Assets and Security Graph

Assets: web apps, APIs, mobile, repos, domains, IPs, hosts, containers, K8s, cloud accounts, DBs, services, third parties — related to applications and organisations.

**Security Graph:** Application → Asset → Repository → Component → Dependency → Vulnerability → Finding → Evidence → Remediation → Retest → Certification

---

## GitHub and source

Same intimacy as QEP: repos, PRs, Actions, security alerts, CodeQL/Dependabot ingestion.

**Read-only source** where explicitly authorised. Not an IDE.

PR security position: sensitive files, provider checks, required security review.

### Customer source operating modes

1. Grant APZPEN read access to repositories.
2. Customer keeps code in their environment; APZPEN receives findings/evidence from their pipelines and authorised scans.

---

## Automated + human testing

SAST / DAST / API / SCA / secrets / containers / SBOM / cloud / infra / mobile — normalised findings (CWE, CVSS, OWASP, evidence, remediation, status).

**Finding deduplication** across tools + manual testing — one problem, many evidence streams.

**Human pentest workspace** is mandatory: scope, RoE, checklists, notes, evidence, findings, retests. Methodologies (OWASP WSTG/ASVS/API/MASVS, PTES, NIST-aligned, PCI where applicable) structure work.

Reusable **security test cases** (authn, authz, injection, BOLA, config, …) — automated, manual, or hybrid.

---

## Risk, remediation, retest

Contextual risk beyond raw CVSS: exposure, criticality, data sensitivity, controls, exploitability.

Remediation closes the loop into engineering:

**Finding → Developer → Issue → PR → Checks → Retest → Evidence → Closed**  
(or Partially Fixed / Not Fixed / Risk Accepted / False Positive)

---

## Certification and reports

Formal assessment position from the same data:

- **Executive** report
- **Technical** report
- **Compliance evidence pack**

Certification states e.g. SECURITY ASSURANCE COMPLETE / BLOCKED.

---

## Continuous + engagement modes

| Mode       | Flow                                                   |
| ---------- | ------------------------------------------------------ |
| Engagement | Scope → Test → Report → Remediate → Retest → Certify   |
| Continuous | Commit → Analyse → Scan → Correlate → Risk → Remediate |

---

## Customer portal (commercial differentiator)

External customers of managed pentest services can:

- see engagement status
- review findings
- assign remediation
- upload evidence
- request retests
- download reports
- view certification

Replace email + spreadsheet remediation chains.

---

## Commercial operating models

SaaS self-serve · Managed APZOR pentest · Hybrid · Continuous assurance · Enterprise / private deployment.

---

## UI / navigation (persona-aware)

Security Operations and Assurance Workspace — risk first, evidence everywhere, not a “hacker terminal.” Light and dark professional themes.

Home · My Work · Applications · Assets · Engagements · Testing · Code Security · Attack Surface · Vulnerabilities · Findings · Remediation · Retests · Evidence · Reports · Certification · Insights · Administration

Personas: Pen Tester, Developer, Security Manager, Executive, Customer, Auditor.

---

## AI — Security Intelligence (later, bounded)

Summarisation, correlation, FP assist, remediation explanation, prioritisation, report drafting.  
**Never autonomous attack. Never autonomous certify.**

---

## With APZQEP

Independently commercialisable. When both licensed, APZPEN evidence feeds APZQEP release security domains. Shared APZHUB identity/audit/search — not a forced bundle.

---

## Ultimate measure of success

| Persona            | Question                                  |
| ------------------ | ----------------------------------------- |
| Pen Tester         | What should I test and what have I found? |
| Developer          | What do I need to fix?                    |
| Security Manager   | Where is our greatest risk?               |
| Product Owner      | Secure enough to release?                 |
| Auditor / Customer | Show evidence / status / remaining risk   |
| Executive          | What is our actual exposure?              |

**Not another scanner. Not another PDF factory.**  
An Enterprise Security Assurance Platform.

**Revision:** 1.0.0 · 2026-08-13
