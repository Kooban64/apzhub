# Requirements Architecture

```
Client → Gateway → Requirement Application Service → Requirement Repository (SoR)
                              ↓
                    Explicit suite links
                              ↓
                    Traceability Engine (derived) ← Cap A–D read ports
                              ↓
                    Coverage Calculator (derived)
                              ↓
                    Events → Processing → QKI / Notifications / Commands
```

Product rule: **Traceability is a calculated relationship, not a manually maintained document.**

Frozen ENG packages (`@apzhub/qep-requirements`, `@apzhub/qep-traceability`) remain untouched.
