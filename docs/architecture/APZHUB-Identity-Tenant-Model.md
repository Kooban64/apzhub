# Identity Tenant Model

`IdentityTenant` is IAM SoR tenant metadata (`platform_iam_tenant`).

It is **not** the Authentication scaffolding table `platform_tenant` from migration `0011_platform_identity.sql`. Cross-linking is by reference metadata only; credentials and session tenancy remain Authentication-owned.
