# Decision Drivers

1. Close P13-KL-ND-03 / Platform 1.4 MUST durable runtime.
2. Honour ADR-0071 Option D (Postgres persistence already decided).
3. Prefer simplest durable model that works on shared-host.
4. Preserve tenant/org isolation, deny-by-default, audit.
5. Keep provider abstraction; no SMTP activation here.
6. Additive migration only; no destructive change.
7. Avoid new broker infrastructure unless necessary.
8. Event Bus remains event plane — not the work queue SoR.
9. Enable future multi-instance workers safely.
10. Keep Integration SDK frozen and layering intact.
