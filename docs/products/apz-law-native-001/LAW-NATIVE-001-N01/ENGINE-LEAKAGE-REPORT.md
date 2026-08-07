# Engine Leakage Report — APZ-LAW-NATIVE-001-N01

| Field     | Value            |
| --------- | ---------------- |
| Slice     | N-01             |
| Status    | **COMPLETE**     |
| Timestamp | 20260805T191100Z |

## Third-party / OSS engine brands

| Brand / system      | In Law user-facing UI / manifests? |
| ------------------- | ---------------------------------- |
| Metabase            | **No**                             |
| OpenProject / Plane | **No**                             |
| Zammad              | **No**                             |
| Authentik           | **No**                             |
| Kimai               | **No**                             |

**Result (brands):** **NONE** (compliant).

## Implementation / administration vocabulary

| Leak                                                       | Location                                         | Severity                                          |
| ---------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------- |
| “Trust engine diagnostics” / “in-memory trust engine only” | Trust UI + copy                                  | Medium — Engine Leak Risk                         |
| “in-memory engine UI”                                      | `law-trust` module.yaml description              | Medium — docs/manifest                            |
| Internal `*-engine.ts` modules                             | `apps/law-platform/lib/trust/`                   | Low — code-only (acceptable if never user-facing) |
| Administration → UX foundation gallery                     | Not a vendor console; still not product Settings | Native chrome gap (L-G12)                         |

## Result

**GAPS IDENTIFIED** — not third-party branding; **implementation “engine” language** in Trust surfaces.

| Gap   | Feeds                        |
| ----- | ---------------------------- |
| L-G07 | N-02 / N-03 vocabulary scrub |
