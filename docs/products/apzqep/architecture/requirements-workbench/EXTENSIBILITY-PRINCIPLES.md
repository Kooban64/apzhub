# Extensibility Principles — APZQEP-ARCH-006

> Companion extract. Authoritative detail: [REQUIREMENTS-WORKBENCH-ARCHITECTURE.md](./REQUIREMENTS-WORKBENCH-ARCHITECTURE.md) §15, ADR-ARCH-006-001.

## Principles

1. **One grammar** — new QEP modules extend panes/providers; they do not fork UX.  
2. **Registration over hardcoding** — navigation, commands, search, inspectors via manifests/SDKs (024/025).  
3. **Semantics stay in services** — UI presents Platform Service contracts only.  
4. **Relationships remain Requirements-owned** — consumers read; they do not redefine taxonomy.  
5. **Configuration honesty** — Baseline/Content Version immutability UX is shared.  
6. **Permission-driven contribution** — unauthorised extensions never appear.  
7. **Stable slots** — Explorer, Editor, Inspector, Relationship, Compare, Activity remain the integration surface through Certification-era modules.
