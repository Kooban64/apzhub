# Observe Live Alerts — Phase A

Phase A delivers production-capable **deny-by-default** alert evaluation against Observe **metadata signals**.

Path: Workbench/HTTP → Gateway → Observe Platform Services → observe-core evaluation → Observe persistence → Event Bus + delivery hook.

Unknown / unavailable signals **never** auto-resolve or mark healthy.
