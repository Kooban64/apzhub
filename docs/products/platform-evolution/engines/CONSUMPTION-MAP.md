# APE Consumption Map — PE-P1-03

| Field     | Value                                                             |
| --------- | ----------------------------------------------------------------- |
| Status    | **Closed** (evidence)                                             |
| Timestamp | 20260808T212500Z                                                  |
| Rule      | Products call Platform Services / APEs — never providers directly |

## Map (Foundation)

| Product          | APE-Registry | APE-Search | APE-Notify | APE-Activity | APE-Audit | APE-Command | APE-Events | APE-Integration | APE-Config | APE-Flags | APE-Realtime |
| ---------------- | ------------ | ---------- | ---------- | ------------ | --------- | ----------- | ---------- | --------------- | ---------- | --------- | ------------ |
| APZ Projects     | ●            | ●          | ●          | ○            | ○         | ●           | ●          | ● (Plane)       | ●          | ○         | ○            |
| APZQEP           | ●            | ●          | ●          | ○            | ○         | ●           | ●          | ●               | ●          | ○         | ○            |
| APZ Workflow     | ●            | ○          | ●          | ○            | ○         | ●           | ●          | ● (n8n)         | ●          | ○         | ○            |
| APZ Support      | ●            | ●          | ●          | ○            | ○         | ●           | ●          | ● (Zammad)      | ●          | ○         | ● (SSE)      |
| APZ Analytics    | ●            | ○          | ○          | ○            | ○         | ●           | ●          | ● (Metabase)    | ●          | ○         | ○            |
| APZ Knowledge    | ●            | ●          | ○          | ○            | ○         | ●           | ●          | — (native)      | ●          | ○         | ○            |
| APZ Time         | ●            | ●          | ○          | ○            | ○         | ●           | ●          | ● (Kimai)       | ●          | ○         | ○            |
| Shell / Platform | ●            | ●          | ●          | ●            | ●         | ●           | ●          | ●               | ●          | ●         | ●            |

● = consumes today · ○ = gap / indirect (inventory residual, not product redesign)

## Gaps (not redesign)

- Cross-product **APE-Audit** query was missing → Foundation facade (`@apzhub/platform-audit`, `/api/v1/platform/audit`).
- Domain audit APIs remain authoritative SoRs for their domains.
- APE-Activity / APE-Command elevated as shell-owned; product-specific activity providers may register over time without UX change.
