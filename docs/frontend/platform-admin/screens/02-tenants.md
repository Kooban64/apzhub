# Screen — Tenants (master + detail)

| Field  | Value                                                                   |
| ------ | ----------------------------------------------------------------------- |
| Status | **LOCKED** · **IMPLEMENTED** (2026-08-17) — master list                 |
| Route  | `/platform-admin/tenants` · detail `/platform-admin/tenants/[tenantId]` |

## Master — Tenants

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Tenants                                                               + Create Tenant  │
│ Manage organisations using the APZ Platform                                            │
│                                                                                         │
│ All Tenants     Trials     Active     Suspended     Provisioning Issues                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔍 Search tenants...          Status ▾    Plan ▾    Products ▾           Filters       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ Organisation       Status       Plan         Users    Products    Provisioning    ⋮     │
│ ─────────────────────────────────────────────────────────────────────────────────────── │
│ APZOR              ● Active     Enterprise     42       3/3       ● Healthy       ⋮     │
│ Acme Bank          ● Active     Enterprise    280       2/3       ⚠ 1 Issue       ⋮     │
│ Zen Retail         ● Trial      Professional   34       1/3       ● Healthy       ⋮     │
│ Example Ltd        ○ Suspended  Starter        12       1/3       —               ⋮     │
│                                                                                         │
│                                                                                         │
│ 1–25 of 42                                               ‹ 1  2 ›                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Rules

- **APZOR appears as a completely ordinary row.**
- Do **not** badge Internal / Owner / System Tenant unless genuine commercial metadata requires it.
- Secondary tabs map to IA children: All · Trials · Active · Suspended · Provisioning Issues.
- Row menu (⋮): open detail, suspend/activate (permissioned), view provisioning, view billing.

---

## Detail — Tenant (Platform Operator view)

This is the **Platform Operator's view of a tenant** (e.g. APZOR), **not** that tenant's own Org Admin screens.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Tenants                                                                               │
│                                                                                         │
│ APZOR (Pty) Ltd                                                        ● Active         │
│ Tenant ID: APZ-000001                                                  Actions ▾        │
│                                                                                         │
│ Overview   Subscription   Products   Users   Provisioning   Security   Audit            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ ORGANISATION                                                                            │
│                                                                                         │
│ Plan                    Enterprise           Users                         42            │
│ Created                 14 Jan 2026          Active Users                  39            │
│ Billing Status          Current              Administrators                4            │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ PRODUCTS                                                                                │
│                                                                                         │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐              │
│ │ QUALITY              │ │ SECURITY             │ │ PRODUCTIVITY         │              │
│ │ APZQEP               │ │ APZPEN               │ │ APZPRD               │              │
│ │                      │ │                      │ │                      │              │
│ │ ● Active             │ │ ● Active             │ │ ● Active             │              │
│ │ 10 / 15 licences     │ │ 5 / 8 licences      │ │ 38 / 50 users       │              │
│ │                      │ │                      │ │                      │              │
│ │ View →               │ │ View →               │ │ View →               │              │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘              │
│                                                                                         │
├──────────────────────────────────────────────┬──────────────────────────────────────────┤
│ PROVISIONING                                 │ SECURITY                                 │
│                                              │                                          │
│ Identity              ● Healthy              │ MFA                       Required       │
│ Products              ● Healthy              │ SSO                       Configured     │
│ Providers             ● Healthy              │ Active Sessions                  36      │
│ Last provisioning     07:56                  │ Privileged Grants                  2      │
│                                              │                                          │
│ View Provisioning →                          │ View Security →                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ RECENT ACTIVITY                                                                         │
│                                                                                         │
│ 07:56   User provisioned              Ayanda                    System                  │
│ 07:21   Product access changed        Mary Smith                John Smith              │
│ Yesterday Subscription updated        APZPRD                    Finance                 │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Detail tabs (secondary nav)

| Tab          | Purpose                                                                        |
| ------------ | ------------------------------------------------------------------------------ |
| Overview     | Organisation summary · product tiles · provisioning/security strips · activity |
| Subscription | Plans, licences, renewals                                                      |
| Products     | Per-product entitlements                                                       |
| Users        | Tenant users (leads to User Inspector — next mockup)                           |
| Provisioning | Tenant-scoped provisioning                                                     |
| Security     | MFA/SSO/sessions/privileged grants                                             |
| Audit        | Tenant-scoped audit                                                            |

### Next mockup (Owner direction)

**Tenant → Users → User Inspector** — proves Stream 6 layers (org roles · product roles · scopes · professional tools) in one experience. See [../MOCKUP-SEQUENCE.md](../MOCKUP-SEQUENCE.md).
