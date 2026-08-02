# APZQEP Configuration Guide

| Layer           | Source                                                        |
| --------------- | ------------------------------------------------------------- |
| Platform env    | `.env.production` / compose                                   |
| Auth            | Better Auth (platform)                                        |
| Ports           | `ENVIRONMENT.md` coexistence                                  |
| Cap A–F runtime | Process-local factories under `apps/web/lib/qep/*-runtime.ts` |
| Modules         | `modules/qep-*/module.yaml`                                   |

No Cap-specific external engine credentials are required for Core QE Caps A–F in LIMITED_AVAILABILITY.
