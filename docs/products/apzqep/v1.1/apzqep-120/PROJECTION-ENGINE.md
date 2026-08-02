# Projection Engine — APZQEP-120-S11

Applies catalogue events to the Quality Knowledge Index.

| Capability            | API / type                         |
| --------------------- | ---------------------------------- |
| Apply event           | `ProjectionEngine.applyEvent`      |
| Full rebuild / replay | `rebuildFromEvents`                |
| Registry              | `ProjectionRegistry`               |
| Repository            | `ProjectionRepository` (in-memory) |
| Diagnostics           | `diagnostics()`                    |

Never queries Evidence SoR or other business services.
