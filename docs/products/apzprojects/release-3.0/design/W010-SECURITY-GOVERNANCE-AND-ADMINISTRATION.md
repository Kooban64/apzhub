# APZ Projects Release 3.0

# Product Design Workshop 010 — Security, Governance & Operational Administration

**Document ID:** W010-SECURITY-GOVERNANCE-AND-ADMINISTRATION  
**Status:** APPROVED WITH AMENDMENTS (Owner review 2026-08-06) — implementation authority for operational administration  
**Mode:** Product design only · no code until Owner authorises engineering  
**Depends on:** W001–W009 (W002–W009 APPROVED WITH AMENDMENTS)  
**Continues:** `W011-UI-SYSTEM-AND-SCREEN-CATALOGUE.md`  
**Authority:** Implementation specification for operational administration within APZ Projects (as amended). Completes operational design spine W002–W010.

---

# 0. Product objective

Define how APZ Projects is **governed and administered** in the enterprise: who may do what, how policy is enforced, how configuration is inherited, and how operational activity is audited and retained.

Align with APZHUB:

- IAM / permissions (007) — Better Auth authenticates; APZHUB owns authz
- Zero Trust (013)
- Platform data (011) — Projects SoR for delivery; no secret sprawl
- Enterprise Context — compose, never duplicate
- Superadmin = explicit tier, not bypass

**Success:** PMO and security officers can administer delivery policy without turning Projects into a generic IAM console or HR system.

---

# 1. Design principles (normative)

| #    | Principle                                                                                                  |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| SG1  | Server-side PermissionService is authoritative — UI never grants access                                    |
| SG2  | Operational Roles (W006) ≠ platform permissions — roles bind accountability; permissions authorize actions |
| SG3  | Separation of duties where governance requires (approve ≠ request)                                         |
| SG4  | Configuration hierarchy: Platform → Org → Portfolio → Programme → Project                                  |
| SG5  | Governance Profiles enforce; waivers are explicit, authorised, audited                                     |
| SG6  | Audit is immutable; operational admin actions are first-class audit events                                 |
| SG7  | Delegation is time-bounded and scoped                                                                      |
| SG8  | Templates & policies are versioned; projects independent after apply                                       |
| SG9  | Never expose backend engine role names in UI (007)                                                         |
| SG10 | Least privilege for users, services, workers                                                               |

---

# 2. Permission model

## 2.1 Capability catalogue (logical)

Group permissions for APZ Projects (map to PermissionService keys at engineering):

| Domain        | Examples                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------- |
| Workspace     | `projects.workspace.view` · `projects.queue.act`                                                |
| Project       | `projects.project.view` · `create` · `manage` · `transition` · `archive`                        |
| Delivery      | `projects.commitment.*` · `milestone.*` · `waiting.*` · `dependency.*`                          |
| Control       | `projects.decision.*` · `risk.*` · `exception.*` · `checkpoint.submit` · `checkpoint.waive`     |
| Portfolio     | `projects.portfolio.view` · `programme.manage` · `initiative.manage` · `objective.manage`       |
| Reviews       | `projects.review.view` · `facilitate` · `schedule.manage`                                       |
| Collaboration | `projects.conversation.write` · `announcement.publish` · `notice.publish`                       |
| Admin         | `projects.admin.templates` · `policies` · `roles_catalogue` · `retention` · `delegation.manage` |
| Reports       | `projects.reports.view` · `export`                                                              |

UI shows human labels; never raw keys as product copy.

## 2.2 Scope binding

Permissions evaluate with scope:

`platform` · `organisation` · `portfolio` · `initiative` · `programme` · `project`

Example: `projects.commitment.manage` on Project A does not imply Project B.

## 2.3 Superadmin

- Explicit permission tier for break-glass administration
- Every use audited with reason
- **Not** a silent bypass of Governance Profile gates in normal UX — break-glass path is separate, alarming, logged

**Decision proposal SG-D1:** Scoped capabilities + explicit superadmin break-glass; no hidden god-mode in product UX.

---

# 3. Operational roles vs permissions

| Concept                     | Purpose                                               |
| --------------------------- | ----------------------------------------------------- |
| **Permission**              | May the principal perform this API/UI action?         |
| **Operational Role** (W006) | Who is accountable (project_owner, delivery_lead, …)? |

- Role assignment does **not** automatically grant all permissions (may imply default permission packs via policy)
- Permission without role still allows acting where authorised
- Accountability gaps (missing Accountable) are operational issues, not authz alone

Central **Operational Role catalogue** administered under Projects Admin (org-extendable keys).

---

# 4. Delegation

```text
Delegation {
  fromPrincipalId · toPrincipalId
  scopeType · scopeId
  permissionSet | roleKeys
  validFrom · validTo
  reason
  status                         // active | expired | revoked
  createdBy
}
```

Rules:

- Time-bounded mandatory
- Scope mandatory (no org-wide casual delegation without admin permission)
- Delegate acts as self with elevated grant — audit records acting principal + delegation id
- Cannot delegate `checkpoint.waive` or superadmin without Separation-of-Duties policy allow
- Expiry automatic; Attention event to both parties

**Decision proposal SG-D2:** Delegation first-class, timed, scoped, audited.

---

# 5. Separation of duties (SoD)

## 5.1 Policy examples (v1)

| Conflict                                               | Rule                                  |
| ------------------------------------------------------ | ------------------------------------- |
| Checkpoint submit vs waive                             | Distinct principals (or dual control) |
| Exception raise vs Accept/Waive at Critical            | Distinct for Critical severity        |
| Review chair vs sole outcome approver on funding gates | Profile-defined                       |
| Template publish vs template consume                   | Admin vs project create               |

## 5.2 Enforcement

- Evaluated in Platform Service before mutation
- Soft warn vs hard block per Governance Profile
- SoD breaks require dual approval or superadmin break-glass

**Decision proposal SG-D3:** SoD rules live in Governance Profile / Delivery Policy; hard-block by default for Critical paths.

---

# 6. Governance enforcement

## 6.1 Governance Profile (W003 — authority)

Determines: checkpoints · approvals · document obligations · review frequency · reporting cadence · closure requirements · evidence rules · exception tolerances · SoD pack · retention class.

## 6.2 Enforcement points

| Moment              | Enforcement                                     |
| ------------------- | ----------------------------------------------- |
| Initiating → Active | Initiation gate + profile artefacts             |
| Commitment complete | Evidence rule                                   |
| Date move           | Exception tolerance                             |
| Checkpoint          | Workflow execution + Projects consume           |
| Closing → Closed    | Closure checklist + waivers                     |
| Waiver              | Authorised role + audit + optional dual control |

## 6.3 Waivers

```text
Waiver {
  policyKey · scopeRef
  reason · authorisedBy · at
  expiresAt?
  auditId
}
```

No silent skip of mandatory gates.

---

# 7. Audit model

## 7.1 Layers

| Layer                                            | Purpose                                                 | Mutability               |
| ------------------------------------------------ | ------------------------------------------------------- | ------------------------ |
| **Platform audit**                               | Security/compliance (authz denials, admin, break-glass) | Immutable                |
| **Operational Changes / Communication Timeline** | Delivery truth for users (W004/W007)                    | Append-only user-facing  |
| **Review snapshots**                             | Ceremony evidence (W008)                                | Immutable after complete |

## 7.2 Admin audit events (mandatory)

- Permission/role/delegation changes
- Profile/policy/template publish
- Waiver grant
- Retention/legal hold changes
- Portfolio membership moves
- Superadmin actions

## 7.3 Access

Security/PMO audit console (permission-gated). Standard users see Operational History — not raw security audit.

**Decision proposal SG-D4:** Triple-layer audit; admin events always in platform audit; no user deletion of audit.

---

# 8. Operational administration surfaces

## 8.1 Admin IA (permissioned)

```text
APZ Projects · Administration
├── Administration Dashboard          // §8.3 — admin workspace, not exec Scorecard
├── Organisation defaults
├── Governance Profiles
├── Operational Policies              // first-class reusable policies
├── Operational Role catalogue
├── Templates (versioned)
├── Enterprise Search (governed searches)
├── Portfolio administration
├── Exception administration (policy)
├── Delegation registry
├── Retention & legal hold
├── Governance Maturity
└── Integration bindings (Workflow checkpoints) — refs only
```

Not a second product — Admin under Settings/More for authorised principals.

## 8.3 Administration Dashboard

Dedicated **operational administration** workspace (not executive Portfolio Scorecard):

| Panel                      | Content                                                      |
| -------------------------- | ------------------------------------------------------------ |
| Policy usage               | Profiles/policies adopted · orphans · deprecated still bound |
| Governance exceptions      | Policy breaches · Critical compliance                        |
| Delegation status          | Active · expiring · over-scoped                              |
| Active overrides / waivers | Count · ageing                                               |
| Pending reviews            | Overdue scheduled reviews                                    |
| Template adoption          | Version spread · blank vs templated                          |
| Compliance trends          | Governance Compliance distribution over time                 |
| Maturity                   | Delivery Governance Maturity factors                         |

Admin-only; institutional density; drill to registries.

## 8.2 Challenge: admin as IAM

**Reject** rebuilding APZHUB identity admin inside Projects.  
**Recommend:** Projects administers **delivery policy & participation**; platform Identity administers users/groups globally.

---

# 9. Configuration hierarchy

```text
Platform defaults
  → Organisation
    → Enterprise Portfolio
      → Strategic Initiative
        → Programme
          → Project
```

| Rule          | Behaviour                                                            |
| ------------- | -------------------------------------------------------------------- |
| Inheritance   | Child inherits parent unless override                                |
| Stricter wins | Child may tighten; loosening requires waiver + permission            |
| Resolution    | Effective config API shows merged view + source layer                |
| Secrets       | Never in Projects config plain text — refs to secret store (011/013) |

**Decision proposal SG-D5:** Hierarchical config with effective-view; stricter-down freely; looser-down via waiver.

---

# 10. Template governance

- Versioned templates (W003) — system + organisation
- **Publish** requires `projects.admin.templates`
- Draft → published → deprecated lifecycle
- Projects **independent** after apply — template edits do not mutate live projects
- Governed change: “re-apply template tips” as advisory only, never silent overwrite
- Enterprise template catalogue is admin SoR; not Favourites

---

# 11. Portfolio administration

| Concern           | Admin capability                                                                |
| ----------------- | ------------------------------------------------------------------------------- |
| Hierarchy         | Create/move initiatives/programmes; move projects (history preserved)           |
| Membership        | Assign projects; prevent orphans per policy                                     |
| Objectives        | CRUD Strategic Objectives; link contributors                                    |
| Profiles          | Bind Governance Profiles at portfolio/programme/initiative                      |
| Scorecard policy  | Health mode (distribution vs strict worst-child)                                |
| Governed searches | Org-published search definitions (separate from personal saved searches — W009) |

---

# 12. Operational Policies (first-class)

**Operational Policies** are reusable enterprise assets that govern operational behaviour without per-project configuration.

```text
OperationalPolicy {
  id · key · name · version
  status                         // draft | published | deprecated
  areas[]                        // exception_tolerance | review_cadence |
                                 // evidence | escalation | closure | …
  rules                          // structured rule payload
  boundProfileIds[]?             // may attach to Governance Profiles
  effectiveFrom
}
```

| Area                  | Examples                                 |
| --------------------- | ---------------------------------------- |
| Exception tolerance   | Date slip thresholds · severity defaults |
| Review cadence        | Default schedules by scope type          |
| Evidence requirements | Commitment/milestone evidence rules      |
| Escalation thresholds | SLA by severity · stage multipliers      |
| Closure obligations   | Checklist items · waiver roles           |
| Forecast / capacity   | Overload thresholds · band cutovers      |
| Communication         | Notice/announcement publish rights       |

- Versioned; publish audited
- Projects inherit via Governance Profile / hierarchy at creation
- **Policy changes never silently modify existing projects** — effective for new binds / explicit re-apply with simulation
- Distinct from Governance Profile (profile orchestrates; policies are reusable rule assets)

## 12.1 Policy Simulation (pre-publish)

Before publishing a Governance Profile or Operational Policy, run **impact simulation**:

- Affected portfolios · programmes · projects (counts + samples)
- Potential governance conflicts (SoD clashes · stricter/looser overrides)
- Estimated new Exceptions / gate failures if applied retroactively (advisory — default is non-retroactive)

Simulation is mandatory for publish of org-level profiles/policies. Prevents unintended operational disruption.

## 12.2 Governance Compliance indicator

Every project (and roll-up to programme/portfolio) exposes:

`Compliant` · `Advisory` · `Non-Compliant` · `Critical`

Computed from open policy breaches, overdue checkpoints, unauthorised overrides, missing evidence, aged Critical exceptions without conclusion, etc.  
Displayed with Health · Confidence · Pulse (governance status at a glance — not a dive into every policy).

## 12.3 Delivery Governance Maturity

Enterprise improvement indicator (not a punitive compliance score):

Evaluates organisational adoption of:

- Governance Profiles
- Operational Reviews
- Operational Policies
- Evidence quality
- Exception management discipline

Bands e.g. `Emerging` · `Established` · `Advanced` · `Optimising` with factor breakdown. Shown on Administration Dashboard — not on every PM Overview.

---

# 13. Exception administration

- Define severity taxonomy (locked W004) — admin does not casually rename Critical
- Configure escalation paths defaults (W006)
- SLAs for open exceptions by severity
- Reporting retention of concluded exceptions
- Break-glass conclude only via superadmin + reason

Operational users conclude exceptions in Control; **admins** configure policy, not day-to-day conclusions (SoD).

---

# 14. Operational retention

```text
RetentionPolicy {
  class                          // standard | regulated | litigation_hold
  retainOperationalYears
  retainAuditYears
  archiveBehaviour               // soft archive | cold storage ref
}
```

| Object class              | Guidance (v1 defaults — org override) |
| ------------------------- | ------------------------------------- |
| Active delivery objects   | Retain while project Active+          |
| Closed projects           | Retain per class (e.g. 7y regulated)  |
| Conversations / timelines | Align to parent object                |
| Review snapshots          | Retain ≥ parent project retention     |
| Platform audit            | ≥ operational retention; often longer |

- **Legal hold** freezes deletion/anonymisation
- User “delete” on operational objects = soft tombstone subject to policy
- GDPR/erasure requests route through platform process — Projects cooperates; no casual hard-delete of audit

**Decision proposal SG-D6:** Retention classes + legal hold; no hard-delete of audit; operational delete is policy-gated tombstone.

---

# 15. Enterprise Context & security

- Context fragments permission-filtered from owning products
- Projects never copies foreign SoR into local tables as authority
- Admin may configure which Context sections appear by default per scope — not the foreign data itself

---

# 16. Zero Trust request path (normative)

Every Projects API:

1. Authenticate (Better Auth session)
2. Authorise (PermissionService + scope)
3. Validate input (Zod/contracts)
4. Enforce Governance Profile / SoD / stage rules
5. Execute via Platform Service
6. Audit + Operational Change / events
7. Standard envelope · correlation ID

No frontend-only enforcement.

---

# 17. Delegation · roles · permissions — admin UX

| Surface                | Content                                                   |
| ---------------------- | --------------------------------------------------------- |
| Project Control / Team | Operational Role assignments (W006)                       |
| Project manage         | Local permission grants (if org allows project-level ACL) |
| Org Admin              | Role catalogue · default permission packs · SoD matrix    |
| Delegation registry    | Active/expired delegations · revoke                       |

External participants: least-privilege project scopes only (W006).

---

# 18. Engineering readiness

| Area                | Current                                      | New                                    | API / platform           | Complexity |
| ------------------- | -------------------------------------------- | -------------------------------------- | ------------------------ | ---------- |
| Permissions         | Platform PermissionService + projects checks | Expand capability catalogue + scope    | authz on all routes      | L          |
| Roles               | Thin membership                              | Operational Role catalogue admin       | `/admin/roles`           | M          |
| Delegation          | None                                         | Delegation SoR                         | `/delegations`           | M–L        |
| SoD                 | None                                         | Policy engine hooks                    | inside Platform Services | M–L        |
| Governance Profiles | Designed W003                                | Admin CRUD + version + effective merge | `/governance-profiles`   | L          |
| Delivery Policies   | None                                         | Policy packs                           | `/delivery-policies`     | M          |
| Templates admin     | None                                         | Publish lifecycle                      | `/admin/templates`       | M          |
| Portfolio admin     | None                                         | Hierarchy admin APIs                   | portfolio admin          | L          |
| Audit               | Partial platform                             | Ensure admin event coverage            | audit APIs               | M          |
| Retention           | None                                         | Policies + hold + job                  | `/retention` · worker    | L          |
| Governed searches   | None                                         | Admin search definitions               | `/admin/searches`        | M          |
| Superadmin          | Platform tier                                | Break-glass flows + reason             | audited                  | M          |
| Acceptance          | —                                            | §20                                    | —                        | —          |

---

# 19. Acceptance criteria

1. Every mutating API checks PermissionService with scope.
2. UI never shows engine role names.
3. Operational Role ≠ automatic full permission set unless policy pack says so.
4. Delegations expire automatically and appear in audit.
5. SoD blocks Critical waive/submit same actor when profile requires.
6. Waivers always audited with reason.
7. Effective configuration shows inheritance sources.
8. Template publish does not mutate existing projects.
9. Review/admin/retention actions immutable in audit.
10. Legal hold prevents destructive purge.
11. Superadmin actions require reason and alert audit.
12. Governed enterprise searches distinct from personal saved searches.
13. External participants cannot receive portfolio admin permissions.
14. Frontend-only checks never sole enforcement.

---

# 20. Decision register — Owner review (2026-08-06)

| ID         | Status       | Decision                                                                                           |
| ---------- | ------------ | -------------------------------------------------------------------------------------------------- |
| **SG-D1**  | **APPROVED** | Capability-based permissions; server sole authz authority; no client-side trust                    |
| **SG-D2**  | **APPROVED** | Accountability ⊥ authorisation — independent concepts                                              |
| **SG-D3**  | **APPROVED** | Delegation time/scope-bound, audited, revocable; never permanent ownership transfer                |
| **SG-D4**  | **APPROVED** | SoD via Governance Profiles; Critical paths hard-block; override only break-glass                  |
| **SG-D5**  | **APPROVED** | Config hierarchy Platform → Org → Portfolio → Initiative → Programme → Project                     |
| **SG-D6**  | **APPROVED** | Templates & policies versioned; inherit at create; independence after apply; no silent mutate      |
| **SG-D7**  | **APPROVED** | Three records: Platform Audit · Operational History · Review Snapshots — no duplication of purpose |
| **SG-D8**  | **APPROVED** | Retention policy-driven; Legal Hold overrides; audit immutable; no hard-delete of audit            |
| **SG-D9**  | **APPROVED** | Governed searches central; personal searches private — separate                                    |
| **SG-D10** | **APPROVED** | Operational Policies first-class reusable enterprise assets                                        |
| **SG-D11** | **APPROVED** | Governance Compliance indicator on every project (Compliant → Critical)                            |
| **SG-D12** | **APPROVED** | Administration Dashboard for ops admin (not executive Scorecard)                                   |
| **SG-D13** | **APPROVED** | Policy/Profile publish requires impact simulation                                                  |
| **SG-D14** | **APPROVED** | Delivery Governance Maturity = improvement indicator, not compliance score                         |

**Operational design spine W002–W010: COMPLETE.** Next: **W011 — UI System & Screen Catalogue**.

---

# 21. Explicit non-goals

- Replacing APZHUB Identity / org directory admin
- HR access certification campaigns
- Building a generic GRC suite beyond delivery governance
- Customer-managed encryption UI
- Implementation code

---

# 22. Approval gate

**Owner approved with amendments (2026-08-06).** This file is implementation authority for operational administration.

**Release status:** Operational design foundation for APZ Projects 3.0 substantially complete (W002–W010).

UI specification: `W011-UI-SYSTEM-AND-SCREEN-CATALOGUE.md`.
